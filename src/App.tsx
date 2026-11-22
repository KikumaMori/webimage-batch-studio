

import { useState, useCallback } from 'react';
import {
  ProcessedItem,
  ProcessingSettings,
} from './types';
import {
  getImageDimensions,
  processImageFile,
} from './utils/imageProcessor';
import {
  calculateReduction,
  generateOutputFileName,
} from './utils/formatters';
import { downloadAllAsZip, downloadSingleImage } from './utils/zipHelper';
import { generateSampleImages } from './utils/sampleImages';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { SettingsPanel } from './components/SettingsPanel';
import { SummaryBar } from './components/SummaryBar';
import { ImageItemCard } from './components/ImageItemCard';
import { CompareModal } from './components/CompareModal';
import {
  Layers,
  Sparkles,
  Shield,
  Zap,
  Lock,
  ArrowDownCircle,
  FileCheck2,
} from 'lucide-react';

const DEFAULT_SETTINGS: ProcessingSettings = {
  format: 'webp',
  quality: 80,
  pngCompressionLevel: 9,
  resizeMode: 'none',
  maxEdge: 1200,
  minEdge: 800,
  width: 1200,
  height: 800,
  percentage: 50,
  maintainAspectRatio: true,
  dontUpscale: true,
  stripExif: true,
  renameRule: 'original',
  prefix: '',
  suffix: '',
  numberPattern: 'img-*',
  replaceSearch: '',
  replaceWith: '',
  replaceUseRegex: false,
  watermark: {
    enabled: false,
    text: '© 2026 MyBrand',
    position: 'bottom_right',
    opacity: 0.8,
    fontSize: 28,
    color: '#ffffff',
  },
};

