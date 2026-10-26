# Design System Divergences

## Purpose

This document records deliberate differences between my typography choices and the Google Material baseline. Each divergence captures the default recommendation, my chosen value, the reason for the change, and a situation in which the choice may be unsuitable.

## 1. Display Large

- **Default:** 57 pt, Regular, 0 letter spacing.
- **Chosen:** 64 pt, Semibold, -3.5% letter spacing.
- **Reason:** Semibold gives the largest display text more visual emphasis. Tighter spacing can make large characters feel more cohesive and reduce the loose appearance that can occur at display sizes.
- **When this could be wrong:** Semibold may feel too heavy in a minimalist design that relies on thin typography. Tight spacing may make certain letter combinations look crowded, especially with a typeface whose characters already sit close together.

## 2. Display Medium

- **Default:** 45 pt, Regular, 0 letter spacing.
- **Chosen:** 48 pt, Semibold, -3 px letter spacing.
- **Reason:** The larger size creates a stronger hierarchy between display text and smaller headings. Semibold and tighter spacing give the style a more deliberate visual presence.
- **When this could be wrong:** The larger size may compete with Display Large or occupy too much space in a compact layout. Tight spacing may also look crowded in long headings.

## 3. Display Small

- **Default:** 36 pt, Regular, 0 letter spacing.
- **Chosen:** 40 pt, Semibold, -2 px letter spacing.
- **Reason:** The increase in size makes the smaller display style more prominent, while Semibold provides stronger emphasis and negative spacing keeps the text visually compact.
- **When this could be wrong:** The larger size may blur the distinction between Display Small and Display Medium. It may also cause wrapping or consume too much space on mobile screens.

## 4. Headline Large

- **Default:** Regular weight, 0 letter spacing.
- **Chosen:** Medium weight, -1.8 px letter spacing; 32 pt.
- **Reason:** Medium weight strengthens heading hierarchy, while negative spacing gives the text a tighter appearance.
- **When this could be wrong:** Medium weight may create too much emphasis when several headings appear together. Tight spacing may look cramped in long or uppercase headings.

## 5. Headline Medium

- **Default:** Regular weight, 0 letter spacing.
- **Chosen:** Medium weight, -1.75 px letter spacing; 28 pt.
- **Reason:** The weight makes headings easier to distinguish from body text, and negative spacing supports a compact heading style.
- **When this could be wrong:** The style may become visually dense when used repeatedly or with a naturally wide or heavy typeface.

## 6. Headline Small

- **Default:** Regular weight, 0 letter spacing.
- **Chosen:** Medium weight, -1.5 px letter spacing; 24 pt.
- **Reason:** Medium weight preserves heading emphasis at a smaller size. Slightly less negative spacing than the larger headlines helps maintain readable character separation.
- **When this could be wrong:** The weight may compete with nearby titles, while negative spacing may make small or dense headings harder to scan.

## 7. Title Styles

- **Default:** Regular weight and 0 letter spacing, where recorded in the baseline.
- **Chosen:** Medium weight for Title Large (22 pt), Title Medium (16 pt), and Title Small (14 pt); letter spacing of -1 px, -1 px, and -0.9 px, respectively.
- **Reason:** Medium weight helps titles stand apart from body text. The compact spacing creates a consistent appearance across the title scale.
- **When this could be wrong:** Medium weight may make titles feel too prominent in text-heavy layouts. Negative spacing may reduce readability when titles are small, long, or rendered in a typeface with narrow characters.

## 8. Body Styles

- **Default:** Regular weight and 0 letter spacing for Body Large (16 pt) and Body Medium (14 pt); Body Small (12 pt) uses 0.1 letter spacing.
- **Chosen:** Medium weight throughout; letter spacing of -0.9 px, -0.85 px, and -0.4 px, respectively.
- **Reason:** Medium weight may improve the visibility of body text, while the decreasing amount of negative spacing limits compression at smaller sizes.
- **When this could be wrong:** Medium weight and negative spacing may make long paragraphs feel dense and tiring to read. This is particularly important for small text, users who need greater text clarity, and interfaces with large amounts of content.

## 9. Label Styles

- **Default:** Regular weight and 0 letter spacing for Label Large (14 pt); 0.1 letter spacing is the recorded baseline for Label Medium (12 pt) and Label Small (11 pt). Confirm the baseline weights for the latter two styles.
- **Chosen:** Medium weight throughout; letter spacing of -0.85 px, -0.4 px, and -0.4 px, respectively.
- **Reason:** Medium weight helps labels remain visible beside controls and other interface elements. Negative spacing creates a more compact label style.
- **When this could be wrong:** Tight spacing may make short labels look crowded or reduce the clarity of small text. Medium weight may also make secondary labels compete with more important content.

## 10. Line Height Preference

I used a consistent 1.5 line-height multiplier across all typography roles to maintain a predictable vertical rhythm and create a balanced, readable interface. It provides enough space between lines for comfortable reading while keeping the layout cohesive across headings, body text, and labels. Using one multiplier also simplifies the system and makes it easier to maintain. However, this may not be ideal for every style, as large display text or small labels may benefit from different spacing depending on their context.