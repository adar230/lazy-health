---
name: Serene Health
colors:
  surface: '#f8faf9'
  surface-dim: '#d8dada'
  surface-bright: '#f8faf9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f3'
  surface-container: '#eceeed'
  surface-container-high: '#e6e9e8'
  surface-container-highest: '#e1e3e2'
  on-surface: '#191c1c'
  on-surface-variant: '#404944'
  inverse-surface: '#2e3131'
  inverse-on-surface: '#eff1f0'
  outline: '#717974'
  outline-variant: '#c0c9c3'
  surface-tint: '#376755'
  primary: '#376755'
  on-primary: '#ffffff'
  primary-container: '#7eb09b'
  on-primary-container: '#0f4333'
  inverse-primary: '#9ed1bb'
  secondary: '#206867'
  on-secondary: '#ffffff'
  secondary-container: '#a8ece9'
  on-secondary-container: '#266d6b'
  tertiary: '#56605f'
  on-tertiary: '#ffffff'
  tertiary-container: '#9da8a6'
  on-tertiary-container: '#333d3c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#baeed7'
  primary-fixed-dim: '#9ed1bb'
  on-primary-fixed: '#002116'
  on-primary-fixed-variant: '#1e4f3e'
  secondary-fixed: '#abefec'
  secondary-fixed-dim: '#8fd2d0'
  on-secondary-fixed: '#00201f'
  on-secondary-fixed-variant: '#00504e'
  tertiary-fixed: '#dae5e3'
  tertiary-fixed-dim: '#bec9c7'
  on-tertiary-fixed: '#141d1d'
  on-tertiary-fixed-variant: '#3e4948'
  background: '#f8faf9'
  on-background: '#191c1c'
  surface-variant: '#e1e3e2'
typography:
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  margin: 24px
  gutter: 16px
---

## Brand & Style

The design system is rooted in **Minimalism** with a focus on emotional wellness and cognitive ease. The goal is to transform health tracking from a chore into a restorative practice. By utilizing expansive whitespace and a restrained palette, the interface reduces "data anxiety," providing a non-judgmental environment for self-reflection.

The visual language emphasizes "breathing room," ensuring that no single screen feels cluttered or urgent. The tone is encouraging and soft, moving away from the aggressive performance metrics often found in fitness apps toward a holistic sense of well-being.

## Colors

The palette is inspired by nature, specifically botanical and aquatic tones that promote lowering the heart rate. 

- **Sage Green (#7EB09B)**: The primary brand color, used for success states, primary actions, and progress indicators.
- **Teal (#4D908E)**: Used for high-emphasis interactive elements and deep-focus data points.
- **Mint (#E8F3F1)**: The foundational surface color for containers and secondary backgrounds, providing a soft alternative to pure white.
- **Soft Neutrals**: A range of off-whites and warm greys used for typography and backgrounds to prevent harsh contrast and eye strain.

## Typography

This design system utilizes **Manrope** for its balanced, modern, and highly legible characteristics. It bridges the gap between a geometric sans-serif and a functional grotesque, making it feel both precise and human.

The type hierarchy prioritizes vertical rhythm and ample line height (1.6 for body text) to ensure information is easily digestible. Headlines use a slightly tighter letter spacing and heavier weight to provide clear anchoring points for the eye without appearing aggressive.

## Layout & Spacing

The design system employs a **Fluid Grid** with generous margins to enforce the "breathing room" philosophy. 

- **Internal Padding**: Cards and containers should never use less than 24px (md) internal padding to maintain a premium, airy feel.
- **Section Spacing**: Large vertical gaps (40px to 64px) are used to separate distinct content blocks, preventing the user from feeling overwhelmed by too much data at once.
- **Safe Areas**: Mobile layouts should respect a 24px side margin to ensure content is comfortably framed within the device hardware.

## Elevation & Depth

Depth is conveyed through **Tonal Layers** and **Ambient Shadows** rather than harsh borders. 

- **Surface Strategy**: The base background is the soft neutral. Primary cards use pure white (#FFFFFF) to lift off the page.
- **Shadow Profile**: Shadows are extremely diffused, using the Sage or Teal primary colors at very low opacities (4-8%) instead of pure black. This creates a "glow" effect that feels organic rather than digital.
- **Layering**: High-priority interactive elements (like a Floating Action Button) use a slightly deeper shadow to indicate they sit atop the visual stack, while secondary cards may use only a subtle 1px border in a slightly darker mint tone.

## Shapes

The shape language is defined by significant **Roundedness**. 

- **Cards**: A signature 24px radius is applied to all main content containers, creating a soft, approachable container for data.
- **Interactive Elements**: Buttons and inputs use a slightly tighter but still significant radius (12px-16px) to maintain a cohesive "soft-touch" aesthetic.
- **Progress Bars**: These should always feature fully rounded (pill-shaped) end caps to reinforce the non-linear, gentle nature of health tracking.

## Components

- **Buttons**: Primary buttons are solid Sage Green with white text. Secondary buttons use the Mint background with Teal text. All buttons should have ample internal horizontal padding (min 32px).
- **Cards**: The cornerstone of the design system. Cards must have a 24px corner radius and a subtle ambient shadow. Use Sage Green for "Success" or "Complete" states.
- **Chips/Tags**: Small, pill-shaped elements used for categorization. Use low-contrast background fills (Mint) with darker Teal text to keep them subtle.
- **Input Fields**: Use a soft Mint fill with no border in the default state. Upon focus, transition to a subtle Sage Green border.
- **Progress Rings**: Use soft, rounded stroke caps. The "track" of the progress bar should be a very faint version of the "fill" color to show the path remaining without creating high-contrast visual noise.
- **Empty States**: Use oversized illustrations in Sage/Mint tones with encouraging, low-pressure microcopy.