import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Clipboard, Zap } from 'lucide-react';

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void;
  compact?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFilesAdded, compact = false }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragActive) setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      onFilesAdded(filesArray);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesAdded(filesArray);
      e.target.value = '';
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = e.clipboardData.items;
      const pastedFiles: File[] = [];

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            pastedFiles.push(file);
          }
        }
      }

      if (pastedFiles.length > 0) {
        onFilesAdded(pastedFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFilesAdded]);

  if (compact) {
    return (
      <div
        id="dropzone-compact"
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-4 transition-all duration-200 cursor-pointer text-center flex items-center justify-center gap-3 select-none ${
          isDragActive
            ? 'border-indigo-500 bg-indigo-50/60 scale-[1.01]'
            : 'border-slate-300 hover:border-indigo-400 bg-white/70 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.webp,.avif,.png,.jpg,.jpeg,.gif,.svg,.bmp,.ico"
          onChange={handleFileInputChange}
          className="hidden"
        />
        <UploadCloud className={`w-5 h-5 ${isDragActive ? 'text-indigo-600 animate-bounce' : 'text-slate-400'}`} />
        <span className="text-sm font-medium text-slate-700">
          追加で画像をドロップ、または<span className="text-indigo-600 underline ml-1">クリックして選択</span> (Ctrl+V ペースト可)
        </span>
      </div>
    );
  }

  return (
    <div
      id="dropzone-main"
      onClick={() => fileInputRef.current?.click()}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 transition-all duration-200 cursor-pointer text-center overflow-hidden group select-none ${
        isDragActive
          ? 'border-indigo-600 bg-indigo-50/70 shadow-lg shadow-indigo-100 scale-[1.01]'
          : 'border-slate-300 hover:border-indigo-500 bg-white hover:bg-slate-50/70 shadow-xs hover:shadow-md'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.webp,.avif,.png,.jpg,.jpeg,.gif,.svg,.bmp,.ico"
        onChange={handleFileInputChange}
        className="hidden"
      />

      
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/30 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center pointer-events-none">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${
            isDragActive
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 animate-pulse'
              : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'
          }`}
        >
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
          ここに画像をドラッグ＆ドロップ
        </h3>
        <p className="text-sm text-slate-500 mt-1 mb-4">
          または <span className="text-indigo-600 font-semibold underline underline-offset-2 hover:text-indigo-700">ファイルを選択</span>
        </p>

        
        <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
            JPEG, PNG, WebP, AVIF, GIF, SVG
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <Clipboard className="w-3.5 h-3.5 text-slate-500" />
            Ctrl + V ペースト対応
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            複数枚一括処理
          </span>
        </div>

        <p className="text-xs text-slate-400 mt-4">
          ※ 端末内（ローカル）でのみ処理されるため、サーバーに画像は一切送信されません。大容量・機密画像も安全です。
        </p>
      </div>
    </div>
  );
};
