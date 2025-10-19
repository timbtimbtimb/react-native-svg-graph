import YAxis from './YAxis';
import XAxis from './XAxis';
import {
  GraphContextProvider,
  type Color,
  type Formatter,
} from './GraphContext';
import Main from './Main';
import Grids from './Grids';
import Lines from './Lines';
import Pointer from './Pointer';

interface Props {
  formatter: Formatter;
  width: number;
  height: number;
  values: [number, number][][];
  colors: Color[];
  zeroVisible: boolean;
  fontSize: number;
}

export default function Graph({
  formatter,
  width,
  height,
  values,
  colors,
  fontSize,
}: Props) {
  return (
    <GraphContextProvider
      width={width}
      height={height}
      fontSize={fontSize}
      values={values}
      zeroVisible={true}
      colors={colors}
      formatter={formatter}
    >
      <Main>
        <XAxis />
        <YAxis />
        <Grids />
        <Lines />
        <Pointer />
      </Main>
    </GraphContextProvider>
  );
}
