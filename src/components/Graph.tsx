import { StyleSheet, View, type ColorValue } from 'react-native';
import Svg from 'react-native-svg';
import GraphLine from './GraphLine';
import YAxis from './YAxis';
import XAxis from './XAxis';
import Grid, { type GridStyle } from './Grid';
import getGraphData from '../utils/getGraphData';

export type Ticks = Array<{
  axis: 'x' | 'y';
  values: [number, number][];
  position: 'top' | 'bottom';
  textFormatter: (v: number) => string;
  style: GridStyle;
}>;

interface Props {
  textFormatter: (v: number) => string;
  width: number;
  height: number;
  values: [number, number][][];
  colors: Array<{
    positiveColor: ColorValue;
    negativeColor: ColorValue;
  }>;
  zeroVisible: boolean;
}

export default function Graph({
  textFormatter,
  width,
  height,
  values,
  colors,
  zeroVisible,
}: Props) {
  const { viewBox, ticks, bounds, transformer } = getGraphData({
    textFormatter,
    width,
    height,
    values,
  });

  const grids = ticks.map((tick, i) => {
    return (
      <Grid
        viewBox={viewBox}
        key={i}
        transformer={transformer}
        values={tick.values}
        axis={tick.axis}
        position={tick.position}
        bounds={bounds}
        zeroVisible={zeroVisible}
        style={tick.style}
        formatter={tick.textFormatter}
      />
    );
  });

  const graphLines = values.map((v, i) => {
    const c = colors[i] ?? { positiveColor: 'orange', negativeColor: 'blue' };

    return (
      <GraphLine
        key={i}
        values={v}
        bounds={bounds}
        transformer={transformer}
        positiveColor={c.positiveColor}
        negativeColor={c.negativeColor}
      />
    );
  });

  return (
    <View style={styles.container}>
      <Svg
        viewBox={viewBox.join(' ')}
        width={viewBox[2]}
        height={viewBox[3]}
        style={styles.svg}
      >
        <XAxis bounds={bounds} transformer={transformer} />
        <YAxis bounds={bounds} transformer={transformer} />
        {grids}
        {graphLines}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingLeft: 60,
  },
  svg: {
    overflow: 'visible',
    width: 'auto',
    height: 'auto',
  },
});
