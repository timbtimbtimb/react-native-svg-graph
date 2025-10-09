import { StyleSheet, View } from 'react-native';
import Svg, { Text } from 'react-native-svg';
import GraphLine from './GraphLine';
import YGrid from './YGrid';
import XGrid from './XGrid';
import YAxis from './YAxis';
import XAxis from './XAxis';
import getRoundDatesBetween from '../utils/getRoundDatesBetween';
import type { ViewBox } from '../utils/getViewBox';
import type { Bounds } from '../utils/getBounds';
import type { Transformer } from '../utils/getTransformer';

interface Props {
  viewBox: ViewBox;
  values: [number, number][];
  ticks: [number, number][];
  width: number;
  height: number;
  bounds: Bounds;
  zeroVisible: boolean;
  title: string;
  transformer: Transformer;
}

export default function Graph({
  viewBox,
  values,
  bounds,
  transformer,
  ticks,
  width,
  height,
  zeroVisible,
  title,
}: Props) {
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
    <View>
      <Svg
        viewBox={viewBox.join(' ')}
        width={viewBox[2]}
        height={viewBox[3]}
        style={styles.svg}
      >
        <XAxis bounds={bounds} transformer={transformer} />
        <YAxis bounds={bounds} transformer={transformer} />
        <XGrid
          transformer={transformer}
          values={ticks}
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
          values={values}
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
          {title}
        </Text>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  svg: {
    overflow: 'visible',
    margin: 30,
    marginBottom: 65,
  },
});
