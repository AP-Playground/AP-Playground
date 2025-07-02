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


// copy icons from src/icons to public/icons
const icons = fs.readdirSync(path.resolve(__dirname, '..', 'src/icons'));
icons.forEach(icon => {
  const srcPath = path.resolve(__dirname, "..", "src/icons", icon)
  const destPath = path.resolve(outDir, "icons", icon);
  const destDir = path.dirname(destPath);

  // Ensure destination directory exists
  fs.mkdirSync(destDir, { recursive: true });

  fs.copyFileSync(srcPath, destPath)
})


// function to generate lesson content
function genLesson(filename) {
  let lessonTemplate = fs.readFileSync("src/templates/lesson.html", "utf-8");
  return lessonTemplate;
}