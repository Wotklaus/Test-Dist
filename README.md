# Test-Dist
# Pokémon JAMstack Project

## Current Architecture

- **Frontend:** Vanilla JS + HTML + CSS
- **Backend:** (Express/Node) **Currently not in use** for authentication, registration, or favorites. The backend is kept in the repository in case custom logic is needed in the future.
- **Database & Authentication:** [Supabase](https://supabase.com/) (PostgreSQL + Auth)
- **CMS:** [Contentful](https://www.contentful.com/) for dynamic content management.
- **Hosting:** [Render](https://render.com/)

## Why is the backend inactive?

All main operations (authentication, registration, favorites) are now handled directly from the frontend using Supabase JS.  
Logic previously managed by the Express/Node backend has been migrated to the frontend, which connects directly to Supabase and Contentful (when needed).

The backend remains in the repository as a backup, should custom business logic, external services, or advanced requirements arise in the future.

## How does the current flow work?

1. **The user interacts with the frontend.**
2. **The frontend connects directly to Supabase** for authentication, user management, and favorites.
3. **The frontend queries Contentful** for dynamic content (if needed).
4. **Render hosts the frontend** (and optionally the inactive backend).