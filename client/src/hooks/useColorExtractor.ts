import { useState, useCallback } from "react";

interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
}

/**
 * Extract dominant colors from an image with perceptual clustering in Lab space
 * - sRGB → Lab conversion
 * - Adaptive k-means in Lab (ΔE76) with centroid merging by ΔE00
 * - Background and near-neutral filtering, pixel sampling and de-duplication
 * - Returns only colors that actually exist in the image
 */
export function useColorExtractor() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractColors = useCallback(
    async (file: File): Promise<Color[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const img = new Image();
        const url = URL.createObjectURL(file);

        return new Promise((resolve, reject) => {
          img.onload = () => {
            try {
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              if (!ctx) throw new Error("Could not get canvas context");

              // Scale image for processing
              const maxSize = 600;
              const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
              canvas.width = Math.max(1, Math.round(img.width * scale));
              canvas.height = Math.max(1, Math.round(img.height * scale));
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

              // Sample pixels with stride and skip alpha/neutral extremes
              const sampled = samplePixels(imageData, {
                stride: chooseStride(canvas.width, canvas.height),
                skipAlphaBelow: 160,
              });
              if (sampled.length === 0) throw new Error("No valid colors found in image");

              // Detect and remove uniform background (common: white, black)
              const bg = detectBackground(imageData);
              const withNoBg = bg
                ? sampled.filter((p) => deltaE00(rgbToLab(p), rgbToLab(bg)) > 8)
                : sampled;

              // Reduce duplicates by mild quantization (fewer unique RGBs)
              const dedup = deduplicateRgb(withNoBg, 8); // 8-bit step quantization per channel
              if (dedup.length === 0) throw new Error("No valid colors after filtering");

              // Convert to Lab for perceptual clustering
              const labPoints = dedup.map((rgb) => ({ rgb, lab: rgbToLab(rgb) }));

              // Adaptive K selection
              const uniqueCount = labPoints.length;
              const initialK = Math.max(4, Math.min(16, Math.round(Math.sqrt(uniqueCount))));

              // k-means in Lab (ΔE76 for speed), then merge centroids by ΔE00
              const clusters = kMeansLab(labPoints.map((p) => p.lab), initialK, 20);

              // Attach original samples to closest centroid
              const clustered = assignPointsToCentroids(labPoints, clusters.centroids);

              // Merge similar clusters by ΔE00 and filter small ones by percentage
              const merged = mergeAndFilterClusters(clustered, {
                mergeDeltaE00: 10,
                minPercent: 1.5,
              });

              // Represent each cluster by the most frequent actual RGB in it
              const results = merged
                .sort((a, b) => b.points.length - a.points.length)
                .map((c) => {
                  const rgb = mostFrequentRgb(c.points.map((p) => p.rgb));
                  const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
                  return { hex, rgb: { r: rgb[0], g: rgb[1], b: rgb[2] } };
                });

              URL.revokeObjectURL(url);
              setIsLoading(false);
              resolve(results);
            } catch (err) {
              URL.revokeObjectURL(url);
              const errorMsg = err instanceof Error ? err.message : "Failed to extract colors";
              setError(errorMsg);
              setIsLoading(false);
              reject(new Error(errorMsg));
            }
          };

          img.onerror = () => {
            URL.revokeObjectURL(url);
            const errorMsg = "Failed to load image";
            setError(errorMsg);
            setIsLoading(false);
            reject(new Error(errorMsg));
          };

          img.src = url;
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "An error occurred";
        setError(errorMsg);
        setIsLoading(false);
        throw err;
      }
    },
    []
  );

  return { extractColors, isLoading, error };
}

// ————————————————————————————————————————————————————————————————
// Sampling and background handling

function chooseStride(width: number, height: number): number {
  const pixels = width * height;
  if (pixels > 800_000) return 6;
  if (pixels > 400_000) return 4;
  if (pixels > 150_000) return 3;
  return 2;
}

