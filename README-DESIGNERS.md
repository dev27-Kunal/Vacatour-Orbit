# 🎨 Vacature-ORBIT Frontend - Designer Guide

## Quick Start

```bash
# Clone the repository
git clone https://github.com/Primadetaautomation/vacature-orbit-frontend.git
cd vacature-orbit-frontend

# Install dependencies
npm install --legacy-peer-deps

# Start development server (English mode)
npm run dev

# Open in browser
http://localhost:5174
```

**The app will start in ENGLISH by default for designers!** 🇬🇧

---

## 🌍 Language Settings

### Force English Mode
The app is configured to show English for designers. If you see Dutch, run:
```javascript
// In browser console
localStorage.setItem('i18nextLng', 'en');
location.reload();
```

### Available Languages
- 🇬🇧 **English** (default for designers)
- 🇳🇱 Dutch (production default)
- 🇫🇷 French
- 🇩🇪 German

---

## 📁 Project Structure

```
client/src/
├── components/
│   ├── ui/           # All UI components (buttons, cards, dialogs)
│   ├── navigation.tsx # Main navigation
│   └── ...
├── pages/            # All page components
│   ├── landing.tsx   # Homepage
│   ├── dashboard.tsx # Dashboard
│   ├── jobs.tsx      # Jobs listing
│   └── ...
├── styles/           # Global styles
└── locales/
    ├── en.json      # English translations (YOUR REFERENCE)
    └── nl.json      # Dutch translations (don't edit)
```

---

## 🎨 Design System

### Colors
All colors are defined as CSS variables in `client/src/index.css`:

```css
:root {
  --primary: 221 83% 53%;      /* Primary blue */
  --secondary: 210 40% 96%;    /* Light gray */
  --destructive: 0 84% 60%;    /* Red for errors */
  --accent: 210 40% 96%;       /* Accent color */
}
```

### Components
We use **shadcn/ui** components. Documentation:
- https://ui.shadcn.com/docs/components

### Icons
Using **Lucide React** for all icons:
- https://lucide.dev/icons/

### Styling
Using **Tailwind CSS** for utility classes:
- https://tailwindcss.com/docs

---

## 💻 Working with Components

### Example: Editing a Button
```jsx
// client/src/components/ui/button.tsx

// Current button with Dutch text (in the app)
<Button>Verstuur</Button>

// You'll see in English:
<Button>Send</Button>
```

### The Magic: i18n Translation System
```jsx
// How it works in code:
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <Button>{t('common.send')}</Button>
    // Shows "Send" in English, "Verstuur" in Dutch
  );
}
```

---

## 📝 Text & Copy

### Where to Find All English Text
**Main file:** `client/src/locales/en.json`

```json
{
  "homepage": {
    "title": "Vacature ORBIT",
    "subtitle": "The complete recruitment platform for everyone",
    "startTrial": "Start Free Trial",
    "viewCandidates": "View Candidates"
  }
}
```

### Important: Don't Edit Text Directly in Components!
Text is managed via translation files. If you need to change text:
1. Note the translation key (e.g., `homepage.title`)
2. Ask developers to update it
3. Or update in `en.json` for English

---

## 🚀 Making Design Changes

### 1. Create a New Branch
```bash
git checkout -b design/update-homepage
```

### 2. Make Your Changes
- Edit components in `client/src/components/`
- Update styles in component files or `index.css`
- Modify layouts in `client/src/pages/`

### 3. Test Your Changes
```bash
npm run dev
# Check at http://localhost:5174
```

### 4. Commit Your Work
```bash
git add .
git commit -m "design: update homepage hero section"
git push origin design/update-homepage
```

### 5. Create Pull Request
Go to GitHub and create a PR with screenshots

---

## 🎯 Design Tasks Checklist

### Visual Design
- [ ] Review color scheme
- [ ] Update typography scales
- [ ] Improve spacing/padding
- [ ] Enhance hover states
- [ ] Add micro-animations

### UX Improvements
- [ ] Simplify user flows
- [ ] Improve form designs
- [ ] Better error states
- [ ] Loading states
- [ ] Empty states

### Responsive Design
- [ ] Mobile layouts (320-640px)
- [ ] Tablet layouts (640-1024px)
- [ ] Desktop layouts (1024px+)
- [ ] Test on real devices

### Accessibility
- [ ] Color contrast (WCAG AA)
- [ ] Focus indicators
- [ ] Screen reader labels
- [ ] Keyboard navigation

---

## 🛠 Useful Commands

```bash
# Start development
npm run dev

# Check for errors
npm run lint

# Format code
npm run format

# Build for production
npm run build
```

---

## 🆘 Troubleshooting

### If you see Dutch instead of English:
1. Clear localStorage: `localStorage.clear()`
2. Set English: `localStorage.setItem('i18nextLng', 'en')`
3. Reload page

### Build errors?
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Can't see your changes?
1. Check if dev server is running
2. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. Clear browser cache

---

## 📞 Support

- **Repository:** https://github.com/Primadetaautomation/vacature-orbit-frontend
- **Issues:** Create an issue in GitHub
- **Slack:** [Your Slack channel]

---

## 🎉 Happy Designing!

Remember: You're working on the **English version** but the app supports multiple languages. Your designs should work well with different text lengths!
---
Last updated: do 13 nov. 2025 06:46:57 CET
