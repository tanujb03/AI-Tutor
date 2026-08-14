import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Sparkles, Bookmark, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { listScenarios } from '../data/mock-stream.mjs';

export function ChatInput({ onSendMessage, isStreaming, onStop, selectedScenario, setSelectedScenario, savedCount, onOpenSavedDeck }) {
  const scenarios = listScenarios();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [promptText, setPromptText] = useState(() => {
    const found = scenarios.find((s) => s.id === selectedScenario);
    return found ? found.prompt : '';
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectScenario = (scId) => {
    setSelectedScenario(scId);
    setIsOpen(false);
    const found = scenarios.find((s) => s.id === scId);
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

  const activeScenarioObj = scenarios.find((s) => s.id === selectedScenario) || scenarios[0];

  return (
    <div className="sticky bottom-0 bg-background/95 backdrop-blur-md pt-2 pb-4 sm:pb-6 border-t border-outline-variant/40">
      <div className="max-w-3xl mx-auto space-y-2 px-2 sm:px-4">
        {/* Top bar controls: Custom Scrollable Scenario Selector Dropdown & Saved Deck Tab Button */}
        <div className="flex items-center justify-between text-xs gap-2">
          {/* Custom Popover Dropdown Container */}
          <div className="relative flex items-center min-w-0" ref={dropdownRef}>
            <span className="text-on-surface-variant font-mono uppercase text-[10px] tracking-wider flex items-center gap-1 mr-1.5 shrink-0">
              <Sparkles className="w-3 h-3 text-primary" />
              Scenario:
            </span>

            {/* Custom Dropdown Trigger Button */}
            <button
              type="button"
              onClick={() => !isStreaming && setIsOpen((prev) => !prev)}
              disabled={isStreaming}
              className="inline-flex items-center space-x-1.5 bg-surface-container-high text-on-surface border border-outline-variant/60 hover:border-primary rounded px-2.5 py-1 text-xs font-mono disabled:opacity-50 transition-colors truncate max-w-[160px] xs:max-w-[210px] sm:max-w-[320px]"
              title="Click to select stream scenario"
            >
              <span className="truncate font-semibold text-primary">{activeScenarioObj.id}</span>
              <span className="text-outline hidden xs:inline">&bull;</span>
              <span className="truncate text-on-surface-variant text-[11px] hidden xs:inline">"{activeScenarioObj.prompt}"</span>
              {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-outline shrink-0 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 text-outline shrink-0 ml-auto" />}
            </button>

            {/* Custom Scrollable Options Popover Menu (Appears above input) */}
            {isOpen && (
              <div className="absolute bottom-full left-0 mb-1.5 w-72 xs:w-80 sm:w-96 max-h-56 overflow-y-auto bg-surface-container-high border border-outline-variant/80 rounded-lg shadow-2xl p-1 z-50 space-y-1 divide-y divide-outline-variant/20 scrollbar-thin">
                {scenarios.map((sc) => {
                  const isSelected = sc.id === selectedScenario;
                  return (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => handleSelectScenario(sc.id)}
                      className={`w-full text-left px-3 py-2 rounded text-xs font-mono transition-colors flex items-start justify-between gap-2 ${
                        isSelected
                          ? 'bg-primary-container text-on-primary-container font-semibold'
                          : 'text-on-surface hover:bg-surface-container-highest'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5">
                          <span className={isSelected ? 'text-on-primary-container font-bold' : 'text-primary font-bold'}>
                            {sc.id}
                          </span>
                        </div>
                        <p className={`text-[11px] leading-snug line-clamp-2 mt-0.5 ${isSelected ? 'text-on-primary-container/90' : 'text-on-surface-variant'}`}>
                          "{sc.prompt}"
                        </p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-on-primary-container shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Saved Deck Trigger Tab Button (Guaranteed Visible on Mobile) */}
          <button
            type="button"
            onClick={onOpenSavedDeck}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/60 hover:border-primary rounded text-xs font-mono transition-colors shrink-0"
            title="Open Saved Study Deck"
          >
            <Bookmark className="w-3 h-3 text-primary fill-primary/30 shrink-0" />
            <span className="hidden xs:inline">Saved Deck</span>
            <span className="xs:hidden">Saved</span>
            <span className="px-1.5 py-0.2 bg-primary-container text-on-primary-container text-[10px] font-bold rounded">
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
