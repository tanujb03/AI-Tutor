import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import SourcePanel from './components/SourcePanel';
import SavedDeck from './components/SavedDeck';
import { MessageSquare, BookOpen } from 'lucide-react';

import lec1 from './data/lectures/lecture-01-linear-models.json';
import lec2 from './data/lectures/lecture-02-gradient-descent.json';
import lec3 from './data/lectures/lecture-03-regularization.json';

const lectures = [lec1, lec2, lec3];

export default function App() {
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [isSavedDeckOpen, setIsSavedDeckOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState('chat'); // 'chat' | 'sources'

  // Initialize savedMessages from localStorage
  const [savedMessages, setSavedMessages] = useState(() => {
    try {
      const stored = localStorage.getItem('ai_tutor_saved_deck');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  // Sync savedMessages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ai_tutor_saved_deck', JSON.stringify(savedMessages));
    } catch (e) {
      console.error("Failed to sync saved deck to localStorage", e);
    }
  }, [savedMessages]);

  const handleCitationClick = (citation) => {
    setSelectedCitation(citation);
  };

  const handleCloseMobile = () => {
    setSelectedCitation(null);
  };

  const handleToggleSave = (message) => {
    setSavedMessages((prev) => {
      const exists = prev.some((m) => m.id === message.id);
      if (exists) {
        return prev.filter((m) => m.id !== message.id);
      } else {
        return [...prev, message];
      }
    });
  };

  const handleRemoveSaved = (messageId) => {
    setSavedMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background text-on-surface overflow-x-hidden font-sans">
      {/* MOBILE TOP TAB BAR (Shown only on < lg screens replacing desktop split view) */}
      <div className="lg:hidden sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-outline-variant/60 px-4 py-2 flex items-center justify-center">
        <div className="flex bg-surface-container-high p-1 rounded-lg border border-outline-variant/60 w-full max-w-xs text-xs font-mono">
          <button
            onClick={() => setActiveMobileTab('chat')}
            className={`flex-1 py-1.5 rounded-md flex items-center justify-center space-x-1.5 transition-all ${
              activeMobileTab === 'chat'
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>

          <button
            onClick={() => setActiveMobileTab('sources')}
            className={`flex-1 py-1.5 rounded-md flex items-center justify-center space-x-1.5 transition-all ${
              activeMobileTab === 'sources'
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Sources</span>
            {selectedCitation && (
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* CENTER / LEFT CHAT AREA */}
      <div className={`flex-1 min-w-0 flex flex-col ${activeMobileTab === 'chat' ? 'flex' : 'hidden lg:flex'}`}>
        <ChatInterface 
          onCitationClick={handleCitationClick} 
          selectedCitation={selectedCitation}
          lectures={lectures}
          savedMessages={savedMessages}
          onToggleSave={handleToggleSave}
          onOpenSavedDeck={() => setIsSavedDeckOpen(true)}
        />
      </div>

      {/* FULL MOBILE SOURCES TAB VIEW (When activeMobileTab === 'sources' on mobile) */}
      {activeMobileTab === 'sources' && (
        <div className="lg:hidden flex-1 p-4 bg-background min-h-[calc(100vh-50px)]">
          <SourcePanel
            selectedCitation={selectedCitation}
            lectures={lectures}
            onCloseMobile={handleCloseMobile}
            isMobileFullTab={true}
          />
        </div>
      )}

      {/* DESKTOP PERSISTENT RIGHT PANEL & MOBILE BOTTOM SHEET OVERLAY */}
      <SourcePanel 
        selectedCitation={selectedCitation}
        lectures={lectures}
        onCloseMobile={handleCloseMobile}
      />

      {/* SAVED STUDY DECK MODAL */}
      {isSavedDeckOpen && (
        <SavedDeck
          savedMessages={savedMessages}
          lectures={lectures}
          onRemoveSaved={handleRemoveSaved}
          onCitationClick={(c) => {
            handleCitationClick(c);
            setActiveMobileTab('sources');
          }}
          onClose={() => setIsSavedDeckOpen(false)}
        />
      )}
    </div>
  );
}
