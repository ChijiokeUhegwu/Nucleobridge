# Interview Answers: Design Systems and Accessibility

## 1. How would you structure design tokens?

I structure design tokens in three tiers. First, primitive tokens define the raw values like specific hex codes or exact pixel measurements. Second, semantic tokens reference those primitives and give them meaning, such as assigning a specific blue to a primary brand role. Third, component tokens reference the semantic tokens for specific UI elements, like a button background. This tiered architecture ensures that if a core brand color changes, you only update the primitive token, and the change cascades through the semantic and component layers automatically. It keeps the design system flexible and prevents hardcoded values.

## 2. When is a token change breaking?

A token change is breaking when it causes existing designs or code to stop working as expected, or when it changes a contract that other parts of the system depend on. For example, deleting or renaming a token can break components that reference it. Changing a spacing token can affect layouts that depend on its original value. Changing a semantic colour from an error colour to a success colour could also confuse users.

Not every value change is automatically breaking. Changing a primitive colour may be safe if it is part of an approved theme update and all affected interfaces remain correct. I would assess the change by checking which tokens and components depend on it, whether the change affects accessibility, and whether existing implementations need updating. For significant changes, I would document the reason, test affected components, communicate with developers and provide a migration path where necessary. Versioning can also help teams understand when a change requires code updates.

## 3. How would you support multiple brands and themes?

I support multiple brands and themes by swapping the primitive token values at the root level while keeping the semantic token names identical. For a dark theme, the semantic token 'color-surface' remains the same, but it points to a dark primitive color instead of a light one. For multiple brands, I swap the entire foundational primitive palette. As long as the interface only uses the semantic roles, the CSS can seamlessly apply a different theme or brand by simply loading a different set of primitive definitions via CSS variables.

## 4. Can tokens guarantee accessible contrast?

Tokens alone cannot guarantee accessible contrast. They can enforce mathematical pairings, such as ensuring 'color-on-primary' always contrasts with 'color-primary'. However, tokens do not control how developers place elements on the screen. If a developer places 'color-on-primary' text on a 'color-surface' background, the contrast might fail. Tokens provide a safe toolkit, but true accessibility requires proper implementation, continuous contrast checking on the final interface, and strict adherence to intended role pairings.

## 5. How do you ensure that colour contrast guidelines are met within a website or application's design?

I ensure contrast guidelines are met by testing color pairings at the design system level before they ever reach development. I use contrast checker plugins to verify that background and text combinations meet the required AAA or AA thresholds. During development, I rely on semantic token pairings that have already been validated. Finally, I run accessibility auditing tools on the rendered interface to catch any edge cases where colors might overlap improperly or where opacity changes affect readability. I also manually inspect interactive states, images, overlays and both light and dark themes.

## 6. Can you discuss the differences between WCAG levels A, AA and AAA?

WCAG defines three levels of conformance: A, AA and AAA.

**Level A** contains the basic accessibility requirements. Meeting it removes some significant barriers, but many accessibility problems may remain.

**Level AA** adds requirements that address a wider range of barriers. It is the usual target for websites and applications because it provides a practical standard for accessible design. For example, WCAG 2.2 AA generally requires a contrast ratio of 4.5:1 for normal text and 3:1 for large text.

**Level AAA** includes stricter requirements. For example, enhanced text contrast generally requires 7:1 for normal text and 4.5:1 for large text. Some AAA requirements may be difficult to apply to every type of content.

The levels build on one another. A website claiming AA conformance must satisfy the applicable A and AA criteria, not just the AA criteria. I would normally design and test for AA, while aiming for AAA where practical and appropriate. The correct target also depends on the project's requirements and applicable regulations.

## 7. Discuss the importance of semantic HTML in the context of accessibility.

Semantic HTML gives web content meaning and communicates the purpose of different elements to browsers and assistive technologies. For example, using `main`, `nav`, `header` and `footer` helps identify page structure. Using a real `button` for an action provides built-in keyboard interaction, focus behaviour and button semantics. A link should be used for navigation, while a button should be used for an action.

If developers use generic elements such as `div` for everything, they may need extra code to provide the correct roles and interactions. Even with ARIA attributes, they must implement behaviour that native HTML elements already provide.

Semantic HTML also improves maintainability and makes interfaces easier to navigate with screen readers and keyboards. I would therefore use native HTML elements according to their intended purpose, add accessible names where needed, and test the interface using keyboard navigation and assistive technologies. ARIA should supplement semantic HTML when necessary, not replace it without a good reason.

