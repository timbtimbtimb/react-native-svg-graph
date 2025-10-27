import type { Bounds } from './getBounds';
import type { Transformer } from './getTransformer';
import svgCoords2SvgLineCoords from './svgCoords2SvgLineCoords';

export default function getPolygonsSvgCoords(
  bounds: Bounds,
  transformer: Transformer,
  values: [number, number][],
  smooth: boolean
) {
  const base = values.map(transformer);

  const positivePart = (
    [
      [bounds.maxValueX, bounds.zeroVisibleMinValueY],
      [bounds.maxValueX, bounds.zeroVisibleMinValueY],
      [bounds.minValueX, bounds.zeroVisibleMinValueY],
      [bounds.minValueX, bounds.zeroVisibleMinValueY],
      values.at(0) ?? [0, 0],
    ] as [number, number][]
  ).map(transformer);

  const negativePart = (
    [
      [bounds.maxValueX, bounds.zeroVisibleMaxValueY],
      [bounds.maxValueX, bounds.zeroVisibleMaxValueY],
      [bounds.minValueX, bounds.zeroVisibleMaxValueY],
      [bounds.minValueX, bounds.zeroVisibleMaxValueY],
      values.at(0) ?? [0, 0],
    ] as [number, number][]
  ).map(transformer);

  const positivePolygon = svgCoords2SvgLineCoords(
    [...base, ...positivePart],
    smooth
  );

  const negativePolygon = svgCoords2SvgLineCoords(
    [...base, ...negativePart],
    smooth
  );

  return { positivePolygon, negativePolygon };
}
