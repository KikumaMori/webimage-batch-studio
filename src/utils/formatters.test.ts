import { describe, expect, it } from 'vitest';
import {
  calculateReduction,
  formatBytes,
  generateOutputFileName,
  slugifyFilename,
  validateRegex,
} from './formatters';

describe('formatBytes', () => {
  it('should format 0 bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('should format bytes to appropriate units', () => {
    expect(formatBytes(500)).toBe('500 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1024 * 1024)).toBe('1 MB');
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
  });

  it('should respect custom decimals', () => {
    expect(formatBytes(1536, 2)).toBe('1.5 KB');
    expect(formatBytes(1234567, 2)).toBe('1.18 MB');
    expect(formatBytes(1234567, 0)).toBe('1 MB');
  });
});

describe('calculateReduction', () => {
  it('should calculate reduction percentage correctly', () => {
    expect(calculateReduction(1000, 200)).toBe(-80);
    expect(calculateReduction(1000, 500)).toBe(-50);
  });

  it('should handle file size increases', () => {
    expect(calculateReduction(1000, 1500)).toBe(50);
  });

  it('should prevent division by zero when original size is 0 or negative', () => {
    expect(calculateReduction(0, 100)).toBe(0);
    expect(calculateReduction(-10, 100)).toBe(0);
  });
});

describe('slugifyFilename', () => {
  it('should sanitize names for SEO friendliness', () => {
    expect(slugifyFilename('My Summer Vacation Photo.jpg')).toBe('my-summer-vacation-photo');
    expect(slugifyFilename('banner__graphic_2026.png')).toBe('banner-graphic-2026');
  });

  it('should remove special characters and symbols', () => {
    expect(slugifyFilename('Sale! 50% Off (New).webp')).toBe('sale-50-off-new');
  });

  it('should fallback to "image" when string becomes empty after sanitization', () => {
    expect(slugifyFilename('***???@@@.png')).toBe('image');
  });
});

describe('generateOutputFileName', () => {
  it('should preserve original filename with extension', () => {
    expect(
      generateOutputFileName('photo.png', 0, 'original', '', '', 'webp')
    ).toBe('photo.webp');
    expect(
      generateOutputFileName('photo.png', 0, 'original', 'thumb', 'optimized', 'webp')
    ).toBe('thumb-photo-optimized.webp');
  });

  it('should replace literal text and regex in replace mode', () => {
    expect(
      generateOutputFileName('IMG_2026_IMG_01.png', 0, 'replace', '', '', 'webp', {
        replaceSearch: 'IMG_',
        replaceWith: 'blog_',
        replaceUseRegex: false,
      })
    ).toBe('blog_2026_blog_01.webp');

    expect(
      generateOutputFileName('photo_2026_01.png', 0, 'replace', '', '', 'webp', {
        replaceSearch: '_(\\d+)$',
        replaceWith: '-no$1',
        replaceUseRegex: true,
      })
    ).toBe('photo_2026-no01.webp');

    expect(
      generateOutputFileName('photo.png', 0, 'replace', '', '', 'webp', {
        replaceSearch: '[invalid',
        replaceWith: 'ok',
        replaceUseRegex: true,
      })
    ).toBe('photo.webp');
  });

  it('should generate sequential numbered filenames replacing * position', () => {
    expect(
      generateOutputFileName('photo.png', 0, 'prefix_number', '', '', 'jpg', {
        numberPattern: '*-banner',
      })
    ).toBe('01-banner.jpg');
    expect(
      generateOutputFileName('photo.png', 8, 'prefix_number', '', '', 'jpg', {
        numberPattern: 'blog_*_thumb',
      })
    ).toBe('blog_09_thumb.jpg');
    expect(
      generateOutputFileName('photo.png', 11, 'prefix_number', '', '', 'jpg', {
        numberPattern: '',
      })
    ).toBe('img-12.jpg');
    expect(
      generateOutputFileName('photo.png', 0, 'prefix_number', 'item', '', 'jpg')
    ).toBe('item-01.jpg');
  });

  it('should generate SEO-friendly slugged filenames with slugified prefix and suffix', () => {
    expect(
      generateOutputFileName('My New Blog Post!.jpg', 0, 'seo_friendly', 'Prod_Item!', 'Min 2026', 'webp')
    ).toBe('prod-item-my-new-blog-post-min-2026.webp');
    expect(
      generateOutputFileName('My New Blog Post!.jpg', 0, 'seo_friendly', 'prod', '', 'webp')
    ).toBe('prod-my-new-blog-post.webp');
  });
});

describe('validateRegex', () => {
  it('should return null for valid regex and error message for invalid regex', () => {
    expect(validateRegex('^IMG_\\d+$')).toBeNull();
    expect(validateRegex('[unclosed')).not.toBeNull();
  });
});
