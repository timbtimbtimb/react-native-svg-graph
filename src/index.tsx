import type { ViewProps } from 'react-native';
import Graph from './components/Graph';
import { GraphContextProvider, type Formatter } from './contexts/GraphContext';
import { PointerContextProvider } from './contexts/PointerContext';
import type { ReactElement } from 'react';

interface Props {
  children: ReactElement[];
  formatter: Formatter;
  width: number;
  height: number;
  values: [number, number][][];
  zeroVisible: boolean;
  fontSize: number;
}

export default function App({
  children,
  formatter,
  width,
  height,
  values,
  fontSize,
  zeroVisible,
  ...props
}: Props & ViewProps) {
  return (
    <GraphContextProvider
      width={width}
      height={height}
      fontSize={fontSize}
      values={values}
      zeroVisible={zeroVisible}
      formatter={formatter}
    >
      <PointerContextProvider>
        <Graph {...props}>{children}</Graph>
      </PointerContextProvider>
    </GraphContextProvider>
  );
}
