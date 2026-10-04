# 💡 MedGuardian AI — Frontend Interview Questions & Deep-Dive Answers

This guide contains technical interview questions and detailed architectural answers based specifically on the MedGuardian AI frontend codebase.

---

### Q1: Why did you choose React Context API over Redux or Zustand for MedGuardian AI?
**Answer:**
For MedGuardian AI, the global state needs are cleanly categorized into three focused domains:
1. **Authentication & User Profile** (`AuthContext` / `HealthDataContext`)
2. **Clinical Health Records & Active Medications** (`HealthDataContext`)
3. **Application Theme & Language** (`ThemeContext`, `useLanguage`)

Using Redux would have introduced unnecessary boilerplate (actions, reducers, dispatchers, store configuration) for state that is predominantly read-heavy and mutated through discrete REST API responses. Zustand is a solid alternative, but React 18's native Context API completely satisfies our requirements with zero third-party bundle weight. To prevent unnecessary re-renders, we split concerns between `ThemeContext` and `HealthDataContext`, ensuring theme toggles do not re-render large medical report tables.

---

### Q2: How did you implement dark mode, and how does it persist across page refreshes?
**Answer:**
We implemented dark mode using a hybrid architecture combining React state, `localStorage`, and CSS Custom Properties:
1. **State Initialization**: In `ThemeContext.jsx`, initial theme state is computed using a lazy initializer:
   ```javascript
   const [theme, setTheme] = useState(() => {
     const saved = localStorage.getItem('medguardian_theme');
     if (saved) return saved;
     return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
   });
   ```
2. **DOM Synchronization**: A `useEffect` hook listens to `theme` changes. It toggles the `.dark` class and sets `data-theme="dark"` on `document.documentElement`, while storing the selection in `localStorage`.
3. **CSS Variables**: In `src/styles/index.css`, design tokens are mapped under `:root` for light mode and `.dark` for dark mode (`--bg-primary`, `--bg-surface`, `--color-primary`, `--text-main`). When the class toggles, the entire UI updates instantly without CSS re-injection or component re-mounting.

---

### Q3: How does the trilingual localization system (English, Hindi, Gujarati) work under the hood?
**Answer:**
We created a lightweight, zero-dependency translation dictionary in `src/utils/translations.js`:
* The dictionary exports an object structured by language keys (`EN`, `HI`, `GU`), mapping common translation token keys (e.g. `dashboard`, `uploadMedicalReport`, `emergencySOS`) to localized strings.
* In `HealthDataContext.jsx`, a `t(key)` helper function accepts a key and returns the translated string for the active language:
  ```javascript
  const t = (key) => translations[language]?.[key] || translations['EN'][key] || key;
  ```
* The `useLanguage` hook exposes `{ language, setLanguage, t }` to all page components. If a translation key is missing in Gujarati or Hindi, it gracefully falls back to the English string.

---

### Q4: How is Leaflet and OpenStreetMap integrated without expensive API keys?
**Answer:**
Instead of relying on proprietary SDKs like Google Maps (which require credit cards, billing quotas, and API keys), we integrated OpenStreetMap using **Leaflet.js**:
1. In `HospitalFinderPage.jsx`, an `ensureLeafletLoaded()` utility dynamically injects Leaflet's CDN stylesheet and JavaScript if they are not already present on `window.L`.
2. When the user provides GPS coordinates, Leaflet initializes an interactive map canvas (`L.map(containerRef.current)`), attaching standard OpenStreetMap tiles (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`).
3. Markers are rendered using `L.divIcon`, allowing custom HTML/CSS styling (e.g. pulsing red rings for 24/7 emergency trauma centers). Clicking markers opens interactive popups with direct Google Maps directions links.

---

### Q5: What is the "Unit Input Group" pattern and why was it necessary?
**Answer:**
In clinical data entry, numerical inputs (height, weight) without explicit units are dangerous. A height value of `165` means centimeters in metric, but `5.9` means feet and inches in imperial. 
* Naive implementations place separate text inputs and select dropdowns side by side, which wrap awkwardly on small mobile screens.
* We created the `.unit-input-group` CSS system: a unified flexbox container that visually merges the numeric input and unit `<select>` dropdown inside a single border with unified `:focus-within` styling.
* This ensures consistent layout across all screen sizes while guaranteeing that units are always captured alongside values.

---

### Q6: How do route guards (`ProtectedRoute` and `OnboardingRoute`) work?
**Answer:**
* **`ProtectedRoute.jsx`**: Checks whether a valid `token` exists in `HealthDataContext`. If absent, it renders a `<Navigate to="/login" replace />`. If present, it renders children (`<Outlet />` inside `AppLayout`).
* **`OnboardingRoute.jsx`**: Inspects `userProfile.profile_completed`. If a newly registered user has not completed their health profile, any attempt to visit `/app/*` redirects them to `/complete-profile`. Once completed, they are granted access to the main dashboard.
