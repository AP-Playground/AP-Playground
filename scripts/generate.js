const fs = require('fs');
const path = require('path');

let lessonTemplate = fs.readFileSync("src/templates/lesson.html", "utf-8");

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
const iconsDir = path.resolve(__dirname, "..", "src/icons")
const icons = fs.readdirSync(iconsDir);
icons.forEach(icon => {
  const srcPath = path.join(iconsDir, icon)
  const destPath = path.resolve(outDir, "icons", icon);
  const destDir = path.dirname(destPath);

  // Ensure destination directory exists
  fs.mkdirSync(destDir, { recursive: true });

  fs.copyFileSync(srcPath, destPath)
})


// copy stylesheets from src/css to public/css
const stylesheetsDir = path.resolve(__dirname, "..", "src/css")
const stylesheets = fs.readdirSync(stylesheetsDir);
stylesheets.forEach(css => {
  const srcPath = path.join(stylesheetsDir, css)
  const destPath = path.resolve(outDir, "css", css);
  const destDir = path.dirname(destPath);

  // Ensure destination directory exists
  fs.mkdirSync(destDir, { recursive: true });

  fs.copyFileSync(srcPath, destPath)
})


// function to generate lesson content
function genLesson(filename) {
  const dataPath = "src/" + filename.replace('.html', '.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  let lesson = lessonTemplate;

  lesson = lesson.replace("{{page.title}}", data.title);

  const navPath = path.resolve(__dirname, "..", "src", data["nav"] + ".json");
  const navData = JSON.parse(fs.readFileSync(navPath, 'utf-8'));
  const pagePath = data.slug.split("/")

  lesson = lesson.replace("{{course.title}}", nav.title)

  let navText = "";
  navData.units.forEach(unit => {
    navText += `<a href="${nav.course}/${unit.slug}" class="item">${unit.prefix}: ${unit.title}</a>`
    if (unit.slug === pagePath[1]) {
      unit.lessons.forEach(lesson => {
        lessonNavContent.insertAdjacentHTML("beforeend", `
          <a href="${nav.course}/${unit.slug}/${lesson.slug}" class="sub-item">${lesson.prefix}: ${lesson.title}</a>
      `)})
    }
  })

  lesson = lesson.replace("{{navigation}}", navText);

  return lesson;
}