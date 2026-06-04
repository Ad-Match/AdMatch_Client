import fs from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer";

const TARGET_URL = "https://plfil.com/";
const OUTPUT_DIR = path.resolve(process.cwd(), "references", "plfil");
const WAIT_AFTER_CLICK_MS = 1200;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const CANDIDATE_SELECTORS = [
  '[role="tab"]',
  "nav a",
  'button[aria-controls]',
  'button[data-tab]',
  ".tab button",
  ".tabs button",
  ".tab-item",
];

async function readInternalLinks(page) {
  return page.evaluate((baseUrl) => {
    const base = new URL(baseUrl);
    const links = [];
    const seen = new Set();

    document.querySelectorAll("a[href]").forEach((el) => {
      const href = el.getAttribute("href");
      if (!href) return;

      let url;
      try {
        url = new URL(href, base.origin);
      } catch {
        return;
      }

      if (url.origin !== base.origin) return;
      if (url.hash && !url.pathname) return;

      const label = (el.textContent || el.getAttribute("aria-label") || "").trim();
      if (!label || label.length > 50) return;
      if (seen.has(url.pathname)) return;

      seen.add(url.pathname);
      links.push({
        label,
        path: url.pathname,
      });
    });

    return links.slice(0, 16);
  }, TARGET_URL);
}

function toSafeFileName(input) {
  return input
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80)
    .toLowerCase();
}

async function readTabCandidates(page) {
  return page.evaluate((selectors) => {
    const seen = new Set();
    const found = [];

    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        const text = (
          el.textContent?.trim() ||
          el.getAttribute("aria-label") ||
          el.getAttribute("title") ||
          ""
        ).trim();

        if (!text || seen.has(text)) {
          return;
        }

        const rect = el.getBoundingClientRect();
        if (rect.width < 20 || rect.height < 12) {
          return;
        }

        const id = el.id ? `#${el.id}` : "";
        const className = el.className
          ? "." + String(el.className).split(/\s+/).filter(Boolean).join(".")
          : "";
        const tag = el.tagName.toLowerCase();
        const selectorHint = `${tag}${id}${className}`;

        seen.add(text);
        found.push({ text, selectorHint });
      });
    });

    return found;
  }, CANDIDATE_SELECTORS);
}

async function clickByText(page, text) {
  const selectors = CANDIDATE_SELECTORS.map((sel) => `${sel}`);

  return page.evaluate(
    ({ selectors: allSelectors, targetText }) => {
      for (const selector of allSelectors) {
        for (const el of document.querySelectorAll(selector)) {
          const text = (
            el.textContent?.trim() ||
            el.getAttribute("aria-label") ||
            el.getAttribute("title") ||
            ""
          ).trim();
          if (text !== targetText) continue;
          el.scrollIntoView({ behavior: "instant", block: "center" });
          el.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
          el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
          el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
          el.click();
          return true;
        }
      }
      return false;
    },
    { selectors, targetText: text },
  );
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1600, height: 2400 },
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(60000);
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  );
  await page.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: 60000 });

  await page.screenshot({
    path: path.join(OUTPUT_DIR, "00-home.png"),
    fullPage: true,
  });

  const tabs = await readTabCandidates(page);
  console.log(`Found ${tabs.length} candidate tabs/nav items`);

  let index = 1;
  for (const tab of tabs) {
    const clicked = await clickByText(page, tab.text);
    if (!clicked) {
      console.log(`Skip (not clickable): ${tab.text}`);
      continue;
    }

    await page.waitForNetworkIdle({ idleTime: 600, timeout: 5000 }).catch(() => {
      return null;
    });
    await sleep(WAIT_AFTER_CLICK_MS);

    const fileName = `${String(index).padStart(2, "0")}-${toSafeFileName(tab.text)}.png`;
    await page.screenshot({
      path: path.join(OUTPUT_DIR, fileName),
      fullPage: true,
    });
    console.log(`Captured: ${fileName} (${tab.selectorHint})`);
    index += 1;
  }

  if (tabs.length === 0) {
    const links = await readInternalLinks(page);
    console.log(`Fallback: found ${links.length} internal links`);

    for (const link of links) {
      const pageUrl = new URL(link.path, TARGET_URL).toString();
      await page.goto(pageUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
      await sleep(800);

      const fileName = `${String(index).padStart(2, "0")}-${toSafeFileName(link.label || link.path)}.png`;
      await page.screenshot({
        path: path.join(OUTPUT_DIR, fileName),
        fullPage: true,
      });
      console.log(`Captured fallback page: ${fileName} (${pageUrl})`);
      index += 1;
    }
  }

  await browser.close();
  console.log(`Done. Screenshots saved to: ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error("Capture failed:", error);
  process.exitCode = 1;
});
