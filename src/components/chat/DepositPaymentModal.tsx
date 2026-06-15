"use client";

type Props = {
  open: boolean;
  amount: number;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
};

export function DepositPaymentModal({
  open,
  amount,
  onClose,
  onConfirm,
  loading,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-[#070707]">계약금 결제</h2>
        <p className="mt-2 text-sm text-brand-muted">
          모의 결제입니다. 실제 금액이 청구되지 않습니다.
        </p>
        <div className="mt-4 rounded-xl bg-brand-primary-light px-4 py-3 text-center">
          <p className="text-xs text-brand-muted">결제 예정 금액 (30%)</p>
          <p className="mt-1 text-2xl font-bold text-[#070707]">
            {amount.toLocaleString("ko-KR")}원
          </p>
        </div>
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-full border border-brand-border py-2.5 text-sm font-semibold text-[#070707]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-full bg-[#070707] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? "처리 중..." : "결제하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