## 8. How do you handle design handoff to developers using Figma?

I prepare the Figma file so developers can understand the design without guessing.

First, I organise the file into clear pages and name frames, components, variables and layers consistently. I use the defined design tokens for colours, typography, spacing and shadows rather than entering unrelated values throughout the design.

Second, I document important behaviour, including responsive layouts, hover and focus states, validation messages, loading states and interactions that may not be obvious from a static screen.

Third, I use Figma's inspection features to help developers access measurements, assets and design properties. I also provide reference screens and explain decisions where implementation might be unclear.

For larger projects, I would agree with developers on how design tokens should map to code. Instead of just handing over a visual file, I export the design system as structured JSON files. This allows the engineering team to use automated scripts to convert the design decisions directly into CSS variables, keeping the codebase perfectly aligned with the design source of truth.

Finally, I review the implemented interface against the design, discuss differences with developers and help resolve issues. I see a good handoff as an ongoing collaboration, not simply sending a Figma link.

## 9. Why do AI-generated interfaces tend to look generic, and what specifically do you hand an agent to stop it?

AI generated interfaces look generic because large language models default to standard, statistical averages of web design when they lack constraints. They will build basic, unbranded components if left alone. To stop this while building projects using agentic systems like Google Antigravity, you must hand the agent a strict, pre compiled design system containing typography scale, colour roles, light and dark theme mappings, spacing and shadow tokens, and component usage rules. I would also provide reference screens and explain which visual decisions are intentional. By providing the design system and enforcing its use, you force the AI to operate within your specific brand guidelines, typography scales, and elevation rules, stripping away its generic fallback styles.

Finally, I review the generated interface for consistency, responsiveness, accessibility and unnecessary deviations. A design system gives the agent clear boundaries, but it does not replace design judgement or testing.

## 10. Your line height for display large is a specific number. Why that number and not one step either side of it? What would you lose with each?

For my Display Large, I used a line height of 96 px for a font size of 64 px. This gives a line-height ratio of 1.5, which is consistent with the ratio used across my typography system. This exact ratio balances readability and vertical rhythm. If we stepped down to a tighter ratio like 1.2, the ascenders and descenders of the DM Sans font would risk colliding across multiple lines, making the text feel cramped and harder to read. If we stepped up to a looser ratio like 1.7, the text would lose its visual grouping, making the headline look disconnected from the content below it. However, the ratio is a design decision, not a universal rule. For the DM Sans font that I used, the 1.5 multiplier maintains perfect structural harmony but this may not be applicable to all font types. I would compare the alternatives in actual layouts and check how the heading behaves across screen sizes before finalising it.

## 11. Point at one place in your own token structure that you would build differently if you started again. Say what you would do instead and what it would cost.

One area I would improve is the organisation of the neutral colour scale. My current colour documentation defines 14 core tones, but some semantic role mappings also reference additional neutral tones, including Neutral 4, 6, 12, 17, 22, 24, 87, 92, 94 and 96.

These extra tones provide more control over surfaces and visual hierarchy, but having them outside the main list can make the system harder to understand and maintain. If I started again, I would define the complete neutral scale in one documented place, clearly distinguish core tones from additional tones, and ensure every semantic role references a documented value. I would also validate the mappings for both light and dark themes.

The cost would be time spent revising the documentation, checking existing mappings and updating any code or design files that depend on the current structure. However, this would make the system clearer, reduce confusion during handoff and make future theme changes easier to manage.

## 12. Wrong-answer analysis. A candidate says: "I set up design tokens by exporting the hex values from Figma into a CSS file, so every colour in the codebase comes from one place. That makes it a single source of truth." This sounds correct and is not. Say precisely what is missing and what will go wrong in month four.

The missing part is the relationship between raw values and their intended roles. Exporting hex values into CSS centralises colours, but it does not automatically create a complete design token system. A robust system needs primitive tokens, semantic tokens, clear naming rules and theme mappings. For example, a raw green value should map to a role such as `color-primary`, while `color-surface` should map to the appropriate surface colour for each theme.

By month four, the team may introduce dark mode, add new components or change the brand palette. If components use raw colour variables directly, developers may need to update many references manually. Some components may be missed, producing inconsistent colours or inaccessible contrast.

There is also a risk that Figma and code drift apart if changes are exported manually without validation.

I would use Figma variables and documented semantic tokens, map them to CSS variables and establish a repeatable export or synchronisation process. I would also test theme mappings and contrast. A single source of truth requires consistent structure and change management, not merely one file containing hex values.