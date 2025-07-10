# ⚡ Quick Deploy Backend (2 minutes)

## **Option 1: Railway (Easiest)**

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Deploy
cd api
railway new collabflow-api
railway add
railway deploy

# ✅ Done! Your API is live at: https://collabflow-api.railway.app
```

## **Option 2: Vercel**

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
cd api
vercel --prod

# ✅ Done! Your API is live
```

## **Option 3: Render (No CLI needed)**

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Settings:
   - **Root Directory**: `api`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Click "Deploy"

## **Option 4: One-Click Script**

```bash
# Run the deployment script
chmod +x deploy.sh
./deploy.sh
```

## **Test Your Deployment**

```bash
# Test if it's working
curl https://your-api-url.com/health

# Should return: {"status":"OK","timestamp":"..."}
```

## **Update SDK to Use Your API**

```jsx
// In your SDK usage
<CollabFlowProvider apiUrl="https://your-api-url.com">
  <CollabEditor projectId="test" />
</CollabFlowProvider>
```

**That's it!** Your backend is now live and ready for others to use.