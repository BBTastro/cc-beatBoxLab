# stepBox Project Guidelines

## Development Rules
- Always run the LINT and TYPESCHECK scripts after completing your changes. This is to check for any issues.
- NEVER start the dev server yourself. If you need something from the terminal, ask the user to provide it to you.
- Avoid using custom colors unless very specifically instructed to do so. Stick to standard tailwind and shadcn colors, styles and tokens.

## Project Context

stepBox is a comprehensive goal tracking application featuring:

### Core Features
1. **Beat Grid Tracking** - Visual daily progress tracking with phase organization
2. **AI Chatbot** - Context-aware OpenAI integration for personalized insights  
3. **Rewards System** - Three-tier achievement motivation (Planned→Active→Achieved)
4. **Motivational Statements** - Structured personal inspiration framework
5. **Allies Network** - Multi-platform support system management
6. **Move System** - Six-type movement framework for creative transformation and goal achievement
7. **User Authentication** - Google OAuth via Better Auth

### Technical Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **Database**: Drizzle ORM + PostgreSQL
- **Auth**: Better Auth with Google OAuth
- **AI**: OpenAI API integration

### Key Pages
- `/` - Landing/dashboard with challenge overview
- `/steps` - Main tracking interface with AI assistant
- `/rewards` - Achievement reward management
- `/motivation` - Personal motivational statements
- `/allies` - Support network organization  
- `/move` - Six-type movement framework with AI-powered guidance
- `/settings` - Challenge configuration
- `/about` - Application information

### Feature Documentation
Complete documentation available in `/docs/features/` covering business value, user workflows, technical requirements, and success metrics for each feature.

## Important Reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
Documentation files should only be created when explicitly requested by the user.
