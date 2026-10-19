import type { ViewProps } from 'react-native';
import Container from './Container';
import {
  GraphContextProvider,
  type Formatter,
  type Legend,
  type PlotLayout,
} from '../contexts/GraphContext';
import { PointerContextProvider } from '../contexts/PointerContext';
import type { DecimationMethod } from '../utils/decimate';
import type { ReactElement } from 'react';

interface Props {
  children: ReactElement[];
  formatter: Formatter;
  width: number;
  /**
   * The graph's height in pixels, its margins included: the plot is what the
   * tick labels, the legends and `rightAxis` leave of it.
   */
  height: number;
  values: [number, number][][];
  zeroVisible: boolean;
  smooth?: boolean;
  fontSize: number;
  // How to simplify dense series before rendering. Defaults to 'minmax'
  // (keeps vertical spikes); 'lttb' preserves smooth shape; 'none' disables it.
  decimation?: DecimationMethod;
  // What the axes plot, named in the graph's own margin. The x legend sits
  // under its tick labels, the y one reads bottom-to-top beside them.
  xLegend?: Legend;
  yLegend?: Legend;
  /**
   * What the axis `Bars` draws on the right plots, named as `yLegend` is, down
   * the outer edge of the right margin. Only drawn with `rightAxis`.
   */
  rightLegend?: Legend;
  /**
   * The vertical range, `[min, max]`, instead of the data's own. Lines are
   * clipped at its edges.
   */
  yDomain?: [number, number];
  /** Room on the right for the axis `Bars` draws there. */
  rightAxis?: boolean;
  /**
   * Called with where the plot is in the graph's box, in pixels, whenever it
   * moves or is resized — to lay something over it.
   */
  onPlotLayout?: (plot: PlotLayout) => void;
}

export default function Graph({
  children,
  formatter,
  width,
  height,
  values,
  fontSize,
  zeroVisible,
  smooth,
  decimation,
  xLegend,
  yLegend,
  rightLegend,
  yDomain,
  rightAxis,
  onPlotLayout,
  ...props
}: Props & ViewProps): ReactElement {
  return (
    <GraphContextProvider
      width={width}
      height={height}
      fontSize={fontSize}
      values={values}
      zeroVisible={zeroVisible}
      smooth={smooth ?? true}
      formatter={formatter}
      decimation={decimation ?? 'minmax'}
      xLegend={xLegend}
      yLegend={yLegend}
      rightLegend={rightAxis === true ? rightLegend : undefined}
      yDomain={yDomain}
      rightAxis={rightAxis}
      onPlotLayout={onPlotLayout}
    >
      <PointerContextProvider>
        <Container {...props}>{children}</Container>
      </PointerContextProvider>
    </GraphContextProvider>
  );
}
