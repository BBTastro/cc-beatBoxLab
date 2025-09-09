# beatBox - Daily Goal Tracking & Achievement System

A comprehensive goal tracking application with AI-powered assistance, built with Next.js, Better Auth, and OpenAI integration. Transform your long-term goals into manageable daily actions through visual beat grids, structured rewards, motivational frameworks, and intelligent support systems.

## 🚀 Core Features

### 🎯 Beat Grid Tracking
Visual grid system for daily progress tracking with phase-based organization. Track up to 91 days per phase with completion sequences, detail logging, and progress statistics.

### 🤖 AI Assistant
Context-aware OpenAI-powered chatbot providing personalized insights based on your progress patterns, motivational statements, and achievement data.

### 🏆 Rewards System
Three-tier reward management (Planned → Active → Achieved) with proof documentation and achievement tracking to maintain motivation throughout your journey.

### 💪 Motivational Statements
Personal inspiration framework with structured sections for core motivation, purpose definition, and collaboration needs.

### 👥 Allies Network
Comprehensive support network management with multi-platform notification preferences (Email, SMS, Slack, Discord, Telegram) and role-based organization.

### 🔐 Secure Authentication
Google OAuth integration via Better Auth ensuring complete data privacy and seamless cross-device access.

## 🏗️ Technical Stack

- **🗃️ Database**: Drizzle ORM with PostgreSQL for reliable data persistence
- **🎨 UI Framework**: shadcn/ui components with Tailwind CSS for modern, accessible design
- **⚡ Frontend**: Next.js 15 with React 19 and TypeScript for type-safe development
- **📊 Analytics**: Built-in progress tracking and statistical analysis
- **📱 Design**: Mobile-first responsive approach across all features


## 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js**: Version 18.0 or higher (<a href="https://nodejs.org/" target="_blank">Download here</a>)
- **Git**: For cloning the repository (<a href="https://git-scm.com/" target="_blank">Download here</a>)
- **PostgreSQL**: Either locally installed or access to a hosted service like Vercel Postgres

## 🛠️ Quick Setup

### 1. Clone or Download the Repository

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file:

```bash
cp env.example .env
```

Fill in your environment variables in the `.env` file:

```env
# Database
POSTGRES_URL="postgresql://username:password@localhost:5432/your_database_name"

# Authentication - Better Auth
BETTER_AUTH_SECRET="your-random-32-character-secret-key-here"

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI Integration (Optional - for chat functionality)
OPENAI_API_KEY="sk-your-openai-api-key-here"
OPENAI_MODEL="gpt-5-mini"

# App URL (for production deployments)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Setup

Generate and run database migrations:

```bash
npm run db:generate
npm run db:migrate
```

### 5. Start the Development Server

```bash
npm run dev
```

Your application will be available at [http://localhost:3000](http://localhost:3000)

## ⚙️ Service Configuration

### PostgreSQL Database on Vercel

1. Go to <a href="https://vercel.com/dashboard" target="_blank">Vercel Dashboard</a>
2. Navigate to the **Storage** tab
3. Click **Create** → **Postgres**
4. Choose your database name and region
5. Copy the `POSTGRES_URL` from the `.env.local` tab
6. Add it to your `.env` file

### Google OAuth Credentials

1. Go to <a href="https://console.cloud.google.com/" target="_blank">Google Cloud Console</a>
2. Create a new project or select an existing one
3. Navigate to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
4. Set application type to **Web application**
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
6. Copy the **Client ID** and **Client Secret** to your `.env` file

### OpenAI API Key

1. Go to <a href="https://platform.openai.com/dashboard" target="_blank">OpenAI Platform</a>
2. Navigate to **API Keys** in the sidebar
3. Click **Create new secret key**
4. Give it a name and copy the key
5. Add it to your `.env` file as `OPENAI_API_KEY`

## 🗂️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   └── chat/          # AI chat endpoint
│   ├── chat/              # AI chat page
│   ├── dashboard/         # User dashboard
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── auth/             # Authentication components
│   └── ui/               # shadcn/ui components
└── lib/                  # Utilities and configurations
    ├── auth.ts           # Better Auth configuration
    ├── auth-client.ts    # Client-side auth utilities
    ├── db.ts             # Database connection
    ├── schema.ts         # Database schema
    └── utils.ts          # General utilities
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate database migrations
npm run db:migrate   # Run database migrations
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Drizzle Studio (database GUI)
npm run db:dev       # Push schema for development
npm run db:reset     # Reset database (drop all tables)
```

## 📖 Application Structure

### Core Pages
- **Home (`/`)**: Landing page with challenge overview and beat grid
- **Beats (`/beats`)**: Main tracking interface with visual progress grid and AI assistant
- **Rewards (`/rewards`)**: Three-tier reward system for motivation and achievement tracking  
- **Motivation (`/motivation`)**: Personal motivational statement management with purpose framework
- **Allies (`/allies`)**: Support network management with multi-platform communication
- **Settings (`/settings`)**: Challenge configuration and account management
- **About (`/about`)**: Application information and contact interface

### Additional Features
- **Details (`/details`)**: Beat detail management and progress analysis
- **Move (`/move`)**: Strategic concepts for goal achievement and momentum

## 📚 Feature Documentation

Comprehensive feature documentation is available in `/docs/features/`:
- [Quick Start with €100K Template](.docs/features/QUICK-START-GUIDE.md) - Get you up and running
- [Beat Grid Tracking](./docs/features/beat-grid-tracking.md) - Visual progress tracking system
- [Rewards System](./docs/features/rewards-system.md) - Achievement-based motivation management  
- [Motivational Statements](./docs/features/motivational-statements.md) - Personal inspiration framework
- [Allies Network](./docs/features/allies-network.md) - Support system organization
- [AI Chatbot](./docs/features/ai-chatbot.md) - Context-aware intelligent assistance
- [User Authentication](./docs/features/user-authentication.md) - Secure access control

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Install the Vercel CLI globally:

   ```bash
   npm install -g vercel
   ```

2. Deploy your application:

   ```bash
   vercel --prod
   ```

3. Follow the prompts to configure your deployment
4. Add your environment variables when prompted or via the Vercel dashboard

### Production Environment Variables

Ensure these are set in your production environment:

- `POSTGRES_URL` - Production PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Secure random 32+ character string
- `GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret
- `OPENAI_API_KEY` - OpenAI API key (optional)
- `OPENAI_MODEL` - OpenAI model name (optional, defaults to gpt-5-mini)
- `NEXT_PUBLIC_APP_URL` - Your production domain


## 🤝 Contributing

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
