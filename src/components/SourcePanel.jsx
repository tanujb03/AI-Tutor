import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { findSlide } from '../data/lectureLookup';
import { BlockMath, InlineMath } from 'react-katex';
import { BookOpen, X, ChevronRight, FileText, Sparkles, Image, MessageSquare, HelpCircle } from 'lucide-react';

/**
 * SourcePanel Component
 * 
 * Displays the cited slide details retrieved via findSlide(citation, lectures).
 * Handles desktop right-side persistent panel and mobile bottom sheet overlay with spring animations.
 */
export function SourcePanel({ selectedCitation, lectures, onCloseMobile, isMobileFullTab = false, conversationMessages = [], onAskAboutSlide }) {
  const [slide, setSlide] = useState(null);
  const [targetLecture, setTargetLecture] = useState(null);
  const [flashHighlight, setFlashHighlight] = useState(false);
  const [showAlreadyAskedModal, setShowAlreadyAskedModal] = useState(false);

  useEffect(() => {
    setShowAlreadyAskedModal(false);
    if (selectedCitation && lectures) {
      const foundSlide = findSlide(selectedCitation, lectures);
      setSlide(foundSlide);

      // Find lecture for breadcrumbs
      const weekMatch = selectedCitation.lecture
        ? selectedCitation.lecture.match(/Week\s*(\d+)/i)
        : null;
      const weekNum = weekMatch
        ? parseInt(weekMatch[1], 10)
        : selectedCitation.week;

      const foundLec = lectures.find((l) => Number(l.week) === Number(weekNum));
      setTargetLecture(foundLec);

      // Trigger flash animation for highlighted cited bullet
      setFlashHighlight(true);
      const timer = setTimeout(() => setFlashHighlight(false), 2200);
      return () => clearTimeout(timer);
    } else {
      setSlide(null);
      setTargetLecture(null);
    }
  }, [selectedCitation, lectures]);

  // Check if current slide has already been asked in the conversation
  const isAlreadyAsked = React.useMemo(() => {
    if (!slide || !targetLecture || !Array.isArray(conversationMessages)) return false;
    const weekNum = targetLecture.week;
    const slideNum = slide.slide_number ?? slide.slideNumber;

    return conversationMessages.some((msg) =>
      Array.isArray(msg.citations) &&
      msg.citations.some((c) => {
        const cSlide = c.slide ?? c.slide_number ?? c.slideNumber;
        const cMatch = c.lecture ? c.lecture.match(/Week\s*(\d+)/i) : null;
        const cWeek = cMatch ? parseInt(cMatch[1], 10) : c.week;
        return Number(cWeek) === Number(weekNum) && Number(cSlide) === Number(slideNum);
      })
    );
  }, [slide, targetLecture, conversationMessages]);

  const handleAskClick = () => {
    if (isAlreadyAsked) {
      setShowAlreadyAskedModal(true);
    } else if (onAskAboutSlide) {
      onAskAboutSlide(slide, targetLecture);
    }
  };

  // Content Renderer Component
  const renderPanelContent = () => {
    if (!selectedCitation || !slide) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center text-on-surface-variant space-y-3 my-auto">
          <div className="w-10 h-10 rounded-md bg-surface-container-high border border-outline-variant/60 flex items-center justify-center text-outline">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-on-surface">No Slide Selected</h3>
          <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed">
            Select a citation chip (e.g. <span className="font-mono text-primary">[1] Week 2 · Slide 9</span>) inside any tutor answer to inspect its original lecture source slides.
          </p>
        </div>
      );
    }

    const slideNum = slide.slide_number ?? slide.slideNumber;
    const lectureTitle = targetLecture ? targetLecture.title : selectedCitation.lecture;
    const weekLabel = targetLecture ? `Week ${targetLecture.week}` : 'Lecture';

    return (
      <div className="space-y-5 p-4 sm:p-5 overflow-y-auto max-h-full">
        {/* Breadcrumb Header */}
        <div className="space-y-1 pb-3 border-b border-outline-variant/60">
          <div className="flex items-center space-x-1.5 text-[11px] font-mono text-primary uppercase tracking-wider">
            <span>{weekLabel}</span>
            <ChevronRight className="w-3 h-3 text-outline" />
            <span className="truncate max-w-[180px]">{lectureTitle}</span>
            <ChevronRight className="w-3 h-3 text-outline" />
            <span className="text-on-surface font-bold">Slide {slideNum}</span>
          </div>

          <h2 className="text-base font-semibold text-on-surface leading-snug">
            {slide.title}
          </h2>
        </div>

        {/* Cited Bullets Section with Highlight Flash */}
        {Array.isArray(slide.bullets) && slide.bullets.length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] font-mono font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span>Key Points & Takeaways</span>
            </div>

            <div className="space-y-2">
              {slide.bullets.map((bullet, idx) => {
                // Highlight the 1st bullet by default or cited bullet
                const isCitedBullet = idx === 0 || idx === (selectedCitation.bulletIndex || 0);

                return (
                  <motion.div
                    key={idx}
                    animate={
                      isCitedBullet && flashHighlight
                        ? {
                          backgroundColor: ['#201f1f', '#0080802b', '#201f1f'],
                          borderColor: ['#3e4949', '#76d6d5', '#3e4949'],
                          scale: [1, 1.015, 1],
                        }
                        : {}
                    }
                    transition={{ duration: 1.4, ease: 'easeInOut' }}
                    className={`p-3 rounded text-xs leading-relaxed border transition-all ${isCitedBullet
                      ? 'bg-primary-container/10 border-primary/40 text-on-surface shadow-sm'
                      : 'bg-surface-container-low border-outline-variant/40 text-on-surface-variant'
                      }`}
                  >
                    <div className="flex items-start space-x-2">
                      <span className={`mt-0.5 font-bold font-mono text-[10px] px-1 py-0.5 rounded ${isCitedBullet ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-outline'
                        }`}>
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <p>{bullet}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Formulas Section */}
        {Array.isArray(slide.formulas) && slide.formulas.length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] font-mono font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-tertiary" />
              <span>Mathematical Formulations</span>
            </div>

            <div className="space-y-2">
              {slide.formulas.map((formula, fIdx) => (
                <div
                  key={fIdx}
                  className="p-3 bg-surface-container-lowest border border-outline-variant/60 rounded overflow-x-auto overflow-y-hidden text-primary"
                >
                  <BlockMath math={String(formula)} errorColor="#ff6b6b" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Figure Description (if available) */}
        {slide.figure && (
          <div className="p-3 bg-surface-container-high/60 border border-outline-variant/60 rounded space-y-1.5 text-xs">
            <div className="flex items-center space-x-1.5 text-primary font-mono text-[11px] font-semibold uppercase">
              <Image className="w-3.5 h-3.5" />
              <span>Slide Diagram & Visual Context</span>
            </div>
            <p className="text-on-surface-variant text-[11px] leading-relaxed">
              {slide.figure.description || slide.figure}
            </p>
          </div>
        )}

        {/* Instructor Notes */}
        {slide.notes && (
          <div className="p-3 bg-surface-container-low border border-outline-variant/40 rounded space-y-1 text-xs">
            <div className="text-[10px] font-mono uppercase text-outline">Pedagogical Notes:</div>
            <p className="text-on-surface-variant text-[11px] italic leading-relaxed">
              {slide.notes}
            </p>
          </div>
        )}

        {/* SPECIAL ALREADY-ASKED MODAL CARD */}
        {showAlreadyAskedModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-surface-container-high border border-primary/50 rounded-lg space-y-3 text-xs font-sans shadow-xl my-3"
          >
            <div className="flex items-center space-x-2 text-primary font-mono font-semibold">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Slide Already Covered in Session</span>
            </div>
            <p className="text-on-surface-variant text-[11px] leading-relaxed">
              Slide {slideNum} (<em>"{slide.title}"</em>) has already been cited & covered in your active study session. Would you like to ask a follow-up question about this slide to deepen your understanding?
            </p>
            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={() => {
                  setShowAlreadyAskedModal(false);
                  if (onAskAboutSlide) onAskAboutSlide(slide, targetLecture);
                }}
                className="px-3 py-1.5 bg-primary-container text-on-primary-container font-mono text-[11px] font-bold rounded hover:bg-primary-container/90 transition-colors shadow-sm"
              >
                Ask Follow-Up Question
              </button>
              <button
                onClick={() => setShowAlreadyAskedModal(false)}
                className="px-3 py-1.5 bg-surface-container border border-outline-variant text-on-surface-variant font-mono text-[11px] rounded hover:text-on-surface transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}

        {/* ACTION BUTTON: Ask Tutor About This Slide */}
        <div className="pt-3 border-t border-outline-variant/40">
          <button
            onClick={handleAskClick}
            className={`w-full py-2.5 px-4 font-mono text-xs font-bold rounded-md flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95 ${
              isAlreadyAsked
                ? 'bg-surface-container-high border border-primary/50 text-primary hover:bg-surface-container-highest'
                : 'bg-primary-container hover:bg-primary-container/90 text-on-primary-container'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>
              {isAlreadyAsked ? 'Ask Follow-up on This Slide' : 'Ask Tutor About This Slide'}
            </span>
          </button>
        </div>
      </div>
    );
  };

  // Mobile full-tab: render just the panel content (no aside/bottom-sheet wrapper)
  if (isMobileFullTab) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl h-full flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-low/80 shrink-0">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-on-surface font-sans uppercase tracking-wider">
              Slide Source Viewer
            </span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {renderPanelContent()}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* DESKTOP PANEL (Right-side persistent, always visible in desktop w-80 or w-96) */}
      <aside className="hidden lg:flex lg:flex-col w-96 bg-surface-container-lowest border-l border-outline-variant/60 h-screen sticky top-0 overflow-hidden shadow-xl">
        {/* Panel Header */}
        <div className="px-4 py-3 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-low/80">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-on-surface font-sans uppercase tracking-wider">
              Slide Source Viewer
            </span>
          </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto">
          {renderPanelContent()}
        </div>
      </aside>

      {/* MOBILE BOTTOM SHEET (Dismissible partial height overlay with spring transition) */}
      <AnimatePresence>
        {selectedCitation && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Bottom Sheet Box with Spring Animation */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative z-10 bg-surface border-t border-outline-variant rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Swipe Handle & Drag Indicator */}
              <div className="w-full py-2 flex flex-col items-center justify-center bg-surface-container-low border-b border-outline-variant/40 shrink-0">
                <div className="w-12 h-1.5 rounded-full bg-outline-variant/80 mb-1" />
                <div className="w-full px-4 flex items-center justify-between text-xs">
                  <span className="font-mono text-primary text-[11px] uppercase tracking-wider font-semibold">
                    Source Slide Viewer
                  </span>
                  <button
                    onClick={onCloseMobile}
                    className="p-1 rounded bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sheet Body */}
              <div className="overflow-y-auto p-2">
                {renderPanelContent()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default SourcePanel;
