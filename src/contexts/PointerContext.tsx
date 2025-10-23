import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';

interface PointerContextType {
  onPointerMove: (x: number) => void;
  onMouseLeave: () => void;
  pointerValue: number | null;
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
  const [pointerValue, setPointerValue] = useState<number | null>(null);

  const onPointerMove = useCallback((x: number) => {
    setPointerValue(x);
  }, []);

  const onMouseLeave = useCallback(() => {
    setPointerValue(null);
  }, []);

  return (
    <PointerContext.Provider
      value={{ pointerValue, onPointerMove, onMouseLeave }}
    >
      {children}
    </PointerContext.Provider>
  );
}
