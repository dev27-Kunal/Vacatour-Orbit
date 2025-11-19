# Vacature-ORBIT Frontend

A modern, full-featured frontend application for Vacature-ORBIT, a comprehensive job and talent management platform built with React, TypeScript, and Vite.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will run on: **http://localhost:5174**

## 📋 Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager

## 🛠️ Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Build with strict type checking
npm run build:strict

# Preview production build
npm run preview

# Run linter
npm run lint

# Type check without building
npm run type-check
```

## 📁 Project Structure

```
vacature-orbit-frontend-v2/
├── client/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ui/           # Reusable UI components (shadcn/ui)
│   │   │   ├── landing/      # Landing page components
│   │   │   ├── jobs/         # Job-related components
│   │   │   ├── contracts/    # Contract management components
│   │   │   ├── analytics/    # Analytics components
│   │   │   └── ...          # Other feature components
│   │   ├── pages/            # Page components (routes)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utilities, API clients, and helpers
│   │   ├── contexts/         # React context providers
│   │   ├── providers/        # App-level providers
│   │   ├── services/         # Service layer (push notifications, etc.)
│   │   ├── types/            # TypeScript type definitions
│   │   ├── locales/          # i18n translation files (en, nl, fr, de)
│   │   └── styles/           # Global styles and CSS
│   ├── public/               # Static assets
│   └── index.html            # HTML entry point
├── shared/                   # Shared types and schemas
├── scripts/                  # Build and utility scripts
└── package.json              # Project dependencies and scripts
```

## 🎨 Tech Stack

### Core
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Wouter** - Lightweight routing

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **next-themes** - Theme management (dark mode support)

### State Management & Data Fetching
- **TanStack Query (React Query)** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Backend Integration
- **Supabase** - Authentication and database
- **Axios** - HTTP client
- **SignalR** - Real-time communication

### Payments
- **Stripe** - Payment processing

### Internationalization
- **i18next** - Internationalization framework
- **react-i18next** - React bindings for i18next
- Supports: English (en), Dutch (nl), French (fr), German (de)

### File Upload
- **Uppy** - File upload library with AWS S3 support

### Other Libraries
- **date-fns** - Date manipulation
- **recharts** - Chart library
- **react-markdown** - Markdown rendering
- **reactflow** - Flow diagram library

## 🎯 Key Features

### Job Management
- Job posting and editing
- Job search and filtering
- Job applications management
- Job alerts and notifications

### User Management
- Authentication (Supabase Auth)
- User profiles (recruiters, self-employed, job seekers)
- Multi-tenant support
- Role-based access control

### Communication
- Real-time messaging
- Group chats
- Video calls
- Email notifications

### Contract Management
- MSA (Master Service Agreement) approvals
- Contract creation and management
- VMS (Vendor Management System) integration

### Analytics & Reporting
- Dashboard with analytics widgets
- Performance metrics
- Job matching insights

### Payments & Subscriptions
- Stripe integration
- Subscription management
- Payment processing

### Compliance
- Company verification
- Compliance tracking
- Document management

## 🌐 Internationalization

The application supports multiple languages:
- English (en)
- Dutch (nl)
- French (fr)
- German (de)

Translation files are located in `client/src/locales/`. The language is automatically detected from the browser settings and can be manually changed via the language selector.

## 🎨 Design Guidelines

### Components
- All UI components are located in `client/src/components/ui/`
- Components follow shadcn/ui patterns
- Use Tailwind CSS classes for styling
- All components are fully typed with TypeScript

### Theming
- Color variables are defined in Tailwind config
- CSS variables are used for consistent theming
- Dark mode is supported via `next-themes`

### Responsive Design
- Mobile-first approach
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
- Components are designed to be responsive by default

### Accessibility
- Components follow WCAG guidelines
- Keyboard navigation support
- Screen reader friendly
- Skip navigation links

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=your_api_url
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

### Path Aliases

The project uses path aliases for cleaner imports:
- `@/` - Points to `client/src/`
- `@shared/` - Points to `shared/`

Example:
```typescript
import { Button } from "@/components/ui/button"
import { Job } from "@shared/types"
```

## 🧪 Testing

```bash
# Run tests (if configured)
npm test
```

## 📦 Building for Production

```bash
# Build the application
npm run build

# The output will be in the client/dist directory
```

## 🤝 Contributing

1. Create a new branch for your changes
2. Make your changes following the project's code style
3. Ensure TypeScript types are correct (`npm run type-check`)
4. Run the linter (`npm run lint`)
5. Commit your changes with descriptive messages
6. Open a Pull Request with a clear description

## 📝 Code Style

- Use TypeScript for all new code
- Follow React best practices and hooks patterns
- Use functional components
- Prefer named exports
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

## 🐛 Troubleshooting

### Port Already in Use
If port 5174 is already in use, you can change it in `vite.config.ts`:
```typescript
server: {
  port: 5175, // Change to your preferred port
}
```

### Build Issues
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Ensure all environment variables are set correctly

## 📞 Support

For questions about the codebase, architecture, or components, please contact the development team or open an issue in the repository.

## 📄 License

This project is private and proprietary.

---

**Note**: This is the frontend application. Ensure the backend API is running and properly configured for full functionality.
