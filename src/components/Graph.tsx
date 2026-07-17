import type { ViewProps } from 'react-native';
import Container from './Container';
import { GraphContextProvider, type Formatter } from '../contexts/GraphContext';
import { PointerContextProvider } from '../contexts/PointerContext';
import type { DecimationMethod } from '../utils/decimate';
import type { ReactElement } from 'react';

interface Props {
  children: ReactElement[];
  formatter: Formatter;
  width: number;
  height: number;
  values: [number, number][][];
  zeroVisible: boolean;
  smooth?: boolean;
  fontSize: number;
  // How to simplify dense series before rendering. Defaults to 'minmax'
  // (keeps vertical spikes); 'lttb' preserves smooth shape; 'none' disables it.
  decimation?: DecimationMethod;
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
    >
      <PointerContextProvider>
        <Container {...props}>{children}</Container>
      </PointerContextProvider>
    </GraphContextProvider>
  );
}
