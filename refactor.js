const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk(srcDir);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes("import { museums") || content.includes("import { museums,")) {
    // Replace import
    content = content.replace(/import\s*\{\s*museums\s*(?:,\s*([^}]+))?\s*\}\s*from\s*['"]\.\.\/data\/museums['"];/, (match, group1) => {
      if (group1 && group1.trim()) {
        return `import { ${group1} } from '../data/museums';\nimport { useMuseums } from '../contexts/MuseumsContext';`;
      }
      return `import { useMuseums } from '../contexts/MuseumsContext';`;
    });

    // Inject hook at top of component
    content = content.replace(/export\s+default\s+function\s+(\w+)\s*\(([^)]*)\)\s*\{/, (match, p1, p2) => {
      return `${match}\n  const { museums, loading } = useMuseums();\n  if (loading) return <div style={{padding:48, textAlign:'center', color:'var(--muted)'}}>Loading museums...</div>;`;
    });

    changed = true;
  }
  
  // Special case for MuseumCard which receives `museum` as a prop and doesn't need to fetch `museums`! 
  // Wait, if it imports `museums`, it's not MuseumCard. MuseumCard imports epithets and CITIES.

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Updated', file);
  }
}
