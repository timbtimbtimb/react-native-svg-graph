import getViewBox from './utils/getViewBox';
import getTransofrmer from './utils/getTransformer';
import { useEffect, useState } from 'react';
import getBounds from './utils/getBounds';
import Graph, { type Ticks } from './components/Graph';
import getRoundDatesBetween from './utils/getRoundDatesBetween';

export interface WeatherStationData {
  id: string;
  name: string;
  region: string;
  elevation: number;
  data: Array<{
    timestamp: number;
    temperature: number;
    snowDepth: number | null;
    lastHourPrecipitations: number | null;
    averageWindSpeed: number | null;
    averageWindDirection: number | null;
    windGustsSpeed: number | null;
    windGustsDirection: number | null;
  }>;
}

export default function Wind({ name }: { name: string }) {
  const [values, setValues] = useState<[number, number][][]>([[[0, 0]]]);
  const [station, setStation] = useState<{ properties: WeatherStationData }>();

  const width = 1500;
  const height = 500;

  useEffect(() => {
    fetch(`https://api.snowmap.fr/v3/weatherStations/${name}`).then(
      async (response) => {
        const data: { properties: WeatherStationData } = await response.json();
        setStation(data);
        setValues([
          data.properties.data.map(({ temperature, timestamp }) => [
            timestamp * 1000,
            temperature - 5,
          ]),
        ]);
      }
    );
  }, [name]);

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
      name: 'dates',
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
          ][date.getDay()],
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
      name: 'hours',
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
      name: 'temperatures',
      axis: 'y',
      position: 'top',
      values: temperatureTicks,
      textFormatter: (v: number) => `${v}°`,
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
      title={`Températures (°C) — ${station?.properties.name} (${station?.properties.elevation}m) — ${station?.properties.region}`}
      viewBox={viewBox}
      values={values}
      ticks={ticks}
      bounds={bounds}
      transformer={transformer}
      width={width}
      height={height}
      zeroVisible={true}
      colors={[
        {
          positiveColor: 'rgba(255, 123, 0, 1)',
          negativeColor: 'rgba(0, 102, 255, 1)',
        },
      ]}
    />
  );
}