function samplePixels(
  imageData: ImageData,
  opts: { stride: number; skipAlphaBelow: number }
): Array<[number, number, number]> {
  const { data, width, height } = imageData as unknown as {
    data: Uint8ClampedArray;
    width: number;
    height: number;
  };

  const result: Array<[number, number, number]> = [];
  const stride = Math.max(1, opts.stride);

  for (let y = 0; y < height; y += stride) {
    for (let x = 0; x < width; x += stride) {
      const i = (y * width + x) * 4;
      const a = data[i + 3];
      if (a < opts.skipAlphaBelow) continue;

      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Skip extreme near-white and near-black (often background/noise)
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      if (maxC > 250 && minC > 245) continue; // near-white
      if (maxC < 10 && minC < 10) continue; // near-black

      result.push([r, g, b]);
    }
  }

  return result;
}

function detectBackground(imageData: ImageData): [number, number, number] | null {
  const { data, width, height } = imageData as unknown as {
    data: Uint8ClampedArray;
    width: number;
    height: number;
  };

  const border: Array<[number, number, number]> = [];
  const pushPx = (idx: number) => {
    const a = data[idx + 3];
    if (a < 200) return;
    border.push([data[idx], data[idx + 1], data[idx + 2]]);
  };

  for (let x = 0; x < width; x++) {
    pushPx((0 * width + x) * 4);
    pushPx(((height - 1) * width + x) * 4);
  }
  for (let y = 0; y < height; y++) {
    pushPx((y * width + 0) * 4);
    pushPx((y * width + (width - 1)) * 4);
  }

  if (border.length < 20) return null;

  // Find dominant border color cluster in Lab
  const labs = border.map((rgb) => rgbToLab(rgb));
  // Simple centroid as mean in Lab
  const centroid: [number, number, number] = [
    labs.reduce((s, p) => s + p[0], 0) / labs.length,
    labs.reduce((s, p) => s + p[1], 0) / labs.length,
    labs.reduce((s, p) => s + p[2], 0) / labs.length,
  ];

  // If most border pixels are within ΔE00 6 of centroid, treat as uniform background
  const within = labs.filter((p) => deltaE00(p, centroid) <= 6).length / labs.length;
  if (within >= 0.6) {
    // Return the most frequent approximate RGB on border
    return mostFrequentRgb(border);
  }
  return null;
}

