import { deflate } from 'pako';
import { ProcessingSettings, SupportedOutputFormat } from '../types';


export function isFormatSupported(format: SupportedOutputFormat): boolean {
  if (format === 'avif') {
    return true;
  }
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const mimeType = `image/${format}`;
    const dataUrl = canvas.toDataURL(mimeType);
    return dataUrl.startsWith(`data:${mimeType}`);
  } catch {
    return false;
  }
}


export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      URL.revokeObjectURL(url);
      resolve({ width, height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('画像の読み込みに失敗しました'));
    };
    img.src = url;
  });
}


export function calculateTargetDimensions(
  origW: number,
  origH: number,
  settings: ProcessingSettings
): { width: number; height: number } {
  let targetW = origW;
  let targetH = origH;

  switch (settings.resizeMode) {
    case 'max_edge': {
      const maxEdge = Math.max(10, settings.maxEdge);
      const currentMax = Math.max(origW, origH);
      if (settings.dontUpscale && currentMax <= maxEdge) {
        return { width: origW, height: origH };
      }
      if (settings.maintainAspectRatio) {
        const scale = maxEdge / currentMax;
        targetW = Math.round(origW * scale);
        targetH = Math.round(origH * scale);
      } else if (origW >= origH) {
        targetW = maxEdge;
        targetH = origH;
      } else {
        targetW = origW;
        targetH = maxEdge;
      }
      break;
    }
    case 'min_edge': {
      const minEdge = Math.max(10, settings.minEdge);
      const currentMin = Math.min(origW, origH);
      if (settings.dontUpscale && currentMin <= minEdge) {
        return { width: origW, height: origH };
      }
      if (settings.maintainAspectRatio) {
        const scale = minEdge / currentMin;
        targetW = Math.round(origW * scale);
        targetH = Math.round(origH * scale);
      } else if (origW <= origH) {
        targetW = minEdge;
        targetH = origH;
      } else {
        targetW = origW;
        targetH = minEdge;
      }
      break;
    }
    case 'width': {
      const w = Math.max(10, settings.width);
      if (settings.dontUpscale && origW <= w) {
        return { width: origW, height: origH };
      }
      targetW = w;
      if (settings.maintainAspectRatio) {
        const scale = w / origW;
        targetH = Math.round(origH * scale);
      } else {
        targetH = origH;
      }
      break;
    }
    case 'height': {
      const h = Math.max(10, settings.height);
      if (settings.dontUpscale && origH <= h) {
        return { width: origW, height: origH };
      }
      targetH = h;
      if (settings.maintainAspectRatio) {
        const scale = h / origH;
        targetW = Math.round(origW * scale);
      } else {
        targetW = origW;
      }
      break;
    }
    case 'percentage': {
      const pct = Math.max(1, settings.percentage);
      const scale = pct / 100;
      targetW = Math.max(1, Math.round(origW * scale));
      targetH = Math.max(1, Math.round(origH * scale));
      break;
    }
    case 'none':
    default:
      targetW = origW;
      targetH = origH;
      break;
  }

  return {
    width: Math.max(1, targetW),
    height: Math.max(1, targetH),
  };
}


function drawWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: ProcessingSettings['watermark']
) {
  if (!settings.enabled || !settings.text.trim()) return;

  ctx.save();

  const baseSize = Math.max(12, Math.min(80, Math.round((width / 1000) * settings.fontSize)));
  ctx.font = `bold ${baseSize}px "Plus Jakarta Sans", "Noto Sans JP", sans-serif`;
  ctx.globalAlpha = Math.max(0.1, Math.min(1.0, settings.opacity));
  ctx.fillStyle = settings.color || '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  const textMetrics = ctx.measureText(settings.text);
  const textWidth = textMetrics.width;
  const padding = baseSize * 0.8;

  let x = padding;
  let y = height - padding;

  switch (settings.position) {
    case 'bottom_right':
      x = width - textWidth - padding;
      y = height - padding;
      break;
    case 'bottom_left':
      x = padding;
      y = height - padding;
      break;
    case 'top_right':
      x = width - textWidth - padding;
      y = padding + baseSize;
      break;
    case 'top_left':
      x = padding;
      y = padding + baseSize;
      break;
    case 'center':
      x = (width - textWidth) / 2;
      y = height / 2 + baseSize / 3;
      break;
  }

  ctx.fillText(settings.text, x, y);
  ctx.restore();
}


