# KMRL Knowledge Lens Platform

An integrated, AI-powered knowledge management system designed for Kochi Metro Rail Limited (KMRL) that transforms documents into actionable insights through intelligent ingestion, processing, and dissemination.

## Overview

The Knowledge Lens Platform serves as KMRL's central nervous system for information management, consolidating documents from multiple sources into a unified, searchable repository with AI-powered analysis and role-based access controls.

## Key Features

### 🔄 Ingestion & Unification Layer
- **Unified Document Lake**: Central cloud-based repository as single source of truth
- **Automated Ingestion**: Connectors for email, SharePoint, and cloud repositories
- **OCR Processing**: Multilingual digitization of scanned PDFs and images (including WhatsApp documents)

### 🧠 Intelligence Engine (Core AI)
- **Smart Classification**: Automatic tagging by document type and priority
- **Named Entity Recognition**: Extract dates, vendors, parts, codes, and locations
- **Intelligent Summarization**: Generate headlines, abstracts, and action items
- **Semantic Search**: Vector embeddings enable natural language queries

### 📊 Dissemination & Presentation Layer
- **Role-Based Dashboards**: Tailored views for Engineers, Finance, Executives, and other departments
- **Proactive Alerts**: Email/SMS/app notifications for high-priority items
- **Conversational Assistant**: AI chatbot for querying the knowledge base

### 🔍 Traceability & Feedback Layer
- **One-Click Traceability**: Link every insight to exact source documents
- **Feedback Loop**: User ratings continuously improve AI quality

## User Roles & Access

The platform supports multiple user roles with specialized dashboards:

- **Administrator** (ADM001): Full system access and user management
- **Station Controller** (STF001): Operations and safety-focused view
- **Procurement Officer** (STF002): Vendor and procurement document access
- **Rolling Stock Engineer** (STF003): Technical documentation and maintenance records

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **State Management**: TanStack Query for server state
- **Authentication**: Context-based auth system
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/madhavchaturvedi005/intelligence-model-sih-25.git
cd kmrl-knowledge-lens
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Demo Credentials

Use these credentials to explore different user perspectives:

| Role | Username | Password |
|------|----------|----------|
| Administrator | ADM001 | admin123 |
| Station Controller | STF001 | staff123 |
| Procurement Officer | STF002 | staff123 |
| Rolling Stock Engineer | STF003 | staff123 |

### Sample Documents

The application includes pre-loaded sample documents to demonstrate AI analysis capabilities:

- **Metro Line 3 Environmental Impact Assessment** (High Priority)
  - Environmental Planning Department
  - Comprehensive assessment with air quality, noise, and biodiversity analysis
  - AI-generated summary with 5 key points and detailed insights

- **Smart Ticketing System Technical Specifications** (Medium Priority)
  - IT Operations Department  
  - Technical documentation for contactless payment system
  - Features NFC/QR code support and mobile app integration

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Dashboard.tsx   # Main dashboard component
│   ├── SearchInterface.tsx
│   └── ...
├── pages/              # Route components
├── contexts/           # React contexts (Auth, etc.)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
└── data/               # Mock data and constants
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Benefits for KMRL

- **Faster Decision Making**: Instant, pre-digested summaries reduce information processing time
- **Cross-Functional Awareness**: Keep Engineering, Procurement, Safety, and Finance teams synchronized
- **Compliance Ready**: Surface high-priority regulatory documents with full audit trails
- **Institutional Memory**: Permanent, searchable digital knowledge repository
- **Eliminate Duplication**: Share high-quality summaries across teams to reduce rework

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software developed for Kochi Metro Rail Limited (KMRL).
