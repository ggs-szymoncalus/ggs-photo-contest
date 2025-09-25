# GGS Photo Contest

A modern photo contest application built with the latest Next.js technologies.

## 🚀 Features

- **Next.js 15** - Latest version with App Router
- **TypeScript** - Full type safety
- **Tailwind CSS v4** - Modern styling with the latest version
- **Biome** - Fast linting and formatting (replaces ESLint + Prettier)
- **Turbopack** - Ultra-fast bundler for development and production
- **MSSQL Integration** - Ready-to-use Microsoft SQL Server database connection
- **Path Aliases** - Clean imports with `@/` alias pointing to `src/`
- **Responsive Design** - Mobile-first approach with Tailwind CSS

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Linting/Formatting**: Biome
- **Bundler**: Turbopack
- **Database**: Microsoft SQL Server (MSSQL)
- **Package Manager**: npm

## 📦 Project Structure

```
ggs-photo-contest/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── health/
│   │   │       └── route.ts      # Health check API endpoint
│   │   ├── globals.css           # Global styles with Tailwind
│   │   ├── layout.tsx           # Root layout component
│   │   └── page.tsx             # Home page
│   └── lib/
│       └── database.ts          # MSSQL database connection utility
├── public/                      # Static assets
├── biome.json                   # Biome configuration
├── next.config.ts               # Next.js configuration
├── package.json                 # Dependencies and scripts
├── postcss.config.mjs           # PostCSS configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── .env.example                 # Environment variables example
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm
- Microsoft SQL Server (for database features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ggs-szymoncalus/ggs-photo-contest.git
   cd ggs-photo-contest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your database configuration:
   ```env
   MSSQL_SERVER=your_server
   MSSQL_DATABASE=ggs_photo_contest
   MSSQL_USER=your_username
   MSSQL_PASSWORD=your_password
   MSSQL_PORT=1433
   MSSQL_ENCRYPT=false
   MSSQL_TRUST_SERVER_CERTIFICATE=true
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production with Turbopack
- `npm run start` - Start production server
- `npm run lint` - Run Biome linter
- `npm run lint:fix` - Fix linting issues automatically
- `npm run format` - Check code formatting
- `npm run format:fix` - Fix formatting issues automatically
- `npm run check` - Run both linting and formatting checks
- `npm run check:fix` - Fix both linting and formatting issues

## 🗄️ Database Integration

The application includes a pre-configured MSSQL integration:

- **Connection utility**: `src/lib/database.ts`
- **Health check endpoint**: `/api/health` - Test database connectivity
- **Environment-based configuration**: Supports both local and Azure SQL configurations

### Database Configuration

The database connection supports the following environment variables:

- `MSSQL_SERVER` - Database server address
- `MSSQL_DATABASE` - Database name
- `MSSQL_USER` - Username
- `MSSQL_PASSWORD` - Password
- `MSSQL_PORT` - Port (default: 1433)
- `MSSQL_ENCRYPT` - Enable encryption (for Azure: true)
- `MSSQL_TRUST_SERVER_CERTIFICATE` - Trust server certificate (for local dev: true)

## 🎨 Styling

This project uses **Tailwind CSS v4** with:

- **System fonts** - Optimized font stack for better performance
- **Dark mode support** - Automatic dark/light theme switching
- **Responsive design** - Mobile-first approach
- **Custom CSS variables** - Consistent theming

## 🔧 Code Quality

**Biome** is configured for optimal developer experience:

- **Fast linting** - Significantly faster than ESLint
- **Built-in formatting** - No need for Prettier
- **TypeScript support** - Native TypeScript understanding
- **Import sorting** - Automatic import organization
- **CSS linting** - Tailwind CSS compatibility

## 🏗️ Build System

**Turbopack** provides:

- **Fast development** - Faster than Webpack in dev mode
- **Optimized builds** - Production-ready optimizations
- **TypeScript support** - Built-in TypeScript compilation
- **CSS processing** - Native CSS and PostCSS support

## 🚀 Deployment

The application is ready for deployment on platforms like:

- **Vercel** (recommended for Next.js apps)
- **Netlify**
- **AWS**
- **Azure**
- **Google Cloud Platform**

### Build for production:
```bash
npm run build
```

### Start production server:
```bash
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for Turbopack
- Tailwind CSS team for the utility-first CSS framework
- Biome team for the fast toolchain
