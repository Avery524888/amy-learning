const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'generated_images');
const outDir = path.join(__dirname, '_deploy', 'images');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const files = [
  ['castle.png', 'castle.jpg'],
  ['watermelon.png', 'watermelon.jpg'],
  ['bridgehouse.png', 'bridgehouse.jpg'],
  ['rabbit.png', 'rabbit.jpg'],
  ['mushroom.png', 'mushroom.jpg'],
  ['underwater.png', 'underwater.jpg'],
  ['camping.png', 'camping.jpg'],
  ['butterfly.png', 'butterfly.jpg'],
];

(async () => {
  for (const [src, dst] of files) {
    const srcPath = path.join(srcDir, src);
    const dstPath = path.join(outDir, dst);
    if (!fs.existsSync(srcPath)) { console.log('missing', srcPath); continue; }
    await sharp(srcPath)
      .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80, progressive: true })
      .toFile(dstPath);
    const st = fs.statSync(dstPath);
    console.log(dst, '->', Math.round(st.size / 1024), 'KB');
  }
})();
