import type { Bounds } from './getBounds';
import type { Transformer } from './getTransformer';
import type { ViewBox } from './getViewBox';
import svgCoords2SvgLineCoords from './svgCoords2SvgLineCoords';

type Line = {
  d: string;
  textX: number;
  textY: number;
  text: string;
  x: number;
  y: number;
};

export default function getRawLinesList(
  values: [number, number][],
  viewBox: ViewBox,
  zeroVisible: boolean,
  bounds: Bounds,
  axis: 'x' | 'y',
  transformer: Transformer,
  formatter: (v: number) => string,
  position: 'top' | 'bottom'
): Line[] {
  const lines = values
    .map(([x, y]) => {
      const xCoords: [number, number][] = [
        [x, zeroVisible ? bounds.zeroVisibleMaxValueY : bounds.maxValueY],
        [x, zeroVisible ? bounds.zeroVisibleMinValueY : bounds.minValueY],
      ];

      const yCoords: [number, number][] = [
        [bounds.minValueX, y],
        [bounds.maxValueX, y],
      ];

      const coords = axis === 'x' ? xCoords : yCoords;

      const transformed = coords.map(transformer);

      const slice = transformed.slice(0, 2) as [
        [number, number],
        [number, number],
      ];

      const d = svgCoords2SvgLineCoords(
        axis === 'x'
          ? [
              [slice[0][0], viewBox[1]],
              [slice[1][0], viewBox[3] + viewBox[1]],
            ]
          : [
              [viewBox[0], slice[0][1]],
              [viewBox[2] + viewBox[0], slice[1][1]],
            ]
      );

      const transformedX = transformed[0]?.[0];
      const transformedY = transformed[0]?.[1];

      const text = formatter(axis === 'x' ? x : y);
      const textX = axis === 'x' ? transformedX : viewBox[0];
      const textY =
        axis === 'x'
          ? position === 'bottom'
            ? viewBox[1] + viewBox[3]
            : viewBox[1]
          : transformedY;

      if (textX == null || textY == null) {
        return null;
      }

      return {
        d,
        textX,
        textY,
        text,
        x,
        y,
      };
    })
    .filter((i) => i != null);

  return lines;
}
