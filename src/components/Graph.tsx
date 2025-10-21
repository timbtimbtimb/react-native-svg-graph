import Svg from 'react-native-svg';
import { useGraphContext } from '../contexts/GraphContext';
import { PanResponder, Platform, StyleSheet } from 'react-native';
import { useRef, type ReactNode } from 'react';
import { usePointerContext } from '../contexts/PointerContext';

export default function Graph({ children }: { children: ReactNode }) {
  const { viewBox, marginViewBox, svgRef } = useGraphContext();
  const { onPointerMove, onMouseLeave } = usePointerContext();

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => true,
      onShouldBlockNativeResponder: () => true,
      onPanResponderMove: (_, { moveX }) => {
        onPointerMove(moveX);
      },
      onPanResponderRelease: () => {
        onMouseLeave();
      },
    })
  );

  return (
    <Svg
      {...(Platform.OS === 'web' ? {} : panResponder.current.panHandlers)}
      preserveAspectRatio="none slice"
      viewBox={marginViewBox.join(' ')}
      ref={svgRef}
      width={viewBox[2]}
      height={viewBox[3]}
      style={styles.svg}
      onMouseLeave={Platform.OS === 'web' ? onMouseLeave : undefined}
      onPointerMove={
        Platform.OS === 'web'
          ? (event) => onPointerMove(event.nativeEvent.offsetX)
          : undefined
      }
    >
      {children}
    </Svg>
  );
}

const styles = StyleSheet.create({
  svg: {
    overflow: 'visible',
    width: 'auto',
    height: 'auto',
  },
});
