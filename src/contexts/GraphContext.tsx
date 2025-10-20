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
import type { ColorValue } from 'react-native';
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
  width: number;
  height: number;
  fontSize: number;
  bounds: Bounds;
  values: [number, number][][];
  svgElement: React.RefObject<Svg | null>;
  margins: {
    marginVertical: number;
    marginLeft: number;
  };
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
  const svgElement = useRef<Svg>(null);
  const [scaleRatio, setScaleRatio] = useState<number>(1);

  const bounds = useMemo<Bounds>(() => {
    return getBounds(values.flat(), zeroVisible);
  }, [values, zeroVisible]);

  const viewBox = useMemo(() => getViewBox(width, height), [width, height]);

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

  return (
    <GraphContext.Provider
      value={{
        bounds,
        fontSize,
        gradients,
        height,
        lines,
        masks,
        margins,
        scaleRatio,
        viewBox,
        width,
        zeroVisible,
        formatter,
        svgElement,
        svgRef,
        transformer,
        values,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
}
