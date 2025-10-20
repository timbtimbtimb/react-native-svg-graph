import type { ReactElement } from 'react';
import { Path } from 'react-native-svg';
import svgCoords2SvgLineCoords from '../utils/svgCoords2SvgLineCoords';
import { useGraphContext } from '../contexts/GraphContext';

export default function XAxis({ atZero }: { atZero?: boolean }): ReactElement {
  const { bounds, transformer } = useGraphContext();

  const xAxisData: [number, number][] = [
    [bounds.minValueX, atZero ? 0 : bounds.zeroVisibleMinValueY],
    [bounds.maxValueX, atZero ? 0 : bounds.zeroVisibleMinValueY],
  ];

  const d = svgCoords2SvgLineCoords(xAxisData.map(transformer));

  return (
    <Path d={d} opacity={0.5} stroke={'gray'} strokeWidth={2} fill="none" />
  );
}
