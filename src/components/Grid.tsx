import type { ReactElement } from 'react';
import { G, Path, Text, type FontWeight } from 'react-native-svg';
import type { Transformer } from '../utils/getTransformer';
import type { Bounds } from '../utils/getBounds';
import type { ColorValue } from 'react-native';
import type { ViewBox } from '../utils/getViewBox';
import getReducedSteps from '../utils/getReducedSteps';
import getRawLinesList from '../utils/getRawLinesList';
import getAverageLinesDistance from '../utils/getAverageLinesDistance';

export interface GridStyle {
  stroke: ColorValue;
  strokeWidth: number;
  fontSize: number;
  fontWeight: FontWeight;
}

export interface Line {
  d: string;
  textX: number;
  textY: number;
  text: string;
  x: number;
  y: number;
}

interface Props {
  values: [number, number][];
  strokeWidth?: number;
  bounds: Bounds;
  zeroVisible?: boolean;
  position: 'top' | 'bottom';
  axis: 'x' | 'y';
  viewBox: ViewBox;
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
  viewBox,
  style,
  transformer,
  formatter,
}: Props): ReactElement {
  const alignmentBaseline =
    axis === 'x' && position === 'bottom' ? 'before-edge' : undefined;
  const textAnchor = axis === 'y' ? 'end' : undefined;
  const dx = axis === 'y' ? style.fontSize * -0.25 : 0;

  const rawLinesList = getRawLinesList(
    values,
    viewBox,
    zeroVisible ?? false,
    bounds,
    axis,
    transformer,
    formatter,
    position
  );

  const averageLinesDistance = getAverageLinesDistance(rawLinesList, axis);

  const targetDistance =
    axis === 'y' ? style.fontSize * 1.25 : style.fontSize * 2;

  const reduceBy = averageLinesDistance / targetDistance;

  const reducedSteps =
    reduceBy >= 1
      ? rawLinesList
      : getReducedSteps(rawLinesList, reduceBy, axis);

  if (reducedSteps == null) return <></>;

  const elements = reducedSteps.map(({ d, textX, textY, text }) => (
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
        dx={dx}
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
  ));

  return <G>{elements}</G>;
}
