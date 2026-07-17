import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactElement,
  type ReactNode,
  type SetStateAction,
} from 'react';
import type { ViewBox } from '../utils/getViewBox';
import getBounds, { type Bounds } from '../utils/getBounds';
import getViewBox from '../utils/getViewBox';
import type { Transformer } from '../utils/getTransformer';
import getTransformer from '../utils/getTransformer';
import { type ColorValue } from 'react-native';
import svgCoords2SvgLineCoords from '../utils/svgCoords2SvgLineCoords';
import getMasksSvgCoords from '../utils/getMasksSvgCoords';
import getPolygonsSvgCoords from '../utils/getPolygonsSvgCoords';
import decimate, { type DecimationMethod } from '../utils/decimate';

export type Formatter = (v: number) => string;

export interface Color {
  positiveColor: ColorValue;
  negativeColor: ColorValue;
}

interface GraphContextType {
  viewBox: ViewBox;
  marginViewBox: ViewBox;
  width: number;
  setWidth: Dispatch<SetStateAction<number>>;
  height: number;
  fontSize: number;
  bounds: Bounds;
  values: [number, number][][];
  zeroVisible: boolean;
  lines: string[];
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
  smooth: boolean;
  formatter: Formatter;
  decimation: DecimationMethod;
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
  height,
  fontSize,
  children,
  values,
  zeroVisible,
  smooth,
  formatter,
  decimation,
}: Props): ReactElement {
  const [width, setWidth] = useState<number>(1);

  // Screen-space simplification: drop sub-pixel points from the rendered paths
  // when a series has more points than horizontal pixels. `values` stays at full
  // resolution so the pointer tooltip still snaps to real data points.
  const renderValues = useMemo(
    () =>
      values.map((series) => decimate(series, Math.ceil(width), decimation)),
    [decimation, values, width]
  );

  const bounds = useMemo<Bounds>(() => {
    return getBounds(values.flat(), zeroVisible);
  }, [values, zeroVisible]);

  const viewBox = useMemo(() => getViewBox(width, height), [width, height]);

  const marginViewBox = useMemo<ViewBox>(
    () => [
      viewBox[0] - fontSize * 3,
      viewBox[1] - fontSize,
      viewBox[2] + fontSize * 3,
      viewBox[3] + fontSize * 2.5,
    ],
    [fontSize, viewBox]
  );

  const transformer = useMemo(
    () => getTransformer(values.flat(), viewBox, bounds),
    [bounds, values, viewBox]
  );

  const lines = useMemo(
    () =>
      renderValues.map((v) =>
        svgCoords2SvgLineCoords(v.map(transformer), smooth)
      ),
    [smooth, transformer, renderValues]
  );

  const masks = useMemo(
    () => getMasksSvgCoords(bounds, transformer),
    [bounds, transformer]
  );

  const gradients = useMemo(() => {
    return renderValues.map((v) =>
      getPolygonsSvgCoords(bounds, transformer, v, smooth)
    );
  }, [bounds, smooth, transformer, renderValues]);

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
        viewBox,
        width,
        setWidth,
        zeroVisible,
        formatter,
        transformer,
        values,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
}
