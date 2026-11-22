import React from 'react';
import { ProcessedItem } from '../types';
import { formatBytes } from '../utils/formatters';
import {
  Download,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface ImageItemCardProps {
  item: ProcessedItem;
  onDownload: (item: ProcessedItem) => void;
  onRemove: (id: string) => void;
  onCompare: (item: ProcessedItem) => void;
  onRetry: (item: ProcessedItem) => void;
}

export const ImageItemCard: React.FC<ImageItemCardProps> = ({
  item,
  onDownload,
  onRemove,
  onCompare,
  onRetry,
}) => {
  const isCompleted = item.status === 'completed';
  const isProcessing = item.status === 'processing';
  const isError = item.status === 'error';
  const isPending = item.status === 'pending';

  return (
    <div
      id={`image-card-${item.id}`}
      className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 p-4 flex flex-col sm:flex-row items-center gap-4 group"
    >
      
      <div className="relative w-full sm:w-28 h-28 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
        
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
            backgroundSize: '12px 12px',
            backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
          }}
        />
        <img
          src={isCompleted && item.outputUrl ? item.outputUrl : item.previewUrl}
          alt={item.originalName}
          className="relative z-10 w-full h-full object-contain p-1"
        />

        
        {isProcessing && (
          <div className="absolute inset-0 bg-indigo-900/40 z-20 backdrop-blur-xs flex items-center justify-center text-white">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          </div>
        )}

        
        {isCompleted && (
          <button
            type="button"
            onClick={() => onCompare(item)}
            className="absolute inset-0 bg-slate-900/50 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-xs font-bold cursor-pointer"
            title="拡大・画質比較"
          >
            <Eye className="w-4 h-4" />
            <span>比較</span>
          </button>
        )}
      </div>

      
      <div className="flex-1 min-w-0 w-full">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate" title={item.originalName}>
              {item.originalName}
            </p>
            {isCompleted && item.outputName && (
              <p className="text-xs font-mono text-indigo-600 font-semibold truncate flex items-center gap-1 mt-0.5">
                <ArrowRight className="w-3 h-3 shrink-0" />
                <span>{item.outputName}</span>
              </p>
            )}
          </div>

          
          <div className="shrink-0">
            {isCompleted && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                完了
              </span>
            )}
            {isProcessing && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                変換中
              </span>
            )}
            {isPending && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                <Clock className="w-3.5 h-3.5" />
                待機中
              </span>
            )}
            {isError && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                エラー
              </span>
            )}
          </div>
        </div>

        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 mt-2">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">変換前</span>
            <span className="font-mono font-medium text-slate-700">
              {formatBytes(item.originalSize)}
            </span>
            <span className="text-slate-400 block text-[11px]">
              {item.originalWidth} × {item.originalHeight} px
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">変換後</span>
            {isCompleted && item.outputSize ? (
              <>
                <span className="font-mono font-bold text-indigo-600">
                  {formatBytes(item.outputSize)}
                </span>
                <span className="text-slate-500 block text-[11px]">
                  {item.outputWidth} × {item.outputHeight} px
                </span>
              </>
            ) : (
              <span className="text-slate-400 font-mono">---</span>
            )}
          </div>

          
          <div className="col-span-2 sm:col-span-1 flex flex-col justify-center">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">削減率</span>
            {isCompleted && item.reductionPercentage !== undefined ? (
              <div className="flex items-center gap-1">
                <span
                  className={`font-mono font-black text-sm px-2 py-0.5 rounded ${
                    item.reductionPercentage <= 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {item.reductionPercentage > 0 ? '+' : ''}
                  {item.reductionPercentage}%
                </span>
              </div>
            ) : (
              <span className="text-slate-400 font-mono">---</span>
            )}
          </div>
        </div>

        {isError && (
          <p className="text-xs text-rose-600 mt-1.5 bg-rose-50 p-1.5 rounded border border-rose-200">
            {item.errorMessage || '変換に失敗しました'}
          </p>
        )}
      </div>

      
      <div className="flex sm:flex-col items-center gap-1.5 shrink-0 self-end sm:self-center w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        {isCompleted && (
          <>
            <button
              type="button"
              onClick={() => onDownload(item)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:bg-indigo-200 border border-indigo-200 transition-colors cursor-pointer"
              title="この画像をダウンロード"
            >
              <Download className="w-3.5 h-3.5" />
              <span>保存</span>
            </button>
            <button
              type="button"
              onClick={() => onCompare(item)}
              className="inline-flex items-center justify-center p-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="画質比較"
            >
              <Eye className="w-4 h-4" />
            </button>
          </>
        )}

        {isError && (
          <button
            type="button"
            onClick={() => onRetry(item)}
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
          >
            再試行
          </button>
        )}

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="inline-flex items-center justify-center p-1.5 rounded-lg text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          title="リストから削除"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
