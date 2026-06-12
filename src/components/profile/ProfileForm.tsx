"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CareerEditor } from "@/components/profile/CareerEditor";
import { HobbyEditor } from "@/components/profile/HobbyEditor";
import { TagChipInput } from "@/components/ui/TagChipInput";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthProvider";
import { ApiError, apiFetch } from "@/lib/api";
import { parseApiErrorMessage } from "@/lib/api-errors";
import { processProfileImage } from "@/lib/image-process";
import type { ModelCareer, ModelHobby, ModelProfile } from "@/lib/types";

type Props = {
  mode?: "create" | "edit";
  backHref?: string;
  onSaved?: (profile: ModelProfile) => void;
};

type Step = 1 | 2 | 3;

const STEP_LABELS: Record<Step, string> = {
  1: "기본 정보",
  2: "프로필 사진",
  3: "활동 정보",
};

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

function SectionHeader({ title, required }: { title: string; required?: boolean }) {
  return (
    <div className="mb-6 flex items-center gap-2 border-b border-brand-border pb-4">
      <h2 className="text-xl font-bold text-[#070707]">{title}</h2>
      {required && (
        <span className="rounded bg-[#070707] px-2 py-0.5 text-xs font-semibold text-white">
          필수
        </span>
      )}
    </div>
  );
}

