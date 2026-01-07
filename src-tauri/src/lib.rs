#[cfg(target_os = "ios")]
use std::ffi::c_void;

#[cfg(target_os = "ios")]
use tauri::Manager;

#[cfg(target_os = "ios")]
extern "C" {
    fn ios_configure_native_bridge(webview_ptr: *mut c_void);
}

#[cfg(target_os = "ios")]
fn setup_ios_bridge(app: &tauri::AppHandle) {
    if let Some(webview) = app.webviews().values().next() {
        let _ = webview.with_webview(|platform_webview| unsafe {
            ios_configure_native_bridge(platform_webview.inner());
        });
    }
}

#[derive(Debug, serde::Serialize)]
struct MapResult {
    success: bool,
    message: String,
}

/// 生成地图导航 URL
/// 支持三种模式：
/// 1. 经纬度+地址：lat + lng + name（最精确）
/// 2. 纯经纬度：lat + lng（精确定位）
/// 3. 纯地址：name（地图搜索）
///
/// direct_nav 参数控制导航行为（仅高德地图支持）：
/// - true: 直接开始语音导航（需要有经纬度）
/// - false: 显示路径规划，用户确认后再导航
fn build_map_url(
    app_type: &str,
    lat: Option<f64>,
    lng: Option<f64>,
    name: Option<&str>,
    is_scheme: bool,
    platform: &str, // "android" | "ios" | "web"
    direct_nav: bool,
) -> Result<String, String> {
    let has_coords = lat.is_some() && lng.is_some();
    let has_name = name.is_some() && !name.unwrap_or("").is_empty();

    if !has_coords && !has_name {
        return Err("请提供经纬度或地址名称".to_string());
    }

    let lat_val = lat.unwrap_or(0.0);
    let lng_val = lng.unwrap_or(0.0);
    let name_val = name.unwrap_or("目的地");

    if is_scheme {
        // 原生 App URL Scheme
        let scheme_prefix = if platform == "ios" { "iosamap" } else { "androidamap" };

        match app_type {
            "amap" => {
                // 高德地图：支持 direct_nav 参数
                // navi = 直接导航，route/plan = 路径规划
                if direct_nav && has_coords {
                    // 直接导航模式（需要经纬度）
                    if has_name {
                        Ok(format!("{}://navi?sourceApplication=tvvb&lat={}&lon={}&poiname={}&dev=0&style=2", scheme_prefix, lat_val, lng_val, name_val))
                    } else {
                        Ok(format!("{}://navi?sourceApplication=tvvb&lat={}&lon={}&dev=0&style=2", scheme_prefix, lat_val, lng_val))
                    }
                } else if has_coords && has_name {
                    // 路径规划模式：经纬度+地址
                    Ok(format!("{}://route/plan?sourceApplication=tvvb&dlat={}&dlon={}&dname={}&dev=0&t=0", scheme_prefix, lat_val, lng_val, name_val))
                } else if has_coords {
                    // 路径规划模式：纯经纬度
                    Ok(format!("{}://route/plan?sourceApplication=tvvb&dlat={}&dlon={}&dev=0&t=0", scheme_prefix, lat_val, lng_val))
                } else {
                    // 路径规划模式：纯地址
                    Ok(format!("{}://route/plan?sourceApplication=tvvb&dname={}&dev=0&t=0", scheme_prefix, name_val))
                }
            }
            "baidu" => {
                // 百度地图：暂不支持 direct_nav，始终显示路径规划
                if has_coords && has_name {
                    Ok(format!("baidumap://map/direction?destination=latlng:{},{}|name:{}&coord_type=gcj02&mode=driving", lat_val, lng_val, name_val))
                } else if has_coords {
                    Ok(format!("baidumap://map/direction?destination=latlng:{},{}&coord_type=gcj02&mode=driving", lat_val, lng_val))
                } else {
                    Ok(format!("baidumap://map/direction?destination={}&mode=driving", name_val))
                }
            }
            "tencent" => {
                // 腾讯地图：暂不支持 direct_nav，始终显示路径规划
                if has_coords && has_name {
                    Ok(format!("qqmap://map/routeplan?type=drive&tocoord={},{}&to={}", lat_val, lng_val, name_val))
                } else if has_coords {
                    Ok(format!("qqmap://map/routeplan?type=drive&tocoord={},{}", lat_val, lng_val))
                } else {
                    Ok(format!("qqmap://map/routeplan?type=drive&to={}", name_val))
                }
            }
            _ => Err("不支持的地图类型".to_string()),
        }
    } else {
        // 网页版 URL（不支持直接导航，始终显示路径规划）
        match app_type {
            "amap" => {
                if has_coords && has_name {
                    Ok(format!("https://uri.amap.com/navigation?to={},{},{}&mode=car", lng_val, lat_val, name_val))
                } else if has_coords {
                    Ok(format!("https://uri.amap.com/navigation?to={},{}&mode=car", lng_val, lat_val))
                } else {
                    Ok(format!("https://uri.amap.com/navigation?to={}&mode=car", name_val))
                }
            }
            "baidu" => {
                if has_coords && has_name {
                    Ok(format!("https://api.map.baidu.com/direction?destination=latlng:{},{}|name:{}&coord_type=gcj02&mode=driving&output=html", lat_val, lng_val, name_val))
                } else if has_coords {
                    Ok(format!("https://api.map.baidu.com/direction?destination=latlng:{},{}&coord_type=gcj02&mode=driving&output=html", lat_val, lng_val))
                } else {
                    Ok(format!("https://api.map.baidu.com/direction?destination={}&mode=driving&output=html", name_val))
                }
            }
            "tencent" => {
                if has_coords && has_name {
                    Ok(format!("https://apis.map.qq.com/uri/v1/routeplan?type=drive&tocoord={},{}&to={}", lat_val, lng_val, name_val))
                } else if has_coords {
                    Ok(format!("https://apis.map.qq.com/uri/v1/routeplan?type=drive&tocoord={},{}", lat_val, lng_val))
                } else {
                    Ok(format!("https://apis.map.qq.com/uri/v1/routeplan?type=drive&to={}", name_val))
                }
            }
            _ => Err("不支持的地图类型".to_string()),
        }
    }
}

