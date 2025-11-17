# Vacature-ORBIT Frontend (Design Version)

Deze repository bevat alleen de frontend code van Vacature-ORBIT voor design doeleinden.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

De applicatie draait op: http://localhost:5174

## 📁 Project Structuur

```
client/
├── src/
│   ├── components/     # React componenten
│   ├── pages/          # Pagina componenten
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities en helpers
│   ├── styles/         # Global styles
│   └── types/          # TypeScript types
├── public/             # Static assets
└── index.html          # Entry point
```

## 🎨 Design Stack

- **React 18** met TypeScript
- **Tailwind CSS** voor styling
- **shadcn/ui** component library
- **Framer Motion** voor animaties
- **Lucide React** voor icons

## 📝 Design Guidelines

### Components
- Alle UI componenten staan in `client/src/components/ui/`
- Gebruik Tailwind classes voor styling
- Componenten zijn fully typed met TypeScript

### Kleuren & Theming
- Kleur variables staan in `client/src/styles/globals.css`
- Gebruik CSS variables voor consistent theming
- Dark mode support via Tailwind

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

## ⚠️ Mock Data

Deze versie gebruikt mock data voor design doeleinden.
De echte API calls zijn uitgeschakeld.

## 🤝 Contributing

1. Maak een nieuwe branch voor je design changes
2. Commit je wijzigingen
3. Open een Pull Request met screenshots

## 📞 Contact

Voor vragen over de code structuur of componenten,
neem contact op met het development team.
