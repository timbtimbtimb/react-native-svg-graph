import { useEffect, useId, useMemo, type ReactElement } from 'react';
import { type ColorValue } from 'react-native';
import { ClipPath, Defs, G, Path, Rect, Text } from 'react-native-svg';
import { useGraphContext, type Formatter } from '../contexts/GraphContext';

// The gap left between two bars, in the plot's own units.
const GAP = 1;

// The axis's labels, in font sizes: the room left between the axis line and
// them, a bold digit's width — about the widest of any character in a number,
// and an estimate for any other, since SVG text cannot be measured as it is
// laid out — and the room after them, before the legend or the edge.
const LABEL_INSET = 0.3;
const CHARACTER_WIDTH = 0.6;
const LABEL_END = 0.3;

/**
 * `values` as bars along the bottom of the plot, on a scale of their own: from
 * zero at the bottom edge to their largest value, rounded up, at `ratio` of the
 * plot's height — read on an axis drawn on the right, which `Graph`'s
 * `rightAxis` makes room for. They share the graph's x axis: a bar spans from
 * the previous point's x to its own, a value being what accumulated over the
 * interval ending at it, as an amount of precipitation is. The first bar is as
 * wide as the second. The axis is a line in the first series' colour, the
 * plot's whole height, with the scale's two ends' values beside it. The
 * pointer's tooltip gives the value of the bar under it, after the graph's own.
 */
export default function Bars({
  values,
  colors,
  ratio = 1 / 3,
  formatter,
  tickFormatter,
}: {
  values: [number, number][][];
  colors: ColorValue[];
  ratio?: number;
  formatter?: Formatter;
  /**
   * The axis's labels, when they say less than the tooltip — the bare number,
   * the unit left to the legend, as `Grid`'s formatter is to the graph's.
   * Defaults to `formatter`.
   */
  tickFormatter?: Formatter;
}): ReactElement {
  const {
    transformer,
    viewBox,
    fontSize,
    setBarsTooltip,
    setRightLabelsWidth,
  } = useGraphContext();
  const uniqueId = useId();

  // Handed to the pointer, so its tooltip says what the bar under it holds.
  useEffect(() => {
    setBarsTooltip({ values, formatter });
    return () => {
      setBarsTooltip(null);
    };
  }, [formatter, setBarsTooltip, values]);

  const { bars, ticks } = useMemo(() => {
    const largest = Math.max(0, ...values.flat().map(([, y]) => y));
    const max = Math.max(1, Math.ceil(largest));
    const bottom = viewBox[1] + viewBox[3];
    const height = viewBox[3] * ratio;
    const toY = (y: number) => bottom - (Math.max(0, y) / max) * height;

    return {
      bars: values.map((series) =>
        series.map(([x, y], i) => {
          const start =
            series[i - 1]?.[0] ?? x - ((series[i + 1]?.[0] ?? x) - x);
          const left = transformer([start, 0])[0];
          const right = transformer([x, 0])[0];
          const top = toY(y);
          return {
            x: left + GAP / 2,
            y: top,
            width: Math.max(0, right - left - GAP),
            height: bottom - top,
          };
        })
      ),
      ticks: [0, max].map((value) => ({
        value,
        y: toY(value),
        label: (tickFormatter ?? formatter)?.(value) ?? String(value),
      })),
    };
  }, [formatter, ratio, tickFormatter, transformer, values, viewBox]);

  // The room the labels take, for the right margin: as wide as the longest.
  const labelsWidth =
    fontSize *
    (LABEL_INSET +
      CHARACTER_WIDTH * Math.max(...ticks.map(({ label }) => label.length)) +
      LABEL_END);
  useEffect(() => {
    setRightLabelsWidth(labelsWidth);
    return () => {
      setRightLabelsWidth(null);
    };
  }, [labelsWidth, setRightLabelsWidth]);

  return (
    <G>
      <Defs>
        <ClipPath id={`bars-clip-${uniqueId}`}>
          <Rect
            x={viewBox[0]}
            y={viewBox[1]}
            width={viewBox[2]}
            height={viewBox[3]}
          />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#bars-clip-${uniqueId})`}>
        {bars.flatMap((series, s) =>
          series.map((bar, i) =>
            bar.height > 0 ? (
              <Rect
                key={`${s}-${i}`}
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                fill={colors[s]}
              />
            ) : null
          )
        )}
      </G>
      <Path
        d={`M ${viewBox[0] + viewBox[2]} ${viewBox[1] + viewBox[3]} V ${viewBox[1]}`}
        stroke={colors[0] ?? 'gray'}
        strokeWidth={1}
        fill="none"
      />
      {ticks.map(({ value, y, label }) => (
        <Text
          key={value}
          x={viewBox[0] + viewBox[2]}
          y={y}
          dx={fontSize * LABEL_INSET}
          fontWeight={'bold'}
          fontSize={fontSize}
          fontFamily="sans"
          fill={colors[0] ?? 'gray'}
          alignmentBaseline={'middle'}
          textAnchor={'start'}
        >
          {label}
        </Text>
      ))}
    </G>
  );
}
