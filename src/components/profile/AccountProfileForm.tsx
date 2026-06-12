"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { parseApiErrorMessage } from "@/lib/api-errors";

export function AccountProfileForm() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState(user?.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  const canChangePassword = Boolean(user && !user.provider);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setMessage("이름은 2자 이상 입력해 주세요.");
      return;
    }

    if (newPassword || confirmPassword || currentPassword) {
      if (!canChangePassword) {
        setMessage("소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.");
        return;
      }
      if (!currentPassword) {
        setMessage("현재 비밀번호를 입력해 주세요.");
        return;
      }
      if (newPassword.length < 8) {
        setMessage("새 비밀번호는 8자 이상이어야 합니다.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessage("새 비밀번호가 일치하지 않습니다.");
        return;
      }
    }

    setSaving(true);
    setMessage("");
    try {
      await updateProfile({
        name: trimmedName,
        ...(newPassword
          ? { currentPassword, newPassword }
          : {}),
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("계정 정보가 저장되었습니다.", "success");
    } catch (err) {
      const msg = parseApiErrorMessage(err);
      setMessage(msg);
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#070707]">
          이메일
        </label>
        <input
          readOnly
          value={user.email}
          className="w-full rounded-lg border border-brand-border bg-brand-primary-light/40 px-3 py-2.5 text-sm text-brand-muted"
        />
        {user.provider && (
          <p className="mt-1.5 text-xs text-brand-muted">
            {user.provider === "google" ? "Google" : "Kakao"} 계정으로 로그인 중
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[#070707]">
          이름 <span className="text-brand-muted">*</span>
        </label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="표시 이름"
          className="w-full rounded-lg border border-brand-border px-3 py-2.5 text-sm"
        />
      </div>

      {canChangePassword && (
        <div className="space-y-4 rounded-xl border border-brand-border bg-brand-primary-light/30 p-4">
          <p className="text-sm font-semibold text-[#070707]">비밀번호 변경</p>
          <p className="text-xs text-brand-muted">
            변경하지 않으려면 비워 두세요.
          </p>
          <div>
            <label className="mb-2 block text-xs font-semibold text-[#070707]">
              현재 비밀번호
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-lg border border-brand-border bg-white px-3 py-2.5 text-sm"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold text-[#070707]">
                새 비밀번호
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full rounded-lg border border-brand-border bg-white px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-[#070707]">
                새 비밀번호 확인
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full rounded-lg border border-brand-border bg-white px-3 py-2.5 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {message && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-full bg-[#070707] py-3.5 text-sm font-semibold text-white disabled:bg-neutral-300"
      >
        {saving ? "저장 중..." : "계정 정보 저장"}
      </button>
    </form>
  );
}
