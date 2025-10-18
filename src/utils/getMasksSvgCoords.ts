import type { Bounds } from './getBounds';
import type { Transformer } from './getTransformer';

export default function getMasksSvgCoords(
  bounds: Bounds,
  transformer: Transformer
) {
  const negativeValuePoints: [number, number][] = [
    [bounds.minValueX, 0],
    [bounds.maxValueX, 0],
    [bounds.maxValueX, bounds.zeroVisibleMinValueY],
    [bounds.minValueX, bounds.zeroVisibleMinValueY],
  ];

  const positiveValuePoints: [number, number][] = [
    [bounds.minValueX, 0],
    [bounds.maxValueX, 0],
    [bounds.maxValueX, bounds.zeroVisibleMaxValueY],
    [bounds.minValueX, bounds.zeroVisibleMaxValueY],
  ];

  const negativeMask = negativeValuePoints
    .map(transformer)
    .map((point) => point.join(','))
    .join(' ');

  const positiveMask = positiveValuePoints
    .map(transformer)
    .map((point) => point.join(','))
    .join(' ');

  return { negativeMask, positiveMask };
}
