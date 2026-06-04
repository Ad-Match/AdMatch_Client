import fs from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer";

const OUTPUT_DIR = path.resolve(process.cwd(), "references", "plfil-core");
const TARGETS = [
  { name: "00-about-landing", url: "https://plfil.com/about" },
  { name: "01-actors-db", url: "https://plfil.com/actors" },
  { name: "02-casting-board", url: "https://plfil.com/casting" },
  {
    name: "03-profiletour",
    url: "https://plfil.com/profiletour?tab=profiletour",
  },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: { width: 1600, height: 2600 },
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(60000);
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  );

  for (const target of TARGETS) {
    await page.goto(target.url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await sleep(1200);

    const fullPath = path.join(OUTPUT_DIR, `${target.name}.png`);
    await page.screenshot({
      path: fullPath,
      fullPage: true,
    });
    console.log(`Captured: ${fullPath}`);
  }

  await browser.close();
  console.log(`Done. Saved to ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error("Capture failed:", error);
  process.exitCode = 1;
});
