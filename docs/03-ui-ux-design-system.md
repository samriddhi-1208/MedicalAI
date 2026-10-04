# 🎨 MedGuardian AI — UI/UX Design System Specification

The MedGuardian AI user interface is engineered as an accessible, calm, trustworthy healthcare SaaS application. It avoids flashy neon gradients, aggressive animations, or generic AI styling in favor of clear typography, subtle borders, high contrast, and accessible medical status indicators.

---

## 1. Color Palette Tokens

The design system implements **six core color tokens** defined via CSS custom properties in `src/styles/index.css`. The application dynamically switches tokens when `.dark` is added to the root document element.

### Light & Dark Token Mapping

| Token Name | Light Mode Hex | Dark Mode Hex | Semantic Role |
| :--- | :--- | :--- | :--- |
| `--color-primary` | `#5B648F` *(muted lavender)* | `#AAB4E8` *(light lavender)* | Primary brand color, headers, primary buttons, active nav pills |
| `--color-secondary` | `#DADCEC` *(soft lavender)* | `#292D40` *(deep blue-charcoal)* | Subtle container fills, secondary interactive accents |
| `--color-accent` | `#B8D9CF` *(sage green)* | `#8BC7B5` *(muted sage green)* | Positive highlights, badges, icons, selective emphasis |
| `--bg-primary` | `#F8F9FA` *(clean off-white)* | `#12141D` *(deep charcoal)* | Main application canvas background |
| `--bg-surface` | `#FFFFFF` *(pure white)* | `#1C1F2E` *(surface charcoal)* | Cards, modals, sidebars, headers, form panels |
| `--bg-surface-subtle`| `#F1F3F9` *(soft tint)* | `#25293C` *(elevated tint)* | Table headers, chip backgrounds, disabled states |
| `--text-main` | `#1E202B` *(dark charcoal)* | `#F1F3F9` *(off-white)* | Primary high-contrast text and headings |
| `--text-muted` | `#525866` *(slate gray)* | `#949DB3` *(slate silver)* | Subtitles, secondary descriptions, metadata |
| `--text-subtle` | `#717784` *(muted gray)* | `#70788C` *(dim gray)* | Timestamps, icon labels, fine print |
| `--border-color` | `#E2E4ED` *(soft slate)* | `#2E3346` *(dark slate)* | Card outlines, input borders, divider rules |

### ⚠️ Accessible Medical Status & Alert Tokens
Crucially, medical indicators are decoupled from general branding to ensure international safety compliance. Alerts **never rely on color alone**; they always pair colors with explicit symbols and text:

| Status Flag | Symbol | Light Colors | Dark Colors | Applied Scenario |
| :--- | :---: | :--- | :--- | :--- |
| **Normal / Verified** | `✓` | Text: `#15803D`<br>Bg: `#DCFCE7` | Text: `#4ADE80`<br>Bg: `#143324` | In-range biomarkers, logged meds, verified reports |
| **Warning / Elevated** | `▲` | Text: `#B45309`<br>Bg: `#FEF3C7` | Text: `#FBBF24`<br>Bg: `#3D2912` | Elevated lab results, refill warnings ($\le 5$ pills) |
| **Critical / Danger** | `🚨` | Text: `#B91C1C`<br>Bg: `#FEE2E2` | Text: `#F87171`<br>Bg: `#3D1919` | Critical lab values, 1-Tap SOS, 108 ambulance hotline |
| **Informational** | `ℹ` | Text: `#1D4ED8`<br>Bg: `#DBEAFE` | Text: `#60A5FA`<br>Bg: `#172A46` | Guidelines, instructions, processing notifications |

---

## 2. Typography Hierarchy

The typography scale uses **Inter** (with system-ui fallbacks), optimized for readable clinical data:

| Classification | CSS Class | Size / Rem | Weight | Line Height | Tracking |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Page Heading** | `.heading-page` | `28px` / `1.75rem` | 700 (Bold) | 1.3 | `-0.015em` |
| **Section Heading**| `.heading-section`| `20px` / `1.25rem` | 600 (Semibold)| 1.35 | `-0.01em` |
| **Body Text** | `.text-body` | `16px` / `1.00rem` | 400 (Regular) | 1.5 | `normal` |
| **Secondary Text** | `.text-secondary`| `14px` / `0.875rem`| 500 (Medium) | 1.45 | `normal` |
| **Captions & Metadata**| `.text-subtle` | `12px` / `0.75rem` | 500 (Medium) | 1.4 | `+0.01em` |

