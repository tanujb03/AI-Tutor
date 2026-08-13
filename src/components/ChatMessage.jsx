import React from 'react';
import { motion } from 'framer-motion';
import MathMarkdown from './MarkdownRenderer';
import { AlertTriangle, RefreshCw, Bookmark } from 'lucide-react';

/**
 * Format lecture name string (e.g. "Week 2 — Gradient Descent and Backpropagation" -> "Week 2 · Slide 9")
 */
function formatCitationLabel(citation, index) {
  let weekText = `[${index + 1}]`;
  let lectureName = citation.lecture || '';

  // Extract "Week X" if present
  const match = lectureName.match(/(Week\s*\d+)/i);
  const weekLabel = match ? match[1] : lectureName;
  const slideNum = citation.slide ?? citation.slide_number ?? citation.slideNumber;

  return {
    num: index + 1,
    label: `${weekLabel} · Slide ${slideNum}`,
  };
}

export function ChatMessage({ message, isStreaming, onRetry, onCitationClick }) {
  const isUser = message.role === 'user' || message.sender === 'user';
  const isAssistant = !isUser;
  const isErrorMidstream = message.error && message.content && message.content.length > 0;
  const isErrorBeforeToken = message.error && (!message.content || message.content.length === 0);

  // If this is a before-token failure, render compact inline error card
  if (isErrorBeforeToken) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="my-3 p-3.5 bg-error-container/20 border border-error/40 rounded-md text-xs text-on-error-container flex items-center justify-between max-w-xl"
      >
        <div className="flex items-center space-x-2.5">
          <AlertTriangle className="w-4 h-4 text-error shrink-0" />
          <div>
            <div className="font-semibold text-error">Connection Failed</div>
            <div className="text-on-surface-variant text-[11px]">
              {message.error || 'Could not connect to tutor server before receiving data.'}
            </div>
          </div>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center space-x-1.5 px-3 py-1 bg-surface-container-high border border-outline hover:border-primary text-primary text-xs font-mono rounded transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        )}
      </motion.div>
    );
  }

  // User Message (Right-aligned bubble)
  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end my-3"
      >
        <div className="bg-surface-container-high text-on-surface px-4 py-2.5 rounded-lg max-w-xl text-sm leading-relaxed border border-outline-variant/40 shadow-sm">
          {message.content}
        </div>
      </motion.div>
    );
  }

  // Assistant Message (Left-aligned flowing document text - NOT bubble-wrapped)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="my-6 max-w-3xl space-y-3"
    >
      {/* Header Label */}
      <div className="flex items-center space-x-2 text-xs text-on-surface-variant font-mono uppercase tracking-wider mb-1">
        <span className="w-2 h-2 rounded-full bg-primary" />
        <span className="font-semibold text-primary">CS 4780 Tutor</span>
      </div>

      {/* Document Content */}
      <div className="relative text-on-surface">
        <MathMarkdown content={message.content} isStreaming={isStreaming} />
        
        {/* Blinking Cursor during streaming */}
        {isStreaming && (
          <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse align-middle" />
        )}
      </div>

      {/* Citations Row (if available) */}
      {Array.isArray(message.citations) && message.citations.length > 0 && (
        <div className="pt-2 border-t border-outline-variant/30 flex flex-wrap items-center gap-2 mt-3">
          <span className="text-[10px] font-mono text-outline uppercase tracking-wider flex items-center gap-1 mr-1">
            <Bookmark className="w-3 h-3 text-primary" />
            Citations:
          </span>
          {message.citations.map((citation, idx) => {
            const formatted = formatCitationLabel(citation, idx);
            return (
              <button
                key={idx}
                onClick={() => onCitationClick && onCitationClick(citation)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/60 hover:border-primary text-primary text-xs font-mono rounded transition-colors"
                title={`Jump to ${citation.lecture} - Slide ${citation.slide}`}
              >
                <span className="font-bold text-primary">[{formatted.num}]</span>
                <span className="text-on-surface-variant">{formatted.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Midstream Connection Error inline notice with retry */}
      {isErrorMidstream && (
        <div className="mt-3 p-3 bg-error-container/10 border border-error/30 rounded text-xs text-on-error-container flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-error shrink-0" />
            <span>
              <strong className="text-error font-medium">Connection lost mid-stream.</strong> Partial answer shown above.
            </span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-surface-container border border-error/50 hover:border-error text-error text-xs font-mono rounded transition-colors ml-3 shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default ChatMessage;
