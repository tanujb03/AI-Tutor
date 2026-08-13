import React, { useState } from 'react';
import { Send, Square, Play, Sparkles, Bookmark } from 'lucide-react';
import { listScenarios } from '../data/mock-stream.mjs';

export function ChatInput({ onSendMessage, isStreaming, onStop, selectedScenario, setSelectedScenario, savedCount, onOpenSavedDeck }) {
  const [promptText, setPromptText] = useState('');
  const scenarios = listScenarios();

  const handleScenarioChange = (e) => {
    const newScenarioId = e.target.value;
    setSelectedScenario(newScenarioId);
    
    // Auto populate prompt text matching scenario prompt for quick testing
    const found = scenarios.find((s) => s.id === newScenarioId);
    if (found) {
      setPromptText(found.prompt);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!promptText.trim() || isStreaming) return;
    onSendMessage(promptText.trim());
    setPromptText('');
  };

  return (
    <div className="sticky bottom-0 bg-background/95 backdrop-blur-md pt-3 pb-6 border-t border-outline-variant/40">
      <div className="max-w-3xl mx-auto space-y-2">
        {/* Top bar controls: Scenario Selector Dropdown & Saved Deck Tab Button */}
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center space-x-2">
            <span className="text-on-surface-variant font-mono uppercase text-[10px] tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-primary" />
              Scenario:
            </span>
            <select
              value={selectedScenario}
              onChange={handleScenarioChange}
              disabled={isStreaming}
              className="bg-surface-container-high text-on-surface border border-outline-variant/60 rounded px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-primary disabled:opacity-50"
            >
              {scenarios.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.id} — "{sc.prompt.substring(0, 30)}..."
                </option>
              ))}
            </select>
          </div>

          {/* Saved Deck Trigger Tab Button */}
          <button
            type="button"
            onClick={onOpenSavedDeck}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/60 hover:border-primary rounded text-xs font-mono transition-colors"
            title="Open Saved Study Deck"
          >
            <Bookmark className="w-3 h-3 text-primary fill-primary/30" />
            <span>Saved Deck</span>
            <span className="px-1.5 py-0.2 bg-primary-container text-on-primary-container text-[10px] font-bold rounded-full">
              {savedCount || 0}
            </span>
          </button>
        </div>

        {/* Form Input Box */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center bg-surface-container-low border border-outline-variant focus-within:border-primary rounded-md p-1.5 transition-colors shadow-lg"
        >
          <input
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Ask a question about CS 4780 Machine Learning..."
            disabled={isStreaming}
            className="flex-1 bg-transparent text-on-surface placeholder-on-surface-variant/60 text-sm px-3 py-2 focus:outline-none disabled:opacity-50 font-sans"
          />

          {/* Action Button: Show Stop while streaming, otherwise Send */}
          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              className="inline-flex items-center space-x-1.5 bg-error text-on-error px-3 py-2 rounded text-xs font-semibold hover:bg-error/90 transition-colors shrink-0"
              title="Stop streaming response"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!promptText.trim()}
              className="inline-flex items-center space-x-1.5 bg-primary-container text-on-primary-container px-3.5 py-2 rounded text-xs font-semibold hover:bg-primary-container/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 font-mono"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default ChatInput;
