/**
 * convert-tokens.js
 * 
 * Converts the NucleoBridge Design System source of truth (tokens-complete.json)
 * into production-ready CSS custom properties (variables) and typography utilities.
 * 
 * Architectural Rules:
 * 1. Primitive tokens (--palette-*, --key-color-*) define the raw tonal scales.
 *    Primitives MUST NEVER be used directly in UI components.
 * 2. Color roles (--color-*) map semantic roles to primitives via var(--palette-*).
 *    Color roles ARE THE ONLY color tokens that should be used directly in the UI.
 * 3. Typography and Elevation tokens provide consistent layout and rhythm.
 * 
 * Usage:
 *   node task-01-design-system/scripts/convert-tokens.js
 *   node task-01-design-system/scripts/convert-tokens.js --input <path> --output <path>
 */

const fs = require('fs');
const path = require('path');

// Default paths
const DEFAULT_INPUT_PATH = path.resolve(__dirname, '../evidence/tokens-complete.json');
const DEFAULT_OUTPUT_PATH = path.resolve(__dirname, '../tokens.css');

/**
 * Parses command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  let inputPath = DEFAULT_INPUT_PATH;
  let outputPath = DEFAULT_OUTPUT_PATH;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' || args[i] === '-i') {
      inputPath = path.resolve(process.cwd(), args[++i]);
    } else if (args[i] === '--output' || args[i] === '-o') {
      outputPath = path.resolve(process.cwd(), args[++i]);
    }
  }

  return { inputPath, outputPath };
}

/**
 * Formats 8-character hex (#rrggbbaa) to 6-char hex (#rrggbb) if alpha is ff,
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
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '');
}

/**
 * Converts a reference token path like "{primitives.color palettes.primary.primary80}"
 * to its corresponding CSS variable name "--palette-primary-80".
 */
function resolveReferenceToVar(refString) {
  if (typeof refString !== 'string') return refString;
  const match = refString.match(/^\{primitives\.color palettes\.([^.]+)\.([^}]+)\}$/);
  if (!match) return refString;

  const rawPalette = match[1]; // e.g. "neutral variant", "primary"
  const rawToken = match[2];   // e.g. "neutral variant30", "primary80", "error"

  const paletteSlug = slugify(rawPalette);

  // Extract numeric tone if present (e.g. primary80 -> 80, neutral4 -> 4)
  const toneMatch = rawToken.match(/\d+$/);
  if (toneMatch) {
    const tone = toneMatch[0];
    return `var(--palette-${paletteSlug}-${tone})`;
  }

  // Handle zero/base tokens like "error" (tone 0)
  if (rawToken === 'error') {
    return `var(--palette-error-0)`;
  }

  return `var(--palette-${paletteSlug}-${slugify(rawToken)})`;
}

/**
 * Core conversion logic
 */
