import {
  Circle,
  G,
  Line,
  Rect,
  Text,
  type CircleProps,
  type LineProps,
} from 'react-native-svg';
import { useGraphContext } from '../contexts/GraphContext';
import { useMemo, useState } from 'react';
import Animated, {
  useAnimatedProps,
  useAnimatedReaction,
  useDerivedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { usePointerContext } from '../contexts/PointerContext';

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Selected = {
  active: boolean;
  idx: number;
  mainX: number;
  mainY: number;
};

export default function Pointer({
  xAxisTextFormatter,
}: {
  xAxisTextFormatter?: (v: number) => string;
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

  const { pointerX } = usePointerContext();

  // Numeric-only geometry, safe to serialize into the UI-thread worklet runtime.
  // Recomputed only when the data / transform changes, never on pointer move.
  const frames = useMemo(() => {
    const list = values[0] ?? [];
    const length = list.length;
    const xs = new Array<number>(length);
    const mainX = new Array<number>(length);
    const mainY = new Array<number>(length);
    const cxs = values.map(() => new Array<number>(length));
    const cys = values.map(() => new Array<number>(length));

    for (let j = 0; j < length; j++) {
      const main = transformer(list[j] ?? [0, 0]);
      xs[j] = main[0];
      mainX[j] = main[0];
      mainY[j] = main[1];
      for (let s = 0; s < values.length; s++) {
        const p = transformer(values[s]?.[j] ?? [0, 0]);
        cxs[s]![j] = p[0];
        cys[s]![j] = p[1];
      }
    }

    return { xs, mainX, mainY, cxs, cys };
  }, [transformer, values]);

  // Tooltip strings. Kept off the UI thread (strings can't be animated props);
  // rendered from React state that only updates when the selected index changes.
  const textFrames = useMemo(() => {
    const list = values[0] ?? [];
    return list.map((v, j) => ({
      yAxisTexts: values
        .map((k) => k[j]?.[1] ?? 0)
        .sort((a, b) => b - a)
        .map((val) => (formatter ? formatter(Math.round(val)) : String(val))),
      dateText: xAxisTextFormatter?.(v?.[0] ?? 0),
    }));
  }, [formatter, values, xAxisTextFormatter]);

  const marginLeft = marginViewBox[0];

  // Binary-search the closest data point on the UI thread, every frame.
  const selected = useDerivedValue<Selected>(() => {
    'worklet';
    const xs = frames.xs;
    const n = xs.length;
    const px = pointerX.value;
    if (px < 0 || n === 0) {
      return { active: false, idx: -1, mainX: 0, mainY: 0 };
    }

    const adjusted = px + marginLeft * (1 - px / width);

    let low = 0;
    let high = n - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if ((xs[mid] ?? 0) < adjusted) low = mid + 1;
      else high = mid - 1;
    }

    const lower = xs[high];
    const upper = xs[low];
    let idx: number;
    if (lower === undefined) idx = low;
    else if (upper === undefined) idx = high;
    else
      idx =
        Math.abs(lower - adjusted) < Math.abs(upper - adjusted) ? high : low;

    if (idx < 0) idx = 0;
    if (idx > n - 1) idx = n - 1;

    return {
      active: true,
      idx,
      mainX: frames.mainX[idx] ?? 0,
      mainY: frames.mainY[idx] ?? 0,
    };
  });

  // Vertical crosshair: follows the cursor, drops to the top margin.
  const verticalLineProps = useAnimatedProps<LineProps>(() => {
    'worklet';
    return {
      x1: selected.value.mainX,
      x2: selected.value.mainX,
      y1: selected.value.mainY,
    };
  });

  // Horizontal crosshair: from the left edge to the cursor.
  const horizontalLineProps = useAnimatedProps<LineProps>(() => {
    'worklet';
    return {
      x2: selected.value.mainX,
      y1: selected.value.mainY,
      y2: selected.value.mainY,
    };
  });

  // Hide the whole crosshair when inactive, without a React re-render.
  const crosshairProps = useAnimatedProps(() => {
    'worklet';
    return { opacity: selected.value.active ? 1 : 0 };
  });

  // Push the selected index to React state only when it actually changes, so
  // the tooltip text re-renders a few times per second, not once per frame.
  const [tipIdx, setTipIdx] = useState(-1);
  useAnimatedReaction(
    () => {
      'worklet';
      return selected.value.active ? selected.value.idx : -1;
    },
    (current, previous) => {
      'worklet';
      if (current !== previous) scheduleOnRN(setTipIdx, current);
    }
  );

  if (frames.xs.length === 0) return null;

  const tip = tipIdx >= 0 ? textFrames[tipIdx] : undefined;
  const tooltipWidth = fontSize * 5;
  const tooltipHeight =
    fontSize * (values.length + (tip?.dateText == null ? 0.5 : 1.5));
  const tooltipX = width / 2 - tooltipWidth / 2;
  const tooltipY = viewBox[1];

  return (
    <G>
      <AnimatedG animatedProps={crosshairProps}>
        <AnimatedLine
          animatedProps={verticalLineProps}
          y2={marginViewBox[0]}
          stroke="gray"
          strokeWidth={1}
          strokeDasharray={3}
        />
        <AnimatedLine
          animatedProps={horizontalLineProps}
          x1={viewBox[0]}
          stroke="gray"
          strokeWidth={1}
          strokeDasharray={3}
        />
        {values.map((_, s) => (
          <PointerCircle
            key={s}
            cxs={frames.cxs[s] ?? []}
            cys={frames.cys[s] ?? []}
            selected={selected}
          />
        ))}
      </AnimatedG>

      {tip != null && (
        <G>
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
          {tip.yAxisTexts.map((text, i) => (
            <Text
              key={i}
              x={width / 2}
              y={
                tooltipY + fontSize * (i + (tip.dateText == null ? 0.25 : 1.25))
              }
              textAnchor="middle"
              alignmentBaseline="hanging"
              fill="white"
              fontSize={fontSize}
              fontFamily="sans"
              fontWeight="bold"
            >
              {text}
            </Text>
          ))}
          {tip.dateText != null && (
            <Text
              x={width / 2}
              y={tooltipY + fontSize * 0.25}
              textAnchor="middle"
              alignmentBaseline="hanging"
              fill="white"
              fontSize={fontSize}
              fontFamily="sans"
            >
              {tip.dateText}
            </Text>
          )}
        </G>
      )}
    </G>
  );
}

function PointerCircle({
  cxs,
  cys,
  selected,
}: {
  cxs: number[];
  cys: number[];
  selected: SharedValue<Selected>;
}) {
  const animatedProps = useAnimatedProps<CircleProps>(() => {
    'worklet';
    const i = selected.value.idx;
    const active = selected.value.active && i >= 0;
    return {
      cx: active ? (cxs[i] ?? 0) : 0,
      cy: active ? (cys[i] ?? 0) : 0,
      opacity: active ? 1 : 0,
    };
  });

  return <AnimatedCircle animatedProps={animatedProps} r={3} fill="white" />;
}
