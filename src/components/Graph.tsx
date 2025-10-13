import { StyleSheet, View, type ColorValue } from 'react-native';
import Svg from 'react-native-svg';
import GraphLine from './GraphLine';
import YAxis from './YAxis';
import XAxis from './XAxis';
import Grid, { type GridStyle } from './Grid';
import getGraphData from '../utils/getGraphData';
import Pointer from './Pointer';
import { useRef, useState } from 'react';

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
  const svgElement = useRef<Svg>(null);
  const [currentSizeRatio, setCurrentSizeRatio] = useState<[number, number]>([
    1, 1,
  ]);
  const [pointerValues, setPointerValues] = useState<[number, number][] | null>(
    null
  );

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
    <View
      style={styles.container}
      onLayout={() => {
        const rect = (
          svgElement.current as null | HTMLElement
        )?.getBoundingClientRect();
        if (rect == null) return;
        const { width: currentWidth, height: currentHeight } = rect;
        setCurrentSizeRatio([width / currentWidth, height / currentHeight]);
      }}
    >
      <Svg
        viewBox={viewBox.join(' ')}
        ref={(ref) => {
          svgElement.current =
            (ref?.elementRef as null | { current: Svg })?.current ?? null;
        }}
        width={viewBox[2]}
        height={viewBox[3]}
        style={styles.svg}
        onMouseLeave={() => {
          setPointerValues(null);
        }}
        onPointerMove={(event) => {
          const xPosition = event.nativeEvent.offsetX * currentSizeRatio[0];
          const xRatio = xPosition / width;
          const clampedXRatio = Math.min(1, Math.max(0, xRatio));
          const xValue =
            clampedXRatio * (bounds.maxValueX - bounds.minValueX) +
            bounds.minValueX;

          setPointerValues(
            values.map((value) => {
              const valuesUnder = value.filter(([x]) => x < xValue);
              const index = valuesUnder.length - 1;
              if (index === -1) return [0, 0];
              return value[index] as [number, number];
            })
          );
        }}
      >
        <XAxis bounds={bounds} transformer={transformer} />
        <YAxis bounds={bounds} transformer={transformer} />
        {grids}
        {graphLines}
        {pointerValues != null && (
          <Pointer
            viewBox={viewBox}
            values={pointerValues}
            formatter={textFormatter}
            transformer={transformer}
            colors={colors}
          />
        )}
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
