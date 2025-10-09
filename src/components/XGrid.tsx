import type { ReactElement } from 'react';
import { G, Path, Text } from 'react-native-svg';
import svgCoords2SvgLineCoords from '../utils/svgCoords2SvgLineCoords';
import type { Transformer } from '../utils/getTransformer';
import type { ColorValue } from 'react-native';
import type { Bounds } from '../utils/getBounds';

interface Props {
  bounds: Bounds;
  strokeWidth?: number;
  height: number;
  stroke?: ColorValue;
  fontSize: number;
  values: [number, number][];
  zeroVisible?: boolean;
  transformer: Transformer;
  formatter?: (v: number) => string;
}

export default function XGrid({
  transformer,
  strokeWidth,
  stroke,
  values,
  bounds,
  fontSize,
  formatter,
}: Props): ReactElement {
  let prev = 99999;

  const lines = values.map(([_, y]) => {
    const coords: [number, number][] = [
      [bounds.minValueX, y],
      [bounds.maxValueX, y],
    ];
    const transformed = coords.map(transformer);
    const d = svgCoords2SvgLineCoords(transformed);

    const transformedX = transformed[0]?.[0];
    const transformedY = transformed[0]?.[1];

    if (transformedX == null || transformedY == null) return null;

    if (Math.abs(prev - transformedY) < fontSize) return null;

    prev = transformedY;

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
          x={transformedX}
          y={transformedY}
          fontSize={fontSize}
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