function convertTokens(tokensData) {
  const lines = [];

  lines.push('/**',
    ' * ============================================================================',
    ' * NUCLEOBRIDGE DESIGN SYSTEM TOKENS',
    ' * Auto-generated from: task-01-design-system/evidence/tokens-complete.json',
    ' * Source of Truth: Figma Design Tokens Export',
    ' * ============================================================================',
    ' *',
    ' * ARCHITECTURAL GUIDELINES:',
    ' *',
    ' * 1. PRIMITIVE PALETTES (--palette-*, --key-color-*):',
    ' *    - Foundational tonal swatches and raw values.',
    ' *    - [CRITICAL] DO NOT USE PRIMITIVE TOKENS DIRECTLY IN UI COMPONENTS.',
    ' *    - Primitives exist solely as the reference foundation for semantic roles.',
    ' *',
    ' * 2. SEMANTIC COLOR ROLES (--color-*):',
    ' *    - Contextual, purpose-driven UI mappings referencing primitives.',
    ' *    - [REQUIRED] ALWAYS USE COLOR ROLES FOR ALL UI IMPLEMENTATION WORK.',
    ' *    - UI components must strictly consume these roles (e.g., var(--color-surface),',
    ' *      var(--color-primary), var(--color-on-primary), var(--color-outline)).',
    ' *',
    ' * 3. TYPOGRAPHY & ELEVATION:',
    ' *    - DM Sans scale tokens with 1.5 line-height multiplier.',
    ' *    - Elevated drop shadows tinted with primary brand tone (#0F6E56).',
    ' * ============================================================================',
    ' */',
    '',
    ':root {'
  );

  let primitiveCount = 0;
  let roleCount = 0;
  let typographyCount = 0;
  let effectCount = 0;

  // 1. Primitive Key Colors
  if (tokensData.primitives && tokensData.primitives['key colors']) {
    lines.push('  /* --------------------------------------------------------------------------',
      '   * 1. PRIMITIVE TOKENS - KEY COLORS (INTERNAL REFERENCE ONLY)',
      '   * DO NOT USE DIRECTLY IN UI COMPONENTS',
      '   * -------------------------------------------------------------------------- */'
    );

    const keyColors = tokensData.primitives['key colors'];
    for (const [keyName, token] of Object.entries(keyColors)) {
      const cleanKey = keyName.replace(/\s*key color$/i, '');
      const varName = `--key-color-${slugify(cleanKey)}`;
      const val = formatColor(token.value);
      lines.push(`  ${varName}: ${val};`);
      primitiveCount++;
    }
    lines.push('');
  }

  // 2. Primitive Tonal Palettes
  if (tokensData.primitives && tokensData.primitives['color palettes']) {
    lines.push('  /* --------------------------------------------------------------------------',
      '   * 2. PRIMITIVE TOKENS - TONAL PALETTES (INTERNAL REFERENCE ONLY)',
      '   * DO NOT USE DIRECTLY IN UI COMPONENTS',
      '   * -------------------------------------------------------------------------- */'
    );

    const palettes = tokensData.primitives['color palettes'];
    for (const [paletteName, tones] of Object.entries(palettes)) {
      const paletteSlug = slugify(paletteName);
      lines.push(`  /* Palette: ${paletteName} */`);

      for (const [toneName, token] of Object.entries(tones)) {
        let toneSuffix = '';
        const toneMatch = toneName.match(/\d+$/);

        if (toneMatch) {
          toneSuffix = toneMatch[0];
        } else if (toneName === 'error') {
          toneSuffix = '0'; // error tone 0 (#000000)
        } else {
          toneSuffix = slugify(toneName);
        }

        const varName = `--palette-${paletteSlug}-${toneSuffix}`;
        const val = formatColor(token.value);
        lines.push(`  ${varName}: ${val};`);
        primitiveCount++;
      }
      lines.push('');
    }
  }

  // 3. Semantic Color Roles (The only colors allowed on the UI)
  if (tokensData['color roles']) {
    lines.push('  /* --------------------------------------------------------------------------',
      '   * 3. SEMANTIC COLOR ROLES (PRIMARY UI LAYER)',
      '   * [STANDARD PRACTICE] THESE ARE THE ONLY COLOR TOKENS ALLOWED ON THE UI.',
      '   * Use these semantic variables directly in components (e.g., buttons, cards,',
      '   * headers, modals, code editors, and terminals).',
      '   * -------------------------------------------------------------------------- */'
    );

    const roles = tokensData['color roles'];
    for (const [roleName, token] of Object.entries(roles)) {
      const roleSlug = slugify(roleName);
      const varName = `--color-${roleSlug}`;
      const resolvedVal = resolveReferenceToVar(token.value);
      lines.push(`  ${varName}: ${resolvedVal};`);
      roleCount++;

      // Helpful typo alias if present in source Figma export (e.g. "on terrtiary fixed")
      if (roleName === 'on terrtiary fixed') {
        lines.push(`  --color-on-tertiary-fixed: ${resolvedVal}; /* normalized alias */`);
      }
    }
    lines.push('');
  }

  // 4. Elevation / Shadow Tokens
  if (tokensData.effect) {
    lines.push('  /* --------------------------------------------------------------------------',
      '   * 4. ELEVATION / SHADOW TOKENS',
      '   * Tinted with primary brand color (#0F6E56) for cohesive visual depth.',
      '   * -------------------------------------------------------------------------- */'
    );

    const effects = tokensData.effect;
    for (const [effectName, token] of Object.entries(effects)) {
      const val = token.value;
      const shadowColor = formatColor(val.color);
      const cleanName = slugify(effectName.replace(/\s*shadow$/i, ''));
      const shadowCss = `${val.offsetX}px ${val.offsetY}px ${val.radius}px ${val.spread}px ${shadowColor}`;
      lines.push(`  --shadow-${cleanName}: ${shadowCss};`);
      effectCount++;
    }
    lines.push('');
  }

  // 5. Typography Tokens
  if (tokensData.typography) {
    lines.push('  /* --------------------------------------------------------------------------',
      '   * 5. TYPOGRAPHY DESIGN TOKENS',
      '   * Font: DM Sans, consistent 1.5 line-height multiplier.',
      '   * -------------------------------------------------------------------------- */',
      "  --font-family-base: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"
    );

    const typos = tokensData.typography;
    for (const [styleName, token] of Object.entries(typos)) {
      const styleSlug = slugify(styleName);
      const fontSize = token.fontSize.value;
      const lineHeight = token.lineHeight.value;
      const letterSpacing = token.letterSpacing.value;
      const fontWeight = token.fontWeight.value;

      lines.push(`  --typography-${styleSlug}-font-size: ${fontSize}px;`);
      lines.push(`  --typography-${styleSlug}-line-height: ${lineHeight}px;`);
      lines.push(`  --typography-${styleSlug}-letter-spacing: ${letterSpacing}px;`);
      lines.push(`  --typography-${styleSlug}-font-weight: ${fontWeight};`);
      typographyCount++;
    }
  }

  lines.push('}', '');

  // 6. Typography Utility Classes
  if (tokensData.typography) {
    lines.push('/* ----------------------------------------------------------------------------',
      ' * 6. TYPOGRAPHY UTILITY CLASSES',
      ' * Ready-to-use semantic classes matching the 15 type scale roles.',
      ' * ---------------------------------------------------------------------------- */'
    );

    const typos = tokensData.typography;
    for (const [styleName] of Object.entries(typos)) {
      const styleSlug = slugify(styleName);
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
  }

  return {
    css: lines.join('\n'),
    stats: {
      primitiveCount,
      roleCount,
      typographyCount,
      effectCount
    }
  };
}

/**
 * Main execution
 */
function main() {
  const { inputPath, outputPath } = parseArgs();

  console.log('NucleoBridge Design System Token Converter');
  console.log('----------------------------------------------------');
  console.log(`Input Source of Truth: ${inputPath}`);
  console.log(`Output CSS Target:     ${outputPath}`);

  if (!fs.existsSync(inputPath)) {
    console.error(`[ERROR] Token file not found at: ${inputPath}`);
    process.exit(1);
  }

  try {
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const tokensData = JSON.parse(rawData);

    const { css, stats } = convertTokens(tokensData);

    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, css, 'utf8');

    console.log('----------------------------------------------------');
    console.log('Conversion completed successfully!');
    console.log(`- Primitives generated:  ${stats.primitiveCount} (Reference layer - not for UI)`);
    console.log(`- Semantic Color Roles:  ${stats.roleCount} (Direct UI application layer)`);
    console.log(`- Typography Styles:     ${stats.typographyCount} (Sizes, line-heights, weights)`);
    console.log(`- Shadow/Elevation:      ${stats.effectCount} (Soft, medium, hard shadows)`);
    console.log(`- Output File:           ${outputPath}`);
    console.log('----------------------------------------------------');
  } catch (err) {
    console.error('[ERROR] Failed to convert tokens:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  convertTokens,
  resolveReferenceToVar,
  formatColor,
  slugify
};
