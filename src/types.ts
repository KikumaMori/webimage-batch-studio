export type SupportedOutputFormat = 'webp' | 'jpeg' | 'png' | 'avif';

export type ResizeMode = 'none' | 'max_edge' | 'min_edge' | 'width' | 'height' | 'percentage';

export type RenameRule = 'original' | 'prefix_number' | 'seo_friendly' | 'replace';

export type WatermarkPosition = 'bottom_right' | 'bottom_left' | 'top_right' | 'top_left' | 'center';

export interface WatermarkSettings {
  enabled: boolean;
  text: string;
  position: WatermarkPosition;
  opacity: number;
  fontSize: number;
  color: string;
}

export interface ProcessingSettings {
  format: SupportedOutputFormat;
  quality: number;
  pngCompressionLevel: number;
  resizeMode: ResizeMode;
  maxEdge: number;
  minEdge: number;
  width: number;
  height: number;
  percentage: number;
  maintainAspectRatio: boolean;
  dontUpscale: boolean;
  stripExif: boolean;
  renameRule: RenameRule;
  prefix: string;
  suffix: string;
  numberPattern: string;
  replaceSearch: string;
  replaceWith: string;
  replaceUseRegex: boolean;
  watermark: WatermarkSettings;
}

export interface ProcessedItem {
  id: string;
  file: File;
  originalName: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalType: string;
  previewUrl: string;

  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  outputBlob?: Blob;
  outputUrl?: string;
  outputSize?: number;
  outputWidth?: number;
  outputHeight?: number;
  outputName?: string;
  reductionPercentage?: number;
  errorMessage?: string;
}
