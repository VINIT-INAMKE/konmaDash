# Frontend Setup Instructions

## Install shadcn/ui Components

Run these commands from the `frontend` directory to install all required shadcn components:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add table
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add dialog
npx shadcn@latest add alert
npx shadcn@latest add badge
npx shadcn@latest add tabs
npx shadcn@latest add separator
npx shadcn@latest add toast
npx shadcn@latest add toaster
```

## Start Development Server

```bash
npm run dev
```

## Environment Variables

Create `.env.local` if not exists:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Backend Connection

Make sure backend is running on port 5000:

```bash
cd ../backend
npm run dev
```
