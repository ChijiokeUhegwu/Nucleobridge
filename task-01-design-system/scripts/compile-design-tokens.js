/**
 * compile-design-tokens.js
 * 
 * Node.js utility script to parse a directory of exported Figma design token JSON files
 * (task-01-design-system/design-tokens) and compile them into a single, valid CSS file
 * named task-01-design-system/main-tokens.css.
 * 
 * Architectural Rules:
 * 1. ZERO PRIMITIVE EXPOSURE (CRITICAL):
 *    Primitives.Mode 1.tokens.json is parsed into memory ONLY to build a lookup map.
 *    Primitive colors (e.g., --palette-primary-40, --neutral-90) are NOT outputted
 *    or exposed as CSS variables.
 * 2. LIGHT THEME GENERATION:
 *    Color Roles.Light.tokens.json is resolved via the in-memory map and outputted
 *    as semantic CSS variables (--color-*) in :root { }.
 * 3. DARK THEME GENERATION:
 *    Color Roles.Dark.tokens.json is resolved via the in-memory map and outputted
 *    with the exact same variable names inside:
 *    @media (prefers-color-scheme: dark) { :root { ... } }
 *    and [data-theme="dark"] { ... }
 * 4. TYPOGRAPHY & EFFECTS:
 *    text.styles.tokens.json and effect.styles.tokens.json are outputted in :root,
 *    along with standard typography utility classes (.text-display-large, etc.).
 */

const fs = require('fs');
const path = require('path');

// Target paths
const TOKENS_DIR = path.resolve(__dirname, '../design-tokens');
const OUTPUT_FILE = path.resolve(__dirname, '../main-tokens.css');

/**
 * Formats 8-character hex (#rrggbbaa) to 6-char hex (#rrggbb) if alpha is 255 (ff),
 * or rgba() if alpha is semi-transparent.
 */
function formatColor(hex) {
  if (typeof hex !== 'string') return hex;
  const cleaned = hex.trim();

  if (/^#[0-9a-fA-F]{8}$/.test(cleaned)) {
    const r = parseInt(cleaned.slice(1, 3), 16);
    const g = parseInt(cleaned.slice(3, 5), 16);
    const b = parseInt(cleaned.slice(5, 7), 16);
    const a = parseInt(cleaned.slice(7, 9), 16);

    if (a === 255) {
      return `#${cleaned.slice(1, 7).toLowerCase()}`;
    }
    const alpha = Number((a / 255).toFixed(2));
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return cleaned.toLowerCase();
}

/**
 * Normalizes string to kebab-case slug
 */
function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Builds an in-memory reference map of primitive tokens from Primitives.Mode 1.tokens.json.
 * Resolves paths like:
 * - "Color_Palettes.Primary.Primary40" -> "#0f6e56"
 * - "Key_Colors.Primary_Key_Color" -> "#0f6e56"
 */
function buildPrimitiveMap(primitivesData) {
  const map = new Map();

  function traverse(obj, currentPath = []) {
    for (const [key, val] of Object.entries(obj)) {
      if (val && typeof val === 'object') {
        if ('$value' in val || 'value' in val) {
          const rawVal = val.$value !== undefined ? val.$value : val.value;
          const fullPath = [...currentPath, key].join('.');
          map.set(fullPath, rawVal);
          // Also set case-insensitive and normalized fallback
          map.set(fullPath.toLowerCase(), rawVal);
        } else {
          traverse(val, [...currentPath, key]);
        }
      }
    }
  }

  traverse(primitivesData);
  return map;
}

/**
 * Resolves reference strings like "{Color_Palettes.Primary.Primary40}" using the primitive map.
 */
function resolveColorRef(refString, primitiveMap) {
  if (typeof refString !== 'string') return refString;
  const match = refString.match(/^\{([^}]+)\}$/);
  if (!match) return refString;

  const keyPath = match[1];
  if (primitiveMap.has(keyPath)) {
    return primitiveMap.get(keyPath);
  }
  if (primitiveMap.has(keyPath.toLowerCase())) {
    return primitiveMap.get(keyPath.toLowerCase());
  }

  console.warn(`[WARN] Could not resolve primitive reference: ${refString}`);
  return refString;
}

/**
 * Main compilation process
 */
