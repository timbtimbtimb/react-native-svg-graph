import { StyleSheet, View, type ColorValue } from 'react-native';
import Svg from 'react-native-svg';
import GraphLine from './GraphLine';
import YAxis from './YAxis';
import XAxis from './XAxis';
import type { ViewBox } from '../utils/getViewBox';
import type { Bounds } from '../utils/getBounds';
import type { Transformer } from '../utils/getTransformer';
import Grid, { type GridStyle } from './Grid';

export type Ticks = Array<{
  name: string;
  axis: 'x' | 'y';
  values: [number, number][];
  position: 'top' | 'bottom';
  textFormatter: (v: number) => string;
  style: GridStyle;
}>;

interface Props {
  viewBox: ViewBox;
  values: [number, number][][];
  ticks: Ticks;
  width: number;
  height: number;
  bounds: Bounds;
  colors: Array<{
    positiveColor: ColorValue;
    negativeColor: ColorValue;
  }>;
  zeroVisible: boolean;
  title: string;
  transformer: Transformer;
}

export default function Graph({
  viewBox,
  values,
  bounds,
  transformer,
  colors,
  ticks,
  zeroVisible,
}: Props) {
  const grids = ticks.map((tick) => {
    return (
      <Grid
        viewBox={viewBox}
        key={tick.name}
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
    paddingLeft: 40,
  },
  svg: {
    overflow: 'visible',
    width: 'auto',
    height: 'auto',
  },
});
