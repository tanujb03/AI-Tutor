import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { InlineMath, BlockMath } from 'react-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { BookOpen, Sparkles, Terminal, CheckCircle2, Cpu } from 'lucide-react';

export function DesignTokensPreview() {
  const sampleMarkdown = `### Markdown & GFM Test
This preview verifies **bold formatting**, *italics*, and ~strikethrough~ rendering using \`react-markdown\` and \`remark-gfm\`.

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| \`learning_rate\` | \`float\` | \`0.01\` | Step size $\\alpha$ for gradient updates |
| \`batch_size\` | \`int\` | \`32\` | Samples per batch |
`;

  const samplePythonCode = `def gradient_descent(X, y, lr=0.01, epochs=1000):
    """
    CS 4780 Gradient Descent Optimization Loop
    """
    m, n = X.shape
    weights = np.zeros(n)
    
    for epoch in range(epochs):
      predictions = np.dot(X, weights)
      errors = predictions - y
      gradient = (1 / m) * np.dot(X.T, errors)
      weights -= lr * gradient
      
    return weights`;

  return (
    <div className="min-h-screen bg-background text-on-background p-6 font-sans">
      {/* Top Bar Header */}
      <header className="max-w-6xl mx-auto border-b border-outline-variant pb-4 mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center text-on-primary-container font-mono font-bold text-sm">
            ML
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-on-surface">
              CS 4780: Machine Learning Tutor
            </h1>
            <p className="text-xs text-on-surface-variant font-mono uppercase tracking-wider">
              Design System & Pedagogical Toolkit
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium bg-surface-container-high text-primary border border-primary/30">
            <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            Design Tokens Verified
          </span>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-6xl mx-auto space-y-8">
        
        {/* Coverage Strip Demo */}
        <section className="bg-surface-container-low border border-outline-variant rounded-md p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.08em] font-sans">
              Coverage Strip (Slide States)
            </span>
            <span className="text-xs text-outline font-mono">Lecture 01 - Linear Models</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Not Asked State */}
            <div className="border border-outline-variant bg-transparent p-3 rounded text-xs flex items-center justify-between">
              <span className="text-on-surface-variant font-medium">1. Problem Formulation</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-outline text-outline">
                Not Asked
              </span>
            </div>

            {/* Touched State */}
            <div className="border border-primary bg-transparent p-3 rounded text-xs flex items-center justify-between">
              <span className="text-on-surface font-medium">2. Linear Regression MSE</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-primary text-primary">
                Touched
              </span>
            </div>

            {/* Revisited State */}
            <div className="border border-primary-container bg-primary-container/20 p-3 rounded text-xs flex items-center justify-between">
              <span className="text-on-surface font-medium">3. Gradient Optimization</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-primary-container text-on-primary-container font-semibold">
                Revisited
              </span>
            </div>
          </div>
        </section>

        {/* Grid Preview of Libraries & Formatting */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card 1: Color Tokens & Tonal Layers */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-surface-container border border-outline-variant rounded-md p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-outline-variant/50 pb-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold text-on-surface">Tonal Palette Swatches</h2>
              </div>
              <span className="text-xs text-outline font-mono">DESIGN.md Tokens</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-background border border-outline-variant text-on-surface">
                <div className="text-[10px] text-outline">background</div>
                <div>#131313</div>
              </div>
              <div className="p-2.5 rounded bg-surface-container-lowest border border-outline-variant text-on-surface">
                <div className="text-[10px] text-outline font-sans">container-lowest</div>
                <div>#0E0E0E</div>
              </div>
              <div className="p-2.5 rounded bg-surface-container-low border border-outline-variant text-on-surface">
                <div className="text-[10px] text-outline">container-low</div>
                <div>#1C1B1B</div>
              </div>
              <div className="p-2.5 rounded bg-surface-container-high border border-outline-variant text-on-surface">
                <div className="text-[10px] text-outline">container-high</div>
                <div>#2A2A2A</div>
              </div>
              <div className="p-2.5 rounded bg-primary-container text-on-primary-container border border-primary/40 col-span-2 flex justify-between items-center">
                <div>
                  <div className="text-[10px] uppercase font-bold text-on-primary-container">primary-container</div>
                  <div>#008080 (Teal Accent)</div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-on-primary-container" />
              </div>
            </div>
          </motion.div>

          {/* Card 2: LaTeX Math Rendering (react-katex) */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-surface-container border border-outline-variant rounded-md p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-outline-variant/50 pb-2">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-tertiary" />
                <h2 className="text-sm font-semibold text-on-surface">LaTeX Math (react-katex)</h2>
              </div>
              <span className="text-xs text-outline font-mono">KaTeX Engine</span>
            </div>

            <div className="space-y-3 text-sm">
              <p className="text-on-surface-variant text-xs">
                Inline formula: <InlineMath math="E(w) = \frac{1}{2} \sum_{i=1}^N (y_i - w^T x_i)^2" />
              </p>
              
              <div className="bg-surface-container-lowest p-3 rounded border border-outline-variant/60 overflow-x-auto text-primary text-center">
                <BlockMath math="\nabla_w L(w) = \frac{1}{N} X^T (Xw - y) + \lambda w" />
              </div>

              <p className="text-xs text-on-surface-variant">
                Normal equation closed-form vector notation:
              </p>
              <div className="bg-surface-container-lowest p-2.5 rounded border border-outline-variant/60 text-xs font-mono text-center">
                <InlineMath math="w^* = (X^T X)^{-1} X^T y" />
              </div>
            </div>
          </motion.div>

          {/* Card 3: Syntax Highlighting (react-syntax-highlighter) */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-surface-container border border-outline-variant rounded-md p-5 space-y-4 lg:col-span-2"
          >
            <div className="flex items-center justify-between border-b border-outline-variant/50 pb-2">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold text-on-surface">Code Highlighting (react-syntax-highlighter)</h2>
              </div>
              <span className="text-xs text-outline font-mono">JetBrains Mono</span>
            </div>

            <div className="rounded border border-outline-variant/60 overflow-hidden text-xs font-mono">
              <SyntaxHighlighter 
                language="python" 
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  backgroundColor: '#0a0a0a',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '13px',
                  lineHeight: '1.5'
                }}
              >
                {samplePythonCode}
              </SyntaxHighlighter>
            </div>
          </motion.div>

          {/* Card 4: Markdown Rendering (react-markdown + remark-gfm) */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-surface-container border border-outline-variant rounded-md p-5 space-y-4 lg:col-span-2"
          >
            <div className="flex items-center justify-between border-b border-outline-variant/50 pb-2">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold text-on-surface">Markdown & GFM Tables (react-markdown)</h2>
              </div>
              <span className="text-xs text-outline font-mono">remark-gfm</span>
            </div>

            <div className="prose prose-invert max-w-none text-xs text-on-surface-variant space-y-2">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {sampleMarkdown}
              </ReactMarkdown>
            </div>
          </motion.div>
        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto mt-12 pt-4 border-t border-outline-variant text-center text-xs text-outline font-mono">
        CS 4780 AI Tutor &bull; Single Source of Truth: DESIGN.md &bull; React + Vite + Tailwind CSS
      </footer>
    </div>
  );
}

export default DesignTokensPreview;
