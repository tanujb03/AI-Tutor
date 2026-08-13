---
name: Technical Precision
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#bdc9c8'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#879392'
  outline-variant: '#3e4949'
  surface-tint: '#76d6d5'
  primary: '#76d6d5'
  on-primary: '#003737'
  primary-container: '#008080'
  on-primary-container: '#e3fffe'
  inverse-primary: '#006a6a'
  secondary: '#c8c6c5'
  on-secondary: '#303030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#ffb692'
  on-tertiary: '#552000'
  tertiary-container: '#a96039'
  on-tertiary-container: '#fff9f7'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#93f2f2'
  primary-fixed-dim: '#76d6d5'
  on-primary-fixed: '#002020'
  on-primary-fixed-variant: '#004f4f'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1b1b1c'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#ffdbcb'
  tertiary-fixed-dim: '#ffb692'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#733512'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  section-label:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.08em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  code-sm:
    fontFamily: jetbrainsMono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 1.5rem
  element-gap: 0.75rem
  stack-tight: 0.25rem
  gutter: 1rem
---

## Brand & Style
The design system is engineered as a high-utility research and pedagogical instrument for CS 4780: Machine Learning. It prioritizes cognitive clarity over visual flair, adopting a **Minimalist-Technical** aesthetic that feels like a sophisticated development environment. The interface is designed to reduce eye strain during long study sessions by utilizing a deep monochromatic base with a singular functional accent. It evokes a sense of academic rigor, precision, and focus, stripping away all non-essential decorative elements to center the student's attention on complex mathematical concepts and code.

## Colors
The palette is strictly functional. The background uses a deep charcoal to establish a low-light environment. Surface areas (cards, input zones) use a slightly lighter grey to create subtle depth without relying on shadows.

**Teal (#008080)** is the sole cognitive anchor. It is used exclusively for interactive intent and progress tracking. 
- **Primary:** Actionable elements, citation markers, and active slide states.
- **Surface:** Used for secondary containers.
- **Neutral:** The foundational layer of the application.

## Typography
The system utilizes **Inter** for its neutral, systematic legibility. For code blocks and mathematical notation contexts, **JetBrains Mono** is introduced to maintain the "research tool" aesthetic.

- **Section Labels:** Always rendered in ALL CAPS with increased letter spacing to provide clear visual anchoring for document structure.
- **Body Text:** Set at 14px to support high information density while maintaining readability.
- **Citations:** Inline teal markers should be slightly bolded to stand out from the body text.

## Layout & Spacing
The layout follows a **Fixed-Grid** logic for the chat interface to maintain a consistent reading line, while the "Coverage" strip and supplemental materials use a **Fluid-Grid** to maximize screen real estate.

Spacing is tight and systematic, following a 4px baseline. Vertical rhythm is prioritized to ensure that dense blocks of ML theory remain parsable. Margins are kept narrow to reinforce the "instrument" feel, allowing more content to be visible simultaneously.

## Elevation & Depth
Depth is conveyed through **Tonal Layers** rather than shadows. 
- **Level 0 (#121212):** Global background.
- **Level 1 (#1E1E1E):** Chat bubbles, sidebar modules, and cards.
- **Level 2 (#2A2A2A):** Hover states and active input fields.

Outlines are used for structural definition. Use `1px` solid borders in `#333333` for inactive elements to maintain a technical, schematic appearance.

## Shapes
The design system uses a **Soft (0.25rem)** roundedness. This subtle rounding prevents the UI from feeling aggressive while maintaining the precision of a professional tool. 
- **Slide Indicators:** Small squares with minimal rounding.
- **Input Fields:** Standardized 4px corner radius.
- **Buttons:** Match the 4px radius; no pill-shapes are permitted as they appear too "consumer-oriented."

## Components

### The Coverage Strip (Slide States)
This component tracks progress through the lecture material.
- **Not Asked:** `border: 1px solid #333333; background: transparent;`
- **Touched:** `border: 1px solid #008080; background: transparent;`
- **Revisited:** `border: 1px solid #008080; background: #008080;`

### Chat Interface
- **Tutor Response:** Surface-grey background (#1E1E1E), white text.
- **Student Input:** Outlined style, 1px border (#333333), focused state uses a 1px teal border.
- **Citations:** Small teal superscript or pill-shaped markers (e.g., [1]) that link directly to slide timestamps.

### Buttons & Controls
- **Primary Action:** Solid teal background with white text.
- **Secondary Action:** Ghost style with teal text and no border until hover.

### Code Blocks
Utilize a darker sub-surface (#0A0A0A) within the grey cards to provide internal contrast for syntax highlighting.