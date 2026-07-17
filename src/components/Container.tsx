import Svg from 'react-native-svg';
import { useGraphContext } from '../contexts/GraphContext';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { useMemo, type ReactNode } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { usePointerContext } from '../contexts/PointerContext';

export default function Container({
  children,
  ...props
}: {
  children: ReactNode;
} & ViewProps) {
  const { viewBox, marginViewBox, setWidth } = useGraphContext();
  const { pointerX } = usePointerContext();

  const gesture = useMemo(() => {
    // Native: track finger drags. `e.x` is view-relative (relative to the SVG),
    // which is the same coordinate space the pointer overlay expects.
    const pan = Gesture.Pan()
      .onBegin((e) => {
        'worklet';
        pointerX.value = e.x;
      })
      .onUpdate((e) => {
        'worklet';
        pointerX.value = e.x;
      })
      .onFinalize(() => {
        'worklet';
        pointerX.value = -1;
      });

    // Web: hover happens without a pressed button, which Pan does not track.
    // Hover maps to mouse enter/move/leave. It is inert on touch devices.
    const hover = Gesture.Hover()
      .onBegin((e) => {
        'worklet';
        pointerX.value = e.x;
      })
      .onUpdate((e) => {
        'worklet';
        pointerX.value = e.x;
      })
      .onEnd(() => {
        'worklet';
        pointerX.value = -1;
      });

    return Gesture.Race(hover, pan);
  }, [pointerX]);

  return (
    <View
      {...props}
      style={{
        ...styles.container,
        ...(props.style ?? {}),
      }}
      onLayout={(event) => {
        setWidth(event.nativeEvent.layout.width);
      }}
    >
      <GestureDetector gesture={gesture}>
        <Svg
          preserveAspectRatio="none slice"
          viewBox={marginViewBox.join(' ')}
          width={viewBox[2]}
          height={viewBox[3]}
          style={styles.svg}
        >
          {children}
        </Svg>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'black',
  },
  svg: {
    overflow: 'visible',
    width: 'auto',
    height: 'auto',
  },
});
