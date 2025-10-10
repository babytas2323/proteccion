/**
 * GitHub Handler Utility
 * Handles data persistence to GitHub repository
 */

import githubConfig from '../config/github.js';

/**
 * Load data from GitHub repository
 * @returns {Promise<Array>} Array of accident data
 */
export const loadFromGitHub = async () => {
  try {
    const url = `${githubConfig.rawUrl}/${githubConfig.owner}/${githubConfig.repo}/${githubConfig.branch}/${githubConfig.path}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data from GitHub: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading from GitHub:', error);
    throw error;
  }
};

/**
 * Save data to GitHub repository
 * @param {Array} data - Array of accident data to save
 * @returns {Promise<Object>} GitHub API response
 */
export const saveToGitHub = async (data) => {
  try {
    // For public repositories with write access, we would need a token
    // This is a simplified version that shows the approach
    console.warn('GitHub saving requires authentication token for write operations');
    console.log('Data that would be saved to GitHub:', JSON.stringify(data, null, 2));
    
    // In a real implementation with proper authentication:
    /*
    const url = `${githubConfig.apiUrl}/repos/${githubConfig.owner}/${githubConfig.repo}/contents/${githubConfig.path}`;
    
    // First, get the current file to get its SHA (required for updating)
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`
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
        'Authorization': `token ${GITHUB_TOKEN}`
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
    */
    
    // Return a mock success response for now
    return {
      success: true,
      message: 'Data would be saved to GitHub (mock response)'
    };
  } catch (error) {
    console.error('Error saving to GitHub:', error);
    throw error;
  }
};

/**
 * Check if GitHub repository is accessible
 * @returns {Promise<boolean>} Whether GitHub repository is accessible
 */
export const isGitHubAvailable = async () => {
  try {
    const url = `${githubConfig.rawUrl}/${githubConfig.owner}/${githubConfig.repo}/${githubConfig.branch}/${githubConfig.path}`;
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('GitHub availability check failed:', error);
    return false;
  }
};

export default {
  loadFromGitHub,
  saveToGitHub,
  isGitHubAvailable
};