import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { GitHubIcon } from '@/components/Icon';
import { ResizablePanel } from '@/components/ResizablePanel';
import { useDebouncedEffect } from '@/utils/hooks';
import { startValue } from '@/utils/static';
import { parse } from 'ahocon';

export { App };

const App = () => {
  const [value, setValue] = useState(startValue);
  const [deferredValue, setDeferredValue] = useState('');

  useDebouncedEffect(
    () => {
      try {
        setDeferredValue(JSON.stringify(parse(value), null, 2));
      } catch ({ message }) {
        setDeferredValue(`parsing error: ${message}`);
      }
    },
    [value],
    750
  );

  return (
    <div className="flex flex-col w-100% h-100%">
      <nav className="flex justify-between p-2">
        <div>
          <b>Ahocon Playground</b>
        </div>

        <div className="flex items-center">
          <div className="pr-4 color-gray">{`v${__APP_VERSION__}`}</div>

          <div className="w-20px h-20px">
            <a
              target="_blank"
              href="https://github.com/steve-py96/ahocon"
              rel="noopener noreferrer"
              className="color-black"
            >
              <GitHubIcon className="cursor-pointer w-100% h-100%" />
            </a>
          </div>
        </div>
      </nav>

      <div className="flex w-100% h-100% flex-1">
        <ResizablePanel
          small={
            <Editor
              value={deferredValue}
              width="100%"
              height="100%"
              theme="vs-dark"
              options={{
                minimap: {
                  enabled: false,
                },
                readOnly: true,
                scrollBeyondLastLine: false,
              }}
            />
          }
        >
          <Editor
            value={value}
            onChange={(val) => setValue(val || '')}
            width="100%"
            height="100%"
            theme="vs-dark"
            options={{
              minimap: {
                enabled: false,
              },
              scrollBeyondLastLine: false,
            }}
          />
        </ResizablePanel>
      </div>
    </div>
  );
};
