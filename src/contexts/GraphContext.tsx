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
  type RefObject,
} from 'react';
import type { ViewBox } from '../utils/getViewBox';
import type Svg from 'react-native-svg';
import getBounds, { type Bounds } from '../utils/getBounds';
import getViewBox from '../utils/getViewBox';
import type { Transformer } from '../utils/getTransformer';
import getTransformer from '../utils/getTransformer';
import { Platform, type ColorValue } from 'react-native';
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
  marginViewBox: ViewBox;
  scaleRatio: number;
  width: number;
  height: number;
  fontSize: number;
  bounds: Bounds;
  values: [number, number][][];
  getSvgElementWidth: RefObject<() => number>;
  zeroVisible: boolean;
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
}

interface Props {
  children?: ReactNode;
  width: number;
  height: number;
  fontSize: number;
  values: [number, number][][];
  zeroVisible: boolean;
  formatter: Formatter;
}

export const GraphContext = createContext<undefined | GraphContextType>(
  undefined
);

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
  formatter,
}: Props): ReactElement {
  const getSvgElementWidth = useRef<() => number>(() => 1);
  const [scaleRatio, setScaleRatio] = useState<number>(1);

  const bounds = useMemo<Bounds>(() => {
    return getBounds(values.flat(), zeroVisible);
  }, [values, zeroVisible]);

  const viewBox = useMemo(() => getViewBox(width, height), [width, height]);

  const marginViewBox = useMemo<ViewBox>(
    () => [
      viewBox[0] - fontSize * 2.5,
      viewBox[1] - fontSize,
      viewBox[2] + fontSize * 4.5,
      viewBox[3] + fontSize * 2,
    ],
    [fontSize, viewBox]
  );

  const transformer = useMemo(
    () => getTransformer(values.flat(), viewBox, bounds),
    [bounds, values, viewBox]
  );

  const lines = useMemo(
    () => values.map((v) => svgCoords2SvgLineCoords(v.map(transformer), true)),
    [transformer, values]
  );

  const masks = useMemo(
    () => getMasksSvgCoords(bounds, transformer),
    [bounds, transformer]
  );

  const gradients = useMemo(() => {
    return values.map((v) => getPolygonsSvgCoords(bounds, transformer, v));
  }, [bounds, transformer, values]);

  const svgRef: Ref<Svg> | undefined = useCallback(
    (ref: Svg) => {
      if (Platform.OS === 'web') {
        const svgElement =
          (ref?.elementRef as null | { current: HTMLElement })?.current ?? null;
        if (svgElement == null) return;
        getSvgElementWidth.current = () =>
          svgElement.getBoundingClientRect().width;
        setScaleRatio(svgElement.getBoundingClientRect().width / width);
      } else {
        ref.measure((_, __, w) => {
          setScaleRatio(w / width);
          getSvgElementWidth.current = () => w;
        });
      }
    },
    [width]
  );

  return (
    <GraphContext.Provider
      value={{
        bounds,
        fontSize,
        gradients,
        height,
        lines,
        masks,
        marginViewBox,
        scaleRatio,
        viewBox,
        width,
        zeroVisible,
        formatter,
        getSvgElementWidth,
        svgRef,
        transformer,
        values,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
}
