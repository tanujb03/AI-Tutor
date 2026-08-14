import React, { useState, useRef, useEffect } from 'react';
import { streamResponse, getScenario, listScenarios } from '../data/mock-stream.mjs';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import CoverageStrip from './CoverageStrip';
import { BookOpen, RefreshCw, MessageSquare, Layers } from 'lucide-react';

export function ChatInterface({ onCitationClick, selectedCitation, lectures, savedMessages = [], onToggleSave, onOpenSavedDeck, askSlidePrompt, onClearAskSlidePrompt, initialConversation, conversationMode, onToggleConversationMode }) {
  const [messages, setMessages] = useState(initialConversation?.messages || []);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('plain');
  
  const abortControllerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Reset messages when initialConversation changes (toggle between empty/populated feeds)
  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
    setMessages(initialConversation?.messages ? JSON.parse(JSON.stringify(initialConversation.messages)) : []);
  }, [initialConversation]);

  // Listener for askSlidePrompt triggered from SourcePanel
  useEffect(() => {
    if (askSlidePrompt) {
      handleSendMessage(askSlidePrompt);
      if (onClearAskSlidePrompt) {
        onClearAskSlidePrompt();
      }
    }
  }, [askSlidePrompt]);

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
    // If this is an "Ask Tutor About This Slide" prompt, never hijack it into mock error scenarios
    if (userText.startsWith('Can you explain Slide')) {
      return selectedScenario === 'error-midstream' || selectedScenario === 'fails-before-token' ? 'plain' : selectedScenario;
    }

    const textLower = userText.toLowerCase();
    if (textLower.includes('fails-before-token') || textLower.includes('instant error')) return 'fails-before-token';
    if (textLower.includes('error-midstream') || textLower.includes('midstream error') || textLower.includes('connection lost')) return 'error-midstream';
    if (textLower.includes('code scenario') || textLower.includes('show me how gradient descent is implemented')) return 'code';
    if (textLower.includes('math scenario') || textLower.includes('why is the sigmoid derivative at most 0.25')) return 'math';
    if (textLower.includes('table scenario') || textLower.includes('compare the regularization techniques')) return 'table';
    if (textLower.includes('long scenario') || textLower.includes('explain everything about backprop')) return 'long';
    if (textLower.includes('refusal scenario') || textLower.includes('when is the final exam')) return 'refusal';
    if (textLower.includes('slow scenario') || textLower.includes('summarise the whole course so far')) return 'slow';

    return selectedScenario;
  };

  const handleSendMessage = async (promptText) => {
    const targetScenarioId = resolveScenarioId(promptText);

    // ── EXACT MATCH LOOKUP ──────────────────────────────────────────────────
    // If the prompt matches a user message in initialConversation exactly
    // (character-for-character), stream back the paired assistant response
    // directly from conversation.json instead of using the mock scenario.
    const convMessages = initialConversation?.messages || [];
    let exactMatchResponse = null;
    for (let i = 0; i < convMessages.length - 1; i++) {
      const m = convMessages[i];
      if ((m.role === 'user' || m.sender === 'user') && m.content === promptText) {
        // Find the immediately following assistant message
        const next = convMessages[i + 1];
        if (next && (next.role === 'assistant' || next.sender === 'tutor')) {
          exactMatchResponse = next;
          break;
        }
      }
    }
    // ────────────────────────────────────────────────────────────────────────

    // 1. Append user prompt message
    const userMsg = {
      id: `usr-${Date.now()}`,
      role: 'user',
      sender: 'user',
      content: promptText,
    };

    const assistantMsgId = `ast-${Date.now()}`;
    let accumulatedText = '';
    let errorMessage = null;
    let scenarioCitations = [];

    // Citations come from the exact match or from the scenario meta
    if (exactMatchResponse) {
      scenarioCitations = exactMatchResponse.citations ? [...exactMatchResponse.citations] : [];
    } else {
      try {
        const scenarioMeta = getScenario(targetScenarioId);
        scenarioCitations = scenarioMeta.citations ? [...scenarioMeta.citations] : [];
      } catch (e) {
        scenarioCitations = [];
      }
    }

    // If this is an "Ask Tutor About This Slide" prompt, extract exact week and slide number for dynamic citation
    const slideMatch = promptText.match(/Slide\s*(\d+)/i);
    const weekMatch = promptText.match(/Week\s*(\d+)/i);

    if (slideMatch && weekMatch) {
      const askedWeek = parseInt(weekMatch[1], 10);
      const askedSlide = parseInt(slideMatch[1], 10);
      
      const targetLec = lectures ? lectures.find((l) => Number(l.week) === askedWeek) : null;
      const lecTitle = targetLec ? targetLec.title : `Lecture`;

      scenarioCitations = [
        {
          lecture: `Week ${askedWeek} — ${lecTitle}`,
          week: askedWeek,
          slide: askedSlide,
        },
      ];
    }

    // Append user prompt AND assistant placeholder immediately
    setMessages((prev) => [
      ...prev,
      userMsg,
      {
        id: assistantMsgId,
        role: 'assistant',
        sender: 'tutor',
        content: '',
        citations: scenarioCitations,
      },
    ]);

    // 2. Prepare AbortController & stream generator
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsStreaming(true);

    try {
      if (exactMatchResponse) {
        // ── STREAM EXACT MATCH from conversation.json ──────────────────────
        // Replay the stored response text chunk-by-chunk with realistic timing
        const text = exactMatchResponse.content || '';
        // Chunkify deterministically (same as mock-stream)
        const chunks = [];
        let seed = 1337;
        const nextRand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
        let i = 0;
        while (i < text.length) {
          const size = 2 + Math.floor(nextRand() * 6);
          chunks.push(text.slice(i, i + size));
          i += size;
        }

        // First-token delay (400ms)
        await new Promise((r) => setTimeout(r, 400));
        if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError');

        for (const chunk of chunks) {
          if (controller.signal.aborted) break;
          accumulatedText += chunk;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, content: accumulatedText, citations: scenarioCitations }
                : m
            )
          );
          await new Promise((r) => setTimeout(r, 18));
        }
        // ──────────────────────────────────────────────────────────────────
      } else {
        // ── MOCK STREAM fallback ──────────────────────────────────────────
        const streamGenerator = getScenario(targetScenarioId) ? targetScenarioId : 'plain';
        
        for await (const chunk of streamResponse(streamGenerator, { signal: controller.signal })) {
          accumulatedText += chunk;

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, content: accumulatedText, citations: scenarioCitations }
                : m
            )
          );
        }
        // ──────────────────────────────────────────────────────────────────
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
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
    setMessages(initialConversation?.messages ? JSON.parse(JSON.stringify(initialConversation.messages)) : []);
    if (onCitationClick) {
      onCitationClick(null);
    }
  };

  const handleToggleSaveMsg = (msg) => {
    let userQuestion = 'Student Question';
    const msgIdx = messages.findIndex((m) => m.id === msg.id);
    if (msgIdx > 0) {
      for (let i = msgIdx - 1; i >= 0; i--) {
        if (messages[i].role === 'user' || messages[i].sender === 'user') {
          userQuestion = messages[i].content;
          break;
        }
      }
    }

    const payload = {
      id: msg.id,
      userQuestion: userQuestion,
      answerContent: msg.content || '',
      citations: msg.citations || [],
      savedAt: new Date().toISOString()
    };

    if (onToggleSave) {
      onToggleSave(payload);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-on-surface font-sans">
      {/* Navigation Header — fixed at top, never scrolls away */}
      <header className="shrink-0 bg-background/90 backdrop-blur-md border-b border-outline-variant/50 px-6 py-3 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded bg-primary-container flex items-center justify-center text-on-primary-container font-mono font-bold text-xs">
              ML
            </div>
            <div>
              <h1 className="text-sm font-semibold text-on-surface">
                CS 4780: Machine Learning
              </h1>
              <p className="text-[11px] text-on-surface-variant font-mono">
                Pedagogical Research Assistant &bull; Week 1-3
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Feed Toggle Button */}
            {onToggleConversationMode && (
              <button
                onClick={onToggleConversationMode}
                className={`inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-mono rounded border transition-colors ${
                  conversationMode === 'empty'
                    ? 'bg-primary-container text-on-primary-container border-primary font-semibold'
                    : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant border-outline-variant/60'
                }`}
                title={conversationMode === 'populated' ? 'Switch to empty feed' : 'Switch to populated feed'}
              >
                <Layers className="w-3 h-3" />
                <span>{conversationMode === 'populated' ? 'Pre-loaded Feed' : 'Empty Feed'}</span>
              </button>
            )}

            <button
              onClick={handleResetConversation}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant text-xs font-mono rounded border border-outline-variant/60 transition-colors"
              title="Reset conversation to initial state"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Feed</span>
            </button>
          </div>
        </div>
      </header>

      {/* Live Coverage Strip — also shrinks to its content height */}
      <div className="shrink-0">
        <CoverageStrip
          messages={messages}
          lectures={lectures}
          isStreaming={isStreaming}
          onSlideSelect={onCitationClick}
        />
      </div>

      {/* Main Chat Scroll Region — flex-1 so it fills the remaining height, overflow-y-auto for scroll */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl w-full mx-auto px-4 py-6 space-y-4">
          {messages.length === 0 ? (
            /* EMPTY STATE — uses metadata from initialConversation */
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 max-w-sm mx-auto">
              {/* Course & Student Identity Card */}
              <div className="w-full p-4 bg-surface-container-low border border-outline-variant/60 rounded-xl space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container font-mono font-bold text-xs shrink-0">
                    {initialConversation?.course?.code?.split(' ')[0] || 'ML'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      {initialConversation?.course?.code || 'Course'}: {initialConversation?.course?.title || 'Machine Learning'}
                    </p>
                    <p className="text-[11px] text-on-surface-variant font-mono">
                      {initialConversation?.course?.instructor || 'Instructor'}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-outline-variant/30 flex items-center space-x-2">
                  <div className="w-6 h-6 rounded bg-surface-container-high border border-outline-variant/60 flex items-center justify-center text-[10px] font-mono text-on-surface-variant">
                    {(initialConversation?.student?.name || 'S').charAt(0)}
                  </div>
                  <span className="text-xs text-on-surface-variant">
                    Logged in as <span className="text-on-surface font-semibold">{initialConversation?.student?.name || 'Student'}</span>
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-base font-semibold text-on-surface">Start a conversation</h2>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Ask anything about the course material — answers come with direct references to the lecture slides.
                </p>
              </div>

              {/* Quick-start example questions */}
              <div className="w-full p-3 bg-surface-container-low border border-outline-variant/40 rounded-lg text-left space-y-1">
                <p className="text-[10px] font-mono text-outline uppercase tracking-wider mb-2">Try asking</p>
                {[
                  "i'm stuck on problem set 2. what's the vanishing gradient problem?",
                  'ok so why does relu fix it',
                  "what's the difference between all the regularization things again, i keep mixing up l1 and l2",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSendMessage(q)}
                    className="block w-full text-left px-3 py-2 text-xs text-on-surface-variant hover:text-primary hover:bg-primary-container/10 rounded transition-colors font-mono leading-snug"
                  >
                    &rsaquo; {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isSaved = savedMessages.some((m) => m.id === msg.id);
              return (
                <ChatMessage
                  key={msg.id || idx}
                  message={msg}
                  isStreaming={isStreaming && idx === messages.length - 1 && (msg.role === 'assistant' || msg.sender === 'tutor')}
                  onRetry={() => handleRetry(idx)}
                  onCitationClick={onCitationClick}
                  selectedCitation={selectedCitation}
                  isSaved={isSaved}
                  onToggleSave={handleToggleSaveMsg}
                />
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Pinned Bottom Input Bar — shrinks to content, never scrolls away */}
      <div className="shrink-0">
        <ChatInput
          onSendMessage={handleSendMessage}
          isStreaming={isStreaming}
          onStop={handleStop}
          selectedScenario={selectedScenario}
          setSelectedScenario={setSelectedScenario}
          savedCount={savedMessages.length}
          onOpenSavedDeck={onOpenSavedDeck}
        />
      </div>
    </div>
  );
}

export default ChatInterface;