export async function processImageFile(
  file: File,
  settings: ProcessingSettings
): Promise<{
  blob: Blob;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = async () => {
      try {
        const origW = img.naturalWidth || img.width;
        const origH = img.naturalHeight || img.height;

        const { width: targetW, height: targetH } = calculateTargetDimensions(origW, origH, settings);

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d', { alpha: true });

        if (!ctx) {
          throw new Error('Canvas 2Dコンテキストの生成に失敗しました');
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        if (settings.format === 'jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetW, targetH);
        }

        ctx.drawImage(img, 0, 0, targetW, targetH);

        if (settings.watermark.enabled) {
          drawWatermark(ctx, targetW, targetH, settings.watermark);
        }

        if (settings.format === 'avif') {
          const imageData = ctx.getImageData(0, 0, targetW, targetH);
          const avifModule = await import('@jsquash/avif') as any;
          const encodeFunc = avifModule.default || avifModule.encode || avifModule;
          const avifBuffer = await encodeFunc(imageData, {
            quality: settings.quality,
          });
          URL.revokeObjectURL(objectUrl);
          const blob = new Blob([avifBuffer], { type: 'image/avif' });
          resolve({
            blob,
            width: targetW,
            height: targetH,
          });
          return;
        }

        if (settings.format === 'png') {
          const imageData = ctx.getImageData(0, 0, targetW, targetH);
          const pngBytes = encodePng(imageData, settings.pngCompressionLevel);
          URL.revokeObjectURL(objectUrl);
          const blob = new Blob([pngBytes], { type: 'image/png' });
          resolve({
            blob,
            width: targetW,
            height: targetH,
          });
          return;
        }

        const mimeType = `image/${settings.format}`;
        const quality = settings.quality / 100;

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (!blob) {
              reject(new Error(`${settings.format.toUpperCase()} への変換に失敗しました`));
              return;
            }
            resolve({
              blob,
              width: targetW,
              height: targetH,
            });
          },
          mimeType,
          quality
        );
      } catch (err: any) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('画像のロード中にエラーが発生しました'));
    };

    img.src = objectUrl;
  });
}


const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function paethPredictor(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function createPngChunk(type: string, data: Uint8Array): Uint8Array {
  const chunk = new Uint8Array(12 + data.length);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, data.length, false);
  chunk[4] = type.charCodeAt(0);
  chunk[5] = type.charCodeAt(1);
  chunk[6] = type.charCodeAt(2);
  chunk[7] = type.charCodeAt(3);
  chunk.set(data, 8);
  const crc = crc32(chunk.subarray(4, 8 + data.length));
  view.setUint32(8 + data.length, crc, false);
  return chunk;
}


export function encodePng(
  imageData: { width: number; height: number; data: Uint8ClampedArray | Uint8Array },
  compressionLevel = 9
): Uint8Array<ArrayBuffer> {
  const { width, height, data } = imageData;
  const level = Math.max(0, Math.min(9, Math.round(compressionLevel))) as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

  let hasAlpha = false;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] !== 255) {
      hasAlpha = true;
      break;
    }
  }

  const bpp = hasAlpha ? 4 : 3;
  const rowBytes = width * bpp;
  const scanlines = new Uint8Array((rowBytes + 1) * height);

  const rawRow = new Uint8Array(rowBytes);
  const prevRow = new Uint8Array(rowBytes);
  const candBuf = level > 0 ? new Uint8Array(rowBytes) : null;
  const bestBuf = level > 0 ? new Uint8Array(rowBytes) : null;

  for (let y = 0; y < height; y++) {
    const srcOffset = y * width * 4;
    if (hasAlpha) {
      rawRow.set(data.subarray(srcOffset, srcOffset + rowBytes));
    } else {
      for (let x = 0, dst = 0, src = srcOffset; x < width; x++, dst += 3, src += 4) {
        rawRow[dst] = data[src];
        rawRow[dst + 1] = data[src + 1];
        rawRow[dst + 2] = data[src + 2];
      }
    }

    const outOffset = y * (rowBytes + 1);

    if (level === 0 || !candBuf || !bestBuf) {
      scanlines[outOffset] = 0;
      scanlines.set(rawRow, outOffset + 1);
    } else {
      let bestFilter = 0;
      let bestScore = Infinity;

      for (let f = 0; f <= 4; f++) {
        let score = 0;
        for (let i = 0; i < rowBytes; i++) {
          const x = rawRow[i];
          const a = i >= bpp ? rawRow[i - bpp] : 0;
          const b = y > 0 ? prevRow[i] : 0;
          const c = y > 0 && i >= bpp ? prevRow[i - bpp] : 0;

          let val: number;
          switch (f) {
            case 0:
              val = x;
              break;
            case 1:
              val = (x - a) & 0xff;
              break;
            case 2:
              val = (x - b) & 0xff;
              break;
            case 3:
              val = (x - ((a + b) >> 1)) & 0xff;
              break;
            case 4:
            default:
              val = (x - paethPredictor(a, b, c)) & 0xff;
              break;
          }
          candBuf[i] = val;
          score += val < 128 ? val : 256 - val;
        }

        if (score < bestScore) {
          bestScore = score;
          bestFilter = f;
          bestBuf.set(candBuf);
        }
      }

      scanlines[outOffset] = bestFilter;
      scanlines.set(bestBuf, outOffset + 1);
      prevRow.set(rawRow);
    }
  }

  const compressed = deflate(scanlines, { level });

  const ihdr = new Uint8Array(13);
  const ihdrView = new DataView(ihdr.buffer);
  ihdrView.setUint32(0, width, false);
  ihdrView.setUint32(4, height, false);
  ihdr[8] = 8;
  ihdr[9] = hasAlpha ? 6 : 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrChunk = createPngChunk('IHDR', ihdr);
  const idatChunk = createPngChunk('IDAT', compressed);
  const iendChunk = createPngChunk('IEND', new Uint8Array(0));

  const out = new Uint8Array(
    signature.length + ihdrChunk.length + idatChunk.length + iendChunk.length
  );
  let pos = 0;
  out.set(signature, pos);
  pos += signature.length;
  out.set(ihdrChunk, pos);
  pos += ihdrChunk.length;
  out.set(idatChunk, pos);
  pos += idatChunk.length;
  out.set(iendChunk, pos);

  return out;
}
