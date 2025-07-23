# DeFi Portfolio App 🚀

A modern, ultra-responsive fullstack DeFi portfolio and trading platform built with Next.js, TypeScript, and Web3 integration.

## ✨ Features

- 🔐 **Web3 Wallet Integration** - Connect with MetaMask, WalletConnect, and more
- 💼 **Portfolio Management** - Track your DeFi positions across multiple protocols
- 🔄 **Token Swapping** - Seamless DEX aggregation with best price routing
- 📊 **Real-time Analytics** - Live price feeds and portfolio performance metrics
- 🤖 **AI Assistant** - Smart suggestions and automated portfolio optimization
- 📱 **Mobile-First Design** - Pixel-perfect responsive UI for all devices
- ⚡ **Ultra Performance** - Optimized bundle, instant loading, smooth animations

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript 5
- **Styling**: Tailwind CSS, Framer Motion
- **Web3**: Wagmi, Viem, RainbowKit
- **State Management**: Zustand, TanStack Query
- **Testing**: Jest, Testing Library, Playwright
- **Linting**: ESLint, Prettier, Husky

## 🚀 Quick Start

### Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd defi-portfolio-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your API keys:
   ```env
   # Required: Get from https://cloud.walletconnect.com
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
   
   # Required: Get from https://www.alchemy.com
   NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
   
   # Optional: For AI features (get from https://openai.com)
   OPENAI_API_KEY=your_openai_key
   
   # Optional: For enhanced analytics
   NEXT_PUBLIC_COINGECKO_API_KEY=your_coingecko_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run type-check` | Run TypeScript compiler |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run format` | Format code with Prettier |
| `npm run clean` | Clean build artifacts |

## 🏗️ Project Structure

```
├── src/
│   ├── app/                 # Next.js 14 App Router
│   ├── components/          # Reusable UI components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility libraries
│   ├── services/            # API and Web3 services
│   ├── stores/              # Zustand state stores
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Helper functions
├── public/                  # Static assets
├── tests/                   # Test files
└── docs/                    # Documentation
```

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Coverage Report
```bash
npm run test:coverage
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy automatically

### Docker
```bash
docker build -t defi-app .
docker run -p 3000:3000 defi-app
```

## 🔧 Configuration

### Environment Variables

All environment variables are documented in `.env.example`. Copy this file to `.env.local` and fill in your values.

### Web3 Configuration

The app uses RainbowKit for wallet connections. Configure supported chains in `src/lib/wagmi.ts`.

### API Keys

- **WalletConnect**: Required for wallet connections
- **Alchemy**: Required for blockchain data
- **OpenAI**: Optional for AI features
- **CoinGecko**: Optional for enhanced price data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [documentation](docs/)
2. Search existing [issues](../../issues)
3. Create a new issue with detailed information

---

Built with ❤️ by the DeFi Portfolio team