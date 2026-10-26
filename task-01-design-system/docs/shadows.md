# Shadow System

## Overview

The shadow system contains three levels: Soft, Medium, and Hard. Each level defines horizontal offset, vertical offset, blur, spread, and opacity.

Shadows use the **primary colour (0F6E56)** rather than black. This keeps elevation effects aligned with the product's colour system and creates a more cohesive visual appearance.

## Shadow Tokens

| Property | Soft | Medium | Hard |
|---|---:|---:|---:|
| X offset | 1.5 px | 4 px | 6 px |
| Y offset | 6 px | 6 px | 10 px |
| Blur | 30 px | 24 px | 20 px |
| Spread | 0 px | 0 px | 0 px |
| Opacity | 12% | 18% | 20% |

## Intended Use

### Soft Shadow
The soft shadow uses a wide blur and low opacity to create subtle separation from the background. It is intended for elements that need gentle visual elevation without drawing too much attention.

### Medium Shadow
The medium shadow increases opacity and horizontal offset to make an element appear more elevated. It is intended for components that require clearer separation from surrounding content.

### Hard Shadow
The hard shadow uses the greatest offsets and highest opacity, with a smaller blur. It creates the strongest sense of elevation and should be reserved for elements that need more visual prominence.
