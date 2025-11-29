import type { AlignmentBaseline, TextAnchor } from 'react-native-svg';
import type { Bounds } from './getBounds';
import type { ViewBox } from './getViewBox';
import type { ColorValue } from 'react-native';
import getValuesTicks from './getValuesTicks';
import getTimeTicks from './getTimeTicks';
import getRawLinesList, { type Line } from './getRawLinesList';
import getAverageLinesDistance from './getAverageLinesDistance';
import getReducedSteps from './getReducedSteps';
import type { Transformer } from './getTransformer';
import type { Props } from '../components/Grid';

export interface ParsedTick {
  alignmentBaseline: 'before-edge' | undefined;
  textAnchor: 'end' | undefined;
  dx: number;
  strokeWidth?: number;
  stroke?: ColorValue;
  lines: Line[];
}

export default function parseTick(
  { axis, type, position, formatter, strokeWidth, stroke }: Props,
  viewBox: ViewBox,
  fontSize: number,
  zeroVisible: boolean,
  bounds: Bounds,
  transformer: Transformer,
  reduce: boolean = true
): ParsedTick | null {
  const alignmentBaseline: AlignmentBaseline | undefined =
    axis === 'x' && position === 'bottom' ? 'before-edge' : undefined;
  const textAnchor: TextAnchor | undefined = axis === 'y' ? 'end' : undefined;
  const dx = axis === 'y' ? fontSize * -0.25 : 0;

  const from = axis === 'x' ? bounds.minValueX : bounds.zeroVisibleMinValueY;
  const to = axis === 'x' ? bounds.maxValueX : bounds.zeroVisibleMaxValueY;

  const values =
    type === 'value'
      ? getValuesTicks(from, to, axis)
      : getTimeTicks(new Date(from), new Date(to), type);

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

  const targetDistance = axis === 'y' ? fontSize * 1.25 : fontSize * 2;

  const reduceBy = reduce === false ? 1 : averageLinesDistance / targetDistance;

  const lines =
    reduceBy >= 1
      ? rawLinesList
      : getReducedSteps(rawLinesList, reduceBy, axis);

  if (lines == null) return null;

  return {
    alignmentBaseline,
    textAnchor,
    dx,
    lines,
    strokeWidth,
    stroke,
  };
}
