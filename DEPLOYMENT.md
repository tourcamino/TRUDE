# TRUDE DeFi App - Deployment Guide

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect to Vercel:**
   ```bash
   npm i -g vercel
   vercel login
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Environment Variables in Vercel Dashboard:**
   - Copy from `.env.example` and add your real API keys
   - Set `NODE_ENV=production`
   - Set `DB_FALLBACK_MEM=1` for in-memory database

### Option 2: Render

1. **Connect GitHub repository to Render**
2. **Use render.yaml configuration**
3. **Set environment variables in Render dashboard**

### Option 3: Manual Deployment

1. **Build the application:**
   ```bash
   npm run build:vercel
   ```

2. **Start production server:**
   ```bash
   npm run start:prod
   ```

## 📋 Pre-deployment Checklist

- [ ] Set up environment variables
- [ ] Configure blockchain RPC URLs
- [ ] Add API keys for external services
- [ ] Test build locally
- [ ] Configure domain (optional)

## 🔧 Environment Variables

### Required for Basic Functionality:
```env
NODE_ENV=production
DB_FALLBACK_MEM=1
FACTORY_ADDRESS=0x0000000000000000000000000000000000000000
```

### For Full Features:
```env
# Blockchain
ETHEREUM_RPC_URL=your_alchemy_or_infura_url
POLYGON_RPC_URL=your_polygon_rpc

# APIs
DUNE_API_KEY=your_dune_key
MORALIS_API_KEY=your_moralis_key
OPENAI_API_KEY=your_openai_key

# Wallet
METAMASK_API_KEY=your_metamask_key
```

## 🌐 Features Available After Deployment

- ✅ DeFi Vault Management
- ✅ AI-Powered Trading Strategies  
- ✅ Real-time Portfolio Tracking
- ✅ Affiliate Program System
- ✅ Developer API Access
- ✅ Multi-chain Support (Ethereum, Polygon)

## 🆘 Troubleshooting

### White Screen Issues:
- Check browser console for errors
- Ensure all environment variables are set
- Verify build completed successfully

### Build Failures:
- Use `DB_FALLBACK_MEM=1` for database
- Check Node.js version compatibility
- Run `npm run build:vercel` locally first

### API Errors:
- Verify all API keys are valid
- Check network connectivity
- Review server logs

## 📞 Support

For deployment issues:
1. Check the build logs
2. Verify environment variables
3. Test locally first
4. Contact support if needed