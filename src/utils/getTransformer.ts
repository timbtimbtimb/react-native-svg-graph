import type { Bounds } from './getBounds.ts';
import type { ViewBox } from './getViewBox';

export type Transformer = ([x, y]: [number, number]) => [number, number];

export default function getTransformer(
  values: [number, number][],
  viewBox: ViewBox,
  bounds: Bounds
): Transformer {
  return ([x, y]: [number, number]): [number, number] => {
    if (values.length === 0) {
      return [0, 0];
    }

    const xRatio =
      (x - bounds.minValueX) /
      (bounds.maxValueX - bounds.minValueX + Number.EPSILON);

    const yRatio =
      -1 *
        ((y - bounds.zeroVisibleMinValueY) /
          (bounds.zeroVisibleMaxValueY -
            bounds.zeroVisibleMinValueY +
            Number.EPSILON)) +
      1;

    const coordinates: [number, number] = [
      xRatio * viewBox[2] + viewBox[0],
      yRatio * viewBox[3] + viewBox[1],
    ];

    return coordinates;
  };
}
