import { useId, useMemo } from 'react';
import { useGraphContext, type Color } from '../contexts/GraphContext';
import {
  G,
  Path,
  Polygon,
  Mask,
  Defs,
  LinearGradient,
  Stop,
  ClipPath,
  Rect,
} from 'react-native-svg';

export default function Lines({ colors }: { colors: Color[] }) {
  const { masks, lines, gradients, clipped, viewBox } = useGraphContext();
  const uniqueId = useId();

  const linesElements = useMemo(
    () =>
      colors.map((_, i) => {
        return (
          <Line
            key={i + uniqueId}
            uniqueId={uniqueId}
            positiveColor={colors[i]?.positiveColor}
            negativeColor={colors[i]?.negativeColor}
            positiveMask={masks.positiveMask}
            negativeMask={masks.negativeMask}
            positivePolygon={gradients[i]?.positivePolygon}
            negativePolygon={gradients[i]?.negativePolygon}
            line={lines[i]}
          />
        );
      }),
    [colors, gradients, lines, masks, uniqueId]
  );

  if (!clipped) return linesElements;

  // A fixed `yDomain` leaves values outside the plot: they are cut at its edges
  // rather than drawn over the axes' margins.
  return (
    <G>
      <Defs>
        <ClipPath id={`clip-${uniqueId}`}>
          <Rect
            x={viewBox[0]}
            y={viewBox[1]}
            width={viewBox[2]}
            height={viewBox[3]}
          />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#clip-${uniqueId})`}>{linesElements}</G>
    </G>
  );
}

function Line({
  uniqueId,
  positiveColor,
  negativeColor,
  positiveMask,
  negativeMask,
  positivePolygon,
  negativePolygon,
  line,
}: {
  uniqueId: string;
  positiveColor?: Color['positiveColor'];
  negativeColor?: Color['positiveColor'];
  positiveMask: string;
  negativeMask: string;
  positivePolygon?: string;
  negativePolygon?: string;
  line?: string;
}) {
  return (
    <G>
      <Defs>
        <LinearGradient
          id={`positive-gradient-${uniqueId}`}
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <Stop offset="0" stopColor={positiveColor} stopOpacity={0.2} />
          <Stop offset="1" stopColor={positiveColor} stopOpacity={0.05} />
        </LinearGradient>
        <LinearGradient
          id={`negative-gradient-${uniqueId}`}
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <Stop offset="0" stopColor={negativeColor} stopOpacity={0.2} />
          <Stop offset="1" stopColor={negativeColor} stopOpacity={0.05} />
        </LinearGradient>
      </Defs>
      <Mask id={`negative-mask-${uniqueId}`}>
        <Polygon points={negativeMask} fill={'white'} />
      </Mask>
      <Mask id={`positive-mask-${uniqueId}`}>
        <Polygon points={positiveMask} fill={'white'} />
      </Mask>
      <Path d={line} stroke={positiveColor} strokeWidth={3} fill="none" />
      <G mask={`url(#positive-mask-${uniqueId})`}>
        <Path
          d={positivePolygon}
          fill={`url(#positive-gradient-${uniqueId})`}
        />
      </G>
      <G mask={`url(#negative-mask-${uniqueId})`}>
        <Path d={line} stroke={negativeColor} strokeWidth={3} fill="none" />
        <Path
          d={negativePolygon}
          fill={`url(#negative-gradient-${uniqueId})`}
        />
      </G>
    </G>
  );
}
