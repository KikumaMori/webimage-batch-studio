import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ProcessedItem } from '../types';


export async function downloadAllAsZip(
  items: ProcessedItem[],
  zipFilename = 'converted-images.zip',
  onProgress?: (percent: number) => void
): Promise<void> {
  const zip = new JSZip();
  const completedItems = items.filter((item) => item.status === 'completed' && item.outputBlob && item.outputName);

  if (completedItems.length === 0) {
    throw new Error('ダウンロード可能な変換済み画像がありません');
  }

  const nameCounts: Record<string, number> = {};

  completedItems.forEach((item) => {
    let filename = item.outputName || `image-${item.id}`;
    if (nameCounts[filename]) {
      const dotIndex = filename.lastIndexOf('.');
      const base = dotIndex !== -1 ? filename.slice(0, dotIndex) : filename;
      const ext = dotIndex !== -1 ? filename.slice(dotIndex) : '';
      filename = `${base}_${nameCounts[filename]}${ext}`;
      nameCounts[filename] = (nameCounts[filename] || 0) + 1;
    } else {
      nameCounts[filename] = 1;
    }

    if (item.outputBlob) {
      zip.file(filename, item.outputBlob);
    }
  });

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      if (onProgress) {
        onProgress(Math.round(metadata.percent));
      }
    }
  );

  saveAs(zipBlob, zipFilename);
}


export function downloadSingleImage(item: ProcessedItem): void {
  if (!item.outputBlob || !item.outputName) {
    throw new Error('ダウンロード可能な画像データがありません');
  }
  saveAs(item.outputBlob, item.outputName);
}
