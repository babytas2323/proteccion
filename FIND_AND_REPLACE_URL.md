# How to Find and Replace the Placeholder URL

## Location of the Placeholder

The placeholder URL `https://your-php-backend-url.com` is located in:
- **File**: `src/App.jsx`
- **Function**: `getApiBaseUrl()`
- **Line**: Approximately line 25

## How to Find It

### Method 1: Search in Your Code Editor
1. Open your project in your code editor (VS Code, Atom, etc.)
2. Use the search function (Ctrl+F or Cmd+F)
3. Search for "your-php-backend-url.com"
4. You'll find it in `src/App.jsx`

### Method 2: Search in File Explorer
1. Open File Explorer
2. Navigate to your project folder
3. Open `src/App.jsx` in a text editor
4. Look for the `getApiBaseUrl()` function

## What You'll See

```javascript
const getApiBaseUrl = () => {
  // In development, use localhost with the correct port
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3004';
  }
  
  // For production, you need to deploy your backend and update this URL
  // Examples:
  // For PHP backend: return 'https://your-actual-domain.com/api';
  // For Render backend: return 'https://your-render-app.onrender.com';
  
  // IMPORTANT: Replace this with your actual deployed backend URL
  return 'https://your-php-backend-url.com/api'; // ← THIS LINE NEEDS TO BE CHANGED
};
```

## How to Replace It

### If Using PHP Backend:
Replace with your actual domain from your hosting provider:
```javascript
return 'https://your-actual-site.000webhostapp.com/api';
```

### If Using Node.js Backend on Render:
Replace with your Render URL:
```javascript
return 'https://tetela-radar-backend-xxxx.onrender.com';
```

## After Making Changes

1. Save the file
2. Commit and push to GitHub
3. If using Vercel, it will automatically redeploy
4. Test your application at https://proteccion-ten.vercel.app

## Need Help Finding Your URL?

If you're not sure what your actual backend URL should be:

1. **For 000webhost**: Check your dashboard for your site URL
2. **For Render**: Check your Render dashboard for your service URL
3. **For other hosting**: Check your hosting provider's dashboard

## Example URLs

Here are examples of what your actual URLs might look like:

- **000webhost**: `https://my-tetela-app.000webhostapp.com/api`
- **InfinityFree**: `https://myusername.infinityfreeapp.com/api`
- **Render**: `https://tetela-backend-abc123.onrender.com`
- **Local development**: `http://localhost:3004`

Remember to only include the base URL, not the full path to specific endpoints.