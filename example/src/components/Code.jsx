import React from 'react';
import Editor from 'react-simple-code-editor';
import {highlight, languages} from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';

const Code = props => {
    let height = props.height || '500px';
    let width = props.width || '500px';
    return (
        <Editor
            value={props.value}
            onValueChange={code => {}}
            highlight={code => highlight(code, languages.js)}
            height={height}
            width={width}
            padding={10}
            style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 14,
                marginBottom: '20px'
            }}
        />
    );
};

export default Code;