export function ProfileForm({
  mode = "edit",
  backHref = "/models",
  onSaved,
}: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<ModelProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [message, setMessage] = useState("");
  const [processingImage, setProcessingImage] = useState(false);
  const [form, setForm] = useState({
    name: "",
    age: "",
    height: "",
    weight: "",
    education: "",
    residence: "",
    bio: "",
    tags: [] as string[],
    profileImageUrl: "",
    galleryImageUrls: [] as string[],
    videoUrl: "",
    instagramUrl: "",
    youtubeUrl: "",
    hobbies: [] as ModelHobby[],
    careers: [] as ModelCareer[],
  });

  useEffect(() => {
    if (!user) return;

    async function load() {
      try {
        const data = await apiFetch<ModelProfile>(`/models/user/${user!.id}`);
        setProfile(data);
        setForm({
          name: data.name,
          age: data.age,
          height: data.height ?? "",
          weight: data.weight ?? "",
          education: data.education ?? "",
          residence: data.residence ?? "",
          bio: data.bio ?? "",
          tags: data.tags,
          profileImageUrl: data.profileImageUrl ?? "",
          galleryImageUrls: data.galleryImageUrls ?? [],
          videoUrl: data.videoUrl ?? "",
          instagramUrl: data.instagramUrl ?? "",
          youtubeUrl: data.youtubeUrl ?? "",
          hobbies: data.hobbies ?? [],
          careers: data.careers ?? [],
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

  async function handleImageChange(
    file: File | null,
    target: "main" | "gallery",
    index?: number,
  ) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    setProcessingImage(true);
    setMessage("");
    try {
      const dataUrl = await processProfileImage(file);
      if (target === "main") {
        setForm((prev) => ({ ...prev, profileImageUrl: dataUrl }));
      } else if (index !== undefined) {
        setForm((prev) => ({
          ...prev,
          galleryImageUrls: prev.galleryImageUrls.map((url, i) =>
            i === index ? dataUrl : url,
          ),
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          galleryImageUrls: [...prev.galleryImageUrls, dataUrl].slice(0, 8),
        }));
      }
    } catch {
      setMessage("이미지 처리에 실패했습니다. 다른 파일을 시도해 주세요.");
    } finally {
      setProcessingImage(false);
    }
  }

  function validateStep1() {
    if (!form.name.trim() || !form.age.trim() || !form.height.trim() || !form.weight.trim()) {
      setMessage("이름, 나이, 신장, 체중은 필수입니다.");
      return false;
    }
    setMessage("");
    return true;
  }

  function validateStep2() {
    if (!form.profileImageUrl) {
      setMessage("대표 사진을 업로드해 주세요.");
      return false;
    }
    setMessage("");
    return true;
  }

  function validateStep3() {
    if (form.tags.length < 2) {
      setMessage("활동 태그는 2개 이상 선택해 주세요.");
      return false;
    }
    setMessage("");
    return true;
  }

  function goNext() {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      if (!validateStep1()) setStep(1);
      else if (!validateStep2()) setStep(2);
      else setStep(3);
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
      education: form.education.trim() || undefined,
      residence: form.residence.trim() || undefined,
      bio: form.bio.trim() || undefined,
      profileImageUrl: form.profileImageUrl,
      galleryImageUrls: form.galleryImageUrls,
      videoUrl: form.videoUrl.trim() || undefined,
      instagramUrl: form.instagramUrl.trim() || undefined,
      youtubeUrl: form.youtubeUrl.trim() || undefined,
      hobbies: form.hobbies.filter((h) => h.name.trim()),
      careers: form.careers.filter((c) => c.title.trim()),
      tags: form.tags,
    };

    try {
      let saved: ModelProfile;
      const isNew = !profile;
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
      showToast(
        isNew ? "프로필 등록이 완료되었습니다!" : "프로필이 저장되었습니다.",
        "success",
      );
      onSaved?.(saved);
      if (isNew) {
        const dest = backHref === "/mypage" ? "/mypage" : "/campaigns";
        setTimeout(() => router.push(dest), 800);
      }
    } catch (err) {
      setMessage(parseApiErrorMessage(err));
      showToast(parseApiErrorMessage(err), "error");
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
  const progressPct = (step / 3) * 100;

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-4xl space-y-4">
      <p className="text-center text-xs text-brand-muted">
        PLFIL 스타일 프로필을 작성하면 브랜드·광고주에게 더 잘 노출됩니다.
      </p>

      <div className="overflow-hidden rounded-2xl border border-brand-border bg-white">
        <div className="flex items-center justify-between border-b border-brand-border px-5 py-3 text-sm">
          <span className="font-semibold text-[#070707]">
            프로필 등록 | {STEP_LABELS[step]}
          </span>
          <span className="text-brand-muted">{step} / 3</span>
        </div>
        <div className="h-1 bg-brand-border">
          <div
            className="h-full bg-[#070707] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {step === 1 && (
          <div className="p-6 md:p-8">
            <SectionHeader title="기본 정보" required />
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <FieldLabel required>이름</FieldLabel>
                <input
                  required
                  placeholder="이름을 입력해 주세요"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-brand-border px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <FieldLabel required>나이</FieldLabel>
                <input
                  required
                  placeholder="예) 20세(05년생)"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="w-full rounded-lg border border-brand-border px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <FieldLabel required>신장 (cm)</FieldLabel>
                <input
                  required
                  placeholder="예) 178"
                  value={form.height}
                  onChange={(e) => setForm({ ...form, height: e.target.value })}
                  className="w-full rounded-lg border border-brand-border px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <FieldLabel required>체중 (kg)</FieldLabel>
                <input
                  required
                  placeholder="예) 73"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  className="w-full rounded-lg border border-brand-border px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <FieldLabel>학력</FieldLabel>
                <input
                  placeholder="예) 대학교: 백석예술대학교 연기전공"
                  value={form.education}
                  onChange={(e) => setForm({ ...form, education: e.target.value })}
                  className="w-full rounded-lg border border-brand-border px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <FieldLabel>거주지</FieldLabel>
                <input
                  placeholder="예) 서울"
                  value={form.residence}
                  onChange={(e) => setForm({ ...form, residence: e.target.value })}
                  className="w-full rounded-lg border border-brand-border px-3 py-2.5 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-6 md:p-8">
            <SectionHeader title="프로필 사진" required />
            <p className="mb-6 text-sm text-brand-muted">
              대표 사진은 상세 페이지 왼쪽에 크게 노출됩니다. 추가 사진은 갤러리에 표시됩니다.
            </p>

            <div className="mb-8">
              <FieldLabel required>대표 사진</FieldLabel>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-border bg-[#fafafa] py-8 transition hover:border-[#070707]">
                {form.profileImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.profileImageUrl}
                    alt="대표 사진"
                    className="mb-3 h-64 w-48 rounded-lg object-cover"
                  />
                ) : (
                  <div className="mb-3 flex h-64 w-48 items-center justify-center rounded-lg bg-brand-primary-soft text-sm text-brand-muted">
                    3:4 비율 상반신
                  </div>
                )}
                <span className="rounded-full bg-[#070707] px-6 py-2.5 text-sm font-semibold text-white">
                  {processingImage ? "처리 중..." : "대표 사진 업로드"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    void handleImageChange(e.target.files?.[0] ?? null, "main");
                    e.target.value = "";
                  }}
                />
              </label>
            </div>

            <div>
              <FieldLabel>추가 프로필 사진 (최대 8장)</FieldLabel>
              <div className="grid grid-cols-4 gap-2">
                {form.galleryImageUrls.map((url, index) => (
                  <div key={index} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`추가 사진 ${index + 1}`}
                      className="aspect-[3/4] w-full rounded object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          galleryImageUrls: prev.galleryImageUrls.filter((_, i) => i !== index),
                        }))
                      }
                      className="absolute right-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white"
                    >
                      삭제
                    </button>
                  </div>
                ))}
                {form.galleryImageUrls.length < 8 && (
                  <label className="flex aspect-[3/4] cursor-pointer items-center justify-center rounded border-2 border-dashed border-brand-border text-xs text-brand-muted hover:border-[#070707]">
                    + 추가
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        void handleImageChange(e.target.files?.[0] ?? null, "gallery");
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

            <label className="mt-6 flex items-start gap-2 rounded-lg bg-brand-primary-light p-3 text-xs text-[#070707]">
              <input type="checkbox" required className="mt-0.5 accent-[#070707]" />
              본인 사진이 아닌 경우 사전 통보 없이 삭제·이용 제한될 수 있음에 동의합니다.
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 p-6 md:p-8">
            <div>
              <SectionHeader title="자기소개" />
              <textarea
                placeholder="자기소개, 활동 방향, 강점 등을 작성해 주세요"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={5}
                className="w-full rounded-lg border border-brand-border px-3 py-2.5 text-sm"
              />
            </div>

            <div>
              <SectionHeader title="활동 태그" required />
              <TagChipInput
                value={form.tags}
                onChange={(tags) => setForm({ ...form, tags })}
                min={2}
              />
            </div>

            <div>
              <SectionHeader title="취미 / 특기" />
              <p className="mb-3 text-xs text-brand-muted">
                숙련도를 별점(1~5)으로 표시합니다. 상세 페이지에 그대로 노출됩니다.
              </p>
              <HobbyEditor
                value={form.hobbies}
                onChange={(hobbies) => setForm({ ...form, hobbies })}
              />
            </div>

            <div>
              <SectionHeader title="경력사항" />
              <p className="mb-3 text-xs text-brand-muted">
                영화, 드라마, CF/광고 등 분류별로 경력을 등록하세요.
              </p>
              <CareerEditor
                value={form.careers}
                onChange={(careers) => setForm({ ...form, careers })}
              />
            </div>

            <div>
              <SectionHeader title="SNS · 영상" />
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Instagram URL</FieldLabel>
                  <input
                    placeholder="https://instagram.com/..."
                    value={form.instagramUrl}
                    onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                    className="w-full rounded-lg border border-brand-border px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <FieldLabel>YouTube URL</FieldLabel>
                  <input
                    placeholder="https://youtube.com/..."
                    value={form.youtubeUrl}
                    onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                    className="w-full rounded-lg border border-brand-border px-3 py-2.5 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <FieldLabel>대표 영상 URL</FieldLabel>
                  <input
                    placeholder="YouTube 등 영상 링크"
                    value={form.videoUrl}
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                    className="w-full rounded-lg border border-brand-border px-3 py-2.5 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {message && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>
      )}

      <div className="flex gap-3 pt-2">
        {step === 1 ? (
          <>
            <Link
              href={backHref}
              className="flex-1 rounded-full border border-brand-border bg-white py-3.5 text-center text-sm font-semibold text-[#070707]"
            >
              나가기
            </Link>
            <button
              type="button"
              onClick={goNext}
              className="flex-1 rounded-full bg-[#070707] py-3.5 text-sm font-semibold text-white"
            >
              다음
            </button>
          </>
        ) : step === 2 ? (
          <>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 rounded-full border border-brand-border bg-white py-3.5 text-sm font-semibold text-[#070707]"
            >
              이전
            </button>
            <button
              type="button"
              onClick={goNext}
              className="flex-1 rounded-full bg-[#070707] py-3.5 text-sm font-semibold text-white"
            >
              다음
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex-1 rounded-full border border-brand-border bg-white py-3.5 text-sm font-semibold text-[#070707]"
            >
              이전
            </button>
            <button
              type="submit"
              disabled={saving}
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
