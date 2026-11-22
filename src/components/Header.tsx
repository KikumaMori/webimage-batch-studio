import React from 'react';
import { ShieldCheck, Sparkles, Trash2, Cpu } from 'lucide-react';

interface HeaderProps {
  itemCount: number;
  onClearAll: () => void;
  onLoadSamples: () => void;
  isLoadingSamples: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  itemCount,
  onClearAll,
  onLoadSamples,
  isLoadingSamples,
}) => {
  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 ring-2 ring-indigo-50">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                WebImage <span className="text-indigo-600 font-extrabold">Batch Studio</span>
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>完全ブラウザ完結 (サーバー送信0)</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              画像の一括リサイズ・WebP/AVIF高速変換・ファイルサイズ削減・Exif自動消去
            </p>
          </div>
        </div>

        
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            id="btn-load-samples"
            onClick={onLoadSamples}
            disabled={isLoadingSamples}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50/90 hover:bg-indigo-100/90 active:bg-indigo-200/80 border border-indigo-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            title="テスト用のサンプル画像を読み込みます"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isLoadingSamples ? 'animate-spin' : ''}`} />
            <span>サンプル画像で試す</span>
          </button>

          {itemCount > 0 && (
            <button
              type="button"
              id="btn-clear-all"
              onClick={onClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 rounded-lg transition-colors cursor-pointer"
              title="リストをすべてクリア"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>全クリア ({itemCount})</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
