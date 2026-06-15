"use client";

import {
  formatCampaignShootSchedule,
  getTodayIsoDate,
} from "@/lib/campaign-due";

type Props = {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
};

export function ShootDateField({ value, onChange, required }: Props) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#070707]">
        촬영 날짜
        {required && <span className="ml-0.5 text-[#070707]">*</span>}
      </label>
      <input
        required={required}
        type="date"
        min={getTodayIsoDate()}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
      />
      {value && (
        <p className="mt-2 text-xs font-medium text-brand-primary">
          {formatCampaignShootSchedule(value)}
        </p>
      )}
    </div>
  );
}
