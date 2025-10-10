import getViewBox from '../utils/getViewBox';
import getTransofrmer from '../utils/getTransformer';
import getBounds from '../utils/getBounds';
import Graph, { type Ticks } from './Graph';
import getRoundDatesBetween from '../utils/getRoundDatesBetween';
import type { ColorValue } from 'react-native';

export default function GraphMain({
  values,
  width,
  height,
  textFormatter,
  colors,
}: {
  values: [number, number][][];
  width: number;
  height: number;
  textFormatter: (v: number) => string;
  colors: Array<{
    positiveColor: ColorValue;
    negativeColor: ColorValue;
  }>;
}) {
  const viewBox = getViewBox(width, height);
  const bounds = getBounds(values.flat());
  const transformer = getTransofrmer(values.flat(), viewBox, bounds);

  const temperatureTicks: [number, number][] = Array.from(
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

  const ticks: Ticks = [
    {
      axis: 'x',
      position: 'bottom',
      values: hoursTicks,
      textFormatter: (v: number) => {
        const date = new Date(v);
        return `${date.getHours().toString().padStart(2, '0')}h`;
      },
      style: {
        stroke: 'rgb(50,50,50)',
        strokeWidth: 1,
        fontSize: 15,
        fontWeight: 'bold',
      },
    },
    {
      axis: 'x',
      position: 'top',
      values: datesTicks,
      textFormatter: (v: number) => {
        const date = new Date(v);
        return [
          [
            'lundi',
            'mardi',
            'mercredi',
            'jeudi',
            'vendredi',
            'samedi',
            'dimanche',
          ][date.getDay() - 1],
          date.getDay().toString(),
        ].join(' ');
      },
      style: {
        stroke: 'gray',
        strokeWidth: 3,
        fontSize: 15,
        fontWeight: 'bold',
      },
    },
    {
      axis: 'y',
      position: 'top',
      values: temperatureTicks,
      textFormatter,
      style: {
        stroke: 'rgb(50,50,50)',
        strokeWidth: 1,
        fontSize: 15,
        fontWeight: 'normal',
      },
    },
  ];

  return (
    <Graph
      viewBox={viewBox}
      values={values}
      ticks={ticks}
      bounds={bounds}
      transformer={transformer}
      width={width}
      height={height}
      zeroVisible={true}
      colors={colors}
    />
  );
}