export default function App() {
  const [items, setItems] = useState<ProcessedItem[]>([]);
  const [settings, setSettings] = useState<ProcessingSettings>(DEFAULT_SETTINGS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);
  const [compareItem, setCompareItem] = useState<ProcessedItem | null>(null);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showNotification = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  const convertSingleItem = useCallback(
    async (
      item: ProcessedItem,
      currentSettings: ProcessingSettings,
      index: number
    ): Promise<ProcessedItem> => {
      try {
        const { blob, width: outW, height: outH } = await processImageFile(item.file, currentSettings);
        const outputUrl = URL.createObjectURL(blob);
        const outputSize = blob.size;
        const reduction = calculateReduction(item.originalSize, outputSize);
        const outputName = generateOutputFileName(
          item.originalName,
          index,
          currentSettings.renameRule,
          currentSettings.prefix,
          currentSettings.suffix,
          currentSettings.format,
          {
            numberPattern: currentSettings.numberPattern,
            replaceSearch: currentSettings.replaceSearch,
            replaceWith: currentSettings.replaceWith,
            replaceUseRegex: currentSettings.replaceUseRegex,
          }
        );

        if (item.outputUrl) {
          URL.revokeObjectURL(item.outputUrl);
        }

        return {
          ...item,
          status: 'completed',
          progress: 100,
          outputBlob: blob,
          outputUrl,
          outputSize,
          outputWidth: outW,
          outputHeight: outH,
          outputName,
          reductionPercentage: reduction,
          errorMessage: undefined,
        };
      } catch (err: any) {
        return {
          ...item,
          status: 'error',
          errorMessage: err.message || '変換に失敗しました',
        };
      }
    },
    []
  );

  const processItems = useCallback(
    async (itemsToProcess: ProcessedItem[], currentSettings: ProcessingSettings) => {
      if (itemsToProcess.length === 0) return;
      setIsProcessing(true);

      setItems((prev) =>
        prev.map((item) =>
          itemsToProcess.some((p) => p.id === item.id)
            ? { ...item, status: 'processing', errorMessage: undefined }
            : item
        )
      );

      const CONCURRENCY = 3;

      for (let i = 0; i < itemsToProcess.length; i += CONCURRENCY) {
        const batch = itemsToProcess.slice(i, i + CONCURRENCY);
        const processedBatch = await Promise.all(
          batch.map((item, bIdx) => convertSingleItem(item, currentSettings, i + bIdx))
        );

        setItems((prev) =>
          prev.map((item) => {
            const updated = processedBatch.find((p) => p.id === item.id);
            return updated || item;
          })
        );
      }

      setIsProcessing(false);
      showNotification('すべての画像の最適化が完了しました！', 'success');
    },
    [convertSingleItem]
  );

  const handleFilesAdded = useCallback(
    async (files: File[]) => {
      const validFiles = files.filter((f) => f.type.startsWith('image/'));
      if (validFiles.length === 0) {
        showNotification('画像ファイル（JPEG, PNG, WebP, AVIF, GIF等）を選択してください', 'error');
        return;
      }

      const newItems: ProcessedItem[] = [];

      for (const file of validFiles) {
        try {
          const { width, height } = await getImageDimensions(file);
          const previewUrl = URL.createObjectURL(file);

          newItems.push({
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            file,
            originalName: file.name,
            originalSize: file.size,
            originalWidth: width,
            originalHeight: height,
            originalType: file.type,
            previewUrl,
            status: 'pending',
            progress: 0,
          });
        } catch (e) {
          console.error(`画像読み込み失敗: ${file.name}`, e);
        }
      }

      if (newItems.length > 0) {
        setItems((prev) => [...prev, ...newItems]);
        showNotification(`${newItems.length}件の画像を追加しました。自動で最適化を開始します。`, 'info');
        processItems(newItems, settings);
      }
    },
    [processItems, settings]
  );

  const handleSettingsChange = (newSettings: ProcessingSettings) => {
    setSettings(newSettings);
  };

  const handleLoadSamples = async () => {
    try {
      setIsLoadingSamples(true);
      const sampleFiles = await generateSampleImages();
      await handleFilesAdded(sampleFiles);
      showNotification('テスト用のサンプル画像を読み込みました', 'success');
    } catch (e) {
      console.error(e);
      showNotification('サンプル画像の生成に失敗しました', 'error');
    } finally {
      setIsLoadingSamples(false);
    }
  };

  const handleDownloadSingle = (item: ProcessedItem) => {
    try {
      downloadSingleImage(item);
      showNotification(`${item.outputName || '画像'} を保存しました`, 'success');
    } catch (err: any) {
      showNotification(err.message || 'ダウンロードに失敗しました', 'error');
    }
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      setZipProgress(0);
      const zipName = `optimized-images-${settings.format}-${Date.now().toString().slice(-4)}.zip`;

      await downloadAllAsZip(items, zipName, (percent) => {
        setZipProgress(percent);
      });

      showNotification('ZIPファイルのダウンロードを開始しました！', 'success');
    } catch (err: any) {
      showNotification(err.message || 'ZIPの作成に失敗しました', 'error');
    } finally {
      setIsZipping(false);
      setZipProgress(0);
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) {
        if (target.previewUrl) URL.revokeObjectURL(target.previewUrl);
        if (target.outputUrl) URL.revokeObjectURL(target.outputUrl);
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleClearAll = () => {
    items.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item.outputUrl) URL.revokeObjectURL(item.outputUrl);
    });
    setItems([]);
    showNotification('画像リストをすべてクリアしました', 'info');
  };

  const handleRetryItem = async (item: ProcessedItem) => {
    const index = items.findIndex((i) => i.id === item.id);
    const updated = await convertSingleItem(item, settings, index >= 0 ? index : 0);
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      <Header
        itemCount={items.length}
        onClearAll={handleClearAll}
        onLoadSamples={handleLoadSamples}
        isLoadingSamples={isLoadingSamples}
      />

      
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
              : notification.type === 'error'
              ? 'bg-rose-900 text-rose-100 border-rose-700'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          <FileCheck2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{notification.text}</span>
        </div>
      )}

      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        <section id="section-dropzone">
          <DropZone onFilesAdded={handleFilesAdded} />
        </section>

        
        <section id="section-settings">
          <SettingsPanel
            settings={settings}
            onChange={handleSettingsChange}
            disabled={isProcessing}
          />
        </section>

        
        {items.length > 0 && (
          <section id="section-summary" className="sticky top-18 z-20">
            <SummaryBar
              items={items}
              isProcessing={isProcessing}
              isZipping={isZipping}
              zipProgress={zipProgress}
              onProcessAll={() => processItems(items, settings)}
              onDownloadZip={handleDownloadZip}
            />
          </section>
        )}

        
        {items.length > 0 && (
          <section id="section-items" className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-800">
                  処理対象画像一覧 ({items.length}件)
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                各カードの「比較」で画質劣化をチェックできます
              </span>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <ImageItemCard
                  key={item.id}
                  item={item}
                  onDownload={handleDownloadSingle}
                  onRemove={handleRemoveItem}
                  onCompare={(it) => setCompareItem(it)}
                  onRetry={handleRetryItem}
                />
              ))}
            </div>

            
            <div className="pt-2">
              <DropZone onFilesAdded={handleFilesAdded} compact />
            </div>
          </section>
        )}

        
        {items.length === 0 && (
          <div className="text-center py-10 px-4 bg-white/50 rounded-2xl border border-dashed border-slate-200">
            <ArrowDownCircle className="w-10 h-10 text-indigo-400 mx-auto mb-3 stroke-1" />
            <h3 className="text-base font-bold text-slate-700">まずは画像をアップロードしてください</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
              画像をドラッグ＆ドロップするか、右上の「サンプル画像で試す」ボタンをクリックすると、即座にリサイズ＆フォーマット変換を体験できます。
            </p>
            <button
              type="button"
              onClick={handleLoadSamples}
              disabled={isLoadingSamples}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:bg-indigo-200 border border-indigo-200 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>テスト用サンプル画像を読み込む</span>
            </button>
          </div>
        )}
      </main>

      
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">サーバー送信ゼロ・安全保証</h4>
              <p className="text-[11px] text-slate-500">画像は端末のブラウザ内でのみ処理されます</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">次世代WebP/AVIF高速変換</h4>
              <p className="text-[11px] text-slate-500">HTML5 Canvasハードウェア描画で瞬時に圧縮</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Exif・位置情報の完全消去</h4>
              <p className="text-[11px] text-slate-500">撮影位置や日時メタデータを安全にカット</p>
            </div>
          </div>
        </div>

        
        <div className="mt-4 bg-slate-100/80 border border-slate-200/80 rounded-xl p-4 text-xs text-slate-600 space-y-1.5">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>プライバシーとセキュリティについての検証のお願い</span>
          </div>
          <p className="leading-relaxed">
            本アプリはコード上および設計上、画像データを外部サーバーへ送信する処理は含まれていません。
            ご不安な場合は、
            <span className="font-semibold text-slate-800">パソコンやスマホのインターネット（Wi-Fi）を完全にオフ（オフライン状態）にした上で動作をご確認いただく</span>
            か、ソースコードを手元にダウンロードしてローカル環境で実行していただくことで、安全性を確実にご確認いただけます。
          </p>
        </div>
      </div>

      
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 WebImage Batch Studio - Client-Side Image Processing Engine</p>
          <p className="text-slate-400">
            Canvas 2D API / JSZip / WebP & AVIF Enabled / Privacy First
          </p>
        </div>
      </footer>

      
      <CompareModal
        item={compareItem}
        onClose={() => setCompareItem(null)}
        onDownload={handleDownloadSingle}
      />
    </div>
  );
}
