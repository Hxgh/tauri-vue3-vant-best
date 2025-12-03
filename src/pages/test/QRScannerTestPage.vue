<script setup lang="ts">
import { showToast } from 'vant';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { BarcodeScanResult } from '@/composables/useBarcodeScanner';
import {
  getContentTypeLabel,
  isWebUrl,
  parseContentType,
  useBarcodeScanner,
} from '@/composables/useBarcodeScanner';
import MainLayout from '@/layouts/MainLayout.vue';
import { ContentStart, HeaderMode, TabbarMode } from '@/types/layout';

const router = useRouter();
const showScanner = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

// 使用框架级封装的条码扫描器
const {
  scanning,
  productLoading,
  lastResult,
  scanHistory,
  startScan,
  stopScan,
  scanFromImage,
  clearHistory,
  isTauriMobile,
} = useBarcodeScanner(
  {
    // vibrate: true,   // 默认开启震动（可配置）
    // sound: true,     // 默认开启声音（可配置）
    autoQueryProduct: true,
    onComplete: (result) => {
      showToast({ message: '扫码完成', icon: 'success' });
      showScanner.value = false;
    },
    onError: (error) => {
      if (error.code === 'CANCELLED') {
        showScanner.value = false;
      }
    },
  },
  'embedded-qr-reader',
);

// 是否为移动端原生模式
const isNativeMode = computed(() => isTauriMobile());

// 处理扫码点击
const handleScanClick = async () => {
  if (isNativeMode.value) {
    try {
      await startScan();
    } catch (error: any) {
      if (error?.code !== 'CANCELLED') {
        console.error('[QRScannerTestPage] Scan failed:', error);
      }
    }
  } else {
    showScanner.value = true;
    setTimeout(() => {
      startScan().catch((error: any) => {
        if (error?.code !== 'CANCELLED') {
          console.error('[QRScannerTestPage] Scan failed:', error);
        }
      });
    }, 100);
  }
};

const handleCancelScan = async () => {
  await stopScan();
  showScanner.value = false;
};

const handleFileSelect = async () => {
  if (isNativeMode.value) {
    // 移动端直接调用 scanFromImage，内部会使用 Tauri dialog
    try {
      await scanFromImage();
    } catch (error: any) {
      if (error?.code !== 'CANCELLED') {
        console.error('[QRScannerTestPage] Image scan failed:', error);
      }
    }
  } else {
    // Web端使用 file input
    fileInputRef.value?.click();
  }
};

const handleFileChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    try {
      await scanFromImage(file);
    } catch (error) {
      // 错误已在回调处理
    }
  }
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

// 内容类型
const contentType = computed(() => {
  if (!lastResult.value) return null;
  return parseContentType(lastResult.value.scan.content);
});

const contentTypeLabel = computed(() => {
  if (!contentType.value) return '';
  return getContentTypeLabel(contentType.value);
});

// 是否为链接
const isLink = computed(() => {
  if (!lastResult.value) return false;
  return isWebUrl(lastResult.value.scan.content);
});

// 打开链接
const openUrl = (url: string) => {
  window.open(url, '_blank');
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    showToast('已复制');
  });
};

const goBack = () => {
  router.back();
};
</script>

