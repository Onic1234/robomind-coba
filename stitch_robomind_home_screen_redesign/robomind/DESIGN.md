---
name: RoboMind
colors:
  surface: '#fbf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#fbf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ef'
  surface-container: '#efeeea'
  surface-container-high: '#eae8e4'
  surface-container-highest: '#e4e2de'
  on-surface: '#1b1c1a'
  on-surface-variant: '#434656'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f0ed'
  outline: '#737688'
  outline-variant: '#c3c5d9'
  surface-tint: '#004ee8'
  primary: '#0047d3'
  on-primary: '#ffffff'
  primary-container: '#1e5eff'
  on-primary-container: '#f0f0ff'
  inverse-primary: '#b6c4ff'
  secondary: '#ae3115'
  on-secondary: '#ffffff'
  secondary-container: '#fd6a49'
  on-secondary-container: '#640f00'
  tertiary: '#705d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c9a900'
  on-tertiary-container: '#4c3f00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#001550'
  on-primary-fixed-variant: '#003ab2'
  secondary-fixed: '#ffdad2'
  secondary-fixed-dim: '#ffb4a3'
  on-secondary-fixed: '#3d0600'
  on-secondary-fixed-variant: '#8c1900'
  tertiary-fixed: '#ffe16d'
  tertiary-fixed-dim: '#e9c400'
  on-tertiary-fixed: '#221b00'
  on-tertiary-fixed-variant: '#544600'
  background: '#fbf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2de'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 38px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
  body-lg:
    fontFamily: Quicksand
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-md:
    fontFamily: Quicksand
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  stats-label:
    fontFamily: Quicksand
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 38px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 20px
  margin-mobile: 16px
  margin-desktop: 40px
  tile-gap: 12px
---

## Brand & Style

The design system is built around a "Storybook Sci-Fi" narrative, blending the wonder of space exploration with the tactile warmth of physical toys. The target audience is children aged 6–9, requiring an interface that feels responsive, sturdy, and high-energy.

The visual style is **Tactile / Skeuomorphic**, utilizing "claymation" physics where elements appear to have physical weight. Every interaction should feel like pressing a real button or moving a physical tile. Avoid flat, sterile corporate aesthetics in favor of chunky, expressive forms that suggest a "living" playground.

**Key Stylistic Pillars:**
- **Chunky Geometries:** Thick strokes and generous padding to accommodate motor skills.
- **Physical Feedback:** Elements use "pressed" states that physically shift downward (3D translation) rather than just changing color.
- **Asymmetry:** Playful, non-standard layouts that mimic a hand-drawn storybook grid.

## Colors

The palette uses a warm, parchment-like base (#FDFBF7) to reduce eye strain and provide a "paper" quality to the digital space.

- **Deep Cobalt (#1E5EFF):** Used for primary actions and "Hero" mechanical elements.
- **Coral-Orange (#FF6B4A):** Used for alerts, energy meters, and high-priority interactions.
- **Currencies & Accents:** Gold (#FFD700), Emerald, and Amethyst are reserved strictly for rewards and collectible items to maintain their perceived value.
- **Progress Mint:** A soft, calming teal used for path-finding and completed states to provide a sense of achievement without visual fatigue.

## Typography

Typography prioritizes extreme legibility and a friendly, rounded personality. 

**Display Type:** Plus Jakarta Sans is used in its heaviest weights (ExtraBold/Bold) for all headers to mimic the "Fredoka" feel while maintaining better structure. These should appear slightly "oversized" to dominate the layout.

**Body & Data:** Quicksand is used for all instructional text and statistics. Its rounded terminals mirror the UI shapes, ensuring the interface feels cohesive and non-threatening. For accessibility, never use a font weight below 500 for body text.

## Layout & Spacing

This design system rejects rigid, symmetrical grids in favor of an **Asymmetric Fluid Grid**. 

- **The Play Zone:** Main content areas use a 4-column layout on mobile and an 8-column layout on desktop. 
- **Tappable Tiles:** Elements are intentionally sized differently—some occupy 1.5 columns, others 2—creating a "bento box" effect that feels curated rather than generated.
- **Safe Zones:** All primary interaction points (buttons/tiles) must have a minimum height of 56px to accommodate younger users' precision levels.
- **Rhythm:** Use an 8px base unit, but apply "jiggle" (randomized +/- 4px offsets) to decorative background elements to enhance the storybook feel.

## Elevation & Depth

Depth is conveyed through **Hard-Edge Extrusions** rather than soft blurs.

- **The 3D "Push":** Instead of shadows, components use a solid 4px to 8px bottom border (tinted 20% darker than the surface color) to simulate a physical side-profile.
- **Active States:** When pressed, the element translates Y-axis +4px and the bottom border disappears, giving the sensation of the button being physically depressed into the "clay."
- **Layering:** Backgrounds use subtle "inner-pressed" wells (inset shadows) to show where a tile belongs, while active tiles sit "atop" the surface.

## Shapes

The shape language is "Squishy-Geometric." 

- **Standard Radius:** 16px (1rem) for all interactive tiles and buttons.
- **Large Radius:** 24px (1.5rem) for main container areas.
- **Circular Badges:** Profile avatars and progress trackers are always perfect circles, often encased in a "porthole" style frame with a thick 4px stroke.
- **Variable Strokes:** Use thick, visible outlines (3pt+) on all interactive elements to define their boundaries against the cream background.

## Components

**Tactile Buttons**
Buttons must feature a primary color face and a darker "extruded" bottom edge. Labels are centered in Bold caps. No ghost buttons; every action must feel substantial.

**Interactive Learning Tiles**
Variable-sized cards with a solid 2px border. Instead of shadows, tiles use "sticker-peel" corners or slight rotations (2-3 degrees) to appear as if they were placed by hand.

**Circular ID Badges**
User avatars are nested inside circular frames. The frame serves as a dual-purpose progress ring, filling with **Progress Mint** as the user completes tasks.

**Chunky Input Fields**
Fields are recessed (inset shadow) into the background. The caret and focus state should use the **Secondary Coral-Orange** to provide a high-contrast visual cue for the active typing area.

**Progress Trackers**
Use "Nodes and Path" styling. Completed nodes are bright Emerald circles; current nodes are Cobalt with a pulsing animation; upcoming nodes are dotted outlines.