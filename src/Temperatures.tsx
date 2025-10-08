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

  const viewBox = getViewBox(1500, 500);
  const bounds = getBounds(valuePoints);
  const transformer = getTransofrmer(valuePoints, viewBox, bounds);

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
          strokeWidth={1}
          stepSize={1}
          bounds={bounds}
          valuePoints={valuePoints}
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
          fontSize={15}
          xTextOffset={5}
          stepSize={1000 * 60 * 60 * 2}
          fontWeight={'bold'}
          valuePoints={valuePoints}
          zeroVisible={zeroVisible}
          formatter={(v: number) => {
            const offset = new Date().getTimezoneOffset() * 60 * 1000;
            const date = new Date(v + offset);
            return `${date.getHours().toString().padStart(2, '0')}h`;
          }}
        />
        <YGrid
          transformer={transformer}
          top
          bounds={bounds}
          fontWeight={'bold'}
          grid
          strokeWidth={2}
          fill={'rgb(150,150,150)'}
          stroke={'rgb(150,150,150)'}
          stepSize={1000 * 60 * 60 * 24}
          valuePoints={valuePoints}
          zeroVisible={zeroVisible}
          fontSize={15}
          xTextOffset={10}
          formatter={(v: number) => {
            const offset = new Date().getTimezoneOffset() * 60 * 1000;
            const date = new Date(v + offset);
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
