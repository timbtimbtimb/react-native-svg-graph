import { Circle, G, Line, Rect, Text } from 'react-native-svg';
import { useGraphContext } from './GraphContext';
import { useMemo } from 'react';

export default function Pointer() {
  const { fontSize, pointer } = useGraphContext();

  const textsElements = useMemo(() => {
    return pointer.texts.map(({ t, x, y }, i) => {
      return (
        <Text
          key={i}
          x={x}
          y={y}
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
  }, [fontSize, pointer]);

  const circlesElements = useMemo(() => {
    return pointer.circles.map(({ cx, cy }, i) => (
      <Circle key={[i, cx, cy].join()} fill={'white'} r={3} cx={cx} cy={cy} />
    ));
  }, [pointer]);

  if (pointer.circles.length === 0) return;

  return (
    <G>
      <Line
        x1={pointer.horizontalLine.x1}
        x2={pointer.horizontalLine.x2}
        y1={pointer.horizontalLine.y1}
        y2={pointer.horizontalLine.y2}
        stroke={'gray'}
        strokeWidth={1}
        strokeDasharray={3}
      />
      <Line
        x1={pointer.verticalLine.x1}
        x2={pointer.verticalLine.x2}
        y1={pointer.verticalLine.y1}
        y2={pointer.verticalLine.y2}
        stroke={'gray'}
        strokeWidth={1}
        strokeDasharray={3}
      />
      {circlesElements}
      <Rect
        x={pointer.rect.x}
        y={pointer.rect.y}
        width={pointer.rect.width}
        height={pointer.rect.height}
        stroke={'white'}
        strokeWidth={1}
        fill={'rgba(0,0,0,0.5)'}
        rx={3}
        ry={3}
      />
      {textsElements}
      <Text
        x={pointer.dateText.x}
        y={pointer.dateText.y}
        fill={'white'}
        textAnchor="middle"
        alignmentBaseline="hanging"
        fontFamily="sans"
        fontSize={fontSize * 0.85}
      >
        {pointer.dateText.t}
      </Text>
    </G>
  );
}
