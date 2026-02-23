# COMP3133 Assignment 1

A small GraphQL API built with Node, Express, Apollo Server, and MongoDB. It handles user signup/login and employee records (CRUD, search by designation or department). Optional photo uploads use Cloudinary.

## Setup

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env` (or create it) and set your own values:

   - `PORT` — server port (default `4000`)
   - `MONGODB_URI` — MongoDB connection string
   - `JWT_SECRET` — secret for JWT signing
   - `CLOUDINARY_*` — Cloudinary credentials (only needed for photo uploads)

3. Start the server:

   ```bash
   npm start
   ```

   For development with auto-restart:

   ```bash
   npm run dev
   ```

The GraphQL endpoint is at `http://localhost:4000/graphql`. Use the playground there to run queries and mutations.

## What’s included

- **Auth:** `signup` and `login` (username or email). Passwords are hashed with bcrypt; responses include a JWT.
- **Employees:** List all, get by ID, add, update, delete, and search by designation or department.
- **Photos:** Employee photo upload via Cloudinary (when configured).

No real secrets or connection strings are committed; keep your `.env` local and out of version control.
