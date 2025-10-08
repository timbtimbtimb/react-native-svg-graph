import type { ReactElement } from 'react';
import { G, Path, Text } from 'react-native-svg';
import svgCoords2SvgLineCoords from '../utils/svgCoords2SvgLineCoords';
import type { Transformer } from '../utils/getTransformer';
import type { ColorValue } from 'react-native';
import getSteppedRange from '../utils/getSteppedRange';
import type { Bounds } from '../utils/getBounds';

export default function XGrid({
  transformer,
  strokeWidth,
  stepSize,
  stroke,
  bounds,
  formatter,
}: {
  valuePoints: [number, number][];
  stepSize: number;
  bounds: Bounds;
  strokeWidth?: number;
  stroke?: ColorValue;
  zeroVisible?: boolean;
  transformer: Transformer;
  formatter?: (v: number) => string;
}): ReactElement {
  const lines = getSteppedRange(
    bounds.zeroVisibleMinValueY,
    bounds.zeroVisibleMaxValueY,
    stepSize,
    false,
    false
  ).map((y) => {
    const coords: [number, number][] = [
      [bounds.minValueX, y],
      [bounds.maxValueX, y],
    ];
    const transformed = coords.map(transformer);
    const d = svgCoords2SvgLineCoords(transformed);
    return (
      <G key={d}>
        <Path
          d={d}
          stroke={stroke ?? 'gray'}
          opacity={0.25}
          strokeWidth={strokeWidth ?? 2}
          fill="none"
        />
        <Text
          x={transformed[0]?.[0]}
          y={transformed[0]?.[1]}
          fontSize={15}
          fontFamily="sans"
          fill="gray"
          alignmentBaseline="after-edge"
          textAnchor="end"
        >
          {formatter != null ? formatter(y) : y.toString()}
        </Text>
      </G>
    );
  });

  const xAxisData: [number, number][] = [
    [bounds.minValueX, 0],
    [bounds.maxValueX, 0],
  ];

  const d = svgCoords2SvgLineCoords(xAxisData.map(transformer));

  return (
    <G>
      <Path
        d={d}
        opacity={0.5}
        stroke={stroke ?? 'gray'}
        strokeWidth={strokeWidth ?? 2}
        fill="none"
      />
      {lines}
    </G>
  );
}