function deduplicateRgb(
  pixels: Array<[number, number, number]>,
  step: number
): Array<[number, number, number]> {
  const seen = new Set<string>();
  const out: Array<[number, number, number]> = [];
  const clamp = (n: number) => Math.max(0, Math.min(255, n));
  for (const [r, g, b] of pixels) {
    const rr = Math.round(clamp(r) / step) * step;
    const gg = Math.round(clamp(g) / step) * step;
    const bb = Math.round(clamp(b) / step) * step;
    const key = `${rr},${gg},${bb}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push([rr, gg, bb]);
    }
  }
  return out;
}

function mostFrequentRgb(pixels: Array<[number, number, number]>): [number, number, number] {
  if (pixels.length === 0) return [0, 0, 0];
  const freq = new Map<string, number>();
  for (const [r, g, b] of pixels) {
    const key = `${r},${g},${b}`;
    freq.set(key, (freq.get(key) || 0) + 1);
  }
  let bestKey = "";
  let bestCount = -1;
  for (const [key, count] of freq.entries()) {
    if (count > bestCount) {
      bestCount = count;
      bestKey = key;
    }
  }
  const parts = bestKey.split(",").map((n) => parseInt(n, 10)) as [number, number, number];
  return parts;
}

// ————————————————————————————————————————————————————————————————
// k-means in Lab space (ΔE76 / Euclidean)

function kMeansLab(
  labPoints: Array<[number, number, number]>,
  k: number,
  maxIterations: number
): { centroids: Array<[number, number, number]> } {
  // k-means++ init
  const centroids: Array<[number, number, number]> = [];
  centroids.push(labPoints[Math.floor(Math.random() * labPoints.length)]);

  while (centroids.length < k) {
    const distances = labPoints.map((p) =>
      Math.min(...centroids.map((c) => euclideanLab(p, c)))
    );
    const total = distances.reduce((s, d) => s + d * d, 0);
    let r = Math.random() * total;
    for (let i = 0; i < labPoints.length; i++) {
      r -= distances[i] * distances[i];
      if (r <= 0) {
        centroids.push(labPoints[i]);
        break;
      }
    }
  }

  for (let iter = 0; iter < maxIterations; iter++) {
    const clusters: Array<Array<[number, number, number]>> = Array(k)
      .fill(null)
      .map(() => []);

    for (const p of labPoints) {
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < centroids.length; i++) {
        const d = euclideanLab(p, centroids[i]);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      clusters[best].push(p);
    }

    let moved = false;
    for (let i = 0; i < k; i++) {
      const cluster = clusters[i];
      if (cluster.length === 0) continue;
      const mean: [number, number, number] = [
        cluster.reduce((s, p) => s + p[0], 0) / cluster.length,
        cluster.reduce((s, p) => s + p[1], 0) / cluster.length,
        cluster.reduce((s, p) => s + p[2], 0) / cluster.length,
      ];
      if (euclideanLab(mean, centroids[i]) > 0.5) moved = true;
      centroids[i] = mean;
    }
    if (!moved) break;
  }

  return { centroids };
}

function assignPointsToCentroids(
  labPoints: Array<{ rgb: [number, number, number]; lab: [number, number, number] }>,
  centroids: Array<[number, number, number]>
): Array<{ centroid: [number, number, number]; points: Array<{ rgb: [number, number, number]; lab: [number, number, number] }> }> {
  const clusters = centroids.map((c) => ({ centroid: c, points: [] as Array<{ rgb: [number, number, number]; lab: [number, number, number] }> }));
  for (const p of labPoints) {
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < centroids.length; i++) {
      const d = euclideanLab(p.lab, centroids[i]);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    clusters[best].points.push(p);
  }
  return clusters.filter((c) => c.points.length > 0);
}

function mergeAndFilterClusters(
  clusters: Array<{ centroid: [number, number, number]; points: Array<{ rgb: [number, number, number]; lab: [number, number, number] }> }>,
  opts: { mergeDeltaE00: number; minPercent: number }
) {
  if (clusters.length <= 1) return clusters;

  // Merge pass using ΔE00
  const merged: typeof clusters = [];
  for (const c of clusters) {
    let mergedInto: typeof clusters[number] | null = null;
    for (const m of merged) {
      if (deltaE00(c.centroid, m.centroid) < opts.mergeDeltaE00) {
        mergedInto = m;
        break;
      }
    }
    if (!mergedInto) {
      merged.push({ centroid: c.centroid, points: [...c.points] });
    } else {
      mergedInto.points.push(...c.points);
      // Recompute centroid as mean in Lab
      const len = mergedInto.points.length;
      mergedInto.centroid = [
        mergedInto.points.reduce((s, p) => s + p.lab[0], 0) / len,
        mergedInto.points.reduce((s, p) => s + p.lab[1], 0) / len,
        mergedInto.points.reduce((s, p) => s + p.lab[2], 0) / len,
      ];
    }
  }

  // Filter by share
  const total = merged.reduce((s, c) => s + c.points.length, 0);
  const minCount = Math.max(1, Math.floor((opts.minPercent / 100) * total));
  return merged.filter((c) => c.points.length >= minCount);
}

// ————————————————————————————————————————————————————————————————
// Color conversions and metrics (sRGB D65)

function srgbToLinear(c: number): number {
  const cs = c / 255;
  return cs <= 0.04045 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
}

function rgbToXyz([r, g, b]: [number, number, number]): [number, number, number] {
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);
  const x = rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375;
  const y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.0721750;
  const z = rl * 0.0193339 + gl * 0.1191920 + bl * 0.9503041;
  return [x, y, z];
}

function xyzToLab([x, y, z]: [number, number, number]): [number, number, number] {
  // D65 reference white
  const Xn = 0.95047;
  const Yn = 1.0;
  const Zn = 1.08883;

  const fx = xyzF(x / Xn);
  const fy = xyzF(y / Yn);
  const fz = xyzF(z / Zn);
  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const b = 200 * (fy - fz);
  return [L, a, b];
}

function xyzF(t: number): number {
  return t > 216 / 24389 ? Math.cbrt(t) : (841 / 108) * t + 4 / 29;
}

function rgbToLab(rgb: [number, number, number]): [number, number, number] {
  return xyzToLab(rgbToXyz(rgb));
}

function euclideanLab(a: [number, number, number], b: [number, number, number]): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

// CIEDE2000 implementation (approx, good enough for clustering thresholds)
function deltaE00(lab1: [number, number, number], lab2: [number, number, number]): number {
  const [L1, a1, b1] = lab1;
  const [L2, a2, b2] = lab2;
  const avgLp = (L1 + L2) / 2;
  const C1 = Math.hypot(a1, b1);
  const C2 = Math.hypot(a2, b2);
  const avgC = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Math.pow(avgC, 7) / (Math.pow(avgC, 7) + Math.pow(25, 7))));
  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;
  const C1p = Math.hypot(a1p, b1);
  const C2p = Math.hypot(a2p, b2);
  const avgCp = (C1p + C2p) / 2;
  const h1p = hpF(b1, a1p);
  const h2p = hpF(b2, a2p);
  const avgHp = hpAvg(h1p, h2p);
  const T = 1 - 0.17 * Math.cos(toRad(avgHp - 30)) + 0.24 * Math.cos(toRad(2 * avgHp)) + 0.32 * Math.cos(toRad(3 * avgHp + 6)) - 0.20 * Math.cos(toRad(4 * avgHp - 63));
  const dLp = L2 - L1;
  const dCp = C2p - C1p;
  const dhp = dhpF(h1p, h2p, C1p, C2p);
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(toRad(dhp / 2));
  const Sl = 1 + (0.015 * Math.pow(avgLp - 50, 2)) / Math.sqrt(20 + Math.pow(avgLp - 50, 2));
  const Sc = 1 + 0.045 * avgCp;
  const Sh = 1 + 0.015 * avgCp * T;
  const dTheta = 30 * Math.exp(-Math.pow((avgHp - 275) / 25, 2));
  const Rc = 2 * Math.sqrt(Math.pow(avgCp, 7) / (Math.pow(avgCp, 7) + Math.pow(25, 7)));
  const Rt = -Rc * Math.sin(toRad(2 * dTheta));
  const Kl = 1, Kc = 1, Kh = 1;
  const dE = Math.sqrt(
    Math.pow(dLp / (Sl * Kl), 2) +
    Math.pow(dCp / (Sc * Kc), 2) +
    Math.pow(dHp / (Sh * Kh), 2) +
    Rt * (dCp / (Sc * Kc)) * (dHp / (Sh * Kh))
  );
  return dE;
}

function hpF(b: number, ap: number): number {
  const h = (Math.atan2(b, ap) * 180) / Math.PI;
  return h >= 0 ? h : h + 360;
}

function dhpF(h1p: number, h2p: number, C1p: number, C2p: number): number {
  if (C1p * C2p === 0) return 0;
  let dh = h2p - h1p;
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  return dh;
}

function hpAvg(h1p: number, h2p: number): number {
  if (Math.abs(h1p - h2p) > 180) return (h1p + h2p + 360) / 2;
  return (h1p + h2p) / 2;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const h = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return h.length === 1 ? "0" + h : h;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

