// Compare thumbnail settings side by side, OFFLINE (reads ./bucket-copy, uploads nothing).
// Usage: node thumb-test.mjs                 (uses 3 of your larger full-size images)
//        node thumb-test.mjs name1.webp name2.webp
// Then open ./thumb-test on your phone and compare A / B / C for each photo.
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const DIR = './bucket-copy'
const OUT = './thumb-test'
fs.mkdirSync(OUT, { recursive: true })

let names = process.argv.slice(2)
if (!names.length) {
  names = fs.readdirSync(DIR)
    .filter(n => !n.startsWith('thumb_') && !n.startsWith('blog-') && !n.startsWith('agent-'))
    .map(n => ({ n, s: fs.statSync(path.join(DIR, n)).size }))
    .filter(f => f.s > 150 * 1024)
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)
    .map(f => f.n)
}

const variants = [
  { tag: 'A_current_400_q60', width: 400, quality: 60, sharpen: false },
  { tag: 'B_720_q78',         width: 720, quality: 78, sharpen: true  },
  { tag: 'C_900_q80',         width: 900, quality: 80, sharpen: true  },
]

for (const name of names) {
  const input = fs.readFileSync(path.join(DIR, name))
  for (const v of variants) {
    let img = sharp(input).rotate().resize({ width: v.width, withoutEnlargement: true, kernel: 'lanczos3' })
    if (v.sharpen) img = img.sharpen({ sigma: 0.6 })
    const out = await img.webp({ quality: v.quality, effort: 5, smartSubsample: true }).toBuffer()
    const file = `${OUT}/${name.replace(/\.[^.]+$/, '')}__${v.tag}.webp`
    fs.writeFileSync(file, out)
    console.log(`${v.tag}  ${Math.round(out.length / 1024)} KB  ${file}`)
  }
}
