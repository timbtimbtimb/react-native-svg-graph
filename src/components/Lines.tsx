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
} from 'react-native-svg';

export default function Lines({ colors }: { colors: Color[] }) {
  const { masks, lines, gradients } = useGraphContext();
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

  return linesElements;
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
      <Path d={line} stroke={positiveColor} strokeWidth={2} fill="none" />
      <G mask={`url(#positive-mask-${uniqueId})`}>
        <Path
          d={positivePolygon}
          fill={`url(#positive-gradient-${uniqueId})`}
        />
      </G>
      <G mask={`url(#negative-mask-${uniqueId})`}>
        <Path d={line} stroke={negativeColor} strokeWidth={2} fill="none" />
        <Path
          d={negativePolygon}
          fill={`url(#negative-gradient-${uniqueId})`}
        />
      </G>
    </G>
  );
}
