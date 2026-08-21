# Next.js developer exercise

&copy; 2026 Renderbit Technologies Pvt. Ltd.

## Prerequisites

You should be familiar with Node.js, React, Next.js, Git and GitHub.

## Getting Started

This tutorial assumes you have a Node.js development environment set up on your machine, with the following components at minimum:

1. Node.js 20 or better
2. Choice of package manager (npm/Yarn/pnpm)
3. Choice of Database (MySQL/MariaDB/PostgreSQL/SQLite)
4. Choice of IDE/Editor

Fork this repository, and clone your fork locally. All submissions have to be made as a pull request against this repository.

## Local Development Setup

To run the project locally, follow these steps:

### 1. Configure Environment Variables
Create a `.env` file in the root directory and copy the contents from `.env.example`:
```bash
cp .env.example .env
```
Update the `DATABASE_URL` in `.env` with your PostgreSQL database credentials and DB name.
Configure `AUTH_SECRET` by generating a new 32-byte secret:
```bash
openssl rand -hex 32
```

### 2. Install Dependencies & Generate Client
Install the npm dependencies and compile the Prisma Client:
```bash
npm install
npx prisma generate
```

### 3. Setup the Database Schema
Apply the database migrations to provision the schema locally:
```bash
npx prisma migrate dev
```

### 4. Run the Dev Server
Start the Next.js development server:
```bash
npm run dev
```
By default, the server runs on `http://localhost:3000`.

## Requirements

You have to design a blogging application using Next.js.

Any user can sign up and create a blog of their own. When signing up, you have to record the user's full name, unique email address, password (8 characters minimum with 1 special character required) and choice of unique username.

The homepage of the blog can be viewed by anyone without logging in. The homepage shall show a list of all blog posts by all users, with most recent posts on top. The list of blog posts shall be paginated, with 8 posts per page. On clicking a post, a user can view the entire post content.

Every user shall have his/her blog home page at `<sitename>/<username>`. This page shall show a list of all posts by the particular user, with the most recent posts on top. This list of blog posts shall also be paginated, with 8 posts per page. On clicking a post, a user can view the entire post content.

A blog post has the URL `<sitename>/<username>/<post_unique_slug_from_title>`. A blog post has a post title and post content. Anyone can view a blog post without logging in. However, you need to log in to comment on a blog post. Any user can comment on any blog post. However, a user can only delete comments that he has made on other users' blog posts. The author of the blog post can delete any comment on the blog post made by any user. The comments are shown below the blog post content, with the most recent comments on top. A form to add a new comment is shown above the comments thread.

Every user can access the admin panel at `<sitename>/admin`. A user has to log in to access the admin panel. The admin panel should show a list of all posts by the logged-in user, with an option to edit and delete each post. The admin panel should also have an option to create a new post.

### UI

You are free to use any UI framework or library of your choice. We recommend [Tailwind CSS](https://tailwindcss.com) (already set up in this starter) or a component library such as [shadcn/ui](https://ui.shadcn.com) as a good place to get started.

Note that you are not required to build a mobile-responsive website, although if you build one, we will be assigning extra credits for that.

### Libraries & Frameworks

You are free to use any libraries, frameworks & tools which you think will be useful to build this application. No credits are deducted for use of libraries. This includes your choice of database driver or ORM (such as [Prisma](https://www.prisma.io) or [Drizzle](https://orm.drizzle.team)) and your choice of authentication approach (such as [NextAuth.js](https://next-auth.js.org)/Auth.js, [Lucia](https://lucia-auth.com), or a custom implementation).

### Extra Credits

- Implement a super admin portal with an option to create, edit & delete all users, posts, etc. (with a separate super admin user type)
- Implement a social login feature which allows users to log in and sign up via their Google/Facebook/Twitter/GitHub accounts.
- Allow photos to be inserted into blog posts.
- Allow WYSIWYG editing of blog posts with rich formatting support.
- Implement a CAPTCHA for adding comments.
- Implement two-factor authentication for login using SMS for one-time passwords.
- Surprise us. :smiley:
