import { Circle, G, Line, Rect, Text } from 'react-native-svg';
import { useGraphContext } from '../contexts/GraphContext';
import { useMemo } from 'react';
import { usePointerContext } from '../contexts/PointerContext';

export default function Pointer() {
  const { fontSize } = useGraphContext();
  const {
    pointer: { texts, circles, horizontalLine, verticalLine, rect, dateText },
  } = usePointerContext();

  const textsElements = useMemo(() => {
    return texts.map(({ t, x, y }, i) => {
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
  }, [fontSize, texts]);

  const circlesElements = useMemo(() => {
    return circles.map(({ cx, cy }, i) => (
      <Circle key={[i, cx, cy].join()} fill={'white'} r={3} cx={cx} cy={cy} />
    ));
  }, [circles]);

  if (circles.length === 0) return;

  return (
    <G>
      <Line
        x1={horizontalLine.x1}
        x2={horizontalLine.x2}
        y1={horizontalLine.y1}
        y2={horizontalLine.y2}
        stroke={'gray'}
        strokeWidth={1}
        strokeDasharray={3}
      />
      <Line
        x1={verticalLine.x1}
        x2={verticalLine.x2}
        y1={verticalLine.y1}
        y2={verticalLine.y2}
        stroke={'gray'}
        strokeWidth={1}
        strokeDasharray={3}
      />
      {circlesElements}
      <Rect
        x={rect.x}
        y={rect.y}
        width={rect.width}
        height={rect.height}
        stroke={'white'}
        strokeWidth={1}
        fill={'rgba(0,0,0,0.5)'}
        rx={3}
        ry={3}
      />
      {textsElements}
      <Text
        x={dateText.x}
        y={dateText.y}
        fill={'white'}
        textAnchor="middle"
        alignmentBaseline="hanging"
        fontFamily="sans"
        fontSize={fontSize * 0.85}
      >
        {dateText.t}
      </Text>
    </G>
  );
}
