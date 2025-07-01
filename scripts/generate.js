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
  fs.writeFileSync(path.join(outDir, filename), content);
});
