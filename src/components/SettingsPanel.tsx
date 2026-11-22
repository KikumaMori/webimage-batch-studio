import React, { useState } from 'react';
import {
  ProcessingSettings,
  SupportedOutputFormat,
  ResizeMode,
  RenameRule,
  WatermarkPosition,
} from '../types';
import { isFormatSupported } from '../utils/imageProcessor';
import { generateOutputFileName, validateRegex } from '../utils/formatters';
import {
  Sliders,
  Maximize2,
  FileText,
  ShieldCheck,
  Stamp,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react';

interface SettingsPanelProps {
  settings: ProcessingSettings;
  onChange: (newSettings: ProcessingSettings) => void;
  disabled?: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onChange,
  disabled = false,
}) => {
  const [showWatermark, setShowWatermark] = useState(settings.watermark.enabled);
  const isAvifSupported = isFormatSupported('avif');

  const update = <K extends keyof ProcessingSettings>(key: K, value: ProcessingSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const handleFormatChange = (fmtId: SupportedOutputFormat) => {
    if (fmtId === 'png') {
      onChange({ ...settings, format: fmtId });
      return;
    }
    let defaultQ = settings.quality;
    if (fmtId === 'webp') defaultQ = 80;
    else if (fmtId === 'jpeg') defaultQ = 85;
    else if (fmtId === 'avif') defaultQ = 80;
    onChange({ ...settings, format: fmtId, quality: defaultQ });
  };

  const updateWatermark = <K extends keyof ProcessingSettings['watermark']>(
    key: K,
    value: ProcessingSettings['watermark'][K]
  ) => {
    onChange({
      ...settings,
      watermark: {
        ...settings.watermark,
        [key]: value,
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 transition-all space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">一括変換・最適化設定</h2>
            <p className="text-xs text-slate-500">設定変更後は「再変換」ボタンで既存画像に適用できます</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Exif・GPS位置情報は自動消去されます</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              出力フォーマット
            </label>
            <span className="text-[11px] font-medium text-indigo-600">
              {settings.format.toUpperCase()} 選択中
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              {
                id: 'webp' as SupportedOutputFormat,
                name: 'WebP',
                desc: '高圧縮・Web最適 (推奨)',
                badge: '推奨',
                supported: true,
              },
              {
                id: 'png' as SupportedOutputFormat,
                name: 'PNG',
                desc: '透過保持・圧縮レベル調整可',
                supported: true,
              },
              {
                id: 'jpeg' as SupportedOutputFormat,
                name: 'JPEG',
                desc: '汎用写真フォーマット',
                supported: true,
              },
              {
                id: 'avif' as SupportedOutputFormat,
                name: 'AVIF',
                desc: isAvifSupported ? '次世代・超高圧縮' : 'お使いのブラウザ非対応',
                badge: isAvifSupported ? '最新' : '非対応',
                supported: isAvifSupported,
              },
            ].map((fmt) => {
              const isSelected = settings.format === fmt.id;
              return (
                <button
                  key={fmt.id}
                  type="button"
                  disabled={disabled || !fmt.supported}
                  onClick={() => handleFormatChange(fmt.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all relative cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 text-indigo-950 font-semibold'
                      : !fmt.supported
                      ? 'opacity-40 border-slate-200 bg-slate-50 cursor-not-allowed text-slate-400'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{fmt.name}</span>
                    {fmt.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          fmt.badge === '推奨'
                            ? 'bg-indigo-600 text-white'
                            : fmt.badge === '最新'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {fmt.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{fmt.desc}</p>
                </button>
              );
            })}
          </div>

          
          <div className="pt-2 border-t border-slate-100">
            {settings.format === 'png' ? (
              <>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-700">
                    PNG 圧縮レベル
                  </span>
                  <span className="text-xs font-bold text-indigo-600 font-mono">
                    レベル {settings.pngCompressionLevel}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="9"
                  step="1"
                  value={settings.pngCompressionLevel}
                  onChange={(e) => update('pngCompressionLevel', parseInt(e.target.value, 10))}
                  disabled={disabled}
                  className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
                />
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                  <button
                    type="button"
                    onClick={() => update('pngCompressionLevel', 0)}
                    disabled={disabled}
                    className="hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    無圧縮 (0)
                  </button>
                  <button
                    type="button"
                    onClick={() => update('pngCompressionLevel', 6)}
                    disabled={disabled}
                    className="hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    標準 (6)
                  </button>
                  <button
                    type="button"
                    onClick={() => update('pngCompressionLevel', 9)}
                    disabled={disabled}
                    className="hover:text-indigo-600 font-bold text-slate-600 transition-colors cursor-pointer"
                  >
                    推奨・最大 (9)
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5 leading-snug">
                  可逆圧縮のため画質への影響はありません（数値が大きいほどファイルサイズが小さくなります）。
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-700">
                    画質・圧縮クオリティ
                  </span>
                  <span className="text-xs font-bold text-indigo-600 font-mono">
                    {settings.quality}%
                  </span>
                </div>

                <input
                  type="range"
                  min="10"
                  max="100"
                  step="1"
                  value={settings.quality}
                  onChange={(e) => update('quality', parseInt(e.target.value, 10))}
                  disabled={disabled}
                  className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
                />
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                  <button
                    type="button"
                    onClick={() => update('quality', 65)}
                    className="hover:text-indigo-600 transition-colors"
                  >
                    超軽量 (65%)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const rec = settings.format === 'jpeg' ? 85 : 80;
                      update('quality', rec);
                    }}
                    className="hover:text-indigo-600 font-bold text-slate-600 transition-colors"
                  >
                    推奨 ({settings.format === 'jpeg' ? '85%' : '80%'})
                  </button>
                  <button
                    type="button"
                    onClick={() => update('quality', 95)}
                    className="hover:text-indigo-600 transition-colors"
                  >
                    高品質 (95%)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
              リサイズ設定
            </label>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'none' as ResizeMode, label: 'リサイズ無' },
              { id: 'max_edge' as ResizeMode, label: '長辺指定' },
              { id: 'min_edge' as ResizeMode, label: '短辺指定' },
              { id: 'width' as ResizeMode, label: '幅固定' },
              { id: 'height' as ResizeMode, label: '高さ固定' },
              { id: 'percentage' as ResizeMode, label: '比率(%)' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => update('resizeMode', m.id)}
                disabled={disabled}
                className={`px-2 py-1.5 text-xs rounded-lg font-medium border text-center transition-all cursor-pointer ${
                  settings.resizeMode === m.id
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          
          {(settings.resizeMode === 'max_edge' ||
            settings.resizeMode === 'min_edge' ||
            settings.resizeMode === 'width' ||
            settings.resizeMode === 'height') && (() => {
            const activeKey =
              settings.resizeMode === 'max_edge'
                ? 'maxEdge'
                : settings.resizeMode === 'min_edge'
                ? 'minEdge'
                : settings.resizeMode === 'width'
                ? 'width'
                : 'height';
            const fallbackVal = settings.resizeMode === 'min_edge' || settings.resizeMode === 'height' ? 800 : 1200;
            const currentVal = settings[activeKey];
            const placeholderText =
              settings.resizeMode === 'max_edge'
                ? '長辺 px (例: 1200)'
                : settings.resizeMode === 'min_edge'
                ? '短辺 px (例: 800)'
                : settings.resizeMode === 'width'
                ? '幅 px (例: 1200)'
                : '高さ px (例: 800)';
            const unitLabel =
              settings.resizeMode === 'max_edge' || settings.resizeMode === 'min_edge'
                ? 'px 以下'
                : 'px';

            const presets = [
              { px: 1920, label: '1920px (FHD)' },
              { px: 1200, label: '1200px (ブログ)' },
              { px: 1080, label: '1080px' },
              { px: 800, label: '800px (EC)' },
              { px: 720, label: '720px' },
              { px: 400, label: '400px' },
            ];

            return (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="50"
                    max="10000"
                    step="50"
                    value={currentVal}
                    onChange={(e) => update(activeKey, parseInt(e.target.value, 10) || fallbackVal)}
                    disabled={disabled}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
                    placeholder={placeholderText}
                  />
                  <span className="text-xs text-slate-500 font-semibold shrink-0">{unitLabel}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {presets.map(({ px, label }) => (
                    <button
                      key={px}
                      type="button"
                      onClick={() => update(activeKey, px)}
                      disabled={disabled}
                      className={`text-[11px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        currentVal === px
                          ? 'bg-indigo-100 border-indigo-300 text-indigo-800 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

          {settings.resizeMode === 'percentage' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  step="5"
                  value={settings.percentage}
                  onChange={(e) => update('percentage', parseInt(e.target.value, 10) || 50)}
                  disabled={disabled}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
                  placeholder="比率 %"
                />
                <span className="text-xs text-slate-500 font-semibold shrink-0">% にリサイズ</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[25, 50, 75, 100, 125, 150, 175, 200].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => update('percentage', pct)}
                    disabled={disabled}
                    className={`text-[11px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                      settings.percentage === pct
                        ? 'bg-indigo-100 border-indigo-300 text-indigo-800 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          )}

          {settings.resizeMode === 'none' && (
            <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200">
              元のピクセル解像度をそのまま維持し、フォーマット変換・圧縮のみ行います。
            </p>
          )}

          
          <div className="space-y-1.5 pt-1">
            
            <label
              className={`flex items-center gap-2 ${
                disabled || settings.resizeMode === 'none' || settings.resizeMode === 'percentage'
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
            >
              <input
                type="checkbox"
                checked={settings.resizeMode === 'percentage' ? true : settings.maintainAspectRatio}
                onChange={(e) => update('maintainAspectRatio', e.target.checked)}
                disabled={disabled || settings.resizeMode === 'none' || settings.resizeMode === 'percentage'}
                className="rounded-sm text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span className="text-xs text-slate-600 select-none">
                縦横比を自動維持する
              </span>
            </label>

            
            <label
              className={`flex items-center gap-2 ${
                disabled || settings.resizeMode === 'none' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <input
                type="checkbox"
                checked={settings.dontUpscale}
                onChange={(e) => update('dontUpscale', e.target.checked)}
                disabled={disabled || settings.resizeMode === 'none'}
                className="rounded-sm text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span className="text-xs text-slate-600 select-none">
                元画像より大きい場合は拡大しない (Don't upscale)
              </span>
            </label>
          </div>
        </div>

        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              一括リネーム・SEO規則
            </label>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'original' as RenameRule, label: '元の名前' },
              { id: 'prefix_number' as RenameRule, label: '連番命名' },
              { id: 'seo_friendly' as RenameRule, label: 'SEO小文字' },
              { id: 'replace' as RenameRule, label: '置換' },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => update('renameRule', r.id)}
                disabled={disabled}
                className={`px-2 py-1.5 text-xs rounded-lg font-medium border text-center transition-all cursor-pointer ${
                  settings.renameRule === r.id
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {settings.renameRule === 'prefix_number' && (
              <div className="space-y-1.5">
                <input
                  type="text"
                  value={settings.numberPattern}
                  onChange={(e) => update('numberPattern', e.target.value)}
                  disabled={disabled}
                  placeholder="例: img-*, *-photo (空欄時は img-*)"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
                />
                <p className="text-[11px] text-slate-500 leading-snug">
                  ※「<span className="font-mono font-bold text-indigo-600">*</span>」の位置が連番（01, 02, ...）になります。
                </p>
              </div>
            )}

            {settings.renameRule === 'replace' && (() => {
              const regexError = settings.replaceUseRegex ? validateRegex(settings.replaceSearch) : null;
              return (
                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      検索文字列
                    </label>
                    <input
                      type="text"
                      value={settings.replaceSearch}
                      onChange={(e) => update('replaceSearch', e.target.value)}
                      disabled={disabled}
                      placeholder={settings.replaceUseRegex ? '例: _\\d+$ または IMG_' : '検索する文字列 (例: IMG_)'}
                      className={`w-full px-3 py-1.5 text-xs border rounded-lg focus:ring-2 focus:outline-hidden font-mono ${
                        regexError
                          ? 'border-rose-400 focus:ring-rose-500'
                          : 'border-slate-300 focus:ring-indigo-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      置換文字列
                    </label>
                    <input
                      type="text"
                      value={settings.replaceWith}
                      onChange={(e) => update('replaceWith', e.target.value)}
                      disabled={disabled}
                      placeholder="置換後の文字列 (空欄で削除)"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer pt-0.5">
                    <input
                      type="checkbox"
                      checked={settings.replaceUseRegex}
                      onChange={(e) => update('replaceUseRegex', e.target.checked)}
                      disabled={disabled}
                      className="rounded-sm text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span className="text-xs text-slate-600 select-none">
                      正規表現を使用する
                    </span>
                  </label>
                  {regexError && (
                    <p className="text-[11px] text-rose-600 font-medium">{regexError}</p>
                  )}
                </div>
              );
            })()}

            {(settings.renameRule === 'original' || settings.renameRule === 'seo_friendly') && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={settings.prefix}
                  onChange={(e) => update('prefix', e.target.value)}
                  disabled={disabled}
                  placeholder="接頭辞 (省略可)"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                <input
                  type="text"
                  value={settings.suffix}
                  onChange={(e) => update('suffix', e.target.value)}
                  disabled={disabled}
                  placeholder="接尾辞 (例: min)"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            )}

            
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-400 text-[10px] block font-semibold mb-0.5">
                {settings.renameRule === 'replace'
                  ? '出力ファイル名プレビュー例 (元: IMG_sample_01.jpg):'
                  : '出力ファイル名プレビュー例:'}
              </span>
              <span className="font-mono text-indigo-700 font-medium break-all">
                {generateOutputFileName(
                  settings.renameRule === 'replace'
                    ? 'IMG_sample_01.jpg'
                    : settings.renameRule === 'seo_friendly'
                    ? 'Sample Photo.jpg'
                    : 'original-name.jpg',
                  0,
                  settings.renameRule,
                  settings.prefix,
                  settings.suffix,
                  settings.format,
                  {
                    numberPattern: settings.numberPattern,
                    replaceSearch: settings.replaceSearch,
                    replaceWith: settings.replaceWith,
                    replaceUseRegex: settings.replaceUseRegex,
                  }
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      
      <div className="border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => {
            const next = !showWatermark;
            setShowWatermark(next);
            updateWatermark('enabled', next);
          }}
          className="flex items-center justify-between w-full text-left text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer py-1"
        >
          <div className="flex items-center gap-2">
            <Stamp className="w-4 h-4 text-indigo-600" />
            <span>透かし（ウォーターマーク）文字の自動埋め込みオプション</span>
            {settings.watermark.enabled && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">
                <CheckCircle2 className="w-3 h-3" /> 有効
              </span>
            )}
          </div>
          {showWatermark ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showWatermark && (
          <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-150">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">透かしテキスト</label>
              <input
                type="text"
                value={settings.watermark.text}
                onChange={(e) => updateWatermark('text', e.target.value)}
                placeholder="例: © 2026 MyBrand"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">配置位置</label>
              <select
                value={settings.watermark.position}
                onChange={(e) => updateWatermark('position', e.target.value as WatermarkPosition)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                <option value="bottom_right">右下 (推奨)</option>
                <option value="bottom_left">左下</option>
                <option value="top_right">右上</option>
                <option value="top_left">左上</option>
                <option value="center">中央</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-semibold text-slate-600">不透明度</label>
                <span className="text-[10px] font-mono text-slate-500">{Math.round(settings.watermark.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={settings.watermark.opacity}
                onChange={(e) => updateWatermark('opacity', parseFloat(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-semibold text-slate-600">文字サイズ比率</label>
                <span className="text-[10px] font-mono text-slate-500">{settings.watermark.fontSize}px基底</span>
              </div>
              <input
                type="range"
                min="16"
                max="64"
                step="4"
                value={settings.watermark.fontSize}
                onChange={(e) => updateWatermark('fontSize', parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