#[tauri::command]
async fn open_map_navigation(
    app: tauri::AppHandle,
    lat: Option<f64>,
    lng: Option<f64>,
    name: Option<String>,
    app_type: String, // "amap" | "baidu" | "tencent"
    direct_nav: bool, // true = 直接导航，false = 路径规划
) -> Result<MapResult, String> {
    let name_ref = name.as_deref();

    #[cfg(target_os = "android")]
    {
        use tauri_plugin_opener::OpenerExt;

        let scheme_url = build_map_url(&app_type, lat, lng, name_ref, true, "android", direct_nav)?;

        // 尝试打开原生地图 App
        match app.opener().open_url(&scheme_url, None::<&str>) {
            Ok(_) => Ok(MapResult {
                success: true,
                message: "已唤起地图应用".to_string(),
            }),
            Err(_) => {
                // 失败则 fallback 到网页版
                let web_url = build_map_url(&app_type, lat, lng, name_ref, false, "android", direct_nav)?;

                match app.opener().open_url(&web_url, None::<&str>) {
                    Ok(_) => Ok(MapResult {
                        success: false,
                        message: "地图应用未安装，已打开网页版".to_string(),
                    }),
                    Err(e) => Err(format!("打开地图失败: {}", e)),
                }
            }
        }
    }

    #[cfg(target_os = "ios")]
    {
        use tauri_plugin_opener::OpenerExt;

        let scheme_url = build_map_url(&app_type, lat, lng, name_ref, true, "ios", direct_nav)?;

        match app.opener().open_url(&scheme_url, None::<&str>) {
            Ok(_) => Ok(MapResult {
                success: true,
                message: "已唤起地图应用".to_string(),
            }),
            Err(_) => {
                let web_url = build_map_url(&app_type, lat, lng, name_ref, false, "ios", direct_nav)?;

                match app.opener().open_url(&web_url, None::<&str>) {
                    Ok(_) => Ok(MapResult {
                        success: false,
                        message: "地图应用未安装，已打开网页版".to_string(),
                    }),
                    Err(e) => Err(format!("打开地图失败: {}", e)),
                }
            }
        }
    }

    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    {
        use tauri_plugin_opener::OpenerExt;

        // 桌面端直接打开网页版
        let web_url = build_map_url(&app_type, lat, lng, name_ref, false, "web", direct_nav)?;

        match app.opener().open_url(&web_url, None::<&str>) {
            Ok(_) => Ok(MapResult {
                success: true,
                message: "已在浏览器中打开地图".to_string(),
            }),
            Err(e) => Err(format!("打开地图失败: {}", e)),
        }
    }
}

#[derive(Debug, serde::Serialize)]
struct CheckMapResult {
    installed: bool,
}

#[tauri::command]
#[cfg(target_os = "android")]
fn check_map_installed(app_type: String) -> Result<CheckMapResult, String> {
    use std::process::Command;

    let package_name = match app_type.as_str() {
        "amap" => "com.autonavi.minimap",
        "baidu" => "com.baidu.BaiduMap",
        "tencent" => "com.tencent.map",
        _ => return Err("不支持的地图类型".to_string()),
    };

    // 通过 pm list packages 命令检查应用是否安装
    match Command::new("pm").arg("list").arg("packages").output() {
        Ok(output) => {
            let packages = String::from_utf8_lossy(&output.stdout);
            let installed = packages.contains(&format!("package:{}", package_name));
            Ok(CheckMapResult { installed })
        }
        Err(_) => {
            // 如果命令失败，默认返回 false
            Ok(CheckMapResult { installed: false })
        }
    }
}

#[tauri::command]
#[cfg(not(target_os = "android"))]
fn check_map_installed(_app_type: String) -> Result<CheckMapResult, String> {
    // 非 Android 平台总是返回 true
    Ok(CheckMapResult { installed: true })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default();

    #[cfg(any(target_os = "android", target_os = "ios"))]
    let builder = builder.plugin(tauri_plugin_barcode_scanner::init());

    builder
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            open_map_navigation,
            check_map_installed
        ])
        .setup(|app| {
            #[cfg(target_os = "ios")]
            setup_ios_bridge(app);

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
