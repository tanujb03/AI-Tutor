import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { InlineMath, BlockMath } from 'react-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

/**
 * Pre-processes text to render KaTeX math expressions embedded in markdown.
 * Splits text into markdown segments and inline/block KaTeX math components.
 */
export function MathMarkdown({ content, isStreaming }) {
  if (!content) return null;



  const mathStore = [];

  // 1. Extract BLOCK MATH $$...$$ FIRST so $$ is never confused with inline math $...$
  const blockRegex = /\$\$([\s\S]+?)\$\$/g;
  let tokenizedContent = content.replace(blockRegex, (match, mathExpr) => {
    const token = `MATHBLOCKTOKEN${mathStore.length}END`;
    mathStore.push({ type: 'block', value: mathExpr.trim() });
    return token;
  });

  // 2. Extract INLINE MATH $...$ SECOND (allowing math expressions with or without newlines)
  const inlineRegex = /\$([^\$]+?)\$/g;
  tokenizedContent = tokenizedContent.replace(inlineRegex, (match, mathExpr) => {
    const token = `MATHINLINETOKEN${mathStore.length}END`;
    mathStore.push({ type: 'inline', value: mathExpr.trim() });
    return token;
  });

  // Helper to replace MATHBLOCKTOKEN... and MATHINLINETOKEN... placeholders back with KaTeX components
  const renderMathTokens = (node) => {
    if (typeof node === 'string') {
      const tokenRegex = /MATH(BLOCK|INLINE)TOKEN(\d+)END/g;
      const elements = [];
      let last = 0;
      let m;

      while ((m = tokenRegex.exec(node)) !== null) {
        if (m.index > last) {
          elements.push(node.substring(last, m.index));
        }
        const isBlock = m[1] === 'BLOCK';
        const index = parseInt(m[2], 10);
        const item = mathStore[index];

        if (item) {
          if (isBlock) {
            elements.push(
              <div key={`blockMath-${m.index}`} className="my-3 p-3 bg-surface-container-lowest border border-outline-variant/40 rounded text-center overflow-x-auto text-primary">
                <BlockMath math={item.value} errorColor="#ff6b6b" />
              </div>
            );
          } else {
            elements.push(
              <span key={`inlineMath-${m.index}`} className="inline-block px-0.5 text-primary font-sans">
                <InlineMath math={item.value} />
              </span>
            );
          }
        }
        last = tokenRegex.lastIndex;
      }

      const tail = node.substring(last);
      if (tail) elements.push(tail);

      return elements.length > 0 ? elements : node;
    }

    if (Array.isArray(node)) {
      return node.map((item, idx) => (
        <React.Fragment key={idx}>{renderMathTokens(item)}</React.Fragment>
      ));
    }

    if (React.isValidElement(node) && node.props && node.props.children) {
      return React.cloneElement(
        node,
        node.props,
        renderMathTokens(node.props.children)
      );
    }

    return node;
  };

  return (
    <div className="space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom inline code & block syntax highlighting
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');

            if (!inline && match) {
              return (
                <div className="my-3 rounded border border-outline-variant/60 overflow-hidden text-xs font-mono">
                  <div className="bg-surface-container-high px-3 py-1 text-[10px] font-mono text-on-surface-variant border-b border-outline-variant/40 flex justify-between items-center">
                    <span>{match[1]}</span>
                    <span>code</span>
                  </div>
                  <SyntaxHighlighter
                    language={match[1]}
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      padding: '0.85rem 1rem',
                      backgroundColor: '#0a0a0a',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '13px',
                      lineHeight: '1.5'
                    }}
                    {...props}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              );
            } else if (!inline) {
              return (
                <div className="my-3 rounded border border-outline-variant/60 overflow-hidden text-xs font-mono">
                  <SyntaxHighlighter
                    language="python"
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      padding: '0.85rem 1rem',
                      backgroundColor: '#0a0a0a',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '13px',
                      lineHeight: '1.5'
                    }}
                    {...props}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              );
            }

            return (
              <code className="bg-surface-container-high text-primary px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                {renderMathTokens(children)}
              </code>
            );
          },

          p({ children }) {
            return (
              <div className="text-on-surface text-sm leading-relaxed mb-3">
                {renderMathTokens(children)}
              </div>
            );
          },

          // Table styling according to DESIGN.md
          table({ children }) {
            return (
              <div className="my-4 overflow-x-auto rounded border border-outline-variant/60">
                <table className="w-full text-xs text-left text-on-surface border-collapse">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-surface-container-high text-on-surface uppercase font-mono text-[11px] border-b border-outline-variant/60">{children}</thead>;
          },
          th({ children }) {
            return <th className="px-3 py-2 border-r border-outline-variant/40 last:border-r-0 font-semibold">{renderMathTokens(children)}</th>;
          },
          td({ children }) {
            return (
              <td className="px-3 py-2 border-t border-outline-variant/30 border-r border-outline-variant/30 last:border-r-0">
                {renderMathTokens(children)}
              </td>
            );
          },
          // Headings styling
          h1({ children }) { return <h1 className="text-lg font-semibold text-on-surface mb-2 mt-4">{renderMathTokens(children)}</h1>; },
          h2({ children }) { return <h2 className="text-base font-semibold text-on-surface mb-2 mt-3">{renderMathTokens(children)}</h2>; },
          h3({ children }) { return <h3 className="text-sm font-semibold text-on-surface mb-1 mt-2">{renderMathTokens(children)}</h3>; },
          ul({ children }) { return <ul className="list-disc list-inside space-y-1 mb-3 text-sm text-on-surface">{children}</ul>; },
          ol({ children }) { return <ol className="list-decimal list-inside space-y-1 mb-3 text-sm text-on-surface">{children}</ol>; },
          li({ children }) { return <li className="text-sm text-on-surface leading-relaxed">{renderMathTokens(children)}</li>; },
        }}
      >
        {tokenizedContent}
      </ReactMarkdown>
    </div>
  );
}

export default MathMarkdown;
