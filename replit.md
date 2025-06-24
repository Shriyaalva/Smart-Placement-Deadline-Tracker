# PlacementAlert - Automated Placement Opportunity Tracker

## Overview

PlacementAlert is a full-stack web application that automatically monitors Gmail for placement and internship opportunities, extracts key information like deadlines and company details, and sends timely reminders to ensure users never miss application deadlines. The application uses intelligent email parsing to identify placement-related emails and provides a comprehensive dashboard for managing opportunities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system variables
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Google OAuth 2.0 for Gmail integration
- **Email Processing**: Gmail API for reading and parsing emails
- **Task Scheduling**: Node-cron for reminder scheduling
- **Session Management**: Express sessions with PostgreSQL store

### Database Design
- **Primary Database**: PostgreSQL
- **Schema Management**: Drizzle Kit for migrations
- **Tables**: Users, Placement Opportunities, Reminders, User Settings, Email Processing Logs

## Key Components

### Email Integration Service
- **Gmail API Integration**: Handles OAuth flow and email access
- **Email Parser**: Intelligent parsing using keyword matching and pattern recognition
- **Placement Detection**: Identifies placement-related emails from subject lines, senders, and content
- **Deadline Extraction**: Uses regex patterns to extract dates and deadlines from email content

### Reminder System
- **Scheduler Service**: Cron-based background job for processing pending reminders
- **Notification Service**: Sends email reminders through Gmail API
- **Urgency Classification**: Categorizes opportunities by deadline proximity
- **User Preferences**: Customizable reminder timing and notification methods

### Dashboard Interface
- **Statistics Overview**: Real-time stats on opportunities, deadlines, and applications
- **Opportunity Management**: View, filter, and update placement opportunities
- **Quick Actions**: One-click operations for common tasks
- **Responsive Design**: Mobile-first approach with adaptive layouts

## Data Flow

1. **Email Synchronization**: 
   - User authenticates with Google OAuth
   - Application periodically fetches new emails via Gmail API
   - Email parser analyzes content for placement opportunities

2. **Opportunity Processing**:
   - Placement-related emails are parsed for company, position, and deadline information
   - Opportunities are stored in database with extracted metadata
   - Automatic reminder scheduling based on user preferences

3. **Reminder Execution**:
   - Background scheduler checks for pending reminders
   - Email notifications sent through Gmail API
   - Reminder status updated in database

4. **User Interaction**:
   - Dashboard displays opportunities with urgency indicators
   - Users can mark opportunities as applied or expired
   - Settings allow customization of reminder preferences

## External Dependencies

### Core Infrastructure
- **Database**: PostgreSQL (configured in .replit for development)
- **Email Service**: Gmail API for both reading and sending emails
- **Authentication**: Google OAuth 2.0 service

### Third-Party Services
- **Neon Database**: Serverless PostgreSQL for production (@neondatabase/serverless)
- **Google APIs**: Gmail and OAuth 2.0 integration
- **Replit**: Development environment and deployment platform

### Key Libraries
- **Frontend**: React, TanStack Query, Shadcn/ui, Tailwind CSS
- **Backend**: Express, Drizzle ORM, node-cron, connect-pg-simple
- **Validation**: Zod for schema validation
- **Build Tools**: Vite, esbuild, TypeScript

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 and PostgreSQL 16 modules
- **Hot Reload**: Vite development server with React Fast Refresh
- **Database**: Local PostgreSQL instance with automatic provisioning

### Production Build
- **Frontend**: Vite build with static asset optimization
- **Backend**: esbuild bundling for Node.js production
- **Database**: Drizzle migrations for schema deployment
- **Deployment**: Replit Autoscale with automatic scaling

### Environment Configuration
- **Port Configuration**: Server runs on port 5000, exposed as port 80
- **Build Process**: `npm run build` creates production-ready assets
- **Start Command**: `npm run start` for production deployment

## Changelog

- June 24, 2025. Initial setup with complete placement alert application
- June 24, 2025. Added PostgreSQL database integration replacing in-memory storage

## User Preferences

Preferred communication style: Simple, everyday language.