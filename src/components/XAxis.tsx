import type { ReactElement } from 'react';
import { Path } from 'react-native-svg';
import svgCoords2SvgLineCoords from '../utils/svgCoords2SvgLineCoords';
import { useGraphContext } from './GraphContext';

export default function XAxis(): ReactElement {
  const { bounds, transformer } = useGraphContext();

  const xAxisData: [number, number][] = [
    [bounds.minValueX, 0],
    [bounds.maxValueX, 0],
  ];

  const d = svgCoords2SvgLineCoords(xAxisData.map(transformer));

  return (
    <Path d={d} opacity={0.5} stroke={'gray'} strokeWidth={2} fill="none" />
  );
}
