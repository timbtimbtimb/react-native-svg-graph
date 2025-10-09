import type { ReactElement } from 'react';
import { G, Path, Text, type FontWeight } from 'react-native-svg';
import svgCoords2SvgLineCoords from '../utils/svgCoords2SvgLineCoords';
import type { Transformer } from '../utils/getTransformer';
import type { ColorValue } from 'react-native';
import type { Bounds } from '../utils/getBounds';

interface Props {
  bounds: Bounds;
  strokeWidth?: number;
  stroke?: ColorValue;
  zeroVisible?: boolean;
  fontWeight?: FontWeight;
  width: number;
  grid?: boolean;
  top?: boolean;
  fontSize: number;
  fill?: ColorValue;
  yTextOffset?: number;
  values: [number, number][];
  transformer: Transformer;
  formatter?: (v: number) => string;
}

export default function YGrid({
  transformer,
  strokeWidth,
  stroke,
  top,
  grid,
  fontSize,
  bounds,
  fill,
  fontWeight,
  yTextOffset,
  values,
  formatter,
}: Props): ReactElement {
  let prev = 0;

  const lines = values.map(([x]) => {
    const coords: [number, number][] = [
      [x, bounds.zeroVisibleMaxValueY],
      [x, bounds.zeroVisibleMinValueY],
    ];

    const transformed = coords.map(transformer);
    const d = svgCoords2SvgLineCoords(transformed.slice(0, 2));

    const transformedX = transformed[0]?.[0];
    const transformedY = transformed[0]?.[1];

    if (transformedX == null || transformedY == null) return null;

    if (Math.abs(prev - transformedX) < fontSize + 10) return null;

    prev = transformedX;

    return (
      <G key={d}>
        {grid && (
          <Path
            d={d}
            stroke={stroke ?? 'gray'}
            strokeWidth={strokeWidth ?? 1}
            fill="none"
          />
        )}
        <Text
          x={transformedX}
          y={
            ((top ? transformedY : transformed[1]?.[1]) ?? 0) +
            (yTextOffset ?? 0)
          }
          fontWeight={fontWeight}
          fontSize={fontSize ?? 10}
          fontFamily="sans"
          fill={fill ?? 'gray'}
          alignmentBaseline={top ? undefined : 'before-edge'}
        >
          {formatter != null ? formatter(x) : x.toString()}
        </Text>
      </G>
    );
  });

  return <G>{lines}</G>;
}
