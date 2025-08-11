import { resolve, join } from 'path';
import { uploadCourse } from './course/init.js'
import * as util from './util.js'
import * as global from './global.js'
import * as about from './unique/about.js'
import * as courses from './unique/courses.js'


// proccess global data
global.init();


// generate and write unique pages
about.upload()
courses.upload()


// write each page
global.courses.forEach(course => uploadCourse(course));


// copy icons from src/icons to public/icons
const iconsDir = resolve("src/icons")
util.getAllFiles(iconsDir).forEach(icon => {
  const srcPath = join(iconsDir, icon)
  const destPath = join("icons", icon);
  util.copyFile(srcPath, destPath);
})


// copy stylesheets from src/css to public/css
const stylesheetsDir = resolve("src/css")
util.getAllFiles(stylesheetsDir).forEach(css => {
  const srcPath = join(stylesheetsDir, css)
  const destPath = join("css", css);
  util.copyFile(srcPath, destPath)
})


// copy scripts from src/css to public/css
const scriptsDir = resolve("src/js")
util.getAllFiles(scriptsDir).forEach(js => {
  const srcPath = join(scriptsDir, js)
  const destPath = join("js", js);
  util.copyFile(srcPath, destPath)
})