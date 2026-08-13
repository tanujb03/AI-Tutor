import React, { useState, useRef, useEffect } from 'react';
import initialConversation from '../data/conversation.json';
import { getScenario, listScenarios } from '../data/mock-stream.mjs';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { BookOpen, RefreshCw, MessageSquare } from 'lucide-react';

export function ChatInterface({ onCitationClick }) {
  const [messages, setMessages] = useState(initialConversation.messages || []);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('plain');
  
  const abortControllerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom as messages change or stream
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // Handler for Stop button
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  // Keyword matching helper if user types instead of picking from dropdown
  const resolveScenarioId = (userText) => {
    const textLower = userText.toLowerCase();
    if (textLower.includes('code') || textLower.includes('python')) return 'code';
    if (textLower.includes('math') || textLower.includes('sigmoid') || textLower.includes('derivative')) return 'math';
    if (textLower.includes('table') || textLower.includes('regularization')) return 'table';
    if (textLower.includes('long') || textLower.includes('backprop')) return 'long';
    if (textLower.includes('exam') || textLower.includes('grade')) return 'refusal';
    if (textLower.includes('error') || textLower.includes('midstream') || textLower.includes('fail')) return 'error-midstream';
    if (textLower.includes('before') || textLower.includes('token') || textLower.includes('disconnect')) return 'fails-before-token';
    return selectedScenario;
  };

  const handleSendMessage = async (promptText) => {
    const targetScenarioId = resolveScenarioId(promptText);

    // 1. Append user prompt message
    const userMsg = {
      id: `usr-${Date.now()}`,
      role: 'user',
      sender: 'user',
      content: promptText,
    };

    setMessages((prev) => [...prev, userMsg]);

    // 2. Prepare AbortController & assistant response placeholder
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsStreaming(true);

    const assistantMsgId = `ast-${Date.now()}`;
    let accumulatedText = '';
    let errorMessage = null;
    let scenarioCitations = [];

    try {
      const scenarioMeta = getScenario(targetScenarioId);
      scenarioCitations = scenarioMeta.citations || [];
    } catch (e) {
      scenarioCitations = [];
    }

    try {
      // Stream generator execution
      const streamGenerator = getScenario(targetScenarioId) ? targetScenarioId : 'plain';
      
      for await (const chunk of streamResponse(streamGenerator, { signal: controller.signal })) {
        accumulatedText += chunk;

        // Append chunk to growing assistant message bubble in real time
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === assistantMsgId);
          const updatedAssistantMsg = {
            id: assistantMsgId,
            role: 'assistant',
            sender: 'tutor',
            content: accumulatedText,
            citations: scenarioCitations,
          };

          if (exists) {
            return prev.map((m) => (m.id === assistantMsgId ? updatedAssistantMsg : m));
          } else {
            return [...prev, updatedAssistantMsg];
          }
        });
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        errorMessage = err.message || 'Connection to tutor lost.';
      }
    } finally {
      setIsStreaming(false);

      // Handle failure modes if error occurred
      if (errorMessage) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === assistantMsgId);
          if (exists) {
            // Failure Mode A: error-midstream (partial text stays visible with error notice)
            return prev.map((m) =>
              m.id === assistantMsgId ? { ...m, error: errorMessage } : m
            );
          } else {
            // Failure Mode B: fails_before_first_token (compact inline error card)
            return [
              ...prev,
              {
                id: assistantMsgId,
                role: 'assistant',
                sender: 'tutor',
                content: '',
                error: errorMessage,
                citations: [],
              },
            ];
          }
        });
      }
    }
  };

  // Retry handler for failed messages
  const handleRetry = (msgIndex) => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user' || m.sender === 'user');
    const promptToRetry = lastUserMsg ? lastUserMsg.content : 'Walk me through the midterm solutions.';
    handleSendMessage(promptToRetry);
  };

  const handleResetConversation = () => {
    setMessages(initialConversation.messages || []);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface font-sans">
      {/* Navigation Header */}
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-outline-variant/50 px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded bg-primary-container flex items-center justify-center text-on-primary-container font-mono font-bold text-xs">
              ML
            </div>
            <div>
              <h1 className="text-sm font-semibold text-on-surface flex items-center gap-2">
                <span>CS 4780: Machine Learning</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-surface-container-high border border-outline-variant/60 rounded text-primary">
                  Active
                </span>
              </h1>
              <p className="text-[11px] text-on-surface-variant font-mono">
                Pedagogical Research Assistant &bull; Week 1-3
              </p>
            </div>
          </div>

          <button
            onClick={handleResetConversation}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant text-xs font-mono rounded border border-outline-variant/60 transition-colors"
            title="Reset conversation to initial state"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Feed</span>
          </button>
        </div>
      </header>

      {/* Main Chat Scroll Region */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-16 text-on-surface-variant space-y-3">
            <MessageSquare className="w-8 h-8 text-outline mx-auto" />
            <p className="text-sm font-medium">No messages yet. Ask a question to start!</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <ChatMessage
              key={msg.id || idx}
              message={msg}
              isStreaming={isStreaming && idx === messages.length - 1 && (msg.role === 'assistant' || msg.sender === 'tutor')}
              onRetry={() => handleRetry(idx)}
              onCitationClick={onCitationClick}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Pinned Bottom Input Bar */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isStreaming={isStreaming}
        onStop={handleStop}
        selectedScenario={selectedScenario}
        setSelectedScenario={setSelectedScenario}
      />
    </div>
  );
}

export default ChatInterface;
