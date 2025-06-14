# React Authentication App with Supabase

A simple React application with authentication screens including Login, Signup, and a Home page, connected to Supabase for backend authentication.

## Features

- Login page with Supabase authentication
- Signup page with Supabase user registration
- Home page with logout functionality
- Routing between pages

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Configure your Supabase credentials:
   - Create a file named `.env.local` in the project root
   - Add the following environment variables:
   ```
   VITE_SUPABASE_URL=https://your_project_id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_VITE_SUPABASE_ANON_KEY
   ```
   - Replace `your_VITE_SUPABASE_ANON_KEY` with your actual Supabase anon/public key

4. Start the development server:

```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Notes

- You must set up your own Supabase project and configure the environment variables for authentication to work
- For production, ensure you properly secure your environment variables
- Consider implementing additional features like password reset, email verification, and profile management
-
- ![Screenshot from 2025-06-12 10-31-03](https://github.com/user-attachments/assets/4a2ee00a-6b8e-40f4-b473-0a72db883a71)





