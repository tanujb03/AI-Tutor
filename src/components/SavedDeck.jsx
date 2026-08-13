import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, BookmarkCheck, X, Trash2, ArrowUpRight, BookOpen, Sparkles } from 'lucide-react';
import MathMarkdown from './MarkdownRenderer';
import { findSlide } from '../data/lectureLookup';

/**
 * SavedDeck Component
 * 
 * Displays bookmarked assistant messages grouped by lecture topic.
 * Reachable via the Saved Deck tab near the chat input.
 */
export function SavedDeck({ savedMessages, lectures, onRemoveSaved, onCitationClick, onClose }) {
  // Group saved messages by lecture title using lectureLookup / citation week
  const groupedDeck = useMemo(() => {
    const groups = new Map();

    if (!Array.isArray(savedMessages)) return groups;

    savedMessages.forEach((msg) => {
      let groupKey = 'General ML Insights';
      let groupWeek = 999;

      if (Array.isArray(msg.citations) && msg.citations.length > 0) {
        const firstCitation = msg.citations[0];
        const matchedSlide = findSlide(firstCitation, lectures);

        if (firstCitation.lecture) {
          groupKey = firstCitation.lecture;
        }

        // Try extracting week number for sorting
        const match = groupKey.match(/Week\s*(\d+)/i);
        if (match) {
          groupWeek = parseInt(match[1], 10);
        }
      }

      if (!groups.has(groupKey)) {
        groups.set(groupKey, { title: groupKey, week: groupWeek, items: [] });
      }
      groups.get(groupKey).items.push(msg);
    });

    // Sort groups by week number
    return Array.from(groups.values()).sort((a, b) => a.week - b.week);
  }, [savedMessages, lectures]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
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
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="relative z-10 w-full max-w-3xl max-h-[85vh] bg-surface border border-outline-variant rounded-xl flex flex-col shadow-2xl overflow-hidden font-sans"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-surface-container-low border-b border-outline-variant/60 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded bg-primary-container/20 text-primary border border-primary/40">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-on-surface flex items-center gap-2">
                <span>Saved Study Deck</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-primary-container text-on-primary-container font-bold rounded-full">
                  {savedMessages.length} {savedMessages.length === 1 ? 'item' : 'items'}
                </span>
              </h2>
              <p className="text-[11px] text-on-surface-variant font-mono">
                Bookmarked Tutor Answers & Citations Grouped by Lecture
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {savedMessages.length === 0 ? (
            /* EMPTY STATE */
            <div className="py-16 text-center text-on-surface-variant space-y-3">
              <div className="w-12 h-12 rounded-full bg-surface-container-high border border-outline-variant/60 flex items-center justify-center text-outline mx-auto">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-on-surface">Nothing saved yet</h3>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                Tap the bookmark icon (<Bookmark className="w-3 h-3 inline text-primary" />) on any tutor answer in the chat to save key formulas and takeaways to your study deck.
              </p>
            </div>
          ) : (
            /* POPULATED GROUPS */
            groupedDeck.map((group, gIdx) => (
              <div key={gIdx} className="space-y-3">
                {/* Group Header */}
                <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-primary border-b border-outline-variant/40 pb-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="font-bold">{group.title}</span>
                  <span className="text-[10px] text-outline">({group.items.length})</span>
                </div>

                {/* Cards List */}
                <div className="space-y-3">
                  {group.items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 bg-surface-container-low border border-outline-variant/60 rounded-lg space-y-3 shadow-sm hover:border-outline transition-colors"
                    >
                      {/* Answer Excerpt */}
                      <div className="text-xs text-on-surface leading-relaxed max-h-36 overflow-y-auto pr-1">
                        <MathMarkdown content={item.content} />
                      </div>

                      {/* Footer Info & Actions */}
                      <div className="pt-2 border-t border-outline-variant/30 flex flex-wrap items-center justify-between gap-2 text-xs">
                        {/* Citations list */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {Array.isArray(item.citations) && item.citations.length > 0 ? (
                            item.citations.map((c, cIdx) => (
                              <button
                                key={cIdx}
                                onClick={() => {
                                  if (onCitationClick) {
                                    onCitationClick(c);
                                    onClose();
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-container/15 hover:bg-primary-container/30 border border-primary/40 text-primary text-[11px] font-mono rounded transition-colors"
                                title="Jump to source slide viewer"
                              >
                                <span>Week {c.week || 1} · Slide {c.slide}</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </button>
                            ))
                          ) : (
                            <span className="text-[10px] font-mono text-outline">General Reference</span>
                          )}
                        </div>

                        {/* Unsave Button */}
                        <button
                          onClick={() => onRemoveSaved(item.id)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-surface-container-high hover:bg-error-container/20 text-on-surface-variant hover:text-error text-[11px] font-mono rounded border border-outline-variant/60 transition-colors ml-auto"
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
      </motion.div>
    </div>
  );
}

export default SavedDeck;
