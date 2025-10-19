import { useId, useMemo } from 'react';
import { useGraphContext } from '../contexts/GraphContext';
import type { ReactElement } from 'react';
import {
  G,
  Path,
  Text,
  type AlignmentBaseline,
  type TextAnchor,
} from 'react-native-svg';
import type { ColorValue } from 'react-native';

export interface Line {
  d: string;
  textX: number;
  textY: number;
  text: string;
  x: number;
  y: number;
}

export default function Grids() {
  const { ticks, fontSize } = useGraphContext();
  const uniqueId = useId();

  const grids = useMemo(
    () =>
      ticks.map(
        (
          { alignmentBaseline, dx, textAnchor, lines, strokeWidth, stroke },
          i
        ) => {
          return lines.map(({ d, text, textX, textY }, j) => (
            <Grid
              key={uniqueId + i + j}
              alignmentBaseline={alignmentBaseline}
              d={d}
              dx={dx}
              fontSize={fontSize}
              text={text}
              textAnchor={textAnchor}
              textX={textX}
              textY={textY}
              strokeWidth={strokeWidth}
              stroke={stroke}
            />
          ));
        }
      ),
    [fontSize, ticks, uniqueId]
  );

  return grids;
}

interface Props {
  alignmentBaseline?: AlignmentBaseline;
  d: string;
  dx: number;
  fontSize: number;
  text: string;
  textAnchor?: TextAnchor;
  textX: number;
  textY: number;
  strokeWidth?: number;
  stroke?: ColorValue;
}

function Grid({
  alignmentBaseline,
  d,
  dx,
  fontSize,
  text,
  textAnchor,
  strokeWidth,
  stroke,
  textX,
  textY,
}: Props): ReactElement {
  return (
    <G>
      <Path
        d={d}
        stroke={stroke ?? 'gray'}
        strokeWidth={strokeWidth ?? 2}
        fill="none"
      />
      <Text
        x={textX}
        y={textY}
        dx={dx}
        fontWeight={'bold'}
        fontSize={fontSize}
        fontFamily="sans"
        fill={'gray'}
        alignmentBaseline={alignmentBaseline}
        textAnchor={textAnchor}
      >
        {text}
      </Text>
    </G>
  );
}
