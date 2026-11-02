# docs/information-design.md

**1. Removed Element (The Pill Badge)**
I removed the "Bioinformatics in Browser" pill badge located next to the logo in the header. I did this because the badge was styled identically to an interactive button but was purely decorative, which invited redirection confusion. The main heading on the page already communicates this exact value proposition, making the badge redundant visual clutter.

**2. Collapsed Choice (The Navigation Buttons)**
I collapsed the separate "Sign In" and "Create Account" buttons in the header into a single "Get Started" call-to-action that routes directly to the sign-up page. 
*Growth Reasoning:* A new visitor arriving at the marketing page should not have to spend cognitive effort distinguishing between login and signup before they even understand what the product is. A single primary button removes decision fatigue and funnels all new traffic directly into the acquisition flow.

**3. Heading Shape and Wrapping**
I set a `max-width` of 45rem on the main `<h1>` heading. This forces the text to wrap deliberately into a readable, balanced block rather than stretching awkwardly across the entire screen. I captured the "badly wrapped" screenshot by temporarily setting the width to a narrow 25rem so it left single dangling words on a line, and then changed it back to capture the "correctly wrapped" screenshot showing the intended inverted pyramid shape.

**4. Button Sizing in Rem Units**
I sized all buttons using `1rem` (16px) for horizontal and vertical padding, and a `0.5rem` (8px) corner radius. I used `rem` units instead of fixed pixel heights so that the button scales proportionally with the user's browser font size settings. This ensures the interface maintains accessible touch targets and zooming standards without breaking the layout.

**5. Button Label Styling**
I applied my specific button label typography token from my task one design system (`main-tokens.css`) to every button on the screen. To ensure it wasn't skipped or overridden with hardcoded values, I explicitly asked the agent in my prompt to confirm that it had successfully applied that exact semantic token to the button text.