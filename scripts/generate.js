const fs = require('fs');
const path = require('path');

// output directory for all generated files
const outDir = path.resolve(__dirname, '..', 'public');

// ensure the directory exists
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

// array of pages to generate
const pages = [
  { filename: 'index.html', content: '<!DOCTYPE html><html><body><h1>Home</h1><p>Welcome!</p></body></html>' },
  { filename: 'test/about.html', content: '<!DOCTYPE html><html><body><h1>About</h1><p>About us.</p></body></html>' }
];

// write each page
pages.forEach(({ filename, content }) => {
  const fullPath = path.join(outDir, filename);
  const dir = path.dirname(fullPath);

  // Ensure parent directories exist
  fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(fullPath, content);
});


// copy static assets
const staticAssets = [
  { src: 'src/svgs/logo.svg', dest: 'svgs/logo.svg' }
]

// copy each static asset
staticAssets.forEach(({ src, dest }) => {
  const srcPath = path.resolve(__dirname, '..', src);
  const destPath = path.resolve(outDir, dest);
  const destDir = path.dirname(destPath);

  // Ensure destination directory exists
  fs.mkdirSync(destDir, { recursive: true });

  // Copy the file
  fs.copyFileSync(srcPath, destPath);
})