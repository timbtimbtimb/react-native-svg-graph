import { StyleSheet, View } from 'react-native';
import Svg from 'react-native-svg';
import GraphLine from './components/GraphLine';
import getViewBox from './utils/getViewBox';
import getTransofrmer from './utils/getTransformer';
import YGrid from './components/YGrid';
import XGrid from './components/XGrid';
import YAxis from './components/YAxis';
import XAxis from './components/XAxis';
import { useEffect, useState } from 'react';
import getBounds from './utils/getBounds';
import type { WeatherStationData } from './Temperatures';

export default function Wind() {
  const zeroVisible = true;
  const [valuePoints, setValuePoints] = useState<[number, number][]>([[0, 0]]);
  const [valuePoints2, setValuePoints2] = useState<[number, number][]>([
    [0, 0],
  ]);

  useEffect(() => {
    fetch('https://api.snowmap.fr/v3/weatherStations/74056006').then(
      async (response) => {
        const data: { properties: WeatherStationData } = await response.json();
        setValuePoints(
          data.properties.data.map(({ averageWindSpeed, timestamp }) => [
            timestamp * 1000,
            (averageWindSpeed ?? 0 / 1000) * 60 * 60,
          ])
        );

        setValuePoints2(
          data.properties.data.map(({ windGustsSpeed, timestamp }) => [
            timestamp * 1000,
            (windGustsSpeed ?? 0 / 1000) * 60 * 60,
          ])
        );
      }
    );
  }, []);

  const viewBox = getViewBox(1500, 500);
  const bounds = getBounds(valuePoints2);
  const transformer = getTransofrmer(valuePoints2, viewBox, bounds);

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
          stepSize={5}
          bounds={bounds}
          valuePoints={valuePoints}
          zeroVisible={zeroVisible}
          formatter={(v: number) => `${v} km/h`}
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
        <GraphLine
          valuePoints={valuePoints}
          bounds={bounds}
          transformer={transformer}
          positiveColor="rgba(200, 200, 200, 1)"
          negativeColor="rgba(200, 200, 200, 1)"
        />
        <GraphLine
          valuePoints={valuePoints2}
          bounds={bounds}
          transformer={transformer}
          positiveColor="rgba(86, 221, 255, 1)"
          negativeColor="rgba(86, 221, 255, 1)"
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
    borderWidth: 1,
    borderColor: 'black',
  },
});
