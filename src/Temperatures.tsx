import { StyleSheet, View } from 'react-native';
import Svg, { Text } from 'react-native-svg';
import GraphLine from './components/GraphLine';
import getViewBox from './utils/getViewBox';
import getTransofrmer from './utils/getTransformer';
import YGrid from './components/YGrid';
import XGrid from './components/XGrid';
import YAxis from './components/YAxis';
import XAxis from './components/XAxis';
import { useEffect, useState } from 'react';
import getBounds from './utils/getBounds';
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

export default function Temperatures() {
  const zeroVisible = true;
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

  return (
    <View style={styles.container}>
      <Svg
        viewBox={viewBox.join(' ')}
        width={viewBox[2]}
        height={viewBox[3]}
        style={styles.svg}
      >
        <XAxis
          valuePoints={valuePoints}
          bounds={bounds}
          transformer={transformer}
        />
        <YAxis bounds={bounds} transformer={transformer} />
        <XGrid
          transformer={transformer}
          values={temperatureTicks}
          height={height}
          strokeWidth={1}
          fontSize={15}
          bounds={bounds}
          zeroVisible={zeroVisible}
          formatter={(v: number) => `${v}°`}
        />
        <YGrid
          transformer={transformer}
          grid
          bounds={bounds}
          strokeWidth={1}
          stroke={'rgb(50,50,50)'}
          fill={'rgb(100,100,100)'}
          width={width}
          fontSize={15}
          fontWeight={'bold'}
          values={hoursTicks}
          zeroVisible={zeroVisible}
          formatter={(v: number) => {
            const date = new Date(v);
            return `${date.getHours().toString().padStart(2, '0')}h`;
          }}
        />
        <YGrid
          transformer={transformer}
          top
          bounds={bounds}
          fontWeight={'bold'}
          width={width}
          grid
          strokeWidth={2}
          fill={'rgb(150,150,150)'}
          stroke={'rgb(150,150,150)'}
          values={datesTicks}
          zeroVisible={zeroVisible}
          fontSize={15}
          formatter={(v: number) => {
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
          }}
        />
        <GraphLine
          valuePoints={valuePoints}
          bounds={bounds}
          transformer={transformer}
          positiveColor="rgba(255, 123, 0, 1)"
          negativeColor="rgba(0, 102, 255, 1)"
        />
        <Text
          fill="rgb(100,100,100)"
          fontFamily="sans"
          textAnchor="middle"
          alignmentBaseline="hanging"
          fontWeight="bold"
          fontSize={30}
          x={transformer([bounds.maxValueX, 0])[0] / 2}
          y={transformer([0, bounds.zeroVisibleMinValueY])[1] + 30}
        >
          {`${station?.properties.name} (${station?.properties.elevation}m) - ${station?.properties.region}`}
        </Text>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(20,20,20)',
  },
  svg: {
    overflow: 'visible',
    margin: 30,
    marginBottom: 65,
  },
});
