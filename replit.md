# La Campana Restaurant Ordering System

## Overview

La Campana is a full-stack restaurant ordering system designed for premium maritime dining experiences. The system enables customers to scan QR codes at tables to access a digital menu, place orders without waiting for servers, and track their order status in real-time. Staff and administrators have dedicated dashboards for order management, menu administration, and analytics.

The application features a sophisticated black-and-gold design theme that reflects the restaurant's premium maritime atmosphere, complete with floating nautical elements and elegant typography using Cinzel and Inter fonts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Styling**: TailwindCSS with custom brand colors (navy, midnight, charcoal, gold, amber, warm-white)
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible interfaces
- **State Management**: React Context API with custom hooks for cart, WebSocket connections, and authentication
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack Query (React Query) for server state management and caching

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints with role-based access control
- **Real-time Communication**: WebSocket server for live order updates and notifications
- **Session Management**: Express sessions with PostgreSQL store
- **Authentication**: Replit Auth integration with role-based authorization (customer, staff, admin)

### Database Design
- **Primary Database**: PostgreSQL with connection pooling via Neon serverless
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema Structure**:
  - Users table with role-based access (customer, staff, admin)
  - Tables with QR codes for customer identification
  - Menu categories and items with pricing and availability
  - Orders with status tracking (pending → preparing → ready → served)
  - Order items for detailed order composition
  - Sessions table for authentication persistence

### Key Design Patterns
- **Separation of Concerns**: Clear separation between client, server, and shared code
- **Type Safety**: Shared TypeScript schemas between frontend and backend
- **Real-time Updates**: WebSocket integration for live order status updates
- **Responsive Design**: Mobile-first approach with maritime-themed animations
- **Error Handling**: Comprehensive error boundaries and user feedback systems

### Authentication & Authorization
- **Authentication Provider**: Replit Auth with OpenID Connect
- **Session Management**: Secure HTTP-only cookies with PostgreSQL session store
- **Role-based Access**: Three-tier system (customer, staff, admin) with route protection
- **Security**: CSRF protection, secure session configuration, and unauthorized request handling

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless database connection
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching
- **ws**: WebSocket implementation for real-time features

### UI & Styling
- **@radix-ui/\***: Complete suite of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework with custom theme
- **class-variance-authority**: Type-safe component variants
- **clsx**: Conditional CSS class composition

### Development & Build Tools
- **vite**: Fast build tool with HMR and optimizations
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-\***: Replit-specific development tools

### Authentication & Session Management
- **openid-client**: OpenID Connect client implementation
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### Utilities
- **zod**: Runtime type validation and schema parsing
- **date-fns**: Date manipulation and formatting
- **nanoid**: Unique ID generation
- **memoizee**: Function result caching