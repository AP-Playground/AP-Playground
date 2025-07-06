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


// copy scripts from src/css to public/css
const scriptsDir = path.resolve(__dirname, "..", "src/js")
const scripts = fs.readdirSync(scriptsDir);
scripts.forEach(js => {
  const srcPath = path.join(scriptsDir, js)
  const destPath = path.resolve(outDir, "js", js);
  const destDir = path.dirname(destPath);

  // Ensure destination directory exists
  fs.mkdirSync(destDir, { recursive: true });

  fs.copyFileSync(srcPath, destPath)
})


// function to generate lesson content
function genLesson(filename) {
  const dataPath = "src/" + filename.replace('.html', '.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  let page = lessonTemplate;

  const navPath = path.resolve(__dirname, "..", "src", data["nav"] + ".json");
  const navData = JSON.parse(fs.readFileSync(navPath, 'utf-8'));
  const pagePath = data.slug.split("/")

  page = page.replaceAll("{{course.title}}", navData.title)
  page = page.replaceAll("{{course.slug}}", pagePath[0]);
  page = page.replaceAll("{{unit.slug}}", pagePath[1]);
  page = page.replaceAll("{{lesson.slug}}", pagePath[2]);

  let navText = "";
  navData.units.forEach(unit => {
    navText += `<li class="item"><a href="/${navData.course}/${unit.slug}">${unit.prefix}: ${unit.title}</a></li>`
    if (unit.slug === pagePath[1]) {
      unit.lessons.forEach(lesson => {
        if (lesson.slug === pagePath[2]) {
          navText += `<li class="sub-item side-nav-current"><a href="/${navData.course}/${unit.slug}/${lesson.slug}">${lesson.prefix}: ${lesson.title}</a></li>`;
          
          page = page.replaceAll("{{page.title}}", lesson.prefix + ": " + lesson.title);

          page = page.replaceAll("{{unit.title}}", unit.prefix + ": " + unit.title);
          page = page.replaceAll("{{lesson.title}}", lesson.prefix + ": " + lesson.title);
        } else {
          navText += `<li class="sub-item"><a href="/${navData.course}/${unit.slug}/${lesson.slug}">${lesson.prefix}: ${lesson.title}</a></li>`
        }
      })
    }
  })

  page = page.replace("{{navigation}}", navText);

  page = page.replace("{{lesson.summary}}", data["summary"])

  const vocabData = data["vocab"]
  let vocabText = "";

  vocabData.forEach(vocab => {
    vocabText += `<li>${vocab}</li>`;
  })

  page = page.replace("{{lesson.vocab}}", vocabText);
  page = page.replace("{{lesson.vocab-row-count}}", Math.ceil(vocabData.length/2))

  return page;
}