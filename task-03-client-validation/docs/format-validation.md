# format-validation.md

**Real-Time Format Enforcement: Registration vs. Login**
Real-time format validation (checking the string-at-domain shape as the user types) is enforced on the registration form. When collecting data for the first time, immediate friction is necessary to ensure clean data entry and prevent typos before the user commits. Conversely, real-time validation is disabled on the login form and only checked upon submission. Returning users already have an account, and aggressively throwing red error messages while they are midway through typing their familiar email address is a jarring and irritating user experience. 

**Why Checking Email Existence is Pointless**
Checking if an email merely exists does not prove that the person filling out the form actually owns or controls that inbox. Furthermore, confirming an email's existence in real-time creates a severe security vulnerability by allowing malicious actors to harvest and verify target lists for credential stuffing.