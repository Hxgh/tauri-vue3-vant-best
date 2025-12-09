/**
 * 商品查询 Composable
 * 通过条码查询商品信息（使用 Open Food Facts API）
 *
 * @module core/scanner/useProductQuery
 */

import { ref } from 'vue';
import { isTauriEnv } from '../platform/detect';
import type { NutritionInfo, ProductQueryResult } from './types';
import { isValidBarcode } from './utils';

/**
 * Open Food Facts API 响应
 */
interface OpenFoodFactsResponse {
  status: number;
  product?: {
    product_name?: string;
    product_name_zh?: string;
    product_name_en?: string;
    brands?: string;
    image_front_small_url?: string;
    image_url?: string;
    categories?: string;
    categories_tags?: string[];
    ingredients_text?: string;
    ingredients_text_zh?: string;
    nutriments?: {
      'energy-kcal_100g'?: number;
      proteins_100g?: number;
      carbohydrates_100g?: number;
      fat_100g?: number;
      sugars_100g?: number;
      sodium_100g?: number;
      fiber_100g?: number;
    };
  };
}

/**
 * 带超时的 fetch（自动选择 Tauri HTTP 或浏览器 fetch）
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 30000,
): Promise<Response> {
  // Tauri 环境使用 Tauri HTTP 插件（绕过 CORS）
  if (isTauriEnv()) {
    const { fetch: tauriFetch } = await import('@tauri-apps/plugin-http');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await tauriFetch(url, {
        method: 'GET',
        headers: options.headers as Record<string, string>,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Web 环境使用浏览器 fetch
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 从 Open Food Facts 查询商品信息
 * 优先使用中文站点获取中文信息
 */
async function queryOpenFoodFacts(
  barcode: string,
): Promise<ProductQueryResult> {
  // 优先尝试中文站点
  const endpoints = [
    `https://zh.openfoodfacts.org/api/v0/product/${barcode}.json`,
    `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
  ];

  let lastError: string | undefined;

  for (const endpoint of endpoints) {
    try {
      const response = await fetchWithTimeout(
        endpoint,
        {
          headers: {
            'User-Agent': 'TauriApp/1.0',
          },
        },
        10000,
      );

      if (!response.ok) {
        continue;
      }

      const data: OpenFoodFactsResponse = await response.json();

      if (data.status === 1 && data.product) {
        const p = data.product;

        // 优先使用中文名称
        const name =
          p.product_name_zh ||
          p.product_name ||
          p.product_name_en ||
          '未知商品';

        // 解析营养成分
        let nutrition: NutritionInfo | null = null;
        if (p.nutriments) {
          const n = p.nutriments;
          nutrition = {
            energy: n['energy-kcal_100g']
              ? `${n['energy-kcal_100g']} kcal`
              : '',
            proteins: n.proteins_100g ? `${n.proteins_100g}g` : '',
            carbohydrates: n.carbohydrates_100g
              ? `${n.carbohydrates_100g}g`
              : '',
            fat: n.fat_100g ? `${n.fat_100g}g` : '',
            sugars: n.sugars_100g ? `${n.sugars_100g}g` : undefined,
            sodium: n.sodium_100g ? `${n.sodium_100g}mg` : undefined,
            fiber: n.fiber_100g ? `${n.fiber_100g}g` : undefined,
          };

          // 如果所有值都为空，则设为 null
          if (
            !nutrition.energy &&
            !nutrition.proteins &&
            !nutrition.carbohydrates &&
            !nutrition.fat
          ) {
            nutrition = null;
          }
        }

        return {
          found: true,
          product: {
            name,
            brand: p.brands || '',
            image: p.image_front_small_url || p.image_url || '',
            categories: p.categories || '',
            ingredients: p.ingredients_text_zh || p.ingredients_text || '',
            nutrition,
            raw: p,
          },
          source: 'openfoodfacts',
        };
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : '查询失败';
    }
  }

  return {
    found: false,
    product: null,
    source: 'openfoodfacts',
    error: lastError,
  };
}

/**
 * 查询商品信息
 * @param barcode 条形码
 * @returns 商品查询结果
 */
export async function queryProduct(
  barcode: string,
): Promise<ProductQueryResult> {
  if (!isValidBarcode(barcode)) {
    return {
      found: false,
      product: null,
      source: 'unknown',
      error: '无效的条形码格式',
    };
  }

  // 目前只支持 Open Food Facts
  return await queryOpenFoodFacts(barcode);
}

/**
 * 商品查询 Composable
 * 提供响应式的商品查询功能
 */
export function useProductQuery() {
  const loading = ref(false);
  const result = ref<ProductQueryResult | null>(null);
  const error = ref<string | null>(null);

  /**
   * 查询商品
   * @param barcode 条形码
   */
  const query = async (barcode: string): Promise<ProductQueryResult> => {
    loading.value = true;
    error.value = null;

    try {
      const queryResult = await queryProduct(barcode);
      result.value = queryResult;

      if (!queryResult.found && queryResult.error) {
        error.value = queryResult.error;
      }

      return queryResult;
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : '查询失败';
      error.value = errorMsg;
      result.value = {
        found: false,
        product: null,
        source: 'unknown',
        error: errorMsg,
      };
      return result.value;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 清除查询结果
   */
  const clear = () => {
    result.value = null;
    error.value = null;
  };

  return {
    loading,
    result,
    error,
    query,
    clear,
    isValidBarcode,
  };
}
