import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer";

const outDir = path.join(process.cwd(), "public", "icons");
const sizes = [192, 512];

function iconHtml(size) {
  const fontSize = Math.round(size * 0.28);
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;background:#070707;">
    <div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;background:#070707;color:#FAF6F9;font:${fontSize}px/1 Geist,sans-serif;font-weight:700;letter-spacing:-0.04em;">
      AM
    </div>
  </body>
</html>`;
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await puppeteer.launch({ headless: true });

  for (const size of sizes) {
    const page = await browser.newPage();
    await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
    await page.setContent(iconHtml(size), { waitUntil: "networkidle0" });
    await page.screenshot({
      path: path.join(outDir, `icon-${size}.png`),
      type: "png",
      clip: { x: 0, y: 0, width: size, height: size },
    });
    await page.close();
  }

  await browser.close();
  console.log("PWA icons generated in public/icons/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
