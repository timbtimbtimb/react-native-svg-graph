import { useMemo, type ReactElement } from 'react';
import { useGraphContext, type Formatter } from '../contexts/GraphContext';
import { G, Path, Text } from 'react-native-svg';
import parseTick from '../utils/parseTick';
import type { ColorValue } from 'react-native';

export interface Props {
  axis: 'x' | 'y';
  position: 'top' | 'bottom';
  type: 'value' | 'days' | 'hours' | 'weeks';
  strokeWidth?: number;
  stroke?: ColorValue;
  formatter: Formatter;
  reduce?: boolean;
}

export default function Grid({
  axis,
  position,
  type,
  strokeWidth,
  stroke,
  formatter,
  reduce,
}: Props): ReactElement[] {
  const { bounds, viewBox, fontSize, zeroVisible, transformer } =
    useGraphContext();

  const tick = useMemo(() => {
    return parseTick(
      { axis, formatter, position, stroke, strokeWidth, type },
      viewBox,
      fontSize,
      zeroVisible,
      bounds,
      transformer,
      reduce
    );
  }, [
    axis,
    bounds,
    fontSize,
    formatter,
    position,
    stroke,
    strokeWidth,
    transformer,
    type,
    viewBox,
    zeroVisible,
    reduce,
  ]);

  return useMemo(() => {
    if (tick == null) return [];
    return tick.lines.map(({ d, textX, textY, text }) => (
      <G key={d}>
        <Path
          d={d}
          stroke={stroke ?? 'gray'}
          strokeWidth={strokeWidth ?? 2}
          fill="none"
        />
        <Text
          x={textX}
          y={textY}
          dx={tick.dx}
          fontWeight={'bold'}
          fontSize={fontSize}
          fontFamily="sans"
          fill={'gray'}
          alignmentBaseline={tick.alignmentBaseline}
          textAnchor={tick.textAnchor}
        >
          {text}
        </Text>
      </G>
    ));
  }, [fontSize, stroke, strokeWidth, tick]);
}
