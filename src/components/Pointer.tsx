import { Circle, G, Line, Rect, Text } from 'react-native-svg';
import { useGraphContext } from '../contexts/GraphContext';
import { useCallback, useMemo } from 'react';
import { usePointerContext } from '../contexts/PointerContext';

export default function Pointer({
  xAxisTextFormatter,
}: {
  xAxisTextFormatter: (v: number) => string;
}) {
  const {
    fontSize,
    viewBox,
    values,
    transformer,
    formatter,
    marginViewBox,
    width,
  } = useGraphContext();

  const { pointerValue } = usePointerContext();

  const cachedData = useMemo(() => {
    return (values[0] ?? []).map((v, j) => {
      const positions = [v].map(transformer);
      const main = positions[0] ?? [0, 0];
      const xAxisText = xAxisTextFormatter(v?.[0] ?? 0);

      const circles = values.map((val) => {
        const p = transformer(val[j] ?? [0, 0]);
        return { cx: p[0], cy: p[1] };
      });

      const yAxisTexts = values
        .map((k) => k[j]?.[1] ?? 0)
        .sort((a, b) => b - a)
        .map((val) => (formatter ? formatter(Math.round(val)) : String(val)));

      return {
        x: positions[0]?.[0] ?? 0,
        circles,
        yAxisTexts,
        dateText: xAxisText,
        mainPosition: main,
      };
    });
  }, [formatter, transformer, values, xAxisTextFormatter]);

  const findClosest = useCallback(
    (value: number) => {
      const items = cachedData;
      if (!items) return;

      let low = 0;
      let high = items.length - 1;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const midVal = items[mid]?.x ?? 0;
        if (midVal < value) low = mid + 1;
        else high = mid - 1;
      }

      const lower = items[high];
      const upper = items[low];
      if (!lower) return upper;
      if (!upper) return lower;
      return Math.abs(lower.x - value) < Math.abs(upper.x - value)
        ? lower
        : upper;
    },
    [cachedData]
  );

  const pointer = useMemo(() => {
    if (pointerValue == null) return;
    const adjusted =
      pointerValue + marginViewBox[0] * (1 - pointerValue / width);
    return findClosest(adjusted);
  }, [findClosest, marginViewBox, pointerValue, width]);

  if (!pointer) return null;

  const tooltipWidth = fontSize * 6;
  const tooltipHeight = fontSize * (values.length + 1.5);
  const tooltipX = width / 2 - tooltipWidth / 2;
  const tooltipY = viewBox[1];

  return (
    <G>
      <Line
        x1={pointer.mainPosition[0]}
        x2={pointer.mainPosition[0]}
        y1={pointer.mainPosition[1]}
        y2={viewBox[3]}
        stroke="gray"
        strokeWidth={1}
        strokeDasharray={3}
      />
      <Line
        x1={viewBox[0]}
        x2={pointer.mainPosition[0]}
        y1={pointer.mainPosition[1]}
        y2={pointer.mainPosition[1]}
        stroke="gray"
        strokeWidth={1}
        strokeDasharray={3}
      />

      {pointer.circles.map((c, i) => (
        <Circle key={i} cx={c.cx} cy={c.cy} r={3} fill="white" />
      ))}
      <Rect
        x={tooltipX}
        y={tooltipY}
        width={tooltipWidth}
        height={tooltipHeight}
        fill="rgba(0,0,0,0.5)"
        stroke="white"
        strokeWidth={1}
        rx={4}
        ry={4}
      />

      {pointer.yAxisTexts.map((text, i) => (
        <Text
          key={i}
          x={width / 2}
          y={tooltipY + fontSize * (i + 1.25)}
          textAnchor="middle"
          alignmentBaseline="hanging"
          fill="white"
          fontSize={fontSize}
          fontWeight="bold"
        >
          {text}
        </Text>
      ))}

      <Text
        x={width / 2}
        y={tooltipY + fontSize * 0.25}
        textAnchor="middle"
        alignmentBaseline="hanging"
        fill="white"
        fontSize={fontSize}
      >
        {pointer.dateText}
      </Text>
    </G>
  );
}
