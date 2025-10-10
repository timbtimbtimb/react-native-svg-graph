import type { ReactElement } from 'react';
import { G, Path, Text, type FontWeight } from 'react-native-svg';
import svgCoords2SvgLineCoords from '../utils/svgCoords2SvgLineCoords';
import type { Transformer } from '../utils/getTransformer';
import type { Bounds } from '../utils/getBounds';
import type { ColorValue } from 'react-native';

export interface GridStyle {
  stroke: ColorValue;
  strokeWidth: number;
  fontSize: number;
  fontWeight: FontWeight;
}

interface Props {
  values: [number, number][];
  strokeWidth?: number;
  bounds: Bounds;
  zeroVisible?: boolean;
  position: 'top' | 'bottom';
  axis: 'x' | 'y';
  style: GridStyle;
  transformer: Transformer;
  formatter: (v: number) => string;
}

export default function Grid({
  values,
  axis,
  bounds,
  zeroVisible,
  position,
  style,
  transformer,
  formatter,
}: Props): ReactElement {
  let prev = 0;

  const lines = values.map(([x, y]) => {
    const xCoords: [number, number][] = [
      [x, zeroVisible ? bounds.zeroVisibleMaxValueY : bounds.maxValueY],
      [x, zeroVisible ? bounds.zeroVisibleMinValueY : bounds.minValueY],
    ];

    const yCoords: [number, number][] = [
      [bounds.minValueX, y],
      [bounds.maxValueX, y],
    ];

    const coords = axis === 'x' ? xCoords : yCoords;

    if (axis === 'y') {
      console.log(yCoords);
    }

    const transformed = coords.map(transformer);
    const d = svgCoords2SvgLineCoords(transformed.slice(0, 2));

    const transformedX = transformed[0]?.[0];
    const transformedY = transformed[0]?.[1];

    const text = formatter(axis === 'x' ? x : y);
    const textX = transformedX;
    const textY = position === 'top' ? transformedY : transformed[1]?.[1];
    const alignmentBaseline =
      axis === 'x' && position === 'bottom' ? 'before-edge' : undefined;
    const textAnchor = axis === 'y' ? 'end' : undefined;

    if (transformedX == null || transformedY == null) {
      return null;
    }

    if (axis === 'x') {
      if (Math.abs(prev - transformedX) < style.fontSize + text.length) {
        return null;
      } else {
        prev = transformedX;
      }
    }

    if (axis === 'y') {
      if (Math.abs(prev - transformedY) < style.fontSize * 1.25) {
        return null;
      } else {
        prev = transformedY;
      }
    }

    return (
      <G key={d}>
        <Path
          d={d}
          stroke={style.stroke}
          strokeWidth={style.strokeWidth}
          fill="none"
        />
        <Text
          x={textX}
          y={textY}
          fontWeight={style.fontWeight}
          fontSize={style.fontSize}
          fontFamily="sans"
          fill={'gray'}
          alignmentBaseline={alignmentBaseline}
          textAnchor={textAnchor}
        >
          {text}
        </Text>
      </G>
    );
  });

  return <G>{lines}</G>;
}
