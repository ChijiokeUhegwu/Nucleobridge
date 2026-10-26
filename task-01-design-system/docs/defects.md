# Missing Color Variables

I realized the colour variables were missing when inspecting `tokens-incomplete.json` and noticing that the generated JSON payload completely lacked the expected colour objects, containing only the typography and effects. So, I exported the Figma file again as JSON using the Design Tokens plugin and the `tokens-complete.json` file which contained the colour variables was saved.

# Missing Dark and Light Mode Palette Variables

I realized the Light and Dark mode semantic palettes were missing when inspecting the generated CSS payload and noticing that all variables were dumped into a single `:root` block. The output only reflected the Dark theme values, rather than providing the necessary structure for theme switching. The root cause was that the original Figma export plugin failed to explicitly capture both variable modes simultaneously, defaulting to a single JSON output of the active canvas theme.

To resolve this and establish a robust, scalable token architecture, I made the following deliberate decisions:

* **Switching Export Plugins for Explicit Mode Separation:** Rather than forcing a single JSON file to manage nested mode structures, I switched to the Design Tokens Manager plugin. This allowed me to export the themes as explicitly separated flat files, specifically `Color Roles.Light.tokens.json` and `Color Roles.Dark.tokens.json`. This flat structure greatly simplifies the Node.js parsing logic and reduces the risk of script failures.

* **Enforcing Zero Primitive Exposure:** When writing the updated conversion script, I configured it to parse the primitive values (from `Primitives.Mode 1.tokens.json`) into memory strictly to resolve the semantic roles. I explicitly prevented the script from outputting these raw primitive variables (e.g., `--palette-primary-40`) into the final `tokens.css`. This hard boundary ensures that the interface components can only consume semantic roles, preventing developers from bypassing the system and hardcoding static palette colors.

* **Native CSS Theme Integration:** I architected the final generation script to map the `Color Roles.Light.tokens.json` output to a standard `:root { }` block, and the `Color Roles.Dark.tokens.json` output to a `@media (prefers-color-scheme: dark)` block. This ensures components use identical semantic variable names (e.g., `--color-surface`) while the browser natively handles the mode swap based on user system preferences.