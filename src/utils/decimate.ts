export type DecimationMethod = 'minmax' | 'lttb' | 'none';

/**
 * Reduce the number of points in an x-sorted series before it is turned into an
 * SVG path. When a chart has more data points than horizontal pixels, the extra
 * points are sub-pixel and cost render time without being visible.
 *
 * `targetPoints` is the horizontal resolution to aim for (typically the pixel
 * width of the graph). Series that already fit are returned untouched.
 */
export default function decimate(
  series: [number, number][],
  targetPoints: number,
  method: DecimationMethod = 'minmax'
): [number, number][] {
  if (method === 'none') return series;

  const target = Math.max(1, Math.floor(targetPoints));
  if (series.length <= target) return series;

  return method === 'lttb'
    ? lttb(series, target)
    : minMaxPerColumn(series, target);
}

/**
 * Bucket the series into ~`targetCols` columns (one per pixel) and, per column,
 * keep the lowest and highest points. Preserves spikes that plain stride
 * sampling would drop. Emits at most `2 * targetCols` points, O(n).
 */
export function minMaxPerColumn(
  series: [number, number][],
  targetCols: number
): [number, number][] {
  const n = series.length;
  if (n <= targetCols * 2 || targetCols < 1) return series;

  const first = series[0];
  const last = series[n - 1];
  if (!first || !last) return series;

  const minX = first[0];
  const range = last[0] - minX || 1;

  const result: [number, number][] = [];
  let currentCol = -1;
  let colMin: [number, number] | null = null;
  let colMax: [number, number] | null = null;

  const flush = () => {
    if (!colMin || !colMax) return;
    if (colMin === colMax) {
      result.push(colMin);
    } else if (colMin[0] <= colMax[0]) {
      result.push(colMin, colMax);
    } else {
      result.push(colMax, colMin);
    }
  };

  for (let i = 0; i < n; i++) {
    const p = series[i];
    if (!p) continue;
    const col = Math.min(
      targetCols - 1,
      Math.floor(((p[0] - minX) / range) * targetCols)
    );

    if (col !== currentCol) {
      flush();
      currentCol = col;
      colMin = p;
      colMax = p;
    } else {
      if (p[1] < colMin![1]) colMin = p;
      if (p[1] > colMax![1]) colMax = p;
    }
  }
  flush();

  return result;
}

/**
 * Largest-Triangle-Three-Buckets: downsample to exactly `threshold` points while
 * preserving the visual shape of the line. Best for smooth curves. O(n).
 * Reference: Sveinn Steinarsson, "Downsampling Time Series for Visual
 * Representation" (2013).
 */
export function lttb(
  series: [number, number][],
  threshold: number
): [number, number][] {
  const n = series.length;
  if (threshold >= n || threshold < 3) return series;

  const first = series[0];
  const last = series[n - 1];
  if (!first || !last) return series;

  const sampled: [number, number][] = [first];
  const bucketSize = (n - 2) / (threshold - 2);

  let a = 0;
  let pointA = first;

  for (let i = 0; i < threshold - 2; i++) {
    // Average point of the next bucket.
    const avgStart = Math.floor((i + 1) * bucketSize) + 1;
    const avgEnd = Math.min(Math.floor((i + 2) * bucketSize) + 1, n);
    let avgX = 0;
    let avgY = 0;
    let avgCount = 0;
    for (let j = avgStart; j < avgEnd; j++) {
      const p = series[j];
      if (!p) continue;
      avgX += p[0];
      avgY += p[1];
      avgCount++;
    }
    if (avgCount > 0) {
      avgX /= avgCount;
      avgY /= avgCount;
    }

    // Point of this bucket that forms the largest triangle with A and the avg.
    const rangeStart = Math.floor(i * bucketSize) + 1;
    const rangeEnd = Math.min(Math.floor((i + 1) * bucketSize) + 1, n);
    let maxArea = -1;
    let chosen = series[rangeStart] ?? pointA;
    let chosenIdx = rangeStart;
    for (let j = rangeStart; j < rangeEnd; j++) {
      const p = series[j];
      if (!p) continue;
      const area =
        Math.abs(
          (pointA[0] - avgX) * (p[1] - pointA[1]) -
            (pointA[0] - p[0]) * (avgY - pointA[1])
        ) * 0.5;
      if (area > maxArea) {
        maxArea = area;
        chosen = p;
        chosenIdx = j;
      }
    }

    sampled.push(chosen);
    a = chosenIdx;
    pointA = series[a] ?? pointA;
  }

  sampled.push(last);
  return sampled;
}
