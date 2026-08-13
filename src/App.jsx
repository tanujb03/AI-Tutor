import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import SourcePanel from './components/SourcePanel';
import SavedDeck from './components/SavedDeck';

import lec1 from './data/lectures/lecture-01-linear-models.json';
import lec2 from './data/lectures/lecture-02-gradient-descent.json';
import lec3 from './data/lectures/lecture-03-regularization.json';

const lectures = [lec1, lec2, lec3];

export default function App() {
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [isSavedDeckOpen, setIsSavedDeckOpen] = useState(false);

  // Initialize savedMessages from localStorage with lazy initializer
  const [savedMessages, setSavedMessages] = useState(() => {
    try {
      const stored = localStorage.getItem('ai_tutor_saved_deck');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  // Sync savedMessages to localStorage on change
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
    <div className="flex min-h-screen bg-background text-on-surface overflow-x-hidden font-sans">
      {/* Center Main Chat Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <ChatInterface 
          onCitationClick={handleCitationClick} 
          selectedCitation={selectedCitation}
          lectures={lectures}
          savedMessages={savedMessages}
          onToggleSave={handleToggleSave}
          onOpenSavedDeck={() => setIsSavedDeckOpen(true)}
        />
      </div>

      {/* Right Desktop Panel & Mobile Bottom Sheet */}
      <SourcePanel 
        selectedCitation={selectedCitation}
        lectures={lectures}
        onCloseMobile={handleCloseMobile}
      />

      {/* Saved Study Deck Modal Overlay */}
      {isSavedDeckOpen && (
        <SavedDeck
          savedMessages={savedMessages}
          lectures={lectures}
          onRemoveSaved={handleRemoveSaved}
          onCitationClick={handleCitationClick}
          onClose={() => setIsSavedDeckOpen(false)}
        />
      )}
    </div>
  );
}
