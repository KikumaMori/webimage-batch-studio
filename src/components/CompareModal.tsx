import React, { useLayoutEffect, useRef, useState } from 'react';
import { ProcessedItem } from '../types';
import { formatBytes } from '../utils/formatters';
import { X, Download, Columns, SplitSquareVertical } from 'lucide-react';

interface CompareModalProps {
  item: ProcessedItem | null;
  onClose: () => void;
  onDownload: (item: ProcessedItem) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({ item, onClose, onDownload }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [viewMode, setViewMode] = useState<'slider' | 'side_by_side'>('slider');
  const [isDragging, setIsDragging] = useState(false);
  const [stageSize, setStageSize] = useState<{ width: number; height: number } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el || !item || viewMode !== 'slider') return;

    const updateStageSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setStageSize({ width: rect.width, height: rect.height });
      }
    };

    updateStageSize();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => {
        updateStageSize();
      });
      observer.observe(el);
      return () => observer.disconnect();
    }
  }, [item?.id, viewMode]);

  if (!item || !item.outputUrl) return null;

  const origW = item.originalWidth || 1;
  const origH = item.originalHeight || 1;
  const outW = item.outputWidth || origW;
  const outH = item.outputHeight || origH;
  const useOriginalAsRef = origW * origH >= outW * outH;
  const refW = useOriginalAsRef ? origW : outW;
  const refH = useOriginalAsRef ? origH : outH;

  let displayBoxStyle: React.CSSProperties | undefined;
  if (stageSize && stageSize.width > 0 && stageSize.height > 0) {
    const scale = Math.min(stageSize.width / refW, stageSize.height / refH);
    displayBoxStyle = {
      width: `${Math.max(1, Math.floor(refW * scale))}px`,
      height: `${Math.max(1, Math.floor(refH * scale))}px`,
    };
  }

  const updateSliderFromClientX = (clientX: number) => {
    const container = sliderContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    if (rect.width <= 0) return;
    const rawPct = ((clientX - rect.left) / rect.width) * 100;
    const clampedPct = Math.max(0, Math.min(100, Math.round(rawPct * 10) / 10));
    setSliderPos(clampedPct);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    updateSliderFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateSliderFromClientX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-3 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full h-full max-w-[98vw] max-h-[96vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-200 bg-slate-50/70 shrink-0">
          <div className="min-w-0 pr-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              画質比較プレビュー: {item.originalName}
            </h3>
            <p className="text-xs text-slate-500 truncate">
              {item.outputName} への変換結果
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setViewMode('slider')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  viewMode === 'slider' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <SplitSquareVertical className="w-3.5 h-3.5" />
                <span>スライダー</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('side_by_side')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  viewMode === 'side_by_side' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>並列比較</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => onDownload(item)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>保存</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        
        <div className="grid grid-cols-2 bg-slate-900 text-white text-xs px-4 sm:px-5 py-2 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <span className="font-bold shrink-0">元画像:</span>
            <span className="font-mono text-slate-300 shrink-0">{formatBytes(item.originalSize)}</span>
            <span className="text-slate-400 truncate">({item.originalWidth}×{item.originalHeight}px)</span>
          </div>

          <div className="flex items-center justify-end gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="font-bold shrink-0">最適化後:</span>
            <span className="font-mono text-emerald-400 font-bold shrink-0">{formatBytes(item.outputSize || 0)}</span>
            <span className="text-slate-400 truncate">({item.outputWidth}×{item.outputHeight}px)</span>
            {item.reductionPercentage !== undefined && (
              <span className="ml-1 font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                {item.reductionPercentage > 0 ? '+' : ''}{item.reductionPercentage}%
              </span>
            )}
          </div>
        </div>

        
        <div className="flex-1 min-h-0 bg-slate-950 p-2 sm:p-3 overflow-hidden flex items-center justify-center relative">
          
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                'linear-gradient(45deg, #64748b 25%, transparent 25%), linear-gradient(-45deg, #64748b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #64748b 75%), linear-gradient(-45deg, transparent 75%, #64748b 75%)',
              backgroundSize: '16px 16px',
              backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
            }}
          />

          {viewMode === 'side_by_side' ? (
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full h-full relative z-10 min-h-0">
              <div className="flex items-center justify-center relative border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60 p-2 min-h-0">
                <span className="absolute top-2 left-2 bg-slate-950/80 text-amber-300 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider z-20">
                  Before (元画像)
                </span>
                <img
                  src={item.previewUrl}
                  alt="Original"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex items-center justify-center relative border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60 p-2 min-h-0">
                <span className="absolute top-2 left-2 bg-slate-950/80 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider z-20">
                  After (変換後)
                </span>
                <img
                  src={item.outputUrl}
                  alt="Converted"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          ) : (
            
            <div
              ref={stageRef}
              className="relative w-full h-full flex items-center justify-center select-none z-10 min-h-0"
            >
              <div
                ref={sliderContainerRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={displayBoxStyle}
                className="relative overflow-hidden rounded-xl border border-slate-800 shadow-2xl cursor-ew-resize touch-none select-none w-full h-full"
              >
                
                <img
                  src={item.outputUrl}
                  alt="Optimized"
                  draggable={false}
                  className="w-full h-full block object-contain select-none pointer-events-none"
                />

                
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                >
                  <img
                    src={item.previewUrl}
                    alt="Original"
                    draggable={false}
                    className="w-full h-full block object-contain select-none"
                  />
                </div>

                
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.8)] z-30 pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 shadow-lg flex items-center justify-center text-xs font-bold ring-2 ring-indigo-500 transition-transform ${
                      isDragging ? 'scale-110 ring-indigo-400' : ''
                    }`}
                  >
                    ↔
                  </div>
                </div>

                
                <span className="absolute bottom-3 left-3 bg-slate-950/80 text-amber-300 text-[10px] px-2 py-1 rounded font-bold tracking-wider z-20 pointer-events-none">
                  ← 元画像 (Before)
                </span>
                <span className="absolute bottom-3 right-3 bg-slate-950/80 text-emerald-300 text-[10px] px-2 py-1 rounded font-bold tracking-wider z-20 pointer-events-none">
                  最適化後 (After) →
                </span>
              </div>
            </div>
          )}
        </div>

        
        {viewMode === 'slider' && (
          <div className="p-2.5 sm:p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-4 shrink-0">
            <span className="text-xs text-slate-400 font-medium">スライダー位置調整:</span>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={Math.round(sliderPos)}
              onChange={(e) => setSliderPos(parseInt(e.target.value, 10))}
              className="w-72 accent-indigo-500 cursor-ew-resize h-1.5 bg-slate-700 rounded-lg appearance-none"
            />
            <span className="text-xs font-mono text-slate-300 w-10">{Math.round(sliderPos)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};
