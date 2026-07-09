const db = require('./src/db/db');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Source paths
const downloadsDir = '/Users/user/Downloads';
const textDir = path.join(downloadsDir, 'сайтга маълумот учун');
const photosDir = path.join(downloadsDir, 'Музейлар буйича фото', "Marg'ilon muzeylari");
const uploadsDir = path.join(__dirname, 'public', 'uploads');

// Create uploads dir if not exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper to copy photos
function copyPhotos(srcDir) {
  const images = [];
  if (fs.existsSync(srcDir)) {
    const files = fs.readdirSync(srcDir);
    for (const file of files) {
      const fullPath = path.join(srcDir, file);
      if (fs.statSync(fullPath).isFile() && /\.(jpg|jpeg|png)$/i.test(file)) {
        const newName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file);
        fs.copyFileSync(fullPath, path.join(uploadsDir, newName));
        images.push(`/uploads/${newName}`);
      } else if (fs.statSync(fullPath).isDirectory()) {
         // recurse
         const subImages = copyPhotos(fullPath);
         images.push(...subImages);
      }
    }
  }
  return images;
}

// Extract text from docx
function extractText(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return execSync(`textutil -convert txt -stdout "${filePath}"`).toString().trim();
    }
  } catch (e) {
    console.log('Failed to extract', filePath);
  }
  return '';
}

// Data
const makolalarDir = path.join(downloadsDir, 'маколалар');

let uvaysiyBio = extractText(path.join(textDir, 'Жаҳон Отин Увайсий уй-музейи.docx'));
uvaysiyBio += '\n\n' + extractText(path.join(makolalarDir, 'Увайсий уй музейи.docx'));

let vohidovHouseBio = extractText(path.join(textDir, 'Эркин Воҳидов уй музейи.docx'));
vohidovHouseBio += '\n\n' + extractText(path.join(makolalarDir, 'Эркин Вохидов.docx'));

const vohidovMemorialBio = extractText(path.join(textDir, 'Эркин Вохидов мемориал музейи.docx'));

const haziniyBio = extractText(path.join(makolalarDir, 'ҲАЗИНИЙ_ИЛМИЙИЖОДИЙ_МЕРОСИ_ВА_УНИНГ_ҚЎҚОН_АДАБИЙ_МУҲИТИДА_ТУТГАН.docx'));

const uvaysiyPhotos = copyPhotos(path.join(photosDir, 'Жаҳон Отин Увайсий уй музейи'));
const vohidovHousePhotos = copyPhotos(path.join(photosDir, 'E.Voxidov uy-muzeyi'));
const vohidovMemorialPhotos = copyPhotos(path.join(photosDir, 'E.Voxidov memorial muzeyi'));

const insertOrUpdateMuseum = (id, city, pos_x, pos_y, name, bio, photos) => {
  const heroImage = photos.length > 0 ? JSON.stringify(photos.slice(0, 5)) : null; // Top 5 for hero
  
  // Insert/update museum table
  const existing = db.prepare('SELECT id FROM museums WHERE id = ?').get(id);
  if (existing) {
    db.prepare('UPDATE museums SET city=?, pos_x=?, pos_y=?, hero_image=? WHERE id=?').run(city, pos_x, pos_y, heroImage, id);
  } else {
    db.prepare('INSERT INTO museums (id, city, pos_x, pos_y, hero_image) VALUES (?, ?, ?, ?, ?)').run(id, city, pos_x, pos_y, heroImage);
  }
  
  // Update translation (uz)
  const existingTrans = db.prepare('SELECT museum_id FROM museum_translations WHERE museum_id = ? AND lang = \'uz\'').get(id);
  if (existingTrans) {
    // only append bio if it's Haziniy and bio exists, to prevent wiping out other fields
    if (id === 'haziniy') {
       db.prepare('UPDATE museum_translations SET bio=? WHERE museum_id=? AND lang=\'uz\'').run(bio, id);
    } else {
       db.prepare('UPDATE museum_translations SET name=?, bio=? WHERE museum_id=? AND lang=\'uz\'').run(name, bio, id);
    }
  } else {
    db.prepare('INSERT INTO museum_translations (museum_id, lang, name, bio) VALUES (?, \'uz\', ?, ?)').run(id, name, bio);
  }
  
  // Delete existing exhibits for this museum to avoid duplicates
  if (photos.length > 0) {
    db.prepare('DELETE FROM exhibits WHERE museum_id = ? AND lang = \'uz\'').run(id);

    // Add the remaining photos as exhibits
    const exhibitPhotos = photos.slice(5, 15); // Add next 10 photos as exhibits
    for (let i = 0; i < exhibitPhotos.length; i++) {
      db.prepare('INSERT INTO exhibits (museum_id, lang, hall_num, title, desc, image_url) VALUES (?, \'uz\', 1, ?, ?, ?)').run(
        id,
        `${name} - Ko'rzgazma ${i+1}`,
        '',
        exhibitPhotos[i]
      );
    }
  }
};

// 1. Uvaysiy
insertOrUpdateMuseum('uvaysi', 'margilan', 57, 46, 'Uvaysiy uy-muzeyi', uvaysiyBio, uvaysiyPhotos);

// 2. Vohidov House (replaces old vokhidov if needed)
insertOrUpdateMuseum('vohidov_house', 'fergana', 75, 60, 'Erkin Vohidov uy-muzeyi (Oltiariq)', vohidovHouseBio, vohidovHousePhotos);

// 3. Vohidov Memorial
insertOrUpdateMuseum('vohidov_memorial', 'margilan', 59, 48, 'Erkin Vohidov memorial muzeyi', vohidovMemorialBio, vohidovMemorialPhotos);

// 4. Haziniy (Append Bio)
insertOrUpdateMuseum('haziniy', 'fergana', 74, 55, 'Haziniy uy-muzeyi', haziniyBio, []);

// 1. Uvaysiy
insertOrUpdateMuseum('uvaysi', 'margilan', 57, 46, 'Uvaysiy uy-muzeyi', uvaysiyBio, uvaysiyPhotos);

// 2. Vohidov House (replaces old vokhidov if needed)
insertOrUpdateMuseum('vohidov_house', 'fergana', 75, 60, 'Erkin Vohidov uy-muzeyi (Oltiariq)', vohidovHouseBio, vohidovHousePhotos);

// 3. Vohidov Memorial
insertOrUpdateMuseum('vohidov_memorial', 'margilan', 59, 48, 'Erkin Vohidov memorial muzeyi', vohidovMemorialBio, vohidovMemorialPhotos);

console.log('Seeding completed successfully!');
