const TARGET_WIDTH = 800;
const TARGET_HEIGHT = 1024;
const TARGET_RATIO = TARGET_WIDTH / TARGET_HEIGHT;
const JPEG_QUALITY = 0.85;

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("이미지를 불러오지 못했습니다."));
    };
    img.src = url;
  });
}

/** 업로드 이미지를 3:4 비율로 중앙 크롭 후 800×1024로 리사이즈 */
export async function processProfileImage(file: File): Promise<string> {
  const img = await loadImageFromFile(file);
  const { width, height } = img;

  let cropW = width;
  let cropH = height;
  const srcRatio = width / height;

  if (srcRatio > TARGET_RATIO) {
    cropW = height * TARGET_RATIO;
  } else {
    cropH = width / TARGET_RATIO;
  }

  const sx = (width - cropW) / 2;
  const sy = (height - cropH) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = TARGET_WIDTH;
  canvas.height = TARGET_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("이미지 처리에 실패했습니다.");
  }

  ctx.drawImage(img, sx, sy, cropW, cropH, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

const COVER_WIDTH = 1200;
const COVER_HEIGHT = 900;
const COVER_RATIO = COVER_WIDTH / COVER_HEIGHT;

/** 공고 대표 이미지 — 4:3 비율로 중앙 크롭 후 1200×900 */
export async function processCampaignCoverImage(file: File): Promise<string> {
  const img = await loadImageFromFile(file);
  const { width, height } = img;

  let cropW = width;
  let cropH = height;
  const srcRatio = width / height;

  if (srcRatio > COVER_RATIO) {
    cropW = height * COVER_RATIO;
  } else {
    cropH = width / COVER_RATIO;
  }

  const sx = (width - cropW) / 2;
  const sy = (height - cropH) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = COVER_WIDTH;
  canvas.height = COVER_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("이미지 처리에 실패했습니다.");
  }

  ctx.drawImage(img, sx, sy, cropW, cropH, 0, 0, COVER_WIDTH, COVER_HEIGHT);

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}
