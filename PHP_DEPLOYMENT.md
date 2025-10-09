# PHP Backend Deployment Guide

This guide will help you deploy your PHP backend so your Vercel frontend can connect to it.

## Prerequisites

1. A hosting account that supports PHP (many free options available)
2. FTP or Git deployment access
3. A domain or subdomain for your API

## Hosting Options

### Free PHP Hosting Options

1. **000WebHost** - Free PHP hosting with MySQL
2. **InfinityFree** - Free hosting with PHP and MySQL
3. **FreeHostingNoAds** - Free PHP hosting
4. **GitHub Pages with a proxy** - For static sites (requires additional setup)

### Paid Options (Recommended for Production)

1. **SiteGround** - Excellent PHP hosting
2. **Bluehost** - Popular shared hosting
3. **HostGator** - Reliable PHP hosting
4. **DigitalOcean** - VPS hosting (more control)

## Deployment Steps

### Option 1: Deploy to Shared Hosting (Most Common)

1. **Prepare Your Files**
   - Upload all files from your project to your hosting account
   - Make sure the directory structure is maintained:
     ```
     /public_html/ (or your root directory)
     ├── api/
     │   ├── accidents.php
     │   ├── upload.php
     │   ├── restore.php
     │   └── .htaccess
     ├── public/
     │   └── images/
     └── src/
         └── data/
     ```

2. **Set Permissions**
   - Set write permissions for the data directory:
     ```bash
     chmod 777 src/data/
     ```
   - Set write permissions for the images directory:
     ```bash
     chmod 777 public/images/
     ```

3. **Test Your API**
   - Visit `https://yourdomain.com/api/accidents.php`
   - You should see an empty JSON array `[]`

### Option 2: Deploy to GitHub Pages with Proxy

1. **Set up a proxy service** like:
   - https://github.com/jamesward/cloudfront-edge-proxy
   - Or use a service like https://proxy.hackery.site/

2. **Configure your frontend** to use the proxy URL

## Updating Your Frontend

1. Update the API base URL in `src/App.jsx`:
   ```javascript
   const getApiBaseUrl = () => {
     // In development
     if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
       return 'http://localhost/your-project/api'; // Local development
     }
     
     // Production with PHP backend
     return 'https://yourdomain.com/api'; // Your actual domain
   };
   ```

2. Push changes to Vercel

## Testing the Connection

1. Visit your frontend URL
2. Open browser developer tools (F12)
3. Try to add a new incident
4. Check the Network tab to see if API requests are successful

## Troubleshooting

### Common Issues

1. **403 Forbidden Errors**
   - Check file permissions
   - Ensure .htaccess files are processed

2. **CORS Errors**
   - The PHP files already include CORS headers
   - If issues persist, check your hosting provider's CORS policy

3. **500 Internal Server Error**
   - Check PHP error logs
   - Ensure PHP version is 7.4 or higher
   - Verify all required PHP extensions are enabled

4. **File Upload Issues**
   - Check PHP upload limits in php.ini:
     ```
     upload_max_filesize = 10M
     post_max_size = 10M
     ```

### Checking Error Logs

Most hosting providers offer access to error logs through their control panel:
1. Log into your hosting control panel
2. Look for "Error Logs" or "PHP Error Logs"
3. Check for any recent errors

## Security Considerations

1. **File Uploads**
   - The upload script validates file types and sizes
   - Consider adding additional validation for production

2. **Data Directory**
   - The data directory should be outside the web root in production
   - Currently it's in src/data which is accessible via web

3. **API Access**
   - Consider adding authentication for sensitive operations
   - Implement rate limiting to prevent abuse

## Next Steps

### Move to Database (Recommended)

For production use, consider migrating from JSON files to a database:

1. **MySQL/MariaDB**
   ```php
   <?php
   $pdo = new PDO('mysql:host=localhost;dbname=your_db', $username, $password);
   ?>
   ```

2. **SQLite**
   ```php
   <?php
   $pdo = new PDO('sqlite:/path/to/database.sqlite');
   ?>
   ```

### Add Authentication

1. Implement user authentication
2. Add API keys or tokens for requests
3. Validate all input data

## Support

If you encounter issues:

1. Check browser console (F12) for specific error messages
2. Check your hosting provider's error logs
3. Verify all file permissions are correct
4. Ensure PHP is properly configured

With these steps, your application will have a fully functional PHP backend that can persist data between sessions.