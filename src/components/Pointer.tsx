import { Circle, G, Line } from 'react-native-svg';
import type { ViewBox } from '../utils/getViewBox';

interface Props {
  viewBox: ViewBox;
  position: [number, number];
}

export default function Pointer({ viewBox, position }: Props) {
  return (
    <G>
      <Line
        x1={position[0]}
        x2={position[0]}
        y1={position[1]}
        y2={viewBox[3] + viewBox[1]}
        stroke={'gray'}
        strokeWidth={1}
        strokeDasharray={3}
      />
      <Line
        x1={viewBox[0]}
        x2={position[0]}
        y1={position[1]}
        y2={position[1]}
        stroke={'gray'}
        strokeWidth={1}
        strokeDasharray={3}
      />
      <Circle fill={'white'} r={3} cx={position[0]} cy={position[1]} />
    </G>
  );
}
