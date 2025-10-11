import { Circle, G, Line, Rect, Text } from 'react-native-svg';
import type { ViewBox } from '../utils/getViewBox';
import type { Transformer } from '../utils/getTransformer';

interface Props {
  viewBox: ViewBox;
  value: [number, number];
  transformer: Transformer;
  formatter?: (v: number) => string;
}

export default function Pointer({
  viewBox,
  value,
  formatter,
  transformer,
}: Props) {
  const position = transformer(value);
  const valueText = Math.round(value[1]);
  const text = formatter ? formatter(valueText) : valueText.toString();
  const fontSize = 15;

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
      <Rect
        x={position[0] - (fontSize * text.length) / 2}
        y={position[1] + fontSize * 0.75}
        width={fontSize * text.length}
        height={fontSize * 1.5}
        stroke={'white'}
        strokeWidth={1}
        fill={'rgba(0,0,0,0.5)'}
        rx={3}
        ry={3}
      />
      <Text
        x={position[0]}
        y={position[1] + fontSize}
        fill={'white'}
        textAnchor="middle"
        alignmentBaseline="hanging"
        fontFamily="sans"
        fontSize={fontSize}
      >
        {text}
      </Text>
    </G>
  );
}
