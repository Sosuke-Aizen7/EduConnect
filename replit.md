# Educational Platform

## Overview

This is a full-stack educational platform called "EduConnect" that helps students discover and compare universities and courses worldwide. The application allows users to search through thousands of educational programs, save courses to wishlists, compare different options side-by-side, and get personalized recommendations. It's built as a modern web application with a React frontend and Express backend, designed to simplify the process of finding the right educational opportunities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible design
- **Styling**: Tailwind CSS with CSS variables for theming support, including dark mode capability
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with TypeScript using ESM modules
- **Framework**: Express.js for REST API development
- **Database ORM**: Drizzle ORM with type-safe database operations
- **Session Management**: Express sessions with PostgreSQL storage for persistent user sessions
- **Authentication**: Replit's OpenID Connect (OIDC) integration for secure user authentication
- **Development**: tsx for TypeScript execution in development mode

### Database Design
- **Primary Database**: PostgreSQL with Neon serverless integration
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Key Tables**:
  - Users table for authentication and profile data
  - Universities table with location and ranking information
  - Courses table with detailed program information
  - Saved courses for user wishlists
  - Course comparisons for side-by-side analysis
  - Sessions table for authentication state

### API Architecture
- **Pattern**: RESTful API design with consistent endpoint structure
- **Authentication**: Protected routes using session-based authentication middleware
- **Error Handling**: Centralized error handling with appropriate HTTP status codes
- **Request Logging**: Custom middleware for API request/response logging
- **Data Validation**: Zod schemas for runtime type validation

### Authentication System
- **Provider**: Replit OIDC for secure authentication flow
- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple
- **Security**: HTTP-only cookies with secure flags and CSRF protection
- **User Management**: Automatic user creation and profile management

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **WebSocket Support**: ws package for Neon's serverless database connections

### Authentication Services
- **Replit OIDC**: OpenID Connect authentication provider
- **Passport.js**: Authentication middleware for Express

### UI and Styling
- **Radix UI**: Comprehensive primitive components for accessible UI elements
- **Lucide React**: Icon library for consistent iconography
- **Google Fonts**: Inter font family for typography
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing

### Development Tools
- **TypeScript**: Static type checking across the entire stack
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Development**: Integration with Replit's development environment and error overlay

### Data Management
- **TanStack React Query**: Server state management with caching and synchronization
- **Drizzle ORM**: Type-safe database operations with automatic migrations
- **Zod**: Schema validation for API endpoints and form handling

### Utility Libraries
- **date-fns**: Date manipulation and formatting utilities
- **class-variance-authority**: Type-safe CSS class variants
- **clsx & tailwind-merge**: Conditional CSS class composition