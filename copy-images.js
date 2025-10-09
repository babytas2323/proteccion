import fs from 'fs';
import path from 'path';

// Function to copy folder recursively
function copyFolderRecursiveSync(source, target) {
  // Check if folder needs to be created or integrated
  const targetFolder = path.join(target, path.basename(source));
  
  // Create target folder if it doesn't exist
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true });
  }

  // Copy files and folders
  if (fs.lstatSync(source).isDirectory()) {
    const files = fs.readdirSync(source);
    files.forEach(function (file) {
      const curSource = path.join(source, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder);
      } else {
        const targetFile = path.join(targetFolder, file);
        fs.copyFileSync(curSource, targetFile);
        console.log(`Copied ${curSource} to ${targetFile}`);
      }
    });
  }
}

// Create dist/images directory if it doesn't exist
if (!fs.existsSync('dist/images')) {
  fs.mkdirSync('dist/images', { recursive: true });
}

// Copy images if public/images exists
if (fs.existsSync('public/images')) {
  const files = fs.readdirSync('public/images');
  files.forEach(function (file) {
    const sourceFile = path.join('public/images', file);
    const targetFile = path.join('dist/images', file);
    fs.copyFileSync(sourceFile, targetFile);
    console.log(`Copied ${sourceFile} to ${targetFile}`);
  });
  console.log('Images copied successfully');
} else {
  console.log('No public/images directory found');
}