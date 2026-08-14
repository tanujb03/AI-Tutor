import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, X, Trash2, ArrowUpRight, BookOpen, ChevronLeft, HelpCircle, Sparkles, MessageSquare } from 'lucide-react';
import MathMarkdown from './MarkdownRenderer';
import { findSlide } from '../data/lectureLookup';

/**
 * SavedDeck Component
 * 
 * Displays bookmarked tutor answers & questions grouped by lecture topic.
 * Level 1: Cards list displaying only Student Question, Lecture Header, and Citations.
 * Level 2: Full answer detail view adhering strictly to DESIGN.md.
 */
export function SavedDeck({ savedMessages, lectures, onRemoveSaved, onCitationClick, onClose }) {
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);

  // Keyboard Escape listener
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedDetailItem) {
          setSelectedDetailItem(null);
        } else if (onClose) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDetailItem, onClose]);

  // Group saved messages by lecture title using lectureLookup / citation week
  const groupedDeck = useMemo(() => {
    const groups = new Map();

    if (!Array.isArray(savedMessages)) return groups;

    savedMessages.forEach((msg) => {
      let groupKey = 'General ML Insights';
      let groupWeek = 999;

      const citations = msg.citations || [];
      if (Array.isArray(citations) && citations.length > 0) {
        const firstCitation = citations[0];

        if (firstCitation.lecture) {
          groupKey = firstCitation.lecture;
        }

        // Try extracting week number for sorting
        const match = groupKey.match(/Week\s*(\d+)/i);
        if (match) {
          groupWeek = parseInt(match[1], 10);
        } else if (firstCitation.week) {
          groupWeek = firstCitation.week;
        }
      }

      if (!groups.has(groupKey)) {
        groups.set(groupKey, { title: groupKey, week: groupWeek, items: [] });
      }

      // Normalization for backwards compatibility
      const question = msg.userQuestion || msg.prompt || 'Student Question';
      const answer = msg.answerContent || msg.content || '';

      groups.get(groupKey).items.push({
        ...msg,
        userQuestion: question,
        answerContent: answer,
      });
    });

    // Sort groups by week number
    return Array.from(groups.values()).sort((a, b) => a.week - b.week);
  }, [savedMessages, lectures]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      {/* Dark Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Main Deck Container Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="relative z-10 w-full max-w-4xl max-h-[88vh] bg-surface border border-outline-variant rounded-xl flex flex-col shadow-2xl overflow-hidden"
      >
        {/* LEVEL 2: FULL ANSWER DETAIL PAGE */}
        {selectedDetailItem ? (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header with Back Button */}
            <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/60 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedDetailItem(null)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-surface-container-high hover:bg-surface-container-highest text-primary text-xs font-mono rounded border border-outline-variant/60 transition-all active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Saved Deck</span>
                </button>

                <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-on-surface-variant">
                  <span>&bull;</span>
                  <span className="text-primary font-semibold truncate max-w-xs">
                    {selectedDetailItem.citations?.[0]?.lecture || 'Lecture Study Notes'}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Detail View Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Question Section */}
              <div className="p-4 bg-surface-container-low border border-primary/40 rounded-lg space-y-2">
                <div className="flex items-center space-x-2 text-xs font-mono font-semibold uppercase tracking-wider text-primary">
                  <HelpCircle className="w-4 h-4" />
                  <span>Student Question</span>
                </div>
                <p className="text-sm font-semibold text-on-surface leading-snug">
                  "{selectedDetailItem.userQuestion}"
                </p>
              </div>

              {/* Tutor Answer Section */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-xs font-mono font-semibold uppercase tracking-wider text-on-surface-variant">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Tutor Answer & Explanation</span>
                </div>

                <div className="p-5 bg-surface-container-lowest border border-outline-variant/60 rounded-xl space-y-3 text-sm text-on-surface leading-relaxed shadow-sm">
                  <MathMarkdown content={selectedDetailItem.answerContent} />
                </div>
              </div>

              {/* Citations Footer & Actions */}
              <div className="p-4 bg-surface-container-low border border-outline-variant/60 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-on-surface-variant uppercase text-[10px] tracking-wider">
                    Source Citations:
                  </span>
                  {Array.isArray(selectedDetailItem.citations) && selectedDetailItem.citations.length > 0 ? (
                    selectedDetailItem.citations.map((c, cIdx) => (
                      <button
                        key={cIdx}
                        onClick={() => {
                          if (onCitationClick) {
                            onCitationClick(c);
                            onClose();
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-container/20 hover:bg-primary-container/40 border border-primary/40 text-primary text-xs font-mono rounded transition-colors"
                        title="Jump to slide viewer"
                      >
                        <span>Week {c.week || 1} · Slide {c.slide}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    ))
                  ) : (
                    <span className="font-mono text-outline text-xs">General Reference</span>
                  )}
                </div>

                <button
                  onClick={() => {
                    onRemoveSaved(selectedDetailItem.id);
                    setSelectedDetailItem(null);
                  }}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-surface-container-high hover:bg-error-container/20 text-on-surface-variant hover:text-error text-xs font-mono rounded border border-outline-variant/60 transition-colors ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Item</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* LEVEL 1: CARDS LIST VIEW */
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/60 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded bg-primary-container/20 text-primary border border-primary/40">
                  <Bookmark className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-on-surface flex items-center gap-2">
                    <span>Saved Study Deck</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-primary-container text-on-primary-container font-bold rounded">
                      {savedMessages.length} {savedMessages.length === 1 ? 'item' : 'items'}
                    </span>
                  </h2>
                  <p className="text-xs text-on-surface-variant font-mono">
                    Bookmarked Questions & Tutor Answers Grouped by Lecture
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {savedMessages.length === 0 ? (
                /* EMPTY STATE */
                <div className="py-20 text-center text-on-surface-variant space-y-3">
                  <div className="w-12 h-12 rounded-md bg-surface-container-high border border-outline-variant/60 flex items-center justify-center text-outline mx-auto">
                    <Bookmark className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-semibold text-on-surface">Nothing saved yet</h3>
                  <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                    Tap the bookmark icon (<Bookmark className="w-3.5 h-3.5 inline text-primary" />) on any tutor answer in the chat to save questions and explanations to your study deck.
                  </p>
                </div>
              ) : (
                /* POPULATED GROUPS */
                groupedDeck.map((group, gIdx) => (
                  <div key={gIdx} className="space-y-3">
                    {/* Group Header */}
                    <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-primary border-b border-outline-variant/40 pb-2">
                      <BookOpen className="w-4 h-4" />
                      <span className="font-bold text-sm">{group.title}</span>
                      <span className="text-xs text-outline">({group.items.length})</span>
                    </div>

                    {/* Cards List - Clean Records Showing Question & Lecture */}
                    <div className="grid grid-cols-1 gap-3">
                      {group.items.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.18 }}
                          className="p-4 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/60 hover:border-primary/60 rounded-xl space-y-3 shadow-sm transition-all group cursor-pointer"
                          onClick={() => setSelectedDetailItem(item)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            {/* Question Title */}
                            <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                              <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <h3 className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors leading-snug">
                                  {item.userQuestion}
                                </h3>
                                <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                                  {item.answerContent.replace(/[#*`$]/g, '').substring(0, 140)}...
                                </p>
                              </div>
                            </div>

                            {/* Read Action Indicator */}
                            <div className="shrink-0 flex items-center space-x-1 text-xs font-mono text-primary font-semibold pt-0.5">
                              <span>Read Answer</span>
                              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </div>
                          </div>

                          {/* Footer Info & Actions */}
                          <div className="pt-2 border-t border-outline-variant/30 flex items-center justify-between text-xs">
                            {/* Citations List Chips */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              {Array.isArray(item.citations) && item.citations.length > 0 ? (
                                item.citations.map((c, cIdx) => (
                                  <span
                                    key={cIdx}
                                    className="px-2 py-0.5 bg-primary-container/15 border border-primary/30 text-primary text-[11px] font-mono rounded"
                                  >
                                    Week {c.week || 1} · Slide {c.slide}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] font-mono text-outline">General Reference</span>
                              )}
                            </div>

                            {/* Unsave Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveSaved(item.id);
                              }}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-surface-container hover:bg-error-container/20 text-on-surface-variant hover:text-error text-[11px] font-mono rounded border border-outline-variant/60 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default SavedDeck;
