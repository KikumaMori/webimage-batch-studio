import React from 'react';
import { ProcessedItem } from '../types';
import { formatBytes } from '../utils/formatters';
import { Download, RefreshCw, TrendingDown } from 'lucide-react';

interface SummaryBarProps {
  items: ProcessedItem[];
  isProcessing: boolean;
  isZipping: boolean;
  zipProgress: number;
  onProcessAll: () => void;
  onDownloadZip: () => void;
}

export const SummaryBar: React.FC<SummaryBarProps> = ({
  items,
  isProcessing,
  isZipping,
  zipProgress,
  onProcessAll,
  onDownloadZip,
}) => {
  const completedItems = items.filter((i) => i.status === 'completed');
  const pendingItems = items.filter((i) => i.status === 'pending');
  const hasCompleted = completedItems.length > 0;

  const totalOriginalBytes = items.reduce((sum, item) => sum + item.originalSize, 0);
  const totalCompletedOriginalBytes = completedItems.reduce((sum, item) => sum + item.originalSize, 0);
  const totalCompletedOutputBytes = completedItems.reduce((sum, item) => sum + (item.outputSize || 0), 0);

  const savedBytes = totalCompletedOriginalBytes - totalCompletedOutputBytes;
  const overallReduction =
    totalCompletedOriginalBytes > 0
      ? Math.round(((totalCompletedOutputBytes - totalCompletedOriginalBytes) / totalCompletedOriginalBytes) * 1000) / 10
      : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-4 sm:p-5 transition-all">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full lg:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/80">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                合計サイズ削減率
              </span>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-black font-mono tracking-tight ${overallReduction <= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {hasCompleted ? `${overallReduction > 0 ? '+' : ''}${overallReduction}%` : '---'}
                </span>
                {hasCompleted && savedBytes > 0 && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                    {formatBytes(savedBytes)} 削減！
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="h-9 w-px bg-slate-200 hidden sm:block" />

          
          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">元サイズ合計</span>
              <span className="font-bold text-slate-700 font-mono text-sm">
                {formatBytes(totalOriginalBytes)}
              </span>
            </div>
            <span className="text-slate-300 font-light text-base">➔</span>
            <div>
              <span className="text-slate-400 block font-medium">変換後サイズ</span>
              <span className="font-bold text-indigo-600 font-mono text-sm">
                {hasCompleted ? formatBytes(totalCompletedOutputBytes) : '---'}
              </span>
            </div>
            <div className="ml-2 pl-3 border-l border-slate-200">
              <span className="text-slate-400 block font-medium">進捗</span>
              <span className="font-bold text-slate-800 text-sm">
                {completedItems.length} / {items.length} 完了
              </span>
            </div>
          </div>
        </div>

        
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
          {pendingItems.length > 0 && (
            <button
              type="button"
              id="btn-process-all"
              onClick={onProcessAll}
              disabled={isProcessing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>
                {isProcessing
                  ? '一括変換中...'
                  : `未変換の画像を変換 (${pendingItems.length}件)`}
              </span>
            </button>
          )}

          {pendingItems.length === 0 && hasCompleted && (
            <button
              type="button"
              id="btn-reprocess-all"
              onClick={onProcessAll}
              disabled={isProcessing}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-all cursor-pointer disabled:opacity-50"
              title="現在の設定ですべての画像を再変換します"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>再変換</span>
            </button>
          )}

          <button
            type="button"
            id="btn-download-zip"
            onClick={onDownloadZip}
            disabled={!hasCompleted || isProcessing || isZipping}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm shadow-emerald-200 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>
              {isZipping
                ? `ZIP生成中... ${zipProgress}%`
                : `すべてZIPでダウンロード (${completedItems.length}枚)`}
            </span>
          </button>
        </div>
      </div>

      
      {isZipping && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 transition-all duration-150 rounded-full"
              style={{ width: `${zipProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
