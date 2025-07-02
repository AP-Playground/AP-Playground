const fs = require('fs');
const path = require('path');

// output directory for all generated files
const outDir = path.resolve(__dirname, '..', 'public');

// ensure the directory exists
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

// array of pages to generate
const pages = [
  { filename: 'index.html', content: '<!DOCTYPE html><html><body><h1>Home</h1><p>Welcome!</p></body></html>' },
  { filename: 'ap-biology/unit-1/lesson-1.html', content: genLesson }
];

// write each page
pages.forEach(({ filename, content }) => {
  const fullPath = path.join(outDir, filename);
  const dir = path.dirname(fullPath);

  // Ensure parent directories exist
  fs.mkdirSync(dir, { recursive: true });

  if (typeof content === "function") {
    fs.writeFileSync(fullPath, content(filename));
  } else if (typeof content === "string") {
    fs.writeFileSync(fullPath, content);
  }
});


// static assets to copy
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

// function to generate lesson content
const lessonTemplate = fs.readFileSync("src/templates/lesson.html", "utf-8");
function genLesson(filename) {
  return lessonTemplate;
}