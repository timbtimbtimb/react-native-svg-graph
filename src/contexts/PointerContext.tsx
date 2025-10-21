import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useGraphContext } from './GraphContext';

interface PointerContextType {
  onPointerMove: (x: number) => void;
  onMouseLeave: () => void;
  pointer: {
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
  };
}

export const PointerContext = createContext<undefined | PointerContextType>(
  undefined
);

export function usePointerContext(): PointerContextType {
  const ctx = useContext(PointerContext);

  if (ctx === undefined) {
    throw new Error('usePointerContext must be used with an PointerContext');
  }

  return ctx;
}

export function PointerContextProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const {
    fontSize,
    transformer,
    formatter,
    viewBox,
    marginViewBox,
    svgElement,
    values,
    bounds,
  } = useGraphContext();

  const [pointerValues, setPointerValues] = useState<[number, number][] | null>(
    null
  );

  const pointer = useMemo<PointerContextType['pointer']>(() => {
    const positions = (pointerValues ?? []).map(transformer);
    const timestamp = Math.round((pointerValues ?? [])[0]?.[0] ?? 0);
    const date = new Date(timestamp);
    const dateText =
      date.getHours().toString().padStart(2, '0') +
      ':' +
      date.getMinutes().toString().padStart(2, '0');
    const w = fontSize * 5;
    const mainPosition = positions.sort((a, b) => b[1] - a[1]).at(0) ?? [0, 0];

    const texts = (pointerValues ?? [])
      .sort((a, b) => b[1] - a[1])
      .map((value, i) => {
        const v = Math.round(value[1]);
        const t = formatter ? formatter(v) : v.toString();
        return {
          t,
          x: mainPosition[0],
          y: mainPosition[1] + fontSize * (i + 1),
        };
      });

    const circles = positions.map((position) => ({
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
  }, [fontSize, formatter, pointerValues, transformer, values, viewBox]);

  const onPointerMove = useCallback(
    (x: number) => {
      const rect = (
        svgElement.current as null | HTMLElement
      )?.getBoundingClientRect();
      if (rect == null) return;

      const offset = Math.abs(marginViewBox[0] / marginViewBox[2]);
      const scale = marginViewBox[2] / viewBox[2];
      const xRatio = (x / rect.width - offset) * scale;
      const clampedXRatio = Math.min(1, Math.max(0, xRatio));
      const xValue =
        clampedXRatio * (bounds.maxValueX - bounds.minValueX) +
        bounds.minValueX;

      setPointerValues(
        values.map((value) => {
          const indexUnder = Math.max(
            0,
            value.findIndex(([xV]) => xV >= xValue) - 1
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
    },
    [bounds, marginViewBox, svgElement, values, viewBox]
  );

  const onMouseLeave = useCallback(() => {
    setPointerValues(null);
  }, []);

  return (
    <PointerContext.Provider value={{ pointer, onPointerMove, onMouseLeave }}>
      {children}
    </PointerContext.Provider>
  );
}
