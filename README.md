# DashCash landing page

Marketing landing page prototype for DashCash, a money dashboard for local businesses.

## Development

```sh
npm install
npm run dev
```

## Production build

```sh
npm run build
```

## Cloudflare Pages

Connect this repository to Cloudflare Pages and configure:

- Build command: `npm run build`
- Build output directory: `dist`

The early-access signup currently displays an on-page confirmation only; it does not send or save email addresses. Connect a form service or backend before collecting real signups.
