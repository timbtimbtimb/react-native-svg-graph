import Graph from './components/Graph';
import {
  GraphContextProvider,
  type Color,
  type Formatter,
} from './contexts/GraphContext';
import { PointerContextProvider } from './contexts/PointerContext';
import type { ReactElement } from 'react';

interface Props {
  children: ReactElement[];
  formatter: Formatter;
  width: number;
  height: number;
  values: [number, number][][];
  colors: Color[];
  zeroVisible: boolean;
  fontSize: number;
}

export default function App({
  children,
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
        <Graph>{children}</Graph>
      </PointerContextProvider>
    </GraphContextProvider>
  );
}
