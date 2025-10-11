import type { Ticks } from '../components/Graph';
import getBounds from './getBounds';
import getRoundDatesBetween from './getRoundDatesBetween';
import getTransformer from './getTransformer';
import getViewBox from './getViewBox';

interface Props {
  textFormatter: (v: number) => string;
  width: number;
  height: number;
  values: [number, number][][];
}

export default function getGraphData({
  textFormatter,
  width,
  height,
  values,
}: Props) {
  const viewBox = getViewBox(width, height);
  const bounds = getBounds(values.flat());
  const transformer = getTransformer(values.flat(), viewBox, bounds);

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

  const ticks: Ticks = [
    {
      axis: 'y',
      position: 'top',
      values: valuesTicks,
      textFormatter,
      style: {
        stroke: 'rgb(50,50,50)',
        strokeWidth: 1,
        fontSize: 15,
        fontWeight: 'normal',
      },
    },
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
  ];

  return { viewBox, ticks, bounds, transformer };
}
