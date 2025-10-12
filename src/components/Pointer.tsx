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
  const valueText1 = Math.round(value[1]);
  const text1 = formatter ? formatter(valueText1) : valueText1.toString();
  const valueText2 = Math.round(value[0]);
  const date = new Date(valueText2);
  const text2 =
    date.getHours().toString().padStart(2, '0') +
    ':' +
    date.getMinutes().toString().padStart(2, '0');
  const fontSize = 15;
  const width = fontSize * Math.max(text1.length, text2.length);

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
        x={position[0] - width / 2}
        y={position[1] + fontSize * 0.66}
        width={width}
        height={fontSize * 2.5}
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
        fontWeight="bold"
        fontSize={fontSize}
      >
        {text1}
      </Text>
      <Text
        x={position[0]}
        y={position[1] + fontSize + fontSize}
        fill={'white'}
        textAnchor="middle"
        alignmentBaseline="hanging"
        fontFamily="sans"
        fontSize={fontSize * 0.85}
      >
        {text2}
      </Text>
    </G>
  );
}
