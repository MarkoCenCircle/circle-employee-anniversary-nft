This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api](http://localhost:3000/api)

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Database

We deploy the Postgres instance on Vercel and use Prisma to maintain the database schema migration

### Change database schema

1. Update the db schema in `prisma/schema.prisma`
2. Run `npm run db:migrate` to sync the updates to the vercel db instance

### Query database

Run `npm run db:studio` to start the Prisma Studio on `http://localhost:5555/`, you can view and edit on the web page
