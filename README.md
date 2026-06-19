# Growix 📈

**Growix** is a real-time stock market tracking platform that delivers live price updates, personalized alerts, and in-depth company insights — helping users make informed investment decisions.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)

---

## Features

- **Real-time stock tracking** — Live price updates so users always have current market data.
- **Personalized alerts** — Custom notifications based on price thresholds and user-defined criteria, powered by background jobs.
- **Company insights** — Detailed company data to support research and decision-making.
- **Secure authentication** — User accounts and sessions handled via BetterAuth.
- **Modern, responsive UI** — Built with Shadcn UI components and Tailwind CSS.

## Tech Stack

| Layer                    | Technology                                   |
| ------------------------ | -------------------------------------------- |
| Framework                | [Next.js](https://nextjs.org)                |
| Language                 | [TypeScript](https://www.typescriptlang.org) |
| Styling                  | [Tailwind CSS](https://tailwindcss.com)      |
| UI Components            | [Shadcn UI](https://ui.shadcn.com)           |
| Database                 | [MongoDB](https://www.mongodb.com)           |
| Background Jobs / Alerts | [Inngest](https://www.inngest.com)           |
| Authentication           | [BetterAuth](https://www.better-auth.com)    |

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB connection string (local or [Atlas](https://www.mongodb.com/atlas))

### Installation

```bash
git clone https://github.com/<your-username>/growix.git
cd growix
pnpm install
```

## Environment Variables

Create a `.env.local` file in the root directory and add the following:

```env
# Application
NODE_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication (BetterAuth)
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:3000

# AI Integration
GEMINI_API_KEY=your_gemini_api_key

# Inngest
INNGEST_DEV=true

# Email Service (Nodemailer)
NODEMAILER_EMAIL=your_email@example.com
NODEMAILER_PASSWORD=your_email_password

# Stock Market Data
NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_api_key
```

Update these values with your own credentials before running the application.

> Update these values to match your own credentials and services.

### Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### Running Inngest Locally

Start the Next.js development server:

```bash
npm run dev
```

In a separate terminal, start the Inngest development server:

```bash
npx inngest-cli@latest dev
```

Or, if you have the CLI installed globally:

```bash
inngest dev
```

The Inngest Dev Server will typically be available at:

```text
http://localhost:8288
```

Make sure your Inngest functions endpoint is configured correctly in your application (for example, `/api/inngest` if you're using Next.js App Router).

Once both servers are running:

- Next.js app → `http://localhost:3000`
- Inngest Dev Server → `http://localhost:8288`

You can trigger events from your application and monitor function executions in the Inngest dashboard.

## Project Structure

```
growix/
├── app/              # Next.js app router pages and layouts
├── components/       # Reusable UI components (Shadcn-based)
├── lib/              # Utilities, database, and auth config
├── inngest/          # Background jobs and alert functions
└── public/           # Static assets
```

## Deployment

The easiest way to deploy Growix is via the [Vercel Platform](https://vercel.com/new), the creators of Next.js. See the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for details.

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to open a pull request or file an issue.

## License

This project is licensed under the [MIT License](LICENSE).