---

## 3. UI Component Primitives (`src/components/ui/`)

### 1. Button (`Button.jsx`)
* **Touch Target**: Minimum height of `42px` to `48px` ensuring mobile accessibility.
* **Variants**: `primary`, `secondary`, `accent`, `emergency`/`sos`, `ghost`, `outline`.
* **State Support**: Built-in spinning SVG loader during async network calls.
* **Focus States**: Ring `0 0 0 2px var(--color-primary)` with `focus-visible`.

### 2. Card (`Card.jsx`)
* **Border Radius**: Moderate `12px` to `16px` (`rounded-xl` to `rounded-2xl`).
* **Border & Shadows**: Subtle 1px border (`var(--border-color)`), avoiding excessive drop-shadows and glassmorphism blur.

### 3. Unit Input Group (`.unit-input-group`)
* Custom flex container for medical measurements pairing a numeric input field seamlessly with a unit selector (`cm`/`ft` for height, `kg`/`lbs` for weight).
* Eliminates visual disconnections and mobile wrapping bugs.

### 4. Modal (`Modal.jsx`)
* Full-screen backdrop with fixed, non-scrolling title header and scrollable body.
* Handles `Escape` key listeners and body scroll-lock (`overflow: hidden`).

### 5. Status Badge (`Badge.jsx`)
* Compact pill badges (`normal`, `warning`, `critical`, `info`) with high contrast text and icons.

### 6. Empty States
* Standardized pattern: Centered SVG icon in circular container + bold title + descriptive explanation + direct action button (e.g. "Upload Medical Report" or "Add Medicine").

---

## 4. Layout Shell Architecture (`src/components/shared/`)

```
+-------------------------------------------------------------------------------+
| Header: Breadcrumbs / Title | Language Selector | Theme Toggle | SOS | Profile |
+-----------------------+-------------------------------------------------------+
| Desktop Sidebar       | Main Content Viewport                                 |
| (Collapsible: 64/20)  | (Dynamic padding: md:pl-72 / md:pl-24)                |
|                       | Max width: max-w-7xl centered                          |
|                       |                                                       |
| - Dashboard           |                                                       |
| - Medical Reports     |                                                       |
| - Health Trends       |                                                       |
| - Find Hospital       |                                                       |
| - Medications         |                                                       |
| - Emergency SOS (24/7)|                                                       |
| - Profile & Settings  |                                                       |
+-----------------------+-------------------------------------------------------+
| Mobile Viewport Only: Bottom Navigation Bar with safe-area padding            |
+-------------------------------------------------------------------------------+
```

### Layout Components:
1. **`AppLayout.jsx`**: Master layout container wrapping authenticated routes with reactive sidebar toggle state.
2. **`Header.jsx`**: Top app bar containing breadcrumbs, active patient context, language selector (EN/HI/GU), theme switch (Sun/Moon), emergency SOS shortcut, and notification bell.
3. **`Sidebar.jsx`**: Desktop navigation with collapsible sidebar mode (`w-64` vs `w-20`).
4. **`MobileBottomNav.jsx`**: Persistent 5-button bottom bar for mobile screens with `safe-area-bottom` (`env(safe-area-inset-bottom)`).
5. **`Navbar.jsx` & `Footer.jsx`**: Public landing page navigation and footer.

---

## 5. Theme Toggling & State Persistence

The theme system is managed by `ThemeContext.jsx`:
1. On initial mount, reads from `localStorage.getItem('medguardian_theme')` or system `window.matchMedia('(prefers-color-scheme: dark)')`.
2. When toggled via the Header button, the provider updates the state, saves to `localStorage`, and toggles the `.dark` class and `data-theme="dark"` attribute on `document.documentElement`.
3. CSS variables scoped under `:root` and `.dark` instantly switch throughout the DOM without page flickering.
