# Coffee Shop POS System

A comprehensive Point of Sale system for coffee shops built with React, featuring inventory management, sales tracking, discount codes, and business reports.

## Features

- **Point of Sale** - Product selection, cart management, and checkout
- **Discount Codes** - Create and manage percentage or fixed-amount discounts
- **Inventory Management** - Track stock levels and add new products
- **Sales History** - Complete transaction records with timestamps
- **Business Reports** - Revenue tracking, top products, and analytics
- **Persistent Storage** - All data saved across sessions

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Navigate to the project directory:
   ```bash
   cd coffee-shop-pos
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Deploy to Vercel:
   ```bash
   vercel
   ```

5. Follow the prompts to complete deployment

### Option 2: Deploy via Vercel Dashboard

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)

3. Click "Add New Project"

4. Import your Git repository

5. Vercel will automatically detect it's a Vite project and configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

6. Click "Deploy"

### Option 3: Import from Local Directory

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Deploy the `dist` folder to Vercel:
   ```bash
   vercel --prod
   ```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:5173 in your browser

## Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

## Tech Stack

- React 18
- Vite
- Lucide React (icons)
- Browser Storage API (data persistence)

## Pre-loaded Data

The system comes with:
- 16 sample products across categories (Coffee, Pastry, Cold Drinks, Tea)
- 4 discount codes (WELCOME10, COFFEE20, SAVE5, FREEPASTRY)

## License

MIT
