import { Circle, G, Line, Rect, Text } from 'react-native-svg';
import { useGraphContext } from '../contexts/GraphContext';
import { useCallback, useMemo } from 'react';
import { usePointerContext } from '../contexts/PointerContext';

interface Pointer {
  x: number;
  circles: {
    cx: number;
    cy: number;
  }[];
  texts: {
    t: string;
    x: number;
    y: number;
  }[];
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  dateText: {
    t: string;
    x: number;
    y: number;
  };
  horizontalLine: {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
  };
  verticalLine: {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
  };
}

export default function Pointer() {
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
      const pointerValues = [v];

      const positions = pointerValues.map(transformer);
      const timestamp = Math.round(pointerValues[0]?.[0] ?? 0);
      const date = new Date(timestamp);
      const dateText =
        date.getHours().toString().padStart(2, '0') +
        ':' +
        date.getMinutes().toString().padStart(2, '0');
      const w = fontSize * 5;
      const mainPosition = positions.sort((a, b) => b[1] - a[1]).at(0) ?? [
        0, 0,
      ];

      const texts = values
        .map((k) => {
          return k[j]?.[1] ?? 0;
        })
        .sort((a, b) => b - a)
        .map((val, i) => {
          const roundedVal = Math.round(val);
          const t = formatter ? formatter(roundedVal) : v.toString();
          return {
            t,
            x: mainPosition[0],
            y: mainPosition[1] + fontSize * (i + 1),
          };
        });

      const circles = values
        .map((val) => transformer(val[j] ?? [0, 0]))
        .map((position) => ({
          cx: position[0],
          cy: position[1],
        }));

      const rect = {
        x: mainPosition[0] - w / 2,
        y: mainPosition[1] + fontSize * 0.66,
        width: w,
        height: fontSize * (values.length + 1.5),
      };

      return {
        x: positions[0]?.[0] ?? 0,
        circles,
        texts,
        rect,
        dateText: {
          t: dateText,
          x: mainPosition[0],
          y: mainPosition[1] + fontSize * (values.length + 1),
        },
        horizontalLine: {
          x1: mainPosition[0],
          x2: mainPosition[0],
          y1: mainPosition[1],
          y2: viewBox[3] + viewBox[1],
        },
        verticalLine: {
          x1: viewBox[0],
          x2: mainPosition[0],
          y1: mainPosition[1],
          y2: mainPosition[1],
        },
      };
    });
  }, [fontSize, formatter, transformer, values, viewBox]);

  const findClosest = useCallback(
    (value: number) => {
      const items = cachedData;
      if (items == null) return undefined;

      let low = 0,
        high = items.length - 1;
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

  const pointer = useMemo<Pointer | undefined>(() => {
    if (pointerValue == null) return;
    const offsettedPosition =
      pointerValue + marginViewBox[0] * (1 - pointerValue / width);
    return findClosest(offsettedPosition);
  }, [findClosest, marginViewBox, pointerValue, width]);

  const textsElements = useMemo(() => {
    if (pointer == null) return;
    return pointer.texts.map(({ t, x, y }, i) => {
      return (
        <Text
          key={i}
          x={x}
          y={y}
          fill={'white'}
          textAnchor="middle"
          alignmentBaseline="hanging"
          fontFamily="sans"
          fontWeight="bold"
          fontSize={fontSize}
        >
          {t}
        </Text>
      );
    });
  }, [fontSize, pointer]);

  const circlesElements = useMemo(() => {
    if (pointer == null) return;
    return pointer.circles.map(({ cx, cy }, i) => (
      <Circle key={[i, cx, cy].join()} fill={'white'} r={3} cx={cx} cy={cy} />
    ));
  }, [pointer]);

  if (pointer == null) return;

  return (
    <G>
      <Line
        x1={pointer.horizontalLine.x1}
        x2={pointer.horizontalLine.x2}
        y1={pointer.horizontalLine.y1}
        y2={pointer.horizontalLine.y2}
        stroke={'gray'}
        strokeWidth={1}
        strokeDasharray={3}
      />
      <Line
        x1={pointer.verticalLine.x1}
        x2={pointer.verticalLine.x2}
        y1={pointer.verticalLine.y1}
        y2={pointer.verticalLine.y2}
        stroke={'gray'}
        strokeWidth={1}
        strokeDasharray={3}
      />
      {circlesElements}
      <Rect
        x={pointer.rect.x}
        y={pointer.rect.y}
        width={pointer.rect.width}
        height={pointer.rect.height}
        stroke={'white'}
        strokeWidth={1}
        fill={'rgba(0,0,0,0.5)'}
        rx={3}
        ry={3}
      />
      {textsElements}
      <Text
        x={pointer.dateText.x}
        y={pointer.dateText.y}
        fill={'white'}
        textAnchor="middle"
        alignmentBaseline="hanging"
        fontFamily="sans"
        fontSize={fontSize * 0.85}
      >
        {pointer.dateText.t}
      </Text>
    </G>
  );
}
