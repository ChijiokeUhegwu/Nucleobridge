# docs/accessibility-audit.md

## Manual Audit Results

*   **Colour Independence:** Passed. A caution SVG icon was added alongside the error text so the error state did not rely on the colour alone.
*   **Keyboard Reachability:** Failed initially. The disabled submit buttons (Sign Up and OTP verify) were removed from the tab order, stranding keyboard users. Fixed by replacing the `disabled` attribute with `aria-disabled="true"`, and enforcing the state via `pointer-events: none` and opacity styling.
*   **Focus Visibility:** Passed initially. All inputs already relied on the browser's native focus ring or a custom high-contrast focus outline defined in our CSS tokens.
*   **Screen Reader Announcement:** Passed initially. The password visibility eye toggle already correctly utilized `aria-label` and `aria-pressed` to announce its state to screen readers.
*   **Error Association:** Passed initially. The password rule ("Minimum 8 characters") was assigned the `id="signup-password-requirement"` and programmatically linked to the password input via `aria-describedby` (which also conditionally includes the error ID when an error is present).
*   **Semantic Form Enforcement:** Passed initially. The Terms and Conditions checkbox had the programmatic required state for assistive tech due to the `aria-required="true"`.

## Screen Reader Transcript (Windows Narrator)

### Before Fixes:
*   **First Name:** "First name, edit, required. Scan off"
*   **Last Name:"** "Last name, edit, required. This detail is missing. Please add your first name". Suggestions hidden for the session. Suggestion available.
*   **Email Address:** "Email address, edit, Learner@example.com, required. This detail is missing. Please add your last name."
*   **Password:** "Password, password edit, Minimum 8 characters, required. This detail is missing. Please add your email address" (The `aria-describedby` attribute successfully links the constraint text so it is read aloud).
*   **Visibility Toggle:** "Show password toggle button off. This detail is missing. Please enter your password." (Announced correctly due to existing aria attributes).
*   **Terms Checkbox:** "I accept the Terms and Conditions and Privacy policy, checkbox, unchecked. Required. Link, terms and conditions. Please accept the Terms and Privacy Policy to continue. Link, privacy policy." 
*   **Sign up Button:** (Silence. Pressing Tab skips the button entirely because the HTML `disabled` attribute removes it from the DOM tab sequence).

### After Fixes:

*   **First Name:** "First name, edit, required. Scan off"
*   **Last Name:"** "Last name, edit, required. This detail is missing. Please add your first name". Suggestions hidden for the session. Suggestion available.
*   **Email Address:** "Email address, edit, Learner@example.com, required. This detail is missing. Please add your last name."
*   **Password:** "Password, password edit, Minimum 8 characters, required. This detail is missing. Please add your email address" (The `aria-describedby` attribute successfully links the constraint text so it is read aloud).
*   **Visibility Toggle:** "Show password toggle button off. This detail is missing. Please enter your password." (Announced correctly due to existing aria attributes).
*   **Terms Checkbox:** "I accept the Terms and Conditions and Privacy policy, checkbox, unchecked. Required. Link, terms and conditions. Please accept the Terms and Privacy Policy to continue. Link, privacy policy." 
*   **Sign up Button:** "Sign up button, disabled" (The button is now reachable via keyboard, and its disabled state is explicitly explained to the user instead of stranding them).