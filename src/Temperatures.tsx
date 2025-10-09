import getViewBox from './utils/getViewBox';
import getTransofrmer from './utils/getTransformer';
import { useEffect, useState } from 'react';
import getBounds from './utils/getBounds';
import Graph from './components/Graph';

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

export default function Temperatures() {
  const [valuePoints, setValuePoints] = useState<[number, number][]>([[0, 0]]);
  const [station, setStation] = useState<{ properties: WeatherStationData }>();

  const width = 1500;
  const height = 500;

  useEffect(() => {
    fetch('https://api.snowmap.fr/v3/weatherStations/73296005').then(
      async (response) => {
        const data: { properties: WeatherStationData } = await response.json();
        setStation(data);
        setValuePoints(
          data.properties.data.map(({ temperature, timestamp }) => [
            timestamp * 1000,
            temperature,
          ])
        );
      }
    );
  }, []);

  const viewBox = getViewBox(width, height);
  const bounds = getBounds(valuePoints);
  const transformer = getTransofrmer(valuePoints, viewBox, bounds);

  const temperatureTicks: [number, number][] = Array.from(
    {
      length: Math.ceil(
        bounds.zeroVisibleMaxValueY - bounds.zeroVisibleMinValueY
      ),
    },
    (_, i) => {
      return [0, Math.floor(bounds.zeroVisibleMinValueY) + i];
    }
  );

  return (
    <Graph
      title={`${station?.properties.name} (${station?.properties.elevation}m) - ${station?.properties.region}`}
      viewBox={viewBox}
      values={valuePoints}
      bounds={bounds}
      transformer={transformer}
      ticks={temperatureTicks}
      width={width}
      height={height}
      zeroVisible={true}
    />
  );
}
