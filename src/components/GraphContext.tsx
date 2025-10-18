import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import type { ViewBox } from '../utils/getViewBox';
import type Svg from 'react-native-svg';
import getBounds, { type Bounds } from '../utils/getBounds';
import getViewBox from '../utils/getViewBox';
import type { Transformer } from '../utils/getTransformer';
import getTransformer from '../utils/getTransformer';
import getTicks, { type ParsedTick } from '../utils/getTicks';
import type { ColorValue, MouseEvent, PointerEvent } from 'react-native';
import svgCoords2SvgLineCoords from '../utils/svgCoords2SvgLineCoords';
import getMasksSvgCoords from '../utils/getMasksSvgCoords';
import getPolygonsSvgCoords from '../utils/getPolygonsSvgCoords';

export type Formatter = (v: number) => string;

export interface Color {
  positiveColor: ColorValue;
  negativeColor: ColorValue;
}

interface GraphContextType {
  viewBox: ViewBox;
  scaleRatio: number;
  pointerValues: [number, number][] | null;
  width: number;
  height: number;
  fontSize: number;
  bounds: Bounds;
  colors: Color[];
  margins: {
    marginVertical: number;
    marginLeft: number;
  };
  zeroVisible: boolean;
  ticks: ParsedTick[];
  lines: string[];
  svgRef: Ref<Svg> | undefined;
  masks: {
    negativeMask: string;
    positiveMask: string;
  };
  gradients: Array<{
    positivePolygon: string;
    negativePolygon: string;
  }>;
  transformer: Transformer;
  formatter: Formatter;
  onPointerMove: ((event: PointerEvent) => void) | undefined;
  onMouseLeave: ((event: MouseEvent) => void) | undefined;
}

type CreateContextType = undefined | GraphContextType;

interface Props {
  children?: ReactNode;
  width: number;
  height: number;
  fontSize: number;
  values: [number, number][][];
  zeroVisible: boolean;
  colors: Array<{
    positiveColor: ColorValue;
    negativeColor: ColorValue;
  }>;
  formatter: Formatter;
}

export const GraphContext = createContext<CreateContextType>(undefined);

export function useGraphContext(): GraphContextType {
  const ctx = useContext(GraphContext);

  if (ctx === undefined) {
    throw new Error('useGraphContext must be used with an GraphContext');
  }

  return ctx;
}

export function GraphContextProvider({
  width,
  height,
  fontSize,
  children,
  values,
  zeroVisible,
  colors,
  formatter,
}: Props): ReactElement {
  const svgElement = useRef<Svg>(null);
  const [scaleRatio, setScaleRatio] = useState<number>(1);
  const [pointerValues, setPointerValues] = useState<[number, number][] | null>(
    null
  );

  const bounds = useMemo<Bounds>(() => {
    return getBounds(values.flat());
  }, [values]);

  const viewBox = useMemo(() => getViewBox(width, height), [width, height]);

  const transformer = useMemo(
    () => getTransformer(values.flat(), viewBox, bounds),
    [bounds, values, viewBox]
  );

  const ticks = useMemo<ParsedTick[]>(
    () =>
      getTicks({
        bounds,
        formatter,
        viewBox,
        fontSize,
        zeroVisible,
        transformer,
      }),
    [bounds, fontSize, formatter, transformer, viewBox, zeroVisible]
  );

  const lines = useMemo(
    () => values.map((v) => svgCoords2SvgLineCoords(v.map(transformer), true)),
    [transformer, values]
  );

  const masks = useMemo(
    () => getMasksSvgCoords(bounds, transformer),
    [bounds, transformer]
  );

  const gradients = useMemo(
    () => values.map((v) => getPolygonsSvgCoords(bounds, transformer, v)),
    [bounds, transformer, values]
  );

  const margins = useMemo(
    () => ({
      marginVertical: scaleRatio * fontSize,
      marginLeft: scaleRatio * fontSize * 5,
    }),
    [fontSize, scaleRatio]
  );

  const svgRef: Ref<Svg> | undefined = useCallback(
    (ref: Svg) => {
      svgElement.current =
        (ref?.elementRef as null | { current: Svg })?.current ?? null;
      const rect = (
        svgElement.current as null | HTMLElement
      )?.getBoundingClientRect();
      if (rect == null) return;
      setScaleRatio(rect.width / width);
    },
    [width]
  );

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
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
    },
    [bounds, values, width]
  );

  const onMouseLeave = useCallback(() => {
    setPointerValues(null);
  }, []);

  return (
    <GraphContext.Provider
      value={{
        bounds,
        colors,
        fontSize,
        gradients,
        height,
        lines,
        masks,
        pointerValues,
        margins,
        scaleRatio,
        ticks,
        viewBox,
        width,
        zeroVisible,
        formatter,
        onMouseLeave,
        onPointerMove,
        svgRef,
        transformer,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
}
