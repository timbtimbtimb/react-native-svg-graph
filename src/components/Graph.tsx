import type { ViewProps } from 'react-native';
import Container from './Container';
import { GraphContextProvider, type Formatter } from '../contexts/GraphContext';
import { PointerContextProvider } from '../contexts/PointerContext';
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

export default function Graph({
  children,
  formatter,
  width,
  height,
  values,
  fontSize,
  zeroVisible,
  ...props
}: Props & ViewProps): ReactElement {
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
        <Container {...props}>{children}</Container>
      </PointerContextProvider>
    </GraphContextProvider>
  );
}
