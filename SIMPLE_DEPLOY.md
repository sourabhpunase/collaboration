# 🚀 Deploy Backend (No CLI needed)

## **Option 1: Render.com (Easiest)**

1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect this GitHub repo
5. Settings:
   - **Name**: `collabflow-api`
   - **Root Directory**: `api`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free
6. Click "Deploy"

✅ **Your API will be live at**: `https://collabflow-api.onrender.com`

## **Option 2: Railway (Browser)**

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "Deploy from GitHub repo"
4. Select your repo
5. Choose `api` folder
6. Click "Deploy"

✅ **Your API will be live at**: `https://collabflow-api.railway.app`

## **Option 3: Netlify**

1. Go to https://netlify.com
2. Drag and drop your `api` folder
3. It will deploy automatically

## **Test Your Deployment**

Once deployed, test:
```bash
curl https://your-api-url.com/health
# Should return: {"status":"OK"}
```

## **Next: Publish SDK**

```bash
cd ../sdk
npm login
npm publish --access public
```

**That's it!** No CLI commands needed.