#[derive(Debug, serde::Serialize)]
struct MapResult {
    success: bool,
    message: String,
}

#[tauri::command]
async fn open_map_navigation(
    app: tauri::AppHandle,
    lat: f64,
    lng: f64,
    name: String,
    app_type: String, // "amap" | "baidu" | "tencent"
) -> Result<MapResult, String> {
    #[cfg(target_os = "android")]
    {
        use tauri_plugin_opener::OpenerExt;
        
        let scheme_url = match app_type.as_str() {
            "amap" => format!("androidamap://navi?sourceApplication=express&lat={}&lon={}&dev=0&style=2", lat, lng),
            "baidu" => format!("baidumap://map/direction?destination=latlng:{},{}|name:{}&coord_type=bd09ll&mode=driving", lat, lng, name),
            "tencent" => format!("qqmap://map/routeplan?type=drive&to={}&tocoord={},{}", name, lat, lng),
            _ => return Err("不支持的地图类型".to_string()),
        };
        
        // 尝试打开原生地图 App
        match app.opener().open_url(scheme_url, None::<&str>) {
            Ok(_) => {
                Ok(MapResult {
                    success: true,
                    message: "已唤起地图应用".to_string(),
                })
            }
            Err(_) => {
                // 失败则 fallback 到网页版
                let web_url = match app_type.as_str() {
                    "amap" => format!("https://uri.amap.com/navigation?to={},{},{}", lng, lat, name),
                    "baidu" => format!("https://api.map.baidu.com/marker?location={},{}&title={}&content={}&output=html&src=webapp.baidu.openAPIdemo", lat, lng, name, name),
                    "tencent" => format!("https://apis.map.qq.com/uri/v1/routeplan?type=drive&to={}&tocoord={},{}", name, lat, lng),
                    _ => return Err("不支持的地图类型".to_string()),
                };
                
                match app.opener().open_url(web_url, None::<&str>) {
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
        
        let scheme_url = match app_type.as_str() {
            "amap" => format!("iosamap://navi?sourceApplication=express&lat={}&lon={}&dev=0&style=2", lat, lng),
            "baidu" => format!("baidumap://map/direction?destination=latlng:{},{}|name:{}&coord_type=bd09ll&mode=driving", lat, lng, name),
            "tencent" => format!("qqmap://map/routeplan?type=drive&to={}&tocoord={},{}", name, lat, lng),
            _ => return Err("不支持的地图类型".to_string()),
        };
        
        match app.opener().open_url(scheme_url, None::<&str>) {
            Ok(_) => {
                Ok(MapResult {
                    success: true,
                    message: "已唤起地图应用".to_string(),
                })
            }
            Err(_) => {
                let web_url = match app_type.as_str() {
                    "amap" => format!("https://uri.amap.com/navigation?to={},{},{}", lng, lat, name),
                    "baidu" => format!("https://api.map.baidu.com/marker?location={},{}&title={}&content={}&output=html&src=webapp.baidu.openAPIdemo", lat, lng, name, name),
                    "tencent" => format!("https://apis.map.qq.com/uri/v1/routeplan?type=drive&to={}&tocoord={},{}", name, lat, lng),
                    _ => return Err("不支持的地图类型".to_string()),
                };
                
                match app.opener().open_url(web_url, None::<&str>) {
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
        let web_url = match app_type.as_str() {
            "amap" => format!("https://uri.amap.com/navigation?to={},{},{}", lng, lat, name),
            "baidu" => format!("https://api.map.baidu.com/marker?location={},{}&title={}&content={}&output=html&src=webapp.baidu.openAPIdemo", lat, lng, name, name),
            "tencent" => format!("https://apis.map.qq.com/uri/v1/routeplan?type=drive&to={}&tocoord={},{}", name, lat, lng),
            _ => return Err("不支持的地图类型".to_string()),
        };
        
        match app.opener().open_url(web_url, None::<&str>) {
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
    match Command::new("pm")
        .arg("list")
        .arg("packages")
        .output()
    {
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
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![open_map_navigation, check_map_installed])
        .setup(|app| {
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
