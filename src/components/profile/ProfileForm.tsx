"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { ApiError, apiFetch } from "@/lib/api";
import { processProfileImage } from "@/lib/image-process";
import type { ModelProfile } from "@/lib/types";

type Props = {
  mode?: "create" | "edit";
  onSaved?: (profile: ModelProfile) => void;
};

function parseTags(raw: string) {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-2 block text-sm font-semibold text-[#070707]">
      {children}
      {required && <span className="ml-0.5 text-[#070707]">*</span>}
    </label>
  );
}

function RadioGroup({
  label,
  name,
  value,
  options,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <FieldLabel required>{label}</FieldLabel>
      <div className="flex gap-6">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex cursor-pointer items-center gap-2 text-sm text-[#070707]"
          >
            <input
              type="radio"
              name={name}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="h-4 w-4 accent-[#070707]"
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}

export function ProfileForm({ mode = "edit", onSaved }: Props) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ModelProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [message, setMessage] = useState("");
  const [processingImage, setProcessingImage] = useState(false);
  const [form, setForm] = useState({
    visibility: "public",
    nationality: "domestic",
    name: "",
    age: "",
    height: "",
    weight: "",
    bio: "",
    tags: "",
    profileImageUrl: "",
  });

  useEffect(() => {
    if (!user) return;

    async function load() {
      try {
        const data = await apiFetch<ModelProfile>(`/models/user/${user!.id}`);
        setProfile(data);
        setForm({
          visibility: "public",
          nationality: "domestic",
          name: data.name,
          age: data.age,
          height: data.height ?? "",
          weight: data.weight ?? "",
          bio: data.bio ?? "",
          tags: data.tags.join(", "),
          profileImageUrl: data.profileImageUrl ?? "",
        });
        if (data.profileImageUrl) setStep(2);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          setProfile(null);
          setForm((prev) => ({ ...prev, name: user!.name }));
        }
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [user]);

  async function handleImageChange(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    setProcessingImage(true);
    setMessage("");
    try {
      const dataUrl = await processProfileImage(file);
      setForm((prev) => ({
        ...prev,
        profileImageUrl: dataUrl,
      }));
    } catch {
      setMessage("이미지 처리에 실패했습니다. 다른 파일을 시도해 주세요.");
    } finally {
      setProcessingImage(false);
    }
  }

  function validateStep1() {
    if (!form.name.trim() || !form.age.trim() || !form.height.trim() || !form.weight.trim()) {
      setMessage("필수 항목을 모두 입력해 주세요.");
      return false;
    }
    if (parseTags(form.tags).length < 2) {
      setMessage("활동 태그는 2개 이상 입력해 주세요. (쉼표로 구분)");
      return false;
    }
    setMessage("");
    return true;
  }

  function goNext() {
    if (validateStep1()) setStep(2);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!validateStep1()) {
      setStep(1);
      return;
    }
    if (!form.profileImageUrl) {
      setMessage("대표 사진을 업로드해 주세요.");
      return;
    }

    setSaving(true);
    setMessage("");

    const payload = {
      name: form.name.trim(),
      age: form.age.trim(),
      body: `${form.height.trim()}cm/${form.weight.trim()}kg`,
      height: form.height.trim(),
      weight: form.weight.trim(),
      bio: form.bio.trim(),
      profileImageUrl: form.profileImageUrl,
      tags: parseTags(form.tags),
    };

    try {
      let saved: ModelProfile;
      if (profile) {
        saved = await apiFetch<ModelProfile>(`/models/${profile.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        saved = await apiFetch<ModelProfile>("/models", {
          method: "POST",
          body: JSON.stringify({ ...payload, userId: user.id }),
        });
        setProfile(saved);
      }
      setMessage("프로필이 저장되었습니다.");
      onSaved?.(saved);
    } catch {
      setMessage("저장에 실패했습니다. 태그 2개 이상·필수 항목을 확인해 주세요.");
    } finally {
      setSaving(false);
    }
  }

  if (!user || user.role !== "model") {
    return (
      <p className="text-sm text-brand-muted">
        모델 계정으로 로그인하면 프로필을 관리할 수 있습니다.
      </p>
    );
  }

  if (loading) {
    return <p className="text-sm text-brand-muted">프로필 불러오는 중...</p>;
  }

  const isCreate = mode === "create" || !profile;
  const tagCount = parseTags(form.tags).length;
  const step1Complete =
    form.name &&
    form.age &&
    form.height &&
    form.weight &&
    tagCount >= 2;
  const step2Complete = Boolean(form.profileImageUrl);
  const progressPct = step === 1 ? 50 : 100;

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-4">
      <p className="text-center text-xs text-brand-muted">
        * 프로필을 채운 모델은 매칭 제안·저장 횟수가 평균 4배 이상 많습니다.
      </p>

      <div className="overflow-hidden rounded-2xl border border-brand-border bg-white">
        <div className="flex items-center justify-between border-b border-brand-border px-5 py-3 text-sm">
          <span className="font-semibold text-[#070707]">
            필수 입력 | {step === 1 ? "기본 정보" : "대표 사진"}
          </span>
          <span className="text-brand-muted">{step} / 2</span>
        </div>
        <div className="h-1 bg-brand-border">
          <div
            className="h-full bg-[#070707] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="border-b border-brand-border px-5 py-2 text-center text-xs text-brand-muted">
          {step === 1
            ? "시작이 반이에요! 조금만 입력하면 프로필이 완성돼요."
            : "거의 다 왔어요! 대표 사진을 올리면 프로필이 생성돼요."}
        </p>

        {step === 1 ? (
          <div className="p-6 md:p-8">
            <div className="mb-8 text-center">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-2xl font-bold text-[#070707]">기본 정보</h2>
                <span className="rounded bg-[#070707] px-2 py-0.5 text-xs font-semibold text-white">
                  필수
                </span>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <RadioGroup
                label="프로필 공개 여부"
                name="visibility"
                value={form.visibility}
                options={[
                  { value: "public", label: "공개" },
                  { value: "private", label: "비공개" },
                ]}
                onChange={(v) => setForm({ ...form, visibility: v })}
              />
              <RadioGroup
                label="내국인 / 외국인"
                name="nationality"
                value={form.nationality}
                options={[
                  { value: "domestic", label: "내국인" },
                  { value: "foreign", label: "외국인" },
                ]}
                onChange={(v) => setForm({ ...form, nationality: v })}
              />
              <div>
                <FieldLabel required>이름</FieldLabel>
                <input
                  required
                  placeholder="이름을 입력해 주세요."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-brand-border px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <FieldLabel required>나이</FieldLabel>
                <input
                  required
                  placeholder="예) 25세(00년생)"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="w-full rounded-lg border border-brand-border px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <FieldLabel required>신장 (cm)</FieldLabel>
                <input
                  required
                  placeholder="예) 175"
                  value={form.height}
                  onChange={(e) => setForm({ ...form, height: e.target.value })}
                  className="w-full rounded-lg border border-brand-border px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <FieldLabel required>체중 (kg)</FieldLabel>
                <input
                  required
                  placeholder="예) 65"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  className="w-full rounded-lg border border-brand-border px-3 py-2.5 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <FieldLabel required>활동 태그 (2개 이상)</FieldLabel>
                <input
                  required
                  placeholder="쉼표 구분: 뷰티, SNS, 숏폼, 라이브커머스"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm ${
                    tagCount > 0 && tagCount < 2
                      ? "border-red-400"
                      : "border-brand-border"
                  }`}
                />
                <p className="mt-1.5 text-xs text-brand-muted">
                  현재 {tagCount}개 · 최소 2개 이상 입력해 주세요.
                </p>
              </div>
              <div className="md:col-span-2">
                <FieldLabel>자기소개 / 경력</FieldLabel>
                <textarea
                  placeholder="경력, 특기, SNS 채널 등을 입력해 주세요"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg border border-brand-border px-3 py-2.5 text-sm"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 md:p-8">
            <div className="mb-6 text-center">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-2xl font-bold text-[#070707]">대표 사진</h2>
                <span className="rounded bg-[#070707] px-2 py-0.5 text-xs font-semibold text-white">
                  필수
                </span>
              </div>
              <p className="mt-2 text-sm text-brand-muted">
                용량 제한 없음 · 업로드 시 3:4 비율로 자동 크롭됩니다
              </p>
            </div>

            <div className="mb-6 rounded-xl border border-brand-border bg-[#fafafa] p-4">
              <p className="mb-3 text-xs font-semibold text-[#070707]">업로드 가이드</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <div className="flex aspect-[4/5] items-center justify-center rounded-lg border-2 border-[#070707] bg-white text-[10px] font-semibold text-[#070707]">
                  GOOD
                  <br />
                  정면 상반신
                </div>
                <div className="flex aspect-[4/5] items-center justify-center rounded-lg border-2 border-[#070707] bg-white text-[10px] font-semibold text-[#070707]">
                  GOOD
                  <br />
                  선명한 얼굴
                </div>
                <div className="flex aspect-[4/5] items-center justify-center rounded-lg border-2 border-red-400 bg-white text-[10px] font-semibold text-red-600">
                  NO
                  <br />
                  모자·선글라스
                </div>
                <div className="flex aspect-[4/5] items-center justify-center rounded-lg border-2 border-red-400 bg-white text-[10px] font-semibold text-red-600">
                  NO
                  <br />
                  얼굴 가림
                </div>
                <div className="flex aspect-[4/5] items-center justify-center rounded-lg border-2 border-red-400 bg-white text-[10px] font-semibold text-red-600">
                  NO
                  <br />
                  복잡한 배경
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-brand-muted">
                정면 상반신이 잘 보이는 사진을 올려 주세요. 모자·선글라스·과도한
                보정, 전신 단순 배경 사진은 피해 주세요.
              </p>
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-border bg-white py-10 transition hover:border-[#070707]">
              {form.profileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.profileImageUrl}
                  alt="대표 사진 미리보기"
                  className="mb-3 h-56 w-44 rounded-lg object-cover"
                />
              ) : (
                <div className="mb-3 flex h-56 w-44 items-center justify-center rounded-lg bg-brand-primary-soft text-sm text-brand-muted">
                  사진 없음
                </div>
              )}
              <span className="rounded-full bg-[#070707] px-6 py-2.5 text-sm font-semibold text-white">
                {processingImage
                  ? "처리 중..."
                  : form.profileImageUrl
                    ? "다른 사진 선택"
                    : "대표 사진 업로드"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  void handleImageChange(e.target.files?.[0] ?? null);
                  e.target.value = "";
                }}
              />
            </label>

            <label className="mt-4 flex items-start gap-2 rounded-lg bg-brand-primary-light p-3 text-xs text-[#070707]">
              <input type="checkbox" required className="mt-0.5 accent-[#070707]" />
              본인 사진이 아닌 경우 사전 통보 없이 삭제·이용 제한될 수 있음에
              동의합니다.
            </label>
          </div>
        )}
      </div>

      {message && (
        <p
          className={`rounded-lg px-4 py-3 text-sm ${
            message.includes("실패") ||
            message.includes("태그") ||
            message.includes("필수") ||
            message.includes("사진") ||
            message.includes("이미지")
              ? "bg-red-50 text-red-700"
              : "bg-brand-primary-light text-[#070707]"
          }`}
        >
          {message}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        {step === 1 ? (
          <>
            <Link
              href="/models"
              className="flex-1 rounded-full border border-brand-border bg-white py-3.5 text-center text-sm font-semibold text-[#070707]"
            >
              나가기
            </Link>
            <button
              type="button"
              onClick={goNext}
              disabled={!step1Complete}
              className="flex-1 rounded-full bg-[#070707] py-3.5 text-sm font-semibold text-white disabled:bg-neutral-300"
            >
              다음
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 rounded-full border border-brand-border bg-white py-3.5 text-sm font-semibold text-[#070707]"
            >
              이전
            </button>
            <button
              type="submit"
              disabled={saving || !step2Complete}
              className="flex-1 rounded-full bg-[#070707] py-3.5 text-sm font-semibold text-white disabled:bg-neutral-300"
            >
              {saving ? "저장 중..." : isCreate ? "프로필 등록" : "변경사항 저장"}
            </button>
          </>
        )}
      </div>
    </form>
  );
}
