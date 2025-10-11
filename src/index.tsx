import SunCalc, { type GetTimesResult } from 'suncalc';
import { StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
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

export type WeatherStation = {
  geometry: { coordinates: [number, number, number] };
  properties: WeatherStationData;
};

export default function App() {
  const [temperatures, setTemperatures] = useState<[number, number][][]>([
    [[0, 0]],
  ]);
  const [snowDepth, setSnowDepth] = useState<[number, number][][]>([[[0, 0]]]);
  const [wind, setWind] = useState<[number, number][][]>([[[0, 0]]]);
  const [station, setStation] = useState<WeatherStation>();
  const [sun, setSun] = useState<GetTimesResult>();

  const width = 1500;
  const height = 500;

  useEffect(() => {
    (async () => {
      const r = await fetch(`https://api.snowmap.fr/v3/weatherStations`);
      const { features }: { features: WeatherStation[] } = await r.json();
      const randomIndex = Math.floor(Math.random() * features.length);
      const n = features[randomIndex] as WeatherStation;
      const { id } = n.properties;

      const response = await fetch(
        `https://api.snowmap.fr/v3/weatherStations/${id}`
      );
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
          ((averageWindSpeed ?? 0) / 1000) * 60 * 60,
        ]),
        data.properties.data.map(({ windGustsSpeed, timestamp }) => [
          timestamp * 1000,
          ((windGustsSpeed ?? 0) / 1000) * 60 * 60,
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

  return (
    <View style={styles.container}>
      {station && (
        <View>
          <Text style={styles.title}>
            {`${station?.properties.name} (${station?.properties.elevation} m)`}
          </Text>
          <Text style={styles.subtitle}>{station?.properties.region}</Text>
          {sun && (
            <>
              <Text style={styles.subtitle}>
                {`Aube: ${sun?.sunrise.getHours()}h${sun?.sunrise.getMinutes().toString().padStart(2, '0')}`}
                {` - `}
                {`Crépuscule: ${sun?.sunset.getHours()}h${sun?.sunrise.getMinutes().toString().padStart(2, '0')}`}
              </Text>
            </>
          )}
        </View>
      )}
      <View>
        <Graph
          values={temperatures}
          width={width}
          height={height}
          zeroVisible={true}
          textFormatter={(v: number) => `${v}°`}
          colors={[
            {
              positiveColor: 'rgba(255, 123, 0, 1)',
              negativeColor: 'rgba(0, 102, 255, 1)',
            },
          ]}
        />
        <Text style={styles.graphTitle}>Températures (°C)</Text>
      </View>
      <View>
        <Graph
          values={wind}
          width={width}
          height={height}
          zeroVisible={true}
          textFormatter={(v: number) => `${v} km/h`}
          colors={[
            {
              positiveColor: 'rgba(200, 200, 200, 1)',
              negativeColor: 'rgba(200, 200, 200, 1)',
            },
            {
              positiveColor: 'rgba(200, 200, 200, 0.33)',
              negativeColor: 'rgba(200, 200, 200, 0.33)',
            },
          ]}
        />
        <Text style={styles.graphTitle}>Vent et rafales (km/h)</Text>
      </View>
      <View>
        <Graph
          values={snowDepth}
          width={width}
          height={height}
          zeroVisible={true}
          textFormatter={(v: number) => `${v} cm`}
          colors={[
            {
              positiveColor: 'rgba(0, 102, 255, 1)',
              negativeColor: 'rgba(0, 102, 255, 1)',
            },
          ]}
        />
        <Text style={styles.graphTitle}>Neige (cm)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgb(20,20,20)',
    gap: 50,
    padding: 20,
    overflow: 'scroll',
    width: '100%',
  },
  title: {
    color: 'white',
    textAlign: 'center',
    fontSize: 50,
  },
  subtitle: {
    color: 'white',
    textAlign: 'center',
    fontSize: 30,
  },
  graphTitle: {
    color: 'gray',
    textAlign: 'center',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 10,
  },
});
