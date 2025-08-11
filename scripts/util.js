import { mkdirSync, writeFileSync, copyFileSync, existsSync, readdirSync } from 'fs';
import { resolve, join, dirname, relative } from 'path';
import * as cheerio from 'cheerio';


// output directory for all generated files
const outDir = resolve('public');

// ensure the directory exists
if (!existsSync(outDir)) mkdirSync(outDir);


const AP = "AP<sup>®</sup>"
const ADVANCEDPLACEMENT = "Advanced Placement<sup>®</sup>"


export function writeFile(filename, file, wrap = false, message = "Uploaded file") {
  const dest = join(outDir, filename);
  const destDir = dirname(dest)

  mkdirSync(destDir, { recursive: true });
  if (wrap) {
    file = wrapHtml(file);
    const $ = cheerio.load(file)
    $('*').each(function() {
      if (['title', 'script', 'style'].includes(this.tagName)) return;
      $(this).contents().each(function() {
        if (this.type === 'text') {
          let text = $(this).text()
          text = text.replaceAll("AP", AP).replaceAll("Advanced Placement", ADVANCEDPLACEMENT)
          $(this).replaceWith(text)
        }
      })
    })
    file = $.html()
  }
  
  writeFileSync(dest, file)

  console.log(message + ": " + filename);
}



export function copyFile(source, destination, message = "Uploaded file") {
  const dest = join(outDir, destination);
  const destDir = dirname(dest)
  
  mkdirSync(destDir, { recursive: true });
  copyFileSync(source, dest)

  console.log(message + ": " + destination);
}



function wrapHtml (file) {
  return `<!DOCTYPE html><html lang="en" class="no-transition">${file}</html>`
}



export function getAllFiles(dir) {
  let files = [];

  const entries = readdirSync(dir, {withFileTypes: true, recursive: true});

  entries.forEach(i => {
    if (i.isDirectory()) return;
    files.push(relative(dir, resolve(i.parentPath, i.name)));
  })

  return files;
}