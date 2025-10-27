import Svg from 'react-native-svg';
import { useGraphContext } from '../contexts/GraphContext';
import {
  PanResponder,
  Platform,
  StyleSheet,
  View,
  type ViewProps,
} from 'react-native';
import { useRef, type ReactNode } from 'react';
import { usePointerContext } from '../contexts/PointerContext';

export default function Container({
  children,
  ...props
}: {
  children: ReactNode;
} & ViewProps) {
  const { viewBox, marginViewBox, setWidth } = useGraphContext();
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
    <View
      {...props}
      onLayout={(event) => {
        setWidth(event.nativeEvent.layout.width);
      }}
    >
      <Svg
        {...(Platform.OS === 'web' ? {} : panResponder.current.panHandlers)}
        preserveAspectRatio="none slice"
        viewBox={marginViewBox.join(' ')}
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
    </View>
  );
}

const styles = StyleSheet.create({
  svg: {
    overflow: 'visible',
    width: 'auto',
    height: 'auto',
  },
});
