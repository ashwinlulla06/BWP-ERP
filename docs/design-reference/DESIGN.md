---
name: Academic Reserve System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464f'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#767680'
  outline-variant: '#c6c5d0'
  surface-tint: '#4f5c8e'
  primary: '#000f3f'
  on-primary: '#ffffff'
  primary-container: '#172554'
  on-primary-container: '#808dc2'
  inverse-primary: '#b7c4fd'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#001626'
  on-tertiary: '#ffffff'
  tertiary-container: '#002b45'
  on-tertiary-container: '#2f96db'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b7c4fd'
  on-primary-fixed: '#071747'
  on-primary-fixed-variant: '#374475'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#cce5ff'
  tertiary-fixed-dim: '#93ccff'
  on-tertiary-fixed: '#001d31'
  on-tertiary-fixed-variant: '#004b73'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  code-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system establishes a high-trust, modern institutional aesthetic tailored for university research facilities, shared labs, and campus libraries. It blends contemporary SaaS clarity with the dignified authority expected of elite higher-education infrastructure.

The visual style is **Corporate Modern with Refined Tactile Depth**:
- **Trustworthy & Authoritative**: Deep scholastic navy establishes institutional permanence and reliability.
- **Efficient & Purpose-Driven**: Dense information displays, clear status signifiers, and rapid keyboard-friendly reservation flows reduce friction for students, lab managers, and faculty.
- **Clean Structure**: Surfaces rely on stark white planes framed by crisp low-contrast borders and elevated by subtle, cool-tinted ambient shadows rather than stark flat dividers.

## Colors

The palette is anchored by deep academic tones balanced with vivid functional signifiers.

### Role Mapping
- **Primary (`#172554`)**: Scholastic Navy. Used for structural hierarchy, primary headings, top-level navigation, and master action triggers.
- **Secondary (`#2563EB`)**: Cobalt Blue. Applied to active states, focused form rings, actionable links, primary buttons, and selected calendar ranges.
- **Tertiary (`#0284C7`)**: Cyan Slate. Employed for secondary analytics accents, auxiliary informational callouts, and subtle instructional highlights.
- **Neutral (`#64748B`)**: Cool Slate. Governs supportive metadata, secondary labels, disabled element styling, and grid divider baselines.

### Canvas & Surface Tones
- **Background (`#F8FAFC`)**: Canvas base providing cool, glare-free optical contrast.
- **Surface (`#FFFFFF`)**: Pure white containers, data tables, modal layers, and inventory cards.
- **Border Stroke (`#E2E8F0`)**: Hairline containment for cards, input bounds, and structural panels.

### Semantic Status Tokens
- **Available (`#16A34A`)**: Equipment ready for checkout, vacant room slots, instant approval flags.
- **Booked / Unavailable (`#DC2626`)**: Active loans, reserved lab benches, overdue returns, hard maintenance blocks.
- **Pending / In Review (`#D97706`)**: Faculty approval required, hold queues, conditional safety clearance checks.

## Typography

The typography couples the humanized geometry of Plus Jakarta Sans for structural navigation and landmark headings with the neutral clarity of Inter for dense booking timetables, metadata strings, and operational forms.

### Editorial Guidelines
- **Headings (`Plus Jakarta Sans`)**: Use tight letter-spacing (`-0.01em` to `-0.02em`) with semi-bold (600) and bold (700) weights to present an orderly, institutional appearance.
- **Body & Data (`Inter`)**: Use standard line heights to sustain readability within multi-column catalog listings, checkout checklists, and condition reports.
- **Labels & Microcopy**: Render status badges, metadata keys, and shelf tags with `label-sm` or `label-md` using uppercase or sentence case with relaxed tracking for scannability.

## Layout & Spacing

The layout is built on a responsive 12-column fluid grid system paired with a persistent, collapsible sidebar shell.

### Grid & Breakpoints
- **Desktop (≥ 1280px)**: 12 columns, `1.5rem` gutters, `2rem` outer canvas margin. Includes a fixed 260px left sidebar for campus hub navigation.
- **Tablet (768px – 1279px)**: 8 columns, `1.5rem` gutters, `1.5rem` outer canvas margin. Sidebar collapses into a compact icon rail (72px) or sliding off-canvas sheet.
- **Mobile (< 768px)**: 4 columns, `1rem` gutters, `1rem` outer canvas margin. Sidebar transforms into a persistent bottom navigation bar or top application header menu.

### Vertical Rhythm
- Keep inventory and calendar items aligned to strict 4px/8px baselines.
- Card padding remains compact (`space-md` or `space-lg`) to maximize viewport density for long equipment inventories.

