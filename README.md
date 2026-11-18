# InstaBot - Instagram DM Automation

<div align="center">
  <h3>Turn Instagram Comments Into Customers</h3>
  <p>Automatically send DMs to users who comment specific keywords on your posts.</p>
</div>

---

## ✨ Features

- **🎯 Keyword-Triggered DMs** - Automatically send DMs when users comment specific words
- **👥 Follow Gating** - Require users to follow you before receiving content
- **📊 Analytics Dashboard** - Track comments, DMs sent, and conversion rates
- **🔐 Secure** - Uses official Instagram APIs, encrypted token storage
- **⚡ Instant** - DMs sent within seconds of qualifying comments
- **🌙 24/7 Automation** - Works around the clock, even while you sleep

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Auth**: NextAuth.js
- **Styling**: Tailwind CSS + shadcn/ui
- **API**: Meta Graph API

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (recommend [Neon](https://neon.tech))
- Meta Developer Account with Facebook App

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/instabot.git
   cd instabot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

## 📝 Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random string for session encryption |
| `NEXTAUTH_URL` | Your app's URL |
| `FACEBOOK_APP_ID` | Meta App ID |
| `FACEBOOK_APP_SECRET` | Meta App Secret |
| `WEBHOOK_VERIFY_TOKEN` | Custom token for webhook verification |
| `ENCRYPTION_KEY` | 64-char hex string for token encryption |

## 🔧 Meta App Setup

1. Go to [Meta Developers](https://developers.facebook.com)
2. Create a new app (Consumer type)
3. Add **Facebook Login** product
4. Configure OAuth redirect: `https://your-domain.com/api/instagram/callback`
5. Add required permissions:
   - `instagram_basic`
   - `instagram_manage_messages`
   - `instagram_manage_comments`
   - `pages_show_list`
   - `pages_read_engagement`
   - `business_management`
6. Configure Webhooks:
   - URL: `https://your-domain.com/api/webhook`
   - Verify Token: Your `WEBHOOK_VERIFY_TOKEN`
   - Subscribe to: `comments`, `messages`, `messaging_postbacks`

## 📦 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

```bash
npm i -g vercel
vercel
```

### After Deployment

1. Update `NEXTAUTH_URL` with your Vercel URL
2. Update Meta App OAuth redirect URI
3. Configure webhooks with your production URL

## 📁 Project Structure

```
├── app/
│   ├── (auth)/           # Login, Register pages
│   ├── (dashboard)/      # Dashboard, Campaigns, Settings
│   ├── (marketing)/      # Landing page
│   └── api/              # API routes
│       ├── auth/         # NextAuth handlers
│       ├── campaigns/    # Campaign CRUD
│       ├── instagram/    # OAuth, Posts
│       └── webhook/      # Instagram webhooks
├── components/
│   ├── ui/               # shadcn/ui components
│   └── dashboard/        # Dashboard components
├── lib/
│   ├── auth.ts           # NextAuth config
│   ├── db.ts             # Prisma client
│   ├── encryption.ts     # Token encryption
│   └── meta/             # Meta API client
└── prisma/
    └── schema.prisma     # Database schema
```

## 🔒 Security

- Access tokens are encrypted with AES-256-GCM
- Passwords hashed with bcrypt
- All API routes protected with session verification
- Webhook payloads validated
- Rate limiting on API endpoints

## 📄 License

MIT License - feel free to use for your own projects!

## 🤝 Support

- Open an issue for bugs
- Star the repo if you find it useful!

---

<div align="center">
  Made with ❤️ for Instagram Creators
</div>
