import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCoverageState } from '../data/lectureLookup';
import { ChevronDown, ChevronUp, Layers, CheckCircle2, Circle, Eye, X, BookOpen } from 'lucide-react';

/**
 * CoverageStrip Component
 * 
 * Tracks pedagogical coverage across all lectures using getCoverageState(messages, lectures).
 * Rendered in collapsed mode by default, expanding into full breakdown rows or mobile modal view.
 */
export function CoverageStrip({ messages, lectures, isStreaming, onSlideSelect }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  // Compute coverage structure live from current messages and lectures
  const coverageData = useMemo(() => {
    return getCoverageState(messages, lectures);
  }, [messages, lectures]);

  // Total summary statistics across all lectures
  const summaryStats = useMemo(() => {
    let totalSlides = 0;
    let notAsked = 0;
    let touched = 0;
    let revisited = 0;

    coverageData.forEach((lec) => {
      totalSlides += lec.totalSlides || (lec.slides ? lec.slides.length : 0);
      notAsked += lec.stats?.notAsked || 0;
      touched += lec.stats?.touched || 0;
      revisited += lec.stats?.revisited || 0;
    });

    const coveredSlides = touched + revisited;
    const percentage = totalSlides > 0 ? Math.round((coveredSlides / totalSlides) * 100) : 0;

    return {
      totalSlides,
      notAsked,
      touched,
      revisited,
      coveredSlides,
      percentage,
    };
  }, [coverageData]);

  const handleToggleExpand = () => {
    // Check screen width for mobile modal vs inline dropdown
    if (window.innerWidth < 768) {
      setIsMobileModalOpen(true);
    } else {
      setIsExpanded((prev) => !prev);
    }
  };

  // Helper to render individual slide chip with exact DESIGN.md styles and pop animation
  const renderSlideChip = (slide, weekNum) => {
    const slideNum = slide.slide_number ?? slide.slideNumber;
    const status = slide.status; // "not-asked" | "touched" | "revisited"

    // Styling according to DESIGN.md
    let chipStyles = 'border-outline-variant/60 bg-transparent text-outline hover:border-outline';
    let statusLabel = 'Not Asked';

    if (status === 'touched') {
      chipStyles = 'border-primary bg-transparent text-primary hover:bg-primary-container/10';
      statusLabel = 'Touched (1 Citation)';
    } else if (status === 'revisited') {
      chipStyles = 'border-primary-container bg-primary-container text-on-primary-container font-semibold shadow-sm';
      statusLabel = `Revisited (${slide.citationCount} Citations)`;
    }

    return (
      <motion.button
        key={`${weekNum}-${slideNum}`}
        layout
        initial={false}
        animate={
          !isStreaming && (status === 'touched' || status === 'revisited')
            ? { scale: [1, 1.2, 1] }
            : { scale: 1 }
        }
        transition={{ duration: 0.35, ease: 'easeOut' }}
        onClick={() => {
          if (onSlideSelect) {
            onSlideSelect({
              lecture: `Week ${weekNum}`,
              week: weekNum,
              slide: slideNum,
            });
          }
        }}
        className={`inline-flex items-center justify-center min-w-[2.2rem] h-7 px-2 border rounded text-xs font-mono transition-all ${chipStyles}`}
        title={`Week ${weekNum} · Slide ${slideNum}: "${slide.title}" [${statusLabel}]`}
      >
        <span className="font-bold">{slideNum}</span>
      </motion.button>
    );
  };

  return (
    <div className="w-full bg-surface-container-low border-b border-outline-variant/60 font-sans">
      {/* 1. COLLAPSED BAR (Always Visible Slim Bar) */}
      <div
        onClick={handleToggleExpand}
        className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-surface-container-high/40 transition-colors select-none"
      >
        {/* Left: Summary Title & Progress Pill */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 font-mono uppercase text-[11px] font-bold text-on-surface">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Lecture Coverage</span>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-on-surface-variant text-[11px] font-mono">
            <span className="px-2 py-0.5 rounded bg-surface-container-high border border-outline-variant/60 text-primary font-medium">
              {summaryStats.coveredSlides} / {summaryStats.totalSlides} Slides Covered ({summaryStats.percentage}%)
            </span>
          </div>
        </div>

        {/* Right: Breakdown Badges & Expand Indicator */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-2 font-mono text-[11px]">
            <span className="flex items-center gap-1 text-on-surface-variant">
              <span className="w-2 h-2 rounded-full border border-outline-variant" />
              <span>{summaryStats.notAsked} Not Asked</span>
            </span>
            <span className="flex items-center gap-1 text-primary">
              <span className="w-2 h-2 rounded-full border border-primary" />
              <span>{summaryStats.touched} Touched</span>
            </span>
            <span className="flex items-center gap-1 text-primary">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>{summaryStats.revisited} Revisited</span>
            </span>
          </div>

          <div className="p-1 rounded text-on-surface-variant hover:text-on-surface bg-surface-container-high">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* 2. EXPANDED DESKTOP BREAKDOWN */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-outline-variant/40 bg-surface-container-lowest/90 px-4 py-4"
          >
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between text-xs text-on-surface-variant font-mono">
                <span>Click any slide chip to load its source slide into the viewer</span>
                <span className="text-[10px] text-outline">DESIGN.md Chip Legend: Outline = Touched | Solid = Revisited</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {coverageData.map((lecture) => (
                  <div
                    key={lecture.id || lecture.week}
                    className="p-3 bg-surface-container-low border border-outline-variant/60 rounded space-y-2.5"
                  >
                    <div className="flex items-center justify-between border-b border-outline-variant/40 pb-1.5">
                      <h4 className="text-xs font-semibold text-on-surface truncate max-w-[170px]" title={lecture.title}>
                        Week {lecture.week} · {lecture.title}
                      </h4>
                      <span className="text-[10px] font-mono text-primary font-bold">
                        {lecture.stats.touched + lecture.stats.revisited} / {lecture.totalSlides}
                      </span>
                    </div>

                    {/* Chips Row */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {lecture.slides.map((slide) => renderSlideChip(slide, lecture.week))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. MOBILE FULL-SCREEN / MODAL VIEW */}
      <AnimatePresence>
        {isMobileModalOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Sheet Container */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="relative z-10 bg-surface border-t border-outline-variant rounded-t-2xl max-h-[90vh] flex flex-col shadow-2xl p-4 space-y-4"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/60">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-on-surface font-sans">
                    Lecture Coverage Breakdown
                  </h3>
                </div>
                <button
                  onClick={() => setIsMobileModalOpen(false)}
                  className="p-1 rounded bg-surface-container-high text-on-surface-variant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto space-y-4 pr-1">
                {coverageData.map((lecture) => (
                  <div
                    key={lecture.id || lecture.week}
                    className="p-3.5 bg-surface-container-low border border-outline-variant/60 rounded space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-outline-variant/40 pb-2">
                      <div>
                        <div className="text-[10px] font-mono text-primary font-bold">Week {lecture.week}</div>
                        <h4 className="text-xs font-semibold text-on-surface">{lecture.title}</h4>
                      </div>
                      <span className="text-xs font-mono text-primary font-bold">
                        {lecture.stats.touched + lecture.stats.revisited} / {lecture.totalSlides}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {lecture.slides.map((slide) => renderSlideChip(slide, lecture.week))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CoverageStrip;
