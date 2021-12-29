import { useEffect, useReducer } from 'react';

export { useDebouncedEffect, useMouseEvents, useSimpleState };

const useDebouncedEffect = (fn: () => void, deps: Array<unknown>, time: number) =>
  useEffect(() => {
    const timeoutRef = setTimeout(fn, time);

    return () => clearTimeout(timeoutRef);
  }, [...deps, fn, time]);

function createReducer<T>() {
  return function (state: T, action: Partial<T> | ((old: T) => Partial<T>)): T {
    return {
      ...state,
      ...(typeof action === 'function' ? action(state) : action),
    };
  };
}

function useSimpleState<T>(initialState: T) {
  return useReducer(createReducer<T>(), initialState);
}

const useMouseEvents = (initState?: {
  width: string | number;
  height: number;
}): [
  state: { width: string | number; height: number; offsetX: number; offsetY: number },
  listeners: { down: MouseEventHandler; drag: MouseEventHandler; up: MouseEventHandler }
] => {
  const [state, setState] = useSimpleState({
    ...(initState || { width: '90vw', height: 200 }),
    dragging: false,
    offsetX: 0,
    offsetY: 0,
  });

  return [
    state,
    {
      down: (evt) => {
        if ((evt.target as HTMLElement)?.closest('.cursor-nwse-resize') === null) return;

        evt.preventDefault();
        setState({
          dragging: true,
          offsetX: evt.offsetX,
          offsetY: evt.offsetY,
        });
      },
      drag: (evt) => {
        if (!state.dragging) return;

        let width = window.innerWidth + state.offsetX - evt.clientX;

        if (width > window.innerWidth) width = window.innerWidth;

        setState({
          width,
          height: window.innerHeight + state.offsetY - evt.clientY,
        });
      },
      up: (evt) => {
        evt.preventDefault();
        setState({ dragging: false, offsetX: 0, offsetY: 0 });
      },
    },
  ];
};
