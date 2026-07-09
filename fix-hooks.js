const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src/pages');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    if (file.endsWith('.jsx')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk(srcDir);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // We want to move the `if (loading) return ...` statement to AFTER all the `const ... = use...()` hooks.
  // A simple way is to remove the loading line and insert it right before `return (` or `const loc = museum[lang]` or whatever the first non-hook logic is.
  
  // First, extract the loading line if it exists
  const loadingLineRegex = /^\s*if\s*\(\s*loading\s*\)\s*return\s*<div[^>]*>Loading museums\.\.\.<\/div>;\s*\n/m;
  if (content.match(loadingLineRegex)) {
    content = content.replace(loadingLineRegex, '');
    
    // Now insert it back just before the main `return (` statement. (This is safe because all hooks must be at the top level before returning JSX).
    // Or, for pages that do logic before return (like MuseumPage), we need to insert it after all `useX()` calls.
    // Let's find the last `useX()` hook and insert it after that line.
    
    // Split into lines
    const lines = content.split('\n');
    let lastHookIndex = -1;
    let componentStartIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/export default function/)) {
        componentStartIndex = i;
      }
      if (componentStartIndex !== -1 && lines[i].match(/^\s*const\s+.*=\s*use[A-Z]/)) {
        lastHookIndex = i;
      }
    }
    
    if (lastHookIndex !== -1) {
      lines.splice(lastHookIndex + 1, 0, "  if (loading) return <div style={{padding:48, textAlign:'center', color:'var(--muted)'}}>Loading museums...</div>;");
      content = lines.join('\n');
      fs.writeFileSync(file, content);
      console.log('Fixed hooks in', file);
    }
  }
}
