import {
  createContext,
  useContext,
  useMemo,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';

interface PointerContextType {
  // Horizontal position of the pointer inside the graph, in layout pixels
  // (relative to the SVG). `-1` means the pointer is inactive (not hovering
  // on web, not pressing on native). This is a Reanimated shared value so the
  // pointer overlay can follow the cursor on the UI thread without triggering
  // a React re-render on every move.
  pointerX: SharedValue<number>;
}

export const PointerContext = createContext<undefined | PointerContextType>(
  undefined
);

export function usePointerContext(): PointerContextType {
  const ctx = useContext(PointerContext);

  if (ctx === undefined) {
    throw new Error('usePointerContext must be used with an PointerContext');
  }

  return ctx;
}

export function PointerContextProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const pointerX = useSharedValue(-1);

  const value = useMemo(() => ({ pointerX }), [pointerX]);

  return (
    <PointerContext.Provider value={value}>{children}</PointerContext.Provider>
  );
}
