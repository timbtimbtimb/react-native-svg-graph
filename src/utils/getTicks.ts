import type { AlignmentBaseline, TextAnchor } from 'react-native-svg';
import { type Bounds } from './getBounds';
import getRoundDatesBetween from './getRoundDatesBetween';
import type { ViewBox } from './getViewBox';
import getAverageLinesDistance from './getAverageLinesDistance';
import getReducedSteps from './getReducedSteps';
import getRawLinesList from './getRawLinesList';
import type { Transformer } from './getTransformer';
import type { Line } from '../components/Grids';
import type { Formatter } from '../contexts/GraphContext';
import type { ColorValue } from 'react-native';

export interface Tick {
  axis: 'x' | 'y';
  values: [number, number][];
  position: 'top' | 'bottom';
  strokeWidth?: number;
  stroke?: ColorValue;
  formatter: Formatter;
}

export interface ParsedTick {
  alignmentBaseline: 'before-edge' | undefined;
  textAnchor: 'end' | undefined;
  dx: number;
  strokeWidth?: number;
  stroke?: ColorValue;
  lines: Line[];
}

interface Props {
  bounds: Bounds;
  formatter: (v: number) => string;
  viewBox: ViewBox;
  fontSize: number;
  zeroVisible: boolean;
  transformer: Transformer;
}

export default function getTicks({
  bounds,
  formatter,
  viewBox,
  fontSize,
  zeroVisible,
  transformer,
}: Props) {
  const valuesTicks: [number, number][] = Array.from(
    {
      length: Math.ceil(
        bounds.zeroVisibleMaxValueY - bounds.zeroVisibleMinValueY
      ),
    },
    (_, i) => {
      return [0, Math.ceil(bounds.zeroVisibleMinValueY) + i];
    }
  );

  const datesTicks: [number, number][] = getRoundDatesBetween(
    new Date(bounds.minValueX),
    new Date(bounds.maxValueX),
    'days'
  ).map((date) => {
    return [date.valueOf(), 0];
  });

  const hoursTicks: [number, number][] = getRoundDatesBetween(
    new Date(bounds.minValueX),
    new Date(bounds.maxValueX),
    'hours'
  ).map((date) => [date.valueOf(), 0]);

  const ticks: Tick[] = [
    {
      axis: 'y',
      position: 'top',
      values: valuesTicks,
      strokeWidth: 1,
      stroke: 'rgb(50,50,50)',
      formatter,
    },
    {
      axis: 'x',
      position: 'bottom',
      values: hoursTicks,
      strokeWidth: 1,
      stroke: 'rgb(50,50,50)',
      formatter: (v: number) => {
        const date = new Date(v);
        return `${date.getHours().toString().padStart(2, '0')}h`;
      },
    },
    {
      axis: 'x',
      position: 'top',
      values: datesTicks,
      strokeWidth: 3,
      stroke: 'rgb(100,100,100)',
      formatter: (v: number) => {
        const date = new Date(v);
        return [
          [
            'dimanche',
            'lundi',
            'mardi',
            'mercredi',
            'jeudi',
            'vendredi',
            'samedi',
          ][date.getDay()],
          date.getDate().toString(),
        ].join(' ');
      },
    },
  ];

  return ticks
    .map((tick) =>
      parseTick(tick, viewBox, fontSize, zeroVisible, bounds, transformer)
    )
    .filter((i) => i != null);
}

function parseTick(
  { axis, values, position, formatter, strokeWidth, stroke }: Tick,
  viewBox: ViewBox,
  fontSize: number,
  zeroVisible: boolean,
  bounds: Bounds,
  transformer: Transformer
): ParsedTick | null {
  const alignmentBaseline: AlignmentBaseline | undefined =
    axis === 'x' && position === 'bottom' ? 'before-edge' : undefined;
  const textAnchor: TextAnchor | undefined = axis === 'y' ? 'end' : undefined;
  const dx = axis === 'y' ? fontSize * -0.25 : 0;

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

  const reduceBy = averageLinesDistance / targetDistance;

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
