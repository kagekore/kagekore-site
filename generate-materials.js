const fs = require('fs');
const path = require('path');

// 画像が入ってるフォルダ
const baseDir = path.join(__dirname, 'images');
// SVGが入ってるフォルダ
const svgDir = path.join(__dirname, 'svgs');

const validExtensions = ['.png', '.svg'];

let materials = [];

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (validExtensions.includes(path.extname(file).toLowerCase())) {
      const relativePath = path.relative(baseDir, fullPath);
      const title = path.basename(file, path.extname(file));
      const tags = path.dirname(relativePath).split(path.sep);

      // SVGのパスを組み立てる（images → svgs）
      const svgPath = path.posix.join('svgs', ...tags, `${title}.svg`);
      const svgFullPath = path.join(svgDir, ...tags, `${title}.svg`);

      // SVGファイルが存在するか確認
      const svg = fs.existsSync(svgFullPath) ? svgPath : '';

      // PNGだけ保存対象に（.svg単体は除外）
      if (path.extname(file).toLowerCase() === '.png') {
        materials.push({
          title: decodeURIComponent(title),
          file: path.posix.join('images', ...tags, path.basename(file)),
          svg: svg, // ←ここ追加！
          tags: tags
        });
      }
    }
  }
}

walk(baseDir);

const output = `const materials = ${JSON.stringify(materials, null, 2)};\n`;
fs.writeFileSync(path.join(__dirname, 'materials.js'), output, 'utf-8');

console.log(`✅ materials.js を出力しました。素材数：`, materials.length);