<template>
  <MainLayout
    :header-mode="HeaderMode.Standard"
    :content-start="ContentStart.BelowHeader"
    :tabbar-mode="TabbarMode.None"
    header-title="扫码测试"
  >
    <template #header-left>
      <van-icon name="arrow-left" @click="goBack" />
    </template>

    <div class="content">
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        style="display: none"
        @change="handleFileChange"
      />

      <!-- 扫码操作 -->
      <van-cell-group title="扫码操作" inset>
        <van-cell center>
          <template #title>
            <van-button
              type="primary"
              size="large"
              block
              icon="scan"
              :disabled="scanning"
              @click="handleScanClick"
            >
              {{ scanning ? '扫描中...' : '开始扫码' }}
            </van-button>
          </template>
        </van-cell>
        <van-cell center>
          <template #title>
            <van-button
              size="large"
              block
              icon="photo-o"
              @click="handleFileSelect"
            >
              从相册选择
            </van-button>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 平台信息 -->
      <van-cell-group title="平台信息" inset>
        <van-cell
          title="扫码模式"
          :value="isNativeMode ? '原生全屏' : 'Web内嵌'"
        />
      </van-cell-group>

      <!-- 最新结果 -->
      <van-cell-group v-if="lastResult" title="扫码结果" inset>
        <van-cell title="内容" :label="lastResult.scan.content">
          <template #value>
            <div class="btn-group">
              <van-button size="mini" type="primary" @click="copyToClipboard(lastResult.scan.content)">
                复制
              </van-button>
              <van-button
                v-if="isLink"
                size="mini"
                type="success"
                @click="openUrl(lastResult.scan.content)"
              >
                打开
              </van-button>
            </div>
          </template>
        </van-cell>
        <van-cell title="内容类型" :value="contentTypeLabel" />
        <van-cell title="码制" :value="`${lastResult.scan.formatInfo.label} (${lastResult.scan.formatInfo.categoryLabel})`" />
        <van-cell
          title="时间"
          :value="new Date(lastResult.scan.timestamp).toLocaleString('zh-CN')"
        />
      </van-cell-group>

      <!-- 商品信息（自动从框架层获取） -->
      <van-cell-group
        v-if="lastResult?.isProductBarcode"
        title="商品信息"
        inset
      >
        <van-cell v-if="productLoading" center>
          <template #title>
            <div class="loading-row">
              <van-loading size="20px" />
              <span>正在查询...</span>
            </div>
          </template>
        </van-cell>

        <van-cell v-else-if="!lastResult.product" center>
          <template #title>
            <div class="info-row">
              <van-icon name="info-o" size="20" color="#969799" />
              <span>未找到商品信息</span>
            </div>
          </template>
        </van-cell>

        <template v-else>
          <van-cell center>
            <template #icon>
              <van-image
                v-if="lastResult.product.image"
                :src="lastResult.product.image"
                width="60"
                height="60"
                fit="contain"
                radius="4"
                class="product-img"
              />
              <div v-else class="product-img-placeholder">
                <van-icon name="photo-o" size="24" color="#c8c9cc" />
              </div>
            </template>
            <template #title>
              <div class="product-info">
                <div class="product-name">{{ lastResult.product.name }}</div>
                <div v-if="lastResult.product.brand" class="product-brand">
                  {{ lastResult.product.brand }}
                </div>
              </div>
            </template>
          </van-cell>

          <van-cell
            v-if="lastResult.product.categories"
            title="分类"
            :label="lastResult.product.categories"
          />

          <van-cell v-if="lastResult.product.nutrition" title="营养成分 (每100g)">
            <template #label>
              <div class="nutrition">
                <span v-if="lastResult.product.nutrition.energy">
                  热量: {{ lastResult.product.nutrition.energy }}
                </span>
                <span v-if="lastResult.product.nutrition.proteins">
                  蛋白质: {{ lastResult.product.nutrition.proteins }}
                </span>
                <span v-if="lastResult.product.nutrition.carbohydrates">
                  碳水: {{ lastResult.product.nutrition.carbohydrates }}
                </span>
                <span v-if="lastResult.product.nutrition.fat">
                  脂肪: {{ lastResult.product.nutrition.fat }}
                </span>
              </div>
            </template>
          </van-cell>
        </template>

        <van-cell>
          <template #title>
            <div class="data-source">
              数据来源: <a href="https://openfoodfacts.org" target="_blank">Open Food Facts</a>
            </div>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 扫码历史 -->
      <van-cell-group v-if="scanHistory.length > 0" title="扫码历史" inset>
        <van-cell
          v-for="(item, index) in scanHistory.slice(0, 5)"
          :key="index"
          :title="item.product?.name || item.scan.formatInfo.label"
          :label="item.scan.content"
          clickable
          @click="copyToClipboard(item.scan.content)"
        >
          <template #right-icon>
            <van-icon name="copy" />
          </template>
        </van-cell>
        <van-cell center>
          <template #title>
            <van-button size="small" type="danger" plain @click="clearHistory">
              清空历史
            </van-button>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 支持的码制 -->
      <van-cell-group title="支持的码制" inset>
        <van-cell>
          <template #title>
            <div class="formats">
              <van-tag type="primary">QR Code</van-tag>
              <van-tag type="success">EAN-13</van-tag>
              <van-tag type="success">EAN-8</van-tag>
              <van-tag type="warning">Code 128</van-tag>
              <van-tag type="warning">Code 39</van-tag>
              <van-tag>Data Matrix</van-tag>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <!-- Web端扫码弹窗 -->
    <van-popup
      v-if="!isNativeMode"
      v-model:show="showScanner"
      position="bottom"
      :style="{ height: '100%' }"
      :close-on-click-overlay="false"
    >
      <div class="scanner-popup">
        <div class="scanner-header">
          <div class="header-btn" @click="handleCancelScan">
            <van-icon name="arrow-left" size="24" color="#fff" />
          </div>
          <div class="header-title">扫一扫</div>
          <div class="header-btn" />
        </div>

        <div class="scanner-body">
          <div id="embedded-qr-reader" class="qr-reader" />
          <div v-if="scanning" class="scan-hint">将条码放入框内</div>
        </div>

        <div class="scanner-footer">
          支持二维码、条形码等多种格式
        </div>
      </div>
    </van-popup>
  </MainLayout>
</template>

<style scoped>
.content {
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.btn-group {
  display: flex;
  gap: 8px;
}

.loading-row,
.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--van-text-color-2);
  font-size: 14px;
}

.product-img {
  margin-right: 12px;
}

.product-img-placeholder {
  width: 60px;
  height: 60px;
  background: var(--van-gray-2);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-name {
  font-size: 15px;
  font-weight: 500;
  line-height: 1.4;
}

.product-brand {
  font-size: 13px;
  color: var(--van-text-color-2);
}

.nutrition {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  font-size: 13px;
  color: var(--van-text-color-2);
  margin-top: 4px;
}

.data-source {
  font-size: 12px;
  color: var(--van-text-color-3);
}

.data-source a {
  color: var(--van-primary-color);
  text-decoration: none;
}

.formats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 0;
}

/* 扫码弹窗 */
.scanner-popup {
  height: 100%;
  background: #000;
  display: flex;
  flex-direction: column;
}

.scanner-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: env(safe-area-inset-top, 20px) 16px 16px;
  background: rgba(0, 0, 0, 0.8);
  flex-shrink: 0;
}

.header-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title {
  color: #fff;
  font-size: 18px;
  font-weight: 500;
}

.scanner-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.qr-reader {
  width: 100%;
  max-width: 500px;
}

.scan-hint {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  font-size: 14px;
  padding: 12px 24px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 20px;
}

.scanner-footer {
  padding: 16px;
  padding-bottom: max(env(safe-area-inset-bottom, 20px), 20px);
  background: rgba(0, 0, 0, 0.8);
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  text-align: center;
}

:deep(#embedded-qr-reader #qr-reader__dashboard_section),
:deep(#embedded-qr-reader #qr-reader__dashboard_section_csr) {
  display: none !important;
}

:deep(#embedded-qr-reader video) {
  border-radius: 12px;
  width: 100%;
}
</style>
