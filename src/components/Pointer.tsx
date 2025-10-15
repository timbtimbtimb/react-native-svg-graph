import { Circle, G, Line, Rect, Text } from 'react-native-svg';
import type { ViewBox } from '../utils/getViewBox';
import type { Transformer } from '../utils/getTransformer';

interface Props {
  viewBox: ViewBox;
  values: [number, number][];
  transformer: Transformer;
  formatter?: (v: number) => string;
}

export default function Pointer({
  viewBox,
  values,
  formatter,
  transformer,
}: Props) {
  const positions = values.map(transformer);
  const timestamp = Math.round(values[0]?.[0] ?? 0);
  const date = new Date(timestamp);
  const dateText =
    date.getHours().toString().padStart(2, '0') +
    ':' +
    date.getMinutes().toString().padStart(2, '0');
  const fontSize = 15;
  const width = fontSize * 5;
  const mainPosition = positions.sort((a, b) => b[1] - a[1]).at(0) ?? [0, 0];

  const valuesTextsElements = values
    .sort((a, b) => b[1] - a[1])
    .map((value, i) => {
      const v = Math.round(value[1]);
      const t = formatter ? formatter(v) : v.toString();

      return (
        <Text
          key={i}
          x={mainPosition[0]}
          y={mainPosition[1] + fontSize * (i + 1)}
          fill={'white'}
          textAnchor="middle"
          alignmentBaseline="hanging"
          fontFamily="sans"
          fontWeight="bold"
          fontSize={fontSize}
        >
          {t}
        </Text>
      );
    });

  const circles = positions.map((position) => (
    <Circle fill={'white'} r={3} cx={position[0]} cy={position[1]} />
  ));

  return (
    <G>
      <Line
        x1={mainPosition[0]}
        x2={mainPosition[0]}
        y1={mainPosition[1]}
        y2={viewBox[3] + viewBox[1]}
        stroke={'gray'}
        strokeWidth={1}
        strokeDasharray={3}
      />
      <Line
        x1={viewBox[0]}
        x2={mainPosition[0]}
        y1={mainPosition[1]}
        y2={mainPosition[1]}
        stroke={'gray'}
        strokeWidth={1}
        strokeDasharray={3}
      />
      {circles}
      <Rect
        x={mainPosition[0] - width / 2}
        y={mainPosition[1] + fontSize * 0.66}
        width={width}
        height={fontSize * (values.length + 1.5)}
        stroke={'white'}
        strokeWidth={1}
        fill={'rgba(0,0,0,0.5)'}
        rx={3}
        ry={3}
      />
      {valuesTextsElements}
      <Text
        x={mainPosition[0]}
        y={mainPosition[1] + fontSize * (values.length + 1)}
        fill={'white'}
        textAnchor="middle"
        alignmentBaseline="hanging"
        fontFamily="sans"
        fontSize={fontSize * 0.85}
      >
        {dateText}
      </Text>
    </G>
  );
}
