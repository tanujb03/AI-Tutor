/**
 * lectureLookup.js
 * 
 * Utility functions for matching slide citations and calculating lecture coverage states
 * for CS 4780 Machine Learning AI Tutor.
 */

/**
 * 1. findSlide(citation, lectures)
 * 
 * Locates a specific slide object from an array of lecture datasets based on a citation.
 * 
 * MATCHING LOGIC (Robust Week Parsing):
 * - Instead of comparing full lecture title strings (which are prone to formatting/punctuation mismatches),
 *   we parse out the numerical week identifier from the citation's `lecture` field (e.g. "Week 2 — ...").
 * - We extract the digit following "Week" via regex (`/Week\s*(\d+)/i`).
 * - We then find the matching lecture object whose `.week` property equals that parsed number.
 * - Finally, we lookup the slide inside `lecture.slides` matching `slide_number` (or `slide`).
 *
 * @param {Object} citation - Citation object containing `lecture` (e.g. "Week 2 — Gradient Descent") and `slide` (number).
 * @param {Array<Object>} lectures - Array of lecture JSON objects (each with a `.week` and `.slides` array).
 * @returns {Object|null} The matched slide object, or null if no match is found.
 */
export function findSlide(citation, lectures) {
  if (!citation || !Array.isArray(lectures)) {
    return null;
  }

  // Determine the target week number
  let targetWeek = null;

  if (typeof citation.week === 'number') {
    targetWeek = citation.week;
  } else if (typeof citation.lecture === 'string') {
    // Regex matching: find "Week" followed by whitespace and numbers (case insensitive)
    const match = citation.lecture.match(/Week\s*(\d+)/i);
    if (match) {
      targetWeek = parseInt(match[1], 10);
    }
  }

  if (targetWeek === null) {
    return null;
  }

  // 1. Find the target lecture object by week number (avoiding fragile string comparison on titles)
  const targetLecture = lectures.find((lec) => Number(lec.week) === targetWeek);

  if (!targetLecture || !Array.isArray(targetLecture.slides)) {
    return null;
  }

  // Determine the target slide number from citation
  const targetSlideNum = citation.slide ?? citation.slide_number ?? citation.slideNumber;

  if (targetSlideNum === undefined || targetSlideNum === null) {
    return null;
  }

  // 2. Find the slide matching the target slide number
  const matchedSlide = targetLecture.slides.find(
    (slide) => (slide.slide_number ?? slide.slideNumber) === Number(targetSlideNum)
  );

  return matchedSlide || null;
}

/**
 * 2. getCoverageState(conversationMessages, lectures)
 * 
 * Scans all assistant/tutor messages across a conversation history to collect citations,
 * counts citations per (week, slide_number), and tags each slide in every lecture with a coverage status:
 * - "not-asked": cited 0 times
 * - "touched": cited exactly 1 time
 * - "revisited": cited 2 or more times
 *
 * @param {Array<Object>} conversationMessages - Array of conversation message objects.
 * @param {Array<Object>} lectures - Array of loaded lecture JSON objects.
 * @returns {Array<Object>} Array of updated lecture structures containing tagged slides and coverage metrics.
 */
export function getCoverageState(conversationMessages, lectures) {
  if (!Array.isArray(lectures)) {
    return [];
  }

  // Map to store frequency of (week, slide_number) citations.
  // Key format: "week-slideNumber", Value: citation count (number)
  const citationCounts = new Map();

  // Helper to record a citation increment
  const recordCitation = (week, slideNum) => {
    if (week !== null && week !== undefined && slideNum !== null && slideNum !== undefined) {
      const key = `${Number(week)}-${Number(slideNum)}`;
      const currentCount = citationCounts.get(key) || 0;
      citationCounts.set(key, currentCount + 1);
    }
  };

  // Walk through all messages in the conversation
  if (Array.isArray(conversationMessages)) {
    for (const msg of conversationMessages) {
      // Filter for assistant/tutor messages
      const isAssistant = msg.role === 'assistant' || msg.sender === 'tutor' || msg.sender === 'assistant';
      
      if (isAssistant && Array.isArray(msg.citations)) {
        for (const citation of msg.citations) {
          // Extract week number
          let week = typeof citation.week === 'number' ? citation.week : null;
          if (week === null && typeof citation.lecture === 'string') {
            const match = citation.lecture.match(/Week\s*(\d+)/i);
            if (match) {
              week = parseInt(match[1], 10);
            }
          }

          // Extract slide number
          const slideNum = citation.slide ?? citation.slide_number ?? citation.slideNumber;

          recordCitation(week, slideNum);
        }
      }
    }
  }

  // Process lectures and calculate coverage status per slide
  return lectures.map((lecture) => {
    const weekNum = Number(lecture.week);
    let touchedCount = 0;
    let revisitedCount = 0;
    let notAskedCount = 0;

    const taggedSlides = (lecture.slides || []).map((slide) => {
      const slideNum = Number(slide.slide_number ?? slide.slideNumber);
      const key = `${weekNum}-${slideNum}`;
      const count = citationCounts.get(key) || 0;

      let status = 'not-asked';
      if (count === 1) {
        status = 'touched';
        touchedCount++;
      } else if (count > 1) {
        status = 'revisited';
        revisitedCount++;
      } else {
        notAskedCount++;
      }

      return {
        ...slide,
        citationCount: count,
        status: status, // "not-asked" | "touched" | "revisited"
      };
    });

    return {
      id: lecture.id,
      week: lecture.week,
      title: lecture.title,
      totalSlides: taggedSlides.length,
      stats: {
        notAsked: notAskedCount,
        touched: touchedCount,
        revisited: revisitedCount,
      },
      slides: taggedSlides,
    };
  });
}

export default { findSlide, getCoverageState };
