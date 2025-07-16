# PersonalRecommend - Recommendation Platform

## Overview

PersonalRecommend is a full-stack web application that provides personalized recommendations based on user preferences. The application features a modern React frontend with a Node.js/Express backend, using PostgreSQL for data persistence and Drizzle ORM for database management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Framework**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: Express sessions with PostgreSQL store

### Database Design
- **Database**: PostgreSQL (configured via Neon serverless)
- **Schema Management**: Drizzle migrations
- **Tables**:
  - `users`: User authentication and profiles
  - `preferences`: User preference settings for recommendations
  - `recommendations`: Product/service recommendations with ratings
  - `chatMessages`: Live chat conversation history
  - `contactSubmissions`: Contact form submissions

## Key Components

### Core Features
1. **Preference Collection**: Multi-step form for gathering user preferences including categories, budget ranges, and interests
2. **Recommendation Engine**: Filtering and sorting system for personalized recommendations
3. **Live Chat**: Real-time customer support chat widget
4. **Contact System**: Contact form with email notifications

### Frontend Components
- **Header**: Navigation with smooth scrolling to sections
- **Hero Section**: Landing page with call-to-action
- **Preference Form**: Multi-step wizard for collecting user preferences
- **Recommendations Grid**: Filterable and sortable recommendation display
- **Contact Form**: Customer inquiry submission
- **Live Chat Widget**: Floating chat interface

### Backend Services
- **Storage Layer**: Abstract storage interface with in-memory implementation
- **Route Handlers**: RESTful endpoints for recommendations, preferences, chat, and contact
- **Middleware**: Request logging, error handling, and JSON parsing

## Data Flow

1. **User Preferences**: Users complete preference form → Data stored in preferences table → Used for recommendation filtering
2. **Recommendations**: Backend fetches filtered recommendations → Frontend displays in grid/list view → Users can sort and paginate
3. **Live Chat**: Users send messages → Stored in chatMessages table → Real-time polling for responses
4. **Contact Forms**: Form submission → Data stored in contactSubmissions table → Admin notification

## External Dependencies

### Frontend Dependencies
- **UI Components**: Extensive Radix UI component library
- **Form Handling**: React Hook Form with Zod validation
- **HTTP Client**: Native fetch with TanStack Query wrapper
- **Date Handling**: date-fns for date manipulation
- **Icons**: Lucide React for iconography

### Backend Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **ORM**: drizzle-orm with drizzle-zod for schema validation
- **Session Store**: connect-pg-simple for PostgreSQL session storage
- **Build Tools**: esbuild for production bundling, tsx for development

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution with file watching
- **Database**: Drizzle push for schema synchronization

### Production
- **Build Process**: 
  1. Vite builds frontend to `dist/public`
  2. esbuild bundles backend to `dist/index.js`
- **Deployment**: Single Node.js process serving both API and static files
- **Database**: PostgreSQL with connection pooling via Neon

### Configuration
- **Environment Variables**: DATABASE_URL for PostgreSQL connection
- **Static Assets**: Express serves built frontend from `dist/public`
- **API Routes**: All backend routes prefixed with `/api`

The application follows a monorepo structure with shared TypeScript types and schemas, enabling type safety across the full stack. The architecture supports both development and production environments with appropriate tooling for each.