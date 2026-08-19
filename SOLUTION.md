# Blogging Application — Solution

## Stack
- Next.js 16 (App Router) + TypeScript
- Prisma ORM + SQLite
- Tailwind CSS
- Custom auth: bcryptjs for password hashing, jose for JWTs in httpOnly cookies

## Setup
\`\`\`bash
npm install
npx prisma migrate dev
npm run dev
\`\`\`
Create a `.env` file with:
\`\`\`
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-here"
\`\`\`

## Features
- Signup with full name, unique email, unique username, password (8+ chars, 1 special character)
- Login / logout via httpOnly JWT cookie
- Public homepage listing all posts, newest first, 8 per page
- Per-user blog at `/[username]`, also paginated at 8 per page
- Individual post at `/[username]/[slug]`
- Comments: login required to post; newest first; form above the thread
- Comment deletion: a user can delete their own comments; a post author can delete any comment on their post
- Admin panel at `/admin` — list, create, edit, delete own posts

## Design decisions

**Slug uniqueness is scoped per author** (`@@unique([authorId, slug])`) rather than globally. Since post URLs are `/username/slug`, two different users can both have a post titled "Hello World" without collision. Duplicate titles by the same author get a numeric suffix.

**Server components query the database directly.** Public pages (homepage, user blog, post page) are server components with no client-side fetching, so content is server-rendered. Only interactive parts (forms, delete buttons) are client components.

**Authorization is enforced server-side, not in the UI.** Delete buttons are conditionally rendered, but the actual permission check lives in the API route — the UI check is convenience, not security.

**Ownership checks use a two-key pattern:** every mutation looks the record up by ID and then verifies the owner ID from the JWT before acting. Post edit/delete returns 404 rather than 403 on an ownership mismatch, to avoid leaking whether a post exists.

## Not implemented
Extra credit items (social login, image uploads, WYSIWYG, CAPTCHA, 2FA) were not attempted, to focus on completing all core requirements.