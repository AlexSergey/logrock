import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';

type CodeProps = {
  value: string;
  height?: string;
  width?: string;
};

export default function Code({ value, height = '500px', width = '500px' }: CodeProps) {
  return (
    <Editor
      value={value}
      onValueChange={() => {}}
      highlight={(code) => highlight(code, languages.js ?? {})}
      padding={10}
      style={{
        fontFamily: '"Fira code", "Fira Mono", monospace',
        fontSize: 14,
        marginBottom: '20px',
        height,
        width,
      }}
    />
  );
}
