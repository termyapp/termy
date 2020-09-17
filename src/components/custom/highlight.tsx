import React from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

const Highlight: React.FC<{ language?: string }> = ({ children, language }) => {
  return (
    <SyntaxHighlighter
      language={language}
      style={vscDarkPlus}
      customStyle={{
        margin: 0,
        marginLeft: 4,
        borderRadius: 5,
        flex: 1,
      }}
    >
      {children}
    </SyntaxHighlighter>
  )
}

export default Highlight