function compileDesignTokens() {
  console.log('Compiling Design Tokens to CSS...');
  console.log(`Directory:   ${TOKENS_DIR}`);
  console.log(`Output File: ${OUTPUT_FILE}`);

  // 1. Read and validate required files
  const primPath = path.join(TOKENS_DIR, 'Primitives.Mode 1.tokens.json');
  const lightPath = path.join(TOKENS_DIR, 'Color Roles.Light.tokens.json');
  const darkPath = path.join(TOKENS_DIR, 'Color Roles.Dark.tokens.json');
  const textPath = path.join(TOKENS_DIR, 'text.styles.tokens.json');
  const effectPath = path.join(TOKENS_DIR, 'effect.styles.tokens.json');

  const requiredFiles = [primPath, lightPath, darkPath, textPath, effectPath];
  for (const f of requiredFiles) {
    if (!fs.existsSync(f)) {
      console.error(`[ERROR] Required token file missing: ${f}`);
      process.exit(1);
    }
  }

  const primData = JSON.parse(fs.readFileSync(primPath, 'utf8'));
  const lightData = JSON.parse(fs.readFileSync(lightPath, 'utf8'));
  const darkData = JSON.parse(fs.readFileSync(darkPath, 'utf8'));
  const textData = JSON.parse(fs.readFileSync(textPath, 'utf8'));
  const effectData = JSON.parse(fs.readFileSync(effectPath, 'utf8'));

  // 2. Build In-Memory Primitive Map (ZERO exposure to final CSS)
  const primitiveMap = buildPrimitiveMap(primData);
  console.log(`[OK] Loaded ${primitiveMap.size} in-memory primitive tokens (strictly unexposed).`);

  const lines = [];

  lines.push('/**',
    ' * ============================================================================',
    ' * NUCLEOBRIDGE MAIN DESIGN TOKENS (main-tokens.css)',
    ' * Source Directory: task-01-design-system/design-tokens',
    ' * Compiled by: task-01-design-system/scripts/compile-design-tokens.js',
    ' * ============================================================================',
    ' *',
    ' * STRICT INTERFACE ARCHITECTURE:',
    ' *',
    ' * 1. ZERO PRIMITIVE EXPOSURE (CRITICAL):',
    ' *    - Underlying primitive palette colors (e.g. Primary 40, Neutral 90) are',
    ' *      resolved in-memory and are NOT exposed as usable CSS variables.',
    ' *    - This hard boundary ensures that primitive colors are never used directly',
    ' *      in the interface, making semantic roles the single source of truth.',
    ' *',
    ' * 2. LIGHT & DARK THEMES (AUTOMATIC & SELECTOR-BASED):',
    ' *    - Light theme semantic roles are defined in :root.',
    ' *    - Dark theme semantic roles are defined in @media (prefers-color-scheme: dark)',
    ' *      and [data-theme="dark"] using the EXACT same variable names.',
    ' *',
    ' * 3. TYPOGRAPHY & ELEVATION:',
    ' *    - DM Sans scale tokens with 1.5 line-height multiplier.',
    ' *    - Elevated drop shadows tinted with primary brand tone (#0F6E56).',
    ' * ============================================================================',
    ' */',
    ''
  );

  // 3. LIGHT THEME GENERATION (:root)
  lines.push(':root {',
    '  /* --------------------------------------------------------------------------',
    '   * 1. SEMANTIC COLOR ROLES - LIGHT THEME (DEFAULT)',
    '   * [STANDARD PRACTICE] Semantic roles are the ONLY accessible UI color tokens.',
    '   * -------------------------------------------------------------------------- */'
  );

  let lightCount = 0;
  for (const [roleName, tokenObj] of Object.entries(lightData)) {
    const rawRef = tokenObj.$value || tokenObj.value;
    const resolvedColor = resolveColorRef(rawRef, primitiveMap);
    const formatted = formatColor(resolvedColor);
    const varName = `--color-${slugify(roleName)}`;

    lines.push(`  ${varName}: ${formatted};`);
    lightCount++;

    // Add normalized alias for known typo in export if present
    if (roleName === 'On_Terrtiary_Fixed' || roleName === 'On_terrtiary_fixed') {
      lines.push(`  --color-on-tertiary-fixed: ${formatted}; /* normalized alias */`);
    }
  }
  lines.push('');

  // 4. ELEVATION / SHADOW TOKENS (:root)
  lines.push('  /* --------------------------------------------------------------------------',
    '   * 2. ELEVATION / SHADOW TOKENS',
    '   * Tinted with primary brand color (#0F6E56) for cohesive visual depth.',
    '   * -------------------------------------------------------------------------- */'
  );

  let effectCount = 0;
  for (const [shadowName, tokenObj] of Object.entries(effectData)) {
    const shadowItems = Array.isArray(tokenObj.$value) ? tokenObj.$value : [tokenObj.$value];
    const cssParts = shadowItems.map(item => {
      const col = formatColor(item.color);
      return `${item.offsetX} ${item.offsetY} ${item.blur} ${item.spread} ${col}`;
    });
    const cleanName = slugify(shadowName.replace(/\s*shadow$/i, ''));
    lines.push(`  --shadow-${cleanName}: ${cssParts.join(', ')};`);
    effectCount++;
  }
  lines.push('');

  // 5. TYPOGRAPHY TOKENS (:root)
  lines.push('  /* --------------------------------------------------------------------------',
    '   * 3. TYPOGRAPHY DESIGN TOKENS (DM SANS)',
    '   * -------------------------------------------------------------------------- */',
    "  --font-family-base: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"
  );

  let typoCount = 0;
  for (const [typoName, tokenObj] of Object.entries(textData)) {
    const val = tokenObj.$value || tokenObj.value;
    const styleSlug = slugify(typoName);

    lines.push(`  --typography-${styleSlug}-font-size: ${val.fontSize};`);
    lines.push(`  --typography-${styleSlug}-line-height: ${val.lineHeight};`);
    lines.push(`  --typography-${styleSlug}-letter-spacing: ${val.letterSpacing};`);
    lines.push(`  --typography-${styleSlug}-font-weight: ${val.fontWeight};`);
    typoCount++;
  }

  lines.push('}', '');

  // 6. DARK THEME GENERATION (@media (prefers-color-scheme: dark) and [data-theme="dark"])
  lines.push('/* ----------------------------------------------------------------------------',
    ' * 4. SEMANTIC COLOR ROLES - DARK THEME',
    ' * Evaluated using exact same variable names for seamless automated theme switching.',
    ' * ---------------------------------------------------------------------------- */',
    '@media (prefers-color-scheme: dark) {',
    '  :root {'
  );

  let darkCount = 0;
  for (const [roleName, tokenObj] of Object.entries(darkData)) {
    const rawRef = tokenObj.$value || tokenObj.value;
    const resolvedColor = resolveColorRef(rawRef, primitiveMap);
    const formatted = formatColor(resolvedColor);
    const varName = `--color-${slugify(roleName)}`;

    lines.push(`    ${varName}: ${formatted};`);
    darkCount++;

    if (roleName === 'On_Terrtiary_Fixed' || roleName === 'On_terrtiary_fixed') {
      lines.push(`    --color-on-tertiary-fixed: ${formatted}; /* normalized alias */`);
    }
  }

  lines.push('  }', '}', '');

  // Manual dark-theme class / attribute override
  lines.push('[data-theme="dark"] {');
  for (const [roleName, tokenObj] of Object.entries(darkData)) {
    const rawRef = tokenObj.$value || tokenObj.value;
    const resolvedColor = resolveColorRef(rawRef, primitiveMap);
    const formatted = formatColor(resolvedColor);
    const varName = `--color-${slugify(roleName)}`;

    lines.push(`  ${varName}: ${formatted};`);
    if (roleName === 'On_Terrtiary_Fixed' || roleName === 'On_terrtiary_fixed') {
      lines.push(`  --color-on-tertiary-fixed: ${formatted};`);
    }
  }
  lines.push('}', '');

  // 7. TYPOGRAPHY UTILITY CLASSES
  lines.push('/* ----------------------------------------------------------------------------',
    ' * 5. TYPOGRAPHY UTILITY CLASSES',
    ' * Standard semantic utility classes for interface elements.',
    ' * ---------------------------------------------------------------------------- */'
  );

  for (const [typoName] of Object.entries(textData)) {
    const styleSlug = slugify(typoName);
    lines.push(
      `.text-${styleSlug} {`,
      `  font-family: var(--font-family-base);`,
      `  font-size: var(--typography-${styleSlug}-font-size);`,
      `  line-height: var(--typography-${styleSlug}-line-height);`,
      `  letter-spacing: var(--typography-${styleSlug}-letter-spacing);`,
      `  font-weight: var(--typography-${styleSlug}-font-weight);`,
      `}`,
      ''
    );
  }

  // 8. Write Output File
  fs.writeFileSync(OUTPUT_FILE, lines.join('\n'), 'utf8');

  console.log('----------------------------------------------------');
  console.log(`Compilation successful! Target: ${OUTPUT_FILE}`);
  console.log(`- Primitives in memory:  ${primitiveMap.size} (0 exposed as CSS variables)`);
  console.log(`- Light Theme Roles:     ${lightCount} (in :root)`);
  console.log(`- Dark Theme Roles:      ${darkCount} (in @media prefers-color-scheme & [data-theme="dark"])`);
  console.log(`- Typography Scales:     ${typoCount}`);
  console.log(`- Elevation Shadows:     ${effectCount}`);
  console.log('----------------------------------------------------');
}

if (require.main === module) {
  compileDesignTokens();
}

module.exports = { compileDesignTokens };
