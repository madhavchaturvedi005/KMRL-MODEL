# Request Access Feature

This is a standalone implementation of the request access feature extracted from the main application.

## Features

- **Multi-step Registration Flow**: 4-step process for user registration
- **Company Search**: Search and select from available companies
- **Identity Verification**: ID document upload and live photo capture
- **Form Validation**: Comprehensive validation using Zod and React Hook Form
- **Camera Integration**: Live photo capture using device camera
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **React Router** for navigation
- **React Hook Form** + **Zod** for form validation
- **Radix UI** components for accessibility
- **Tailwind CSS** for styling
- **Lucide React** for icons

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   └── RegistrationFlow.tsx
├── contexts/
│   └── AuthContext.tsx
├── data/
│   ├── mockCompanies.ts
│   └── mockUsers.ts
├── lib/
│   └── utils.ts
├── pages/
│   ├── RequestAccess.tsx
│   └── Signup.tsx
├── styles/
│   └── globals.css
└── types/
    └── auth.ts
```

## Key Components

### RegistrationFlow
Multi-step form component with:
- Step 1: Company selection
- Step 2: Personal details
- Step 3: Identity verification (ID upload + live photo)
- Step 4: Review and confirmation

### AuthContext
Provides authentication state and registration submission functionality.

## Integration Notes

- Replace mock data with real API calls
- Implement proper file upload to cloud storage
- Add proper error handling and logging
- Configure CORS for cross-origin requests
- Set up proper authentication flow

## Routes

- `/request-access` - Main registration flow
- `/signup` - Redirects to request access
- `/` - Redirects to request access

## Dependencies

Key dependencies include:
- `react-hook-form` - Form management
- `@hookform/resolvers` - Form validation resolvers
- `zod` - Schema validation
- `@radix-ui/*` - Accessible UI components
- `lucide-react` - Icons
- `tailwind-merge` + `clsx` - Utility classes

## Development

The feature runs on port 3002 by default. You can change this in `vite.config.ts`.

For production deployment, build the project and serve the `dist` folder.