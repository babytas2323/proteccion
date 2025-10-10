# GitHub Integration for Tetela Radar

This document explains how to set up GitHub integration for permanent data storage in the Tetela Radar application.

## How It Works

The application uses GitHub as a data persistence layer, storing incident reports directly in a GitHub repository. This approach provides:

1. Permanent data storage without running a local backend server
2. Version control for all incident reports
3. Easy data backup and recovery
4. Collaborative access to incident data

## Current Implementation

The current implementation can:
- Load data from the GitHub repository (read-only)
- Check GitHub repository availability
- Provide a framework for saving data to GitHub

## Setting Up Write Access

To enable write access to GitHub, you need to:

1. Create a GitHub Personal Access Token:
   - Go to GitHub Settings > Developer settings > Personal access tokens
   - Generate a new token with `repo` scope
   - Copy the token value

2. Add the token to your environment:
   ```javascript
   // In src/config/github.js
   const githubConfig = {
     owner: 'babytas2323',
     repo: 'proteccion',
     path: 'src/data/accidents.json',
     branch: 'main',
     token: 'YOUR_GITHUB_TOKEN_HERE', // Add your token here
     apiUrl: 'https://api.github.com',
     rawUrl: 'https://raw.githubusercontent.com'
   };
   ```

3. Update the saveToGitHub function in `src/utils/githubHandler.js` to use the token:
   ```javascript
   export const saveToGitHub = async (data) => {
     try {
       const url = `${githubConfig.apiUrl}/repos/${githubConfig.owner}/${githubConfig.repo}/contents/${githubConfig.path}`;
       
       // First, get the current file to get its SHA (required for updating)
       const response = await fetch(url, {
         headers: {
           'Authorization': `token ${githubConfig.token}`
         }
       });
       
       if (!response.ok) {
         throw new Error(`GitHub API error: ${response.status}`);
       }
       
       const fileData = await response.json();
       
       // Update the file
       const updateResponse = await fetch(url, {
         method: 'PUT',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `token ${githubConfig.token}`
         },
         body: JSON.stringify({
           message: `Update accident data ${new Date().toISOString()}`,
           content: btoa(JSON.stringify(data, null, 2)), // Base64 encode
           sha: fileData.sha, // Required for updating existing file
           branch: githubConfig.branch
         })
       });
       
       if (!updateResponse.ok) {
         const errorData = await updateResponse.json();
         throw new Error(`GitHub update failed: ${errorData.message}`);
       }
       
       return await updateResponse.json();
     } catch (error) {
       console.error('Error saving to GitHub:', error);
       throw error;
     }
   };
   ```

## Security Considerations

1. **Never commit tokens to version control**: Use environment variables or secure storage
2. **Limit token scope**: Only grant necessary permissions (repo scope for private repos)
3. **Token rotation**: Regularly rotate tokens for security
4. **Rate limiting**: GitHub API has rate limits, especially for unauthenticated requests

## Alternative Approaches

1. **GitHub Actions**: Use workflows to process data updates
2. **GitHub Pages**: Serve the application directly from GitHub
3. **GitHub Issues**: Store incident reports as GitHub issues
4. **Git LFS**: For large data files

## Troubleshooting

Common issues and solutions:

1. **403 Forbidden**: Check token permissions and validity
2. **404 Not Found**: Verify repository owner, name, and file path
3. **422 Unprocessable Entity**: Check file SHA and content format
4. **Rate Limiting**: Implement proper error handling for rate limits

## Future Enhancements

1. Implement proper authentication with token management
2. Add conflict resolution for concurrent updates
3. Implement data validation before saving
4. Add rollback functionality for erroneous updates
5. Implement batch operations for better performance