import type { ReactElement } from 'react';
import { Path } from 'react-native-svg';
import svgCoords2SvgLineCoords from '../utils/svgCoords2SvgLineCoords';
import type { Transformer } from '../utils/getTransformer';
import type { ColorValue } from 'react-native';
import type { Bounds } from '../utils/getBounds';

export default function YAxis({
  transformer,
  strokeWidth,
  stroke,
  bounds,
}: {
  bounds: Bounds;
  strokeWidth?: number;
  stroke?: ColorValue;
  transformer: Transformer;
}): ReactElement {
  const xAxisData: [number, number][] = [
    [bounds.minValueX, 0],
    [bounds.maxValueX, 0],
  ];

  const d = svgCoords2SvgLineCoords(xAxisData.map(transformer));

  return (
    <Path
      d={d}
      opacity={0.5}
      stroke={stroke ?? 'gray'}
      strokeWidth={strokeWidth ?? 2}
      fill="none"
    />
  );
}
