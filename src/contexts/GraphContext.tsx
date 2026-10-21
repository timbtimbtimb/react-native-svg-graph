import {
  createContext,
  useContext,
  useEffect,
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

/** The name of what an axis plots, and the unit it is counted in. */
export interface Legend {
  label: string;
  unit?: string;
  color?: ColorValue;
}

/** Where the plot is in the graph's box, in pixels from its top left corner. */
export interface PlotLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

// How much room a legend needs, as a multiple of the font size, on top of the
// margin the tick labels already take. Exported because `Legends` lays itself
// out over exactly this strip, and the two reading different numbers would put
// the label somewhere the plot had not been shortened for.
export const LEGEND_MARGIN = 1.5;

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
  xLegend?: Legend;
  yLegend?: Legend;
  rightLegend?: Legend;
  /** Whether a `yDomain` fixes the vertical range, so `Lines` clips to the plot. */
  clipped: boolean;
  /** What `Bars` draws, which the pointer's tooltip reads too. */
  barsTooltip: BarsTooltip | null;
  setBarsTooltip: Dispatch<SetStateAction<BarsTooltip | null>>;
  /** How wide `Bars`' labels are, in pixels, which the right margin is made. */
  setRightLabelsWidth: Dispatch<SetStateAction<number | null>>;
}

interface BarsTooltip {
  values: [number, number][][];
  formatter?: Formatter;
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
  xLegend?: Legend;
  yLegend?: Legend;
  rightLegend?: Legend;
  yDomain?: [number, number];
  rightAxis?: boolean;
  onPlotLayout?: (plot: PlotLayout) => void;
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
  width: initialWidth,
  height,
  fontSize,
  children,
  values,
  zeroVisible,
  smooth,
  formatter,
  decimation,
  xLegend,
  yLegend,
  rightLegend,
  yDomain,
  rightAxis,
  onPlotLayout,
}: Props): ReactElement {
  // The width the caller says the graph will have, until the box has measured
  // itself: starting from a pixel, the first frame's view box was a pixel wide,
  // and the web sizes an SVG from its view box's proportions.
  const [width, setWidth] = useState<number>(initialWidth);
  const clipped = yDomain != null;
  // What `Bars` draws, for the pointer's tooltip, which otherwise reads only
  // `values`. Set by `Bars` itself, as it is a child the provider cannot see.
  const [barsTooltip, setBarsTooltip] = useState<BarsTooltip | null>(null);
  // As wide as `Bars` says its labels are, which only it knows, or the left
  // axis's own room until it has.
  const [rightLabelsWidth, setRightLabelsWidth] = useState<number | null>(null);

  // The domain is compared by its ends, so a fresh array literal each render
  // does not recompute the bounds.
  const yMin = yDomain?.[0];
  const yMax = yDomain?.[1];
  const bounds = useMemo<Bounds>(() => {
    return getBounds(
      values.flat(),
      zeroVisible,
      yMin == null || yMax == null ? undefined : [yMin, yMax]
    );
  }, [values, zeroVisible, yMin, yMax]);

  // The graph's box is `width` by `height` pixels, and its view box is the box
  // itself, so one unit is one pixel: nothing is stretched, a stroke is as wide
  // as it says and a font size is its size. The plot is what the margins leave.
  // A legend is given room beyond what the tick labels need rather than a share
  // of it, so the two can never crowd one another.
  const { viewBox, marginViewBox } = useMemo(() => {
    const legend = fontSize * LEGEND_MARGIN;
    const left = fontSize * 3 + (yLegend == null ? 0 : legend);
    const top = fontSize;
    const bottom = fontSize * 2.5 + (xLegend == null ? 0 : legend);
    // Room for `Bars`' own axis, on the right, and for its legend.
    const right =
      (rightAxis === true ? (rightLabelsWidth ?? fontSize * 3) : 0) +
      (rightLegend == null ? 0 : legend);
    // At least a pixel each way, before the box has been measured.
    const plot = getViewBox(
      Math.max(1, width - left - right),
      Math.max(1, height - top - bottom)
    );

    return {
      viewBox: plot,
      marginViewBox: [plot[0] - left, plot[1] - top, width, height] as ViewBox,
    };
  }, [
    fontSize,
    height,
    rightAxis,
    rightLabelsWidth,
    rightLegend,
    width,
    xLegend,
    yLegend,
  ]);

  // Reported whenever the plot moves or is resized, so what is laid over the
  // graph can be placed on it without knowing how its margins are made. A unit
  // is a pixel, so the plot's place in the margin view box is its place in the
  // box.
  const plotX = viewBox[0] - marginViewBox[0];
  const plotY = viewBox[1] - marginViewBox[1];
  const plotWidth = viewBox[2];
  const plotHeight = viewBox[3];
  useEffect(() => {
    onPlotLayout?.({
      x: plotX,
      y: plotY,
      width: plotWidth,
      height: plotHeight,
    });
  }, [onPlotLayout, plotHeight, plotWidth, plotX, plotY]);

  // Screen-space simplification: drop sub-pixel points from the rendered paths
  // when a series has more points than the plot has pixels across. `values`
  // stays at full resolution so the pointer tooltip still snaps to real data
  // points.
  const renderValues = useMemo(
    () =>
      values.map((series) =>
        decimate(series, Math.ceil(viewBox[2]), decimation)
      ),
    [decimation, values, viewBox]
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
        xLegend,
        yLegend,
        rightLegend,
        clipped,
        barsTooltip,
        setBarsTooltip,
        setRightLabelsWidth,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
}
