import { describe, expect, it } from 'vitest';
import { ProcessingSettings } from '../types';
import { calculateTargetDimensions, encodePng } from './imageProcessor';

describe('calculateTargetDimensions', () => {
  const baseSettings: ProcessingSettings = {
    format: 'webp',
    quality: 85,
    pngCompressionLevel: 9,
    resizeMode: 'none',
    maxEdge: 1920,
    minEdge: 800,
    width: 1200,
    height: 800,
    percentage: 100,
    maintainAspectRatio: true,
    dontUpscale: true,
    stripExif: true,
    renameRule: 'original',
    prefix: '',
    suffix: '',
    numberPattern: 'img-*',
    replaceSearch: '',
    replaceWith: '',
    replaceUseRegex: false,
    watermark: {
      enabled: false,
      text: '',
      position: 'bottom_right',
      fontSize: 24,
      opacity: 0.5,
      color: '#ffffff',
    },
  };

  it('should maintain original dimensions when resizeMode is "none"', () => {
    const result = calculateTargetDimensions(1920, 1080, baseSettings);
    expect(result).toEqual({ width: 1920, height: 1080 });
  });

  describe('max_edge mode', () => {
    it('should scale landscape image according to max edge', () => {
      const settings: ProcessingSettings = {
        ...baseSettings,
        resizeMode: 'max_edge',
        maxEdge: 800,
      };
      const result = calculateTargetDimensions(1600, 800, settings);
      expect(result).toEqual({ width: 800, height: 400 });
    });

    it('should scale portrait image according to max edge', () => {
      const settings: ProcessingSettings = {
        ...baseSettings,
        resizeMode: 'max_edge',
        maxEdge: 600,
      };
      const result = calculateTargetDimensions(400, 1200, settings);
      expect(result).toEqual({ width: 200, height: 600 });
    });

    it('should not upscale if dontUpscale is true', () => {
      const settings: ProcessingSettings = {
        ...baseSettings,
        resizeMode: 'max_edge',
        maxEdge: 2000,
        dontUpscale: true,
      };
      const result = calculateTargetDimensions(800, 600, settings);
      expect(result).toEqual({ width: 800, height: 600 });
    });

    it('should only resize long edge when maintainAspectRatio is false', () => {
      const settings: ProcessingSettings = {
        ...baseSettings,
        resizeMode: 'max_edge',
        maxEdge: 800,
        maintainAspectRatio: false,
      };
      const result = calculateTargetDimensions(1600, 600, settings);
      expect(result).toEqual({ width: 800, height: 600 });
    });
  });

  describe('min_edge mode', () => {
    it('should scale landscape image according to min edge', () => {
      const settings: ProcessingSettings = {
        ...baseSettings,
        resizeMode: 'min_edge',
        minEdge: 720,
      };
      const result = calculateTargetDimensions(1920, 1080, settings);
      expect(result).toEqual({ width: 1280, height: 720 });
    });

    it('should scale portrait image according to min edge', () => {
      const settings: ProcessingSettings = {
        ...baseSettings,
        resizeMode: 'min_edge',
        minEdge: 400,
      };
      const result = calculateTargetDimensions(800, 1200, settings);
      expect(result).toEqual({ width: 400, height: 600 });
    });

    it('should not upscale if min edge is smaller than target and dontUpscale is true', () => {
      const settings: ProcessingSettings = {
        ...baseSettings,
        resizeMode: 'min_edge',
        minEdge: 1080,
        dontUpscale: true,
      };
      const result = calculateTargetDimensions(1200, 800, settings);
      expect(result).toEqual({ width: 1200, height: 800 });
    });

    it('should only resize short edge when maintainAspectRatio is false', () => {
      const settings: ProcessingSettings = {
        ...baseSettings,
        resizeMode: 'min_edge',
        minEdge: 720,
        maintainAspectRatio: false,
      };
      const result = calculateTargetDimensions(1920, 1080, settings);
      expect(result).toEqual({ width: 1920, height: 720 });
    });
  });

  describe('width mode', () => {
    it('should calculate proportional height based on target width', () => {
      const settings: ProcessingSettings = {
        ...baseSettings,
        resizeMode: 'width',
        width: 800,
      };
      const result = calculateTargetDimensions(1600, 1200, settings);
      expect(result).toEqual({ width: 800, height: 600 });
    });

    it('should keep original height when maintainAspectRatio is false', () => {
      const settings: ProcessingSettings = {
        ...baseSettings,
        resizeMode: 'width',
        width: 800,
        maintainAspectRatio: false,
      };
      const result = calculateTargetDimensions(1600, 1200, settings);
      expect(result).toEqual({ width: 800, height: 1200 });
    });

    it('should not upscale if image width is smaller than target and dontUpscale is true', () => {
      const settings: ProcessingSettings = {
        ...baseSettings,
        resizeMode: 'width',
        width: 1200,
        dontUpscale: true,
      };
      const result = calculateTargetDimensions(800, 600, settings);
      expect(result).toEqual({ width: 800, height: 600 });
    });
  });

  describe('height mode', () => {
    it('should calculate proportional width based on target height', () => {
      const settings: ProcessingSettings = {
        ...baseSettings,
        resizeMode: 'height',
        height: 600,
      };
      const result = calculateTargetDimensions(1600, 1200, settings);
      expect(result).toEqual({ width: 800, height: 600 });
    });

    it('should keep original width when maintainAspectRatio is false', () => {
      const settings: ProcessingSettings = {
        ...baseSettings,
        resizeMode: 'height',
        height: 600,
        maintainAspectRatio: false,
      };
      const result = calculateTargetDimensions(1600, 1200, settings);
      expect(result).toEqual({ width: 1600, height: 600 });
    });

    it('should not upscale if image height is smaller than target and dontUpscale is true', () => {
      const settings: ProcessingSettings = {
        ...baseSettings,
        resizeMode: 'height',
        height: 1000,
        dontUpscale: true,
      };
      const result = calculateTargetDimensions(800, 500, settings);
      expect(result).toEqual({ width: 800, height: 500 });
    });
  });

  describe('percentage mode', () => {
    it('should scale dimensions by percentage regardless of maintainAspectRatio', () => {
      const settings: ProcessingSettings = {
        ...baseSettings,
        resizeMode: 'percentage',
        percentage: 50,
        maintainAspectRatio: false,
      };
      const result = calculateTargetDimensions(1000, 800, settings);
      expect(result).toEqual({ width: 500, height: 400 });
    });

    it('should enlarge dimensions for percentages above 100% including over 200%', () => {
      const settings150: ProcessingSettings = {
        ...baseSettings,
        resizeMode: 'percentage',
        percentage: 150,
      };
      expect(calculateTargetDimensions(1000, 800, settings150)).toEqual({ width: 1500, height: 1200 });

      const settings300: ProcessingSettings = {
        ...baseSettings,
        resizeMode: 'percentage',
        percentage: 300,
      };
      expect(calculateTargetDimensions(1000, 800, settings300)).toEqual({ width: 3000, height: 2400 });
    });

    it('should clamp dimensions to at least 1px', () => {
      const settings: ProcessingSettings = {
        ...baseSettings,
        resizeMode: 'percentage',
        percentage: 1,
      };
      const result = calculateTargetDimensions(10, 5, settings);
      expect(result.width).toBeGreaterThanOrEqual(1);
      expect(result.height).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('encodePng', () => {
  it('should encode valid PNG header and chunks with smaller output at level 9 than level 0', () => {
    const width = 64;
    const height = 64;
    const data = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        data[idx] = (x * 4) % 256;
        data[idx + 1] = (y * 4) % 256;
        data[idx + 2] = ((x + y) * 2) % 256;
        data[idx + 3] = 255;
      }
    }

    const level0 = encodePng({ width, height, data }, 0);
    const level9 = encodePng({ width, height, data }, 9);

    expect(Array.from(level9.subarray(0, 8))).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    expect(level9[25]).toBe(2);
    expect(level9.length).toBeLessThan(level0.length);
  });

  it('should use RGBA color type 6 when image contains transparency', () => {
    const width = 16;
    const height = 16;
    const data = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 120;
      data[i + 1] = 200;
      data[i + 2] = 255;
      data[i + 3] = i === 0 ? 128 : 255;
    }

    const png = encodePng({ width, height, data }, 9);
    expect(Array.from(png.subarray(0, 8))).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    expect(png[25]).toBe(6);
  });
});
