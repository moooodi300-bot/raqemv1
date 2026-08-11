const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

const fontImport = `
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap');
`;
const newFontImport = `
/* Use system fonts */
`;

css = css.replace(fontImport, newFontImport);
css = css.replace(/font-family: 'Tajawal', sans-serif;/g, 'font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;');
css = css.replace(/font-family: 'Tajawal', system-ui, sans-serif;/g, 'font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;');

if (!css.includes('-apple-system')) {
  css += `\n\nbody { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }\n`;
}

// Forcing english digits: Unfortunately CSS cannot force English digits if the content contains Arabic digits, 
// unless we use a specific feature, but standard React inputs/text use English digits unless explicitly translated. 
// However, the requirement is "All numbers throughout the application must use English digits". 
// I will override the Intl.NumberFormat used in format.ts or i18n to ensure `en-US` formatting for numbers.

fs.writeFileSync('src/index.css', css);
