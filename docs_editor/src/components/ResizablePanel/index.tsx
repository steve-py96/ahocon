import type { FC, ReactNode } from 'react';
import { useEffect, useCallback, useState } from 'react';
import { useMouseEvents } from '../../utils/hooks';

export { ResizablePanel };

const ResizablePanel: FC<{ small: ReactNode }> = ({ small, children }) => {
  const [titleHeight, setTitleHeight] = useState(0);
  const [{ width, height }, { down, drag, up }] = useMouseEvents();
  const titleRef = useCallback<(el: HTMLDivElement) => void>(
    (element) => setTitleHeight(element?.getBoundingClientRect().height || 0),
    []
  );

  useEffect(() => {
    window.addEventListener('mousedown', down);
    window.addEventListener('mousemove', drag);
    window.addEventListener('mouseup', up);
    window.addEventListener('mouseleave', up);

    return () => {
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mousemove', drag);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('mouseleave', up);
    };
  }, [down, drag, up]);

  return (
    <div className="w-100% h-100%">
      {children}

      <div
        className="absolute bottom-0 right-0 min-w-200px min-h-200px bg-white b-1 p-1 max-h-75vh z-666"
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: `${height}px`,
        }}
      >
        <div className="flex align-center cursor-nwse-resize pb-1" ref={titleRef}>
          output
        </div>

        <div
          className="w-100% h-100%"
          style={
            titleHeight === 0
              ? undefined
              : {
                  height: `calc(100% - ${titleHeight}px)`,
                }
          }
        >
          {small}
        </div>
      </div>
    </div>
  );
};
