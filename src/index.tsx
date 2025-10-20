import Grids from './components/Grids';
import Lines from './components/Lines';
import Graph from './components/Graph';
import Pointer from './components/Pointer';
import XAxis from './components/XAxis';
import YAxis from './components/YAxis';
import {
  GraphContextProvider,
  type Color,
  type Formatter,
} from './contexts/GraphContext';
import { PointerContextProvider } from './contexts/PointerContext';

interface Props {
  formatter: Formatter;
  width: number;
  height: number;
  values: [number, number][][];
  colors: Color[];
  zeroVisible: boolean;
  fontSize: number;
}

export default function App({
  formatter,
  width,
  height,
  values,
  colors,
  fontSize,
  zeroVisible,
}: Props) {
  return (
    <GraphContextProvider
      width={width}
      height={height}
      fontSize={fontSize}
      values={values}
      zeroVisible={zeroVisible}
      colors={colors}
      formatter={formatter}
    >
      <PointerContextProvider>
        <Graph>
          <XAxis />
          <YAxis />
          <Grids />
          <Lines />
          <Pointer />
        </Graph>
      </PointerContextProvider>
    </GraphContextProvider>
  );
}
