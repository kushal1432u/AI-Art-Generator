This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

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

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

---

### AI Image Generation Configuration

The app relies on a backend service (`/generate` endpoint) that calls the Hugging Face inference API. By default it uses the **FLUX.1-schnell** model via the new `router.huggingface.co` endpoint, which is more stable than the earlier FLUX.1-dev variant.

To enable realistic output you should create a `.env` file in the `backend` folder containing your Hugging Face token:

```env
HUGGINGFACE_API_KEY=hf_...your_token_here...
```

Also make sure to install Python dependencies (the project now uses the `huggingface_hub` client which supports the new router API):

```bash
cd backend
pip install -r requirements.txt
```

If you've been running the server already, restart it so the upgraded client is loaded.

The backend will automatically wait for the model to finish loading and surface any error messages; if you see `Failed to load generated image` in the UI it usually means the server returned JSON instead of an image (model still loading or another HF error). The fix is to retry once the model has warmed up or switch to a more stable model as shown above.

**Quick test prompt:**
```
a cute fluffy orange cat sitting on a sofa, ultra realistic, 4k
```
This should generate a realistic-looking image if everything is configured correctly.


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
