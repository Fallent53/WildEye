This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## License

WildEye is copyright (c) 2026 Loris Dc.

This project is licensed under the GNU Affero General Public License version 3
(`AGPL-3.0-only`). If someone modifies the project and runs it as a network
service, the AGPLv3 requires them to offer the corresponding source code to the
users of that service.

The attribution notice `Designed & Developed by Loris Dc` must be preserved in
the interactive interface or equivalent legal notices. See `LICENSE` and
`NOTICE.md` for details.

## Admin passcode

The admin passcode is never checked in browser code. It is verified by
`/api/admin/login` against the `public.admin_passcodes` table.

To create a new admin passcode hash:

```bash
npm run admin:passcode -- "your-new-passcode"
```

Run the generated SQL in Supabase after applying the migrations. Use a new
passcode if an older one was exposed in client code.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