## Elevation & Depth

Visual hierarchy uses cool-toned ambient shadows and clean boundary lines to prevent elements from blending into the canvas.

### Depth Hierarchy
- **Level 0 (Canvas Base)**: `#F8FAFC`. Base backdrop for all portal routes.
- **Level 1 (Card & Content Surface)**: Pure `#FFFFFF` resting over `#F8FAFC`, framed by a solid `1px` border in `#E2E8F0` and an ultra-soft ambient shadow: `box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.03)`.
- **Level 2 (Hover & Active Interactive Cards)**: Elevated during cursor focus or item selection. Border sharpens slightly (`#CBD5E1`) with lifted shadow: `box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.06), 0 4px 6px -4px rgba(15, 23, 42, 0.03)`.
- **Level 3 (Sticky Menus & Dropdowns)**: Fixed top filter bars, comboboxes, and calendar time pickers: `box-shadow: 0 12px 24px -4px rgba(15, 23, 42, 0.08), 0 4px 8px -2px rgba(15, 23, 42, 0.04)`.
- **Level 4 (Modals & Reservation Drawers)**: Heavy focus overlay with backdrop blur: `backdrop-filter: blur(4px); background-color: rgba(15, 23, 42, 0.45); box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25)`.

## Shapes

The design system uses a balanced rounded geometry (`roundedness: 2` base) that merges software precision with inviting warmth.

### Token Scaling
- **Standard Base (`0.5rem` / 8px)**: Input fields, dropdown triggers, list row items, secondary buttons.
- **Large Surfaces (`1rem` / 16px)**: Equipment cards, library rack panels, resource summary boards, interactive modals.
- **Extra Large Layers (`1.5rem` / 24px)**: Outer dashboard layout containers and feature callouts.
- **Full Radius (Pill / 9999px)**: Status badges, counter chips, avatar frames, filter tags, and primary action triggers.

## Components

### Buttons
- **Primary**: Solid Deep Navy (`#172554`) or Cobalt Blue (`#2563EB`) fill, text in white (`#FFFFFF`), bold weight. Border radius `8px` or full pill (`9999px`) for quick-book CTAs. Focus ring: `3px` offset with `#2563EB33`.
- **Secondary**: Pure white fill with `1px` border in `#E2E8F0`, text in `#172554`. Hover shifts background to `#F8FAFC`.
- **Destructive**: White background with `#DC2626` text and border for cancellation; filled `#DC2626` for confirmed returns/deletions.

### Status Badges & Chips
- Crisp, low-profile pill components (`padding: 2px 10px`, radius `9999px`, font `label-sm`).
- **Available**: Background `#DCFCE7`, text `#15803D`, border `#BBF7D0`. Optional 6px solid green status dot prefix.
- **Booked**: Background `#FEE2E2`, text `#B91C1C`, border `#FECACA`.
- **Pending**: Background `#FEF3C7`, text `#B45309`, border `#FDE68A`.

### Inventory & Resource Cards
- Formed with pure white background, `16px` border-radius (`rounded-lg`), bounded by `1px` stroke `#E2E8F0`.
- Includes a top visual preview (book jacket or lab apparatus photo), asset tag code (`code-sm`), item title (`headline-sm`), location anchor (building/room number), and persistent bottom status strip with dynamic action buttons.

### Form Inputs & Search Fields
- Height `40px` (standard) or `48px` (primary search), `8px` corner radius, `1px` border in `#CBD5E1`.
- Clean white background transitioning to `#FFFFFF` with `2px` ring in `#2563EB` and border `#2563EB` on focus.
- Prefix slots reserved for search glass, barcode icons, or date-picker glyphs.

### Selection Controls (Checkboxes & Radios)
- Custom square (`6px` radius for checkbox) and circular (radio) controls in `18px` diameter.
- Unchecked: `1.5px` border in `#94A3B8`.
- Checked: `#2563EB` background with white check or centered indicator dot.

### Sticky Sidebar Navigation
- Docked permanently to viewport left on desktop screens with light border right (`1px` `#E2E8F0`).
- Background: `#FFFFFF` or subtle `#F8FAFC`.
- Nav links display clear icon pairings: inactive items use `#64748B`, while active states feature `#2563EB` text, `#EFF6FF` background pill, and an indicator accent line.

### Reservation Timeline & Slot Pickers
- Hour-by-hour slot matrix showing real-time lab station capacity.
- Available slots render as dashed bordered blocks in `#E2E8F0`; booked slots render as muted `#F1F5F9` stripes; user-selected slots fill with `#2563EB` and white typography.