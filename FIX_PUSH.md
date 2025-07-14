# 🔧 Fix GitHub Push Issue

## **Problem**: Git is using wrong user (57113SP instead of sourabhpunase)

## **Solution**: Create Personal Access Token

### **Step 1: Create Token**
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: `CollabFlow`
4. Select: ✅ `repo` (Full control)
5. Click "Generate token"
6. **Copy the token**

### **Step 2: Push with Token**
```bash
git push -u origin main
```

When prompted:
- **Username**: `sourabhpunase`
- **Password**: `[paste your token here]`

### **Alternative: Manual Upload**
If still doesn't work:

1. Go to https://github.com/sourabhpunase/collaboration
2. Click "Add file" → "Upload files"
3. Drag your entire project folder
4. Commit message: "Initial commit"
5. Click "Commit changes"

### **Step 3: Verify**
Check: https://github.com/sourabhpunase/collaboration

**Your code will be live and ready for deployment!**