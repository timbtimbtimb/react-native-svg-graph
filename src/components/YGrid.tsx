import type { ReactElement } from 'react';
import { G, Path, Text, type FontWeight } from 'react-native-svg';
import svgCoords2SvgLineCoords from '../utils/svgCoords2SvgLineCoords';
import type { Transformer } from '../utils/getTransformer';
import type { ColorValue } from 'react-native';
import getSteppedRange from '../utils/getSteppedRange';
import type { Bounds } from '../utils/getBounds';

export default function YGrid({
  transformer,
  strokeWidth,
  stepSize,
  stroke,
  top,
  grid,
  fontSize,
  bounds,
  fill,
  fontWeight,
  xTextOffset,
  yTextOffset,
  formatter,
}: {
  valuePoints: [number, number][];
  stepSize: number;
  bounds: Bounds;
  strokeWidth?: number;
  stroke?: ColorValue;
  zeroVisible?: boolean;
  fontWeight?: FontWeight;
  grid?: boolean;
  top?: boolean;
  fontSize?: number;
  fill?: ColorValue;
  xTextOffset?: number;
  yTextOffset?: number;
  transformer: Transformer;
  formatter?: (v: number) => string;
}): ReactElement {
  const lines = getSteppedRange(
    bounds.minValueX,
    bounds.maxValueX,
    stepSize,
    false,
    false
  ).map((x) => {
    const coords: [number, number][] = [
      [x, bounds.zeroVisibleMaxValueY],
      [x, bounds.zeroVisibleMinValueY],
    ];
    const transformed = coords.map(transformer);
    const d = svgCoords2SvgLineCoords(transformed.slice(0, 2));
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
          x={(transformed[0]?.[0] ?? 0) + (xTextOffset ?? 0)}
          y={
            ((top ? transformed[0]?.[1] : transformed[1]?.[1]) ?? 0) +
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
