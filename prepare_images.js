const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const outDir = path.join(root, 'assets', 'images');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const userSrcDir = "D:/xinmiao/其他/自己/艾米/学习资料/绘画";

const aiFiles = [
  ['castle.png', 'ai-01.jpg'],
  ['watermelon.png', 'ai-02.jpg'],
  ['bridgehouse.png', 'ai-03.jpg'],
  ['rabbit.png', 'ai-04.jpg'],
  ['mushroom.png', 'ai-05.jpg'],
  ['underwater.png', 'ai-06.jpg'],
  ['camping.png', 'ai-07.jpg'],
  ['butterfly.png', 'ai-08.jpg'],
];

const userFiles = [
  ['0.png', 'user-01.jpg'],
  ['1.jpg', 'user-02.jpg'],
  ['2.jpeg', 'user-03.jpg'],
  ['3.jpg', 'user-04.jpg'],
  ['4.jpg', 'user-05.jpg'],
  ['5.jpg', 'user-06.jpg'],
  ['6.jpg', 'user-07.jpg'],
  ['7.jpg', 'user-08.jpg'],
  ['8.jpg', 'user-09.jpg'],
  ['9.jpg', 'user-10.jpg'],
  ['10.jpg', 'user-11.jpg'],
  ['11.jpg', 'user-12.jpg'],
  ['12.jpg', 'user-13.jpg'],
  ['13.jpg', 'user-14.jpg'],
  ['15.jpg', 'user-15.jpg'],
  ['c305bb22239520e0701533668d18e998.png', 'user-16.jpg'],
];

async function compress(src, dst) {
  await sharp(src)
    .rotate()
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80, progressive: true })
    .toFile(dst);
  const st = fs.statSync(dst);
  return Math.round(st.size / 1024);
}

(async () => {
  console.log('Output dir:', outDir);
  for (const [src, dst] of aiFiles) {
    const srcPath = path.join(root, 'generated_images', src);
    const dstPath = path.join(outDir, dst);
    if (!fs.existsSync(srcPath)) { console.log('missing', srcPath); continue; }
    const kb = await compress(srcPath, dstPath);
    console.log(dst, '->', kb, 'KB');
  }
  for (const [src, dst] of userFiles) {
    const srcPath = path.join(userSrcDir, src);
    const dstPath = path.join(outDir, dst);
    if (!fs.existsSync(srcPath)) { console.log('missing', srcPath); continue; }
    const kb = await compress(srcPath, dstPath);
    console.log(dst, '->', kb, 'KB');
  }
  console.log('Done');
})();
