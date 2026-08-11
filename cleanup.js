const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove animation classes
  content = content.replace(/\b(reveal-up|reveal-left|reveal-right|reveal-zoom|delay-100|delay-200|delay-300|delay-400|delay-500|is-revealed)\b/g, '');
  // Clean up empty class attributes or double spaces left behind
  content = content.replace(/class="\s+"/g, '');
  content = content.replace(/class="([^"]*)\s{2,}([^"]*)"/g, 'class="$1 $2"');
  content = content.replace(/class="\s+([^"]+)"/g, 'class="$1"');
  content = content.replace(/class="([^"]+)\s+"/g, 'class="$1"');

  // Remove Quote buttons from desktop and mobile nav
  content = content.replace(/<a href="quote\.html" class="btn btn-quote btn-accent"[^>]*>Request Quote<\/a>/g, '');
  content = content.replace(/<a href="quote\.html" class="btn btn-primary"[^>]*>Request Quote<\/a>/g, '');
  
  // Remove other specific quote buttons
  content = content.replace(/<a href="quote\.html"[^>]*>Request a Quote<\/a>/g, '');
  content = content.replace(/<a href="quote\.html"[^>]*>Request a Free Quote<\/a>/g, '');
  content = content.replace(/<a href="quote\.html"[^>]*>Get an Air Freight Quote<\/a>/g, '');
  content = content.replace(/<a href="quote\.html"[^>]*>Get an Ocean Freight Quote<\/a>/g, '');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Cleaned ${file}`);
});
