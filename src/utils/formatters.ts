
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}


export function calculateReduction(originalSize: number, newSize: number): number {
  if (originalSize <= 0) return 0;
  const diff = ((newSize - originalSize) / originalSize) * 100;
  return Math.round(diff * 10) / 10;
}


function slugifySegment(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}


export function slugifyFilename(name: string): string {
  const lastDotIndex = name.lastIndexOf('.');
  const baseName = lastDotIndex !== -1 ? name.slice(0, lastDotIndex) : name;

  return slugifySegment(baseName) || 'image';
}

export interface RenameOptions {
  numberPattern?: string;
  replaceSearch?: string;
  replaceWith?: string;
  replaceUseRegex?: boolean;
}


export function validateRegex(pattern: string): string | null {
  if (!pattern) return null;
  try {
    new RegExp(pattern, 'g');
    return null;
  } catch {
    return '正規表現の構文が正しくありません';
  }
}


export function generateOutputFileName(
  originalName: string,
  index: number,
  rule: string,
  prefix: string,
  suffix: string,
  extension: string,
  options?: RenameOptions
): string {
  const lastDotIndex = originalName.lastIndexOf('.');
  const rawBase = lastDotIndex !== -1 ? originalName.slice(0, lastDotIndex) : originalName;
  const paddedIndex = String(index + 1).padStart(2, '0');

  let base = rawBase;
  switch (rule) {
    case 'prefix_number': {
      const rawPattern = options?.numberPattern !== undefined ? options.numberPattern : prefix;
      const trimmed = rawPattern.trim();
      if (!trimmed) {
        base = `img-${paddedIndex}`;
      } else if (trimmed.includes('*')) {
        base = trimmed.replace(/\*/g, paddedIndex);
      } else {
        base =
          trimmed.endsWith('-') || trimmed.endsWith('_')
            ? `${trimmed}${paddedIndex}`
            : `${trimmed}-${paddedIndex}`;
      }
      break;
    }
    case 'seo_friendly': {
      const seoBase = slugifyFilename(rawBase);
      const seoPrefix = prefix ? slugifySegment(prefix) : '';
      const seoSuffix = suffix ? slugifySegment(suffix) : '';
      base = `${seoPrefix ? seoPrefix + '-' : ''}${seoBase}${seoSuffix ? '-' + seoSuffix : ''}`;
      break;
    }
    case 'replace': {
      const search = options?.replaceSearch ?? '';
      const replaceWith = options?.replaceWith ?? '';
      const useRegex = options?.replaceUseRegex ?? false;

      if (!search) {
        base = rawBase;
      } else if (useRegex) {
        try {
          const regex = new RegExp(search, 'g');
          base = rawBase.replace(regex, replaceWith);
        } catch {
          base = rawBase;
        }
      } else {
        base = rawBase.split(search).join(replaceWith);
      }

      if (!base) {
        base = 'image';
      }
      break;
    }
    case 'original':
    default:
      if (prefix || suffix) {
        base = `${prefix ? prefix + '-' : ''}${rawBase}${suffix ? '-' + suffix : ''}`;
      } else {
        base = rawBase;
      }
      break;
  }

  return `${base}.${extension}`;
}
