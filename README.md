# Prism — Pedagogical Research Assistant

A citation-grounded learning interface built for CS 4780: Machine Learning for Engineers.

## What I Built

This application is built around a single data relationship: **Message &rarr; Citation &rarr; Lecture Slide**. Rather than functioning as a free-floating conversational chatbot, every tutor response is anchored to authoritative course slides.

### Core Features & Non-Happy-Path Behavior

1. **Citation-Grounded Streaming Chat**
   - **Happy Path**: Responses stream token-by-token with realistic delay intervals. Citations arrive attached to the message as interactive chips (`[1] Week 2 · Slide 9`). Clicking a chip switches to the slide view and highlights the relevant lecture content.
   - **Streaming Cancellation**: Clicking the **Stop** button triggers an `AbortController.abort()` signal. The generator loop terminates immediately, preserving all text and citations accumulated up to that point.
   - **Error Mode A (`fails-before-first-token`)**: When a network connection fails before emitting tokens, the system renders a compact inline error card ("Connection Failed") with a **Retry** button.
   - **Error Mode B (`error-midstream`)**: When a connection drops partway through generation, the partial answer remains visible in the chat log, accompanied by an inline error banner ("Connection lost mid-stream. Partial answer shown above.") and a **Retry** button.
   - **Exact-Match Bypass**: Submitting a question that matches a recorded user message in `conversation.json` character-for-character replays the stored response directly, bypassing mock scenario matching.

2. **First-Load & Empty Feed State**
   - Toggling between `Pre-loaded Feed` (`conversation.json`) and `Empty Feed` (`conversation-empty.json`) resets the chat messages.
   - When loaded in the empty state (`messages.length === 0`), the scroll view automatically locks to the top (`scrollTop = 0`). This ensures the course header, instructor details, and logged-in student info card (`Ben Tanaka`) are immediately visible without scrolling, directly above a list of quick-start question prompts.

3. **Robust Citation-to-Slide Matching (`findSlide`)**
   - Direct full-string comparison between citation titles and lecture titles is brittle due to formatting variations (e.g., `"Week 2 — Gradient Descent"` vs `"Lecture 2: Gradient Descent"`).
   - `findSlide` uses a 4-tier matching strategy:
     1. **Regex Week Extraction**: Extracts the numerical week identifier via `/Week\s*(\d+)/i` and matches it against `lecture.week`.
     2. **ID Matching**: Falls back to comparing `citation.lectureId` against `lecture.id` or `lecture.lecture_id`.
     3. **Substring Inclusion**: Checks bidirectional case-insensitive substring containment between `citation.lecture` and `lecture.title`.
     4. **Property Key Normalization**: Normalizes slide numbers across property variants (`slide`, `slide_number`, `slideNumber`).

4. **Lecture Coverage Map (`CoverageStrip`)**
   - A collapsible top bar calculates live coverage stats across all lectures (`getCoverageState`).
   - Categorizes every slide into *Not Asked* (0 citations), *Touched* (1 citation), or *Revisited* (2+ citations).
   - Slide chips animate with a scale pop when their coverage status transitions.

5. **Saved Study Deck (`SavedDeck`)**
   - A two-level modal interface for exam revision.
   - **Level 1**: Groups saved Q&A pairs by lecture with card expanders.
   - **Level 2**: Detail view displaying the student question, full tutor response, formatted math/code, and source citations.

## Setup

Run the following commands to clone, install dependencies, and start the development server:

```bash
git clone https://github.com/tanujb03/AI-Tutor.git
cd AI-Tutor
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

To create a production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Design Process

Visual direction and theme were brainstormed using Mixboard. Screen layouts, dark color tokens (`#131313` base), and component rules were defined in Stitch (`DESIGN.md`). Code implementation and pair-programming were executed in Antigravity IDE.

## What I Deliberately Left Out

- **Coverage Strip Layout Scaling**: The coverage map displays all 3 course lectures side-by-side in a fixed grid. For a full semester course (e.g., 14 lectures), this grid would be refactored into a scrollable, filterable list.
- **Backend LLM Server**: The streaming engine is implemented entirely on the client (`mock-stream.mjs`) replaying canned scenarios (`responses.json`). Every run is deterministic and offline-capable without external API keys.
- **User Authentication**: Student identities (`Ben Tanaka` / `Ana Reyes`) are loaded directly from static JSON datasets to focus scope on frontend interaction requirements.
- **PDF Canvas Rendering**: Lecture slides are rendered as structured JSON cards containing KaTeX math formulas and syntax-highlighted code blocks rather than embedding heavy PDF canvas elements.

## What's Still Broken

None currently known. Every bug found during QA (listed below) was fixed before submission.

## QA Process & Resolved Bugs

A full QA walkthrough was conducted across all 9 mock streaming scenarios (8 shipped with the spec; `fails-before-token` was added to explicitly test pre-first-token failure), both conversation feeds (`conversation.json`, `conversation-empty.json`), and mobile viewports. Scenarios tested:

`plain`, `code`, `math`, `table`, `long`, `refusal`, `error-midstream`, `slow`, `fails-before-token`

Bugs identified and fixed during testing:

- **Formula Double-Rendering Bug**: Math formulas were double-rendering because both raw LaTeX regex replacement and `ReactMarkdown` KaTeX plugins processed `$$` blocks. Fixed by consolidating math rendering into a single `MathMarkdown` component.
- **Paragraph Streaming Flicker Bug**: CSS entry animations applied to `<p>` tags caused visible flickering because `ReactMarkdown` re-created DOM nodes on every streamed token. Fixed by animating at the message container level using Framer Motion.
- **Scenario Error Hijacking Bug**: Academic prompts containing the word "error" (e.g., "What is error analysis?") triggered mock failure modes. Fixed by adding explicit prompt guards in `resolveScenarioId`.
- **Mobile Dropdown Clipping Bug**: Native `<select>` elements and long scenario prompt strings overflowed mobile viewports and hid the Saved Deck button. Fixed by implementing a custom scrollable popover dropdown with `max-h-56` and responsive flex layout.


## Tech Stack

Verified against `package.json`:

- **Framework**: React 18 (`18.3.1`), Vite 5 (`5.4.10`)
- **Styling**: Tailwind CSS (`3.4.14`), PostCSS (`8.4.47`), Autoprefixer (`10.4.20`)
- **Markdown & Math**: `react-markdown` (`9.0.1`), `remark-gfm` (`4.0.0`), `react-katex` (`3.0.1`), `katex` (`0.16.11`)
- **Code Highlighting**: `react-syntax-highlighter` (`15.5.0`)
- **Animations**: `framer-motion` (`11.11.17`)
- **Icons**: `lucide-react` (`0.454.0`)
