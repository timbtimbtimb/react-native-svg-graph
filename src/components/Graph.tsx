import { StyleSheet, type ColorValue } from 'react-native';
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
  fontSize: number;
}

export default function Graph({
  textFormatter,
  width,
  height,
  values,
  colors,
  zeroVisible,
  fontSize,
}: Props) {
  const svgElement = useRef<Svg>(null);
  const [scaleRatio, setScaleRatio] = useState<number>(1);
  const [pointerValues, setPointerValues] = useState<[number, number][] | null>(
    null
  );

  const { viewBox, ticks, bounds, transformer } = getGraphData({
    textFormatter,
    width,
    height,
    values,
    fontSize,
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
    <Svg
      viewBox={viewBox.join(' ')}
      ref={(ref) => {
        svgElement.current =
          (ref?.elementRef as null | { current: Svg })?.current ?? null;
        const rect = (
          svgElement.current as null | HTMLElement
        )?.getBoundingClientRect();
        if (rect == null) return;
        setScaleRatio(rect.width / width);
      }}
      width={viewBox[2]}
      height={viewBox[3]}
      style={{
        ...styles.svg,
        marginVertical: scaleRatio * fontSize,
        marginLeft: scaleRatio * fontSize * 5,
      }}
      onMouseLeave={() => {
        setPointerValues(null);
      }}
      onPointerMove={(event) => {
        const rect = (
          svgElement.current as null | HTMLElement
        )?.getBoundingClientRect();
        if (rect == null) return;
        const xPosition = (event.nativeEvent.offsetX * width) / rect.width;
        const xRatio = xPosition / width;
        const clampedXRatio = Math.min(1, Math.max(0, xRatio));
        const xValue =
          clampedXRatio * (bounds.maxValueX - bounds.minValueX) +
          bounds.minValueX;

        setPointerValues(
          values.map((value) => {
            const indexUnder = Math.max(
              0,
              value.findIndex(([x]) => x >= xValue) - 1
            );
            const valueUnder = value[indexUnder] as [number, number];
            const valueOver = value[
              Math.min(indexUnder + 1, value.length - 1)
            ] as [number, number];
            return xValue - valueUnder[0] > valueOver[0] - xValue
              ? valueOver
              : valueUnder;
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
        />
      )}
    </Svg>
  );
}

const styles = StyleSheet.create({
  svg: {
    overflow: 'visible',
    width: 'auto',
    height: 'auto',
  },
});
