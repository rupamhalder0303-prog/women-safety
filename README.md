# Sakhi — Women's Safety App

A learning prototype built with HTML, CSS, JavaScript,
Vercel serverless functions, and Supabase PostgreSQL.

## Features

- Demo SOS alert recording
- Trusted contact management
- Journey planning and arrival check-ins
- Demo alert history
- Responsive layout

## Requirements

- Node.js 20 or newer
- Git
- A Supabase project
- A Vercel account for deployment

## Database setup

1. Create a project in Supabase.
2. Open SQL Editor in the Supabase dashboard.
3. Run the contents of supabase-schema.sql.

## Local setup

Install dependencies:

    npm install

Create a .env file beside package.json:

    SUPABASE_URL=https://YOUR-PROJECT.supabase.co
    SUPABASE_SERVICE_ROLE_KEY=YOUR_SECRET_KEY

Start the Vercel development server:

    npx vercel dev

Open the local URL printed by the terminal.

On Windows, if PowerShell blocks npm scripts, use
Command Prompt or try npm.cmd and npx.cmd.

## Deployment

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Add SUPABASE_URL in Vercel Environment Variables.
4. Add SUPABASE_SERVICE_ROLE_KEY in Vercel Environment Variables.
5. Deploy the project.

Redeploy after changing production environment variables.

## Security warning

This is a prototype, not an emergency service.

SOS events are stored but no SMS, police call, or
trusted-contact notification is sent.

The prototype has no login or per-user authorization.
Do not store real sensitive information or launch it as
a real safety service until authentication, access
controls, rate limiting, data retention, and security
testing have been implemented.
