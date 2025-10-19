import SunCalc, { type GetTimesResult } from 'suncalc';
import { useEffect, useState } from 'react';

const HOST = 'https://api.snowmap.fr';
// const HOST = 'http://localhost:8080';

export interface WeatherStationData {
  id: string;
  name: string;
  region: string;
  elevation: number;
  data: Array<{
    timestamp: number;
    temperature: number;
    snowDepth: number;
    lastHourPrecipitations: number;
    averageWindSpeed: number;
    averageWindDirection: number;
    windGustsSpeed: number;
    windGustsDirection: number;
  }>;
}

export type WeatherStation = {
  geometry: { coordinates: [number, number, number] };
  properties: WeatherStationData;
};

export default function useSourceData() {
  const [temperatures, setTemperatures] = useState<[number, number][][]>([
    [[0, 0]],
  ]);
  const [snowDepth, setSnowDepth] = useState<[number, number][][]>([[[0, 0]]]);
  const [wind, setWind] = useState<[number, number][][]>([[[0, 0]]]);
  const [station, setStation] = useState<WeatherStation>();
  const [sun, setSun] = useState<GetTimesResult>();

  useEffect(() => {
    (async () => {
      const r = await fetch(`${HOST}/v3/weatherStations`);
      const { features }: { features: WeatherStation[] } = await r.json();
      const randomIndex = Math.floor(Math.random() * features.length);
      const n = features[randomIndex] as WeatherStation;
      const { id } = n.properties;

      const response = await fetch(`${HOST}/v3/weatherStations/${id}`);
      const data: WeatherStation = await response.json();

      setStation(data);

      setSun(
        SunCalc.getTimes(
          new Date(),
          data.geometry.coordinates[1],
          data.geometry.coordinates[0]
        )
      );

      setTemperatures([
        data.properties.data.map(({ temperature, timestamp }) => [
          timestamp * 1000,
          temperature,
        ]),
      ]);

      setWind([
        data.properties.data.map(({ averageWindSpeed, timestamp }) => [
          timestamp * 1000,
          averageWindSpeed,
        ]),
        data.properties.data.map(({ windGustsSpeed, timestamp }) => [
          timestamp * 1000,
          windGustsSpeed,
        ]),
      ]);

      setSnowDepth([
        data.properties.data.map(({ snowDepth: s, timestamp }) => [
          timestamp * 1000,
          s ?? 0,
        ]),
      ]);
    })();
  }, []);

  return { temperatures, snowDepth, wind, station, sun };
}
