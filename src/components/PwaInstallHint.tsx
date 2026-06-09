'use client';

import { useEffect, useState } from 'react';
import { Share, X } from 'lucide-react';

const DISMISS_KEY = 'admatch_pwa_install_dismissed';

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export function PwaInstallHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isIos() || isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY) === '1') return;
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-4 right-4 z-[70] md:bottom-6 md:left-auto md:right-6 md:max-w-sm">
      <div className="rounded-2xl border border-zinc-200 bg-white/95 p-4 shadow-xl backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-zinc-900">앱처럼 사용하기</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
              Safari 하단의 <Share size={12} className="inline align-text-bottom" /> 공유 버튼을 누른 뒤
              {' '}
              <span className="font-semibold text-zinc-700">홈 화면에 추가</span>
              를 선택하세요.
            </p>
          </div>
          <button
            type="button"
            aria-label="닫기"
            onClick={() => {
              localStorage.setItem(DISMISS_KEY, '1');
              setVisible(false);
            }}
            className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
