import { useEffect, useId, useMemo, type ReactElement } from 'react';
import { type ColorValue } from 'react-native';
import { ClipPath, Defs, G, Rect, Text } from 'react-native-svg';
import { useGraphContext, type Formatter } from '../contexts/GraphContext';

// The gap left between two bars, in the plot's own units.
const GAP = 1;

/**
 * `values` as bars along the bottom of the plot, on a scale of their own: from
 * zero at the bottom edge to their largest value, rounded up, at `ratio` of the
 * plot's height — read on an axis drawn on the right, which `Graph`'s
 * `rightAxis` makes room for. They share the graph's x axis: a bar spans from
 * the previous point's x to its own, a value being what accumulated over the
 * interval ending at it, as an amount of precipitation is. The first bar is as
 * wide as the second. The pointer's tooltip gives the value of the bar under
 * it, after the graph's own.
 */
export default function Bars({
  values,
  colors,
  ratio = 1 / 3,
  formatter,
}: {
  values: [number, number][][];
  colors: ColorValue[];
  ratio?: number;
  formatter?: Formatter;
}): ReactElement {
  const { transformer, viewBox, fontSize, setBarsTooltip } = useGraphContext();
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
      ticks: [0, max].map((value) => ({ value, y: toY(value) })),
    };
  }, [ratio, transformer, values, viewBox]);

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
      {ticks.map(({ value, y }) => (
        <Text
          key={value}
          x={viewBox[0] + viewBox[2]}
          y={y}
          dx={fontSize * 0.3}
          fontWeight={'bold'}
          fontSize={fontSize}
          fontFamily="sans"
          fill={colors[0] ?? 'gray'}
          alignmentBaseline={'middle'}
          textAnchor={'start'}
        >
          {formatter ? formatter(value) : String(value)}
        </Text>
      ))}
    </G>
  );
}
