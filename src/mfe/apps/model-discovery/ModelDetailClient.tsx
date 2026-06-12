"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StarRating } from "@/components/profile/StarRating";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { apiFetch } from "@/lib/api";
import { parseApiErrorMessage } from "@/lib/api-errors";
import {
  careerCategoryStyle,
  extractYoutubeId,
  formatBodyText,
  formatUpdatedAt,
  groupCareersByCategory,
} from "@/lib/model-profile";
import type { Campaign, Matching, ModelProfile } from "@/lib/types";

type Props = { modelId: string };

type PhotoTab = "profile" | "fullbody";
type VideoTab = "acting" | "hobby" | "career";

function StatCell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-brand-border bg-white px-4 py-3">
      <p className="text-xs font-semibold text-brand-muted">{label}</p>
      <div className="mt-1 text-sm font-medium text-[#070707]">{children}</div>
    </div>
  );
}

function SectionCard({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-brand-border bg-white">
      <div className="flex items-center justify-between border-b border-brand-border px-4 py-3">
        <h2 className="text-sm font-bold text-[#070707]">{title}</h2>
        {action}
      </div>
      <div className="px-4 py-4">{children}</div>
    </section>
  );
}

export function ModelDetailClient({ modelId }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [model, setModel] = useState<ModelProfile | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignId, setCampaignId] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [photoTab, setPhotoTab] = useState<PhotoTab>("profile");
  const [videoTab, setVideoTab] = useState<VideoTab>("acting");
  const [careerFilter, setCareerFilter] = useState("전체");
  const [showAllHobbies, setShowAllHobbies] = useState(false);
  const [showAllCareers, setShowAllCareers] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [modelData, campaignData] = await Promise.all([
          apiFetch<ModelProfile>(`/models/${modelId}`),
          apiFetch<{ items: Campaign[] }>("/campaigns?status=진행중&limit=50"),
        ]);
        setModel(modelData);
        const mine = user
          ? campaignData.items.filter((c) => c.advertiserId === user.id)
          : [];
        setCampaigns(mine);
        if (mine[0]) setCampaignId(mine[0].id);
      } catch {
        showToast("모델 정보를 불러오지 못했습니다.", "error");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [modelId, user, showToast]);

  const proposeMatching = useCallback(async () => {
    if (!campaignId) {
      showToast("먼저 브랜드 공고를 등록해 주세요.", "error");
      router.push("/campaigns/new");
      return;
    }
    setSubmitting(true);
    try {
      const result = await apiFetch<Matching>("/matchings", {
        method: "POST",
        body: JSON.stringify({
          campaignId,
          modelId,
          message,
          autoAccept: true,
        }),
      });
      showToast("매칭 제안이 완료되었습니다. 채팅으로 이동합니다.", "success");
      if (result.chatRoomId) {
        router.push(`/chats/${result.chatRoomId}`);
      } else {
        router.push("/chats");
      }
    } catch (err) {
      showToast(parseApiErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  }, [campaignId, modelId, message, router, showToast]);

  const careerGroups = useMemo(
    () => groupCareersByCategory(model?.careers ?? []),
    [model?.careers],
  );

  const filteredCareerGroups = useMemo(() => {
    if (careerFilter === "전체") return careerGroups;
    return careerGroups.filter(([category]) => category === careerFilter);
  }, [careerFilter, careerGroups]);

  const visibleCareerGroups = showAllCareers
    ? filteredCareerGroups
    : filteredCareerGroups.slice(0, 2);

  const hobbies = model?.hobbies ?? [];
  const visibleHobbies = showAllHobbies ? hobbies : hobbies.slice(0, 3);
  if (loading) {
    return <p className="px-4 py-16 text-center text-brand-muted">불러오는 중...</p>;
  }

  if (!model) {
    return <p className="px-4 py-16 text-center text-red-600">모델을 찾을 수 없습니다.</p>;
  }

  const hasExtraGallery = (model.galleryImageUrls?.length ?? 0) > 0;
  const youtubeId = extractYoutubeId(model.videoUrl ?? model.youtubeUrl);
  const bodyText = formatBodyText(model.height, model.weight, model.body);

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8">
      <nav className="mb-5 text-sm text-brand-muted">
        <Link href="/models" className="hover:text-[#070707] hover:underline">
          모델 검색
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[#070707]">{model.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(280px,380px)_1fr]">
        <div className="space-y-5">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#070707] sm:text-3xl">
                  {model.name}
                </h1>
                <p className="mt-1 text-xs text-brand-muted">
                  최근 업데이트 {formatUpdatedAt(model.updatedAt)}
                </p>
              </div>
              {model.verified && (
                <span className="shrink-0 rounded bg-[#070707] px-2 py-1 text-xs font-semibold text-white">
                  인증
                </span>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-brand-border bg-white shadow-sm">
            <div className="relative aspect-[3/4] bg-[#ececec]">
              {model.profileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={model.profileImageUrl}
                  alt={model.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-brand-muted">
                  대표 사진 없음
                </div>
              )}
            </div>
          </div>

          {hasExtraGallery && (
            <div className="rounded-lg border border-brand-border bg-white">
              <div className="flex border-b border-brand-border text-sm">
                <button
                  type="button"
                  onClick={() => setPhotoTab("profile")}
                  className={`flex-1 px-3 py-2.5 font-semibold ${
                    photoTab === "profile"
                      ? "border-b-2 border-[#070707] text-[#070707]"
                      : "text-brand-muted"
                  }`}
                >
                  추가 프로필 사진
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoTab("fullbody")}
                  className={`flex-1 px-3 py-2.5 font-semibold ${
                    photoTab === "fullbody"
                      ? "border-b-2 border-[#070707] text-[#070707]"
                      : "text-brand-muted"
                  }`}
                >
                  전신·상반신
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2 p-3">
                {(photoTab === "profile"
                  ? (model.galleryImageUrls ?? [])
                  : (model.galleryImageUrls ?? []).slice(4)
                ).slice(0, 8).map((src, index) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={`${src}-${index}`}
                    src={src}
                    alt={`${model.name} 사진 ${index + 1}`}
                    className="aspect-[3/4] w-full rounded object-cover"
                  />
                ))}
              </div>
            </div>
          )}

          {(youtubeId || model.videoUrl) && (
            <div className="rounded-lg border border-brand-border bg-white">
              <div className="flex overflow-x-auto border-b border-brand-border text-xs sm:text-sm">
                {(
                  [
                    ["acting", "연기 영상"],
                    ["hobby", "취미·특기 영상"],
                    ["career", "출연·경력 영상"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setVideoTab(key)}
                    className={`whitespace-nowrap px-3 py-2.5 font-semibold ${
                      videoTab === key
                        ? "border-b-2 border-[#070707] text-[#070707]"
                        : "text-brand-muted"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="p-3">
                {youtubeId ? (
                  <div className="aspect-video overflow-hidden rounded-lg bg-black">
                    <iframe
                      title={`${model.name} 영상`}
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <a
                    href={model.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg border border-brand-border px-4 py-8 text-center text-sm text-[#070707] hover:underline"
                  >
                    영상 링크 보기
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-0 overflow-hidden rounded-lg border border-brand-border sm:grid-cols-3">
            <StatCell label="나이">
              {model.age}
            </StatCell>
            <StatCell label="신장/체중">{bodyText}</StatCell>
            <StatCell label="거주지">{model.residence || "-"}</StatCell>
            <StatCell label="SNS">
              <div className="flex flex-wrap gap-2">
                {model.instagramUrl ? (
                  <a
                    href={model.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold underline"
                  >
                    Instagram
                  </a>
                ) : null}
                {model.youtubeUrl ? (
                  <a
                    href={model.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold underline"
                  >
                    YouTube
                  </a>
                ) : null}
                {!model.instagramUrl && !model.youtubeUrl && "-"}
              </div>
            </StatCell>
            <StatCell label="활동 분야">
              {model.tags.length > 0
                ? model.tags.map((t) => `#${t}`).join(" ")
                : "-"}
            </StatCell>
            <StatCell label="학력">{model.education || "-"}</StatCell>
          </div>

          {model.bio && (
            <SectionCard title="자기소개">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#070707]">
                {model.bio}
              </p>
            </SectionCard>
          )}

          {hobbies.length > 0 && (
            <SectionCard
              title="취미 / 특기"
              action={
                hobbies.length > 3 ? (
                  <button
                    type="button"
                    onClick={() => setShowAllHobbies((v) => !v)}
                    className="text-xs font-semibold text-brand-muted hover:text-[#070707]"
                  >
                    {showAllHobbies ? "접기" : `더보기 (+${hobbies.length - 3})`}
                  </button>
                ) : undefined
              }
            >
              <ul className="space-y-3">
                {visibleHobbies.map((hobby, index) => (
                  <li
                    key={`${hobby.name}-${index}`}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="font-medium text-[#070707]">{hobby.name}</span>
                    <StarRating value={hobby.rating} size="sm" />
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {careerGroups.length > 0 && (
            <SectionCard
              title="경력사항"
              action={
                <select
                  value={careerFilter}
                  onChange={(e) => setCareerFilter(e.target.value)}
                  className="rounded border border-brand-border px-2 py-1 text-xs"
                >
                  <option value="전체">전체</option>
                  {careerGroups.map(([category]) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              }
            >
              <p className="mb-4 text-xs text-brand-muted">
                총 {model.careers?.length ?? 0}건 · {careerGroups.length}개 분류
              </p>
              <div className="space-y-4">
                {visibleCareerGroups.map(([category, items]) => (
                  <div
                    key={category}
                    className="overflow-hidden rounded-lg border border-brand-border"
                  >
                    <div
                      className={`px-3 py-2 text-xs font-bold ${careerCategoryStyle(category)}`}
                    >
                      {category}
                    </div>
                    <ul className="divide-y divide-brand-border">
                      {items.map((item, index) => (
                        <li key={`${item.title}-${index}`} className="px-3 py-3 text-sm">
                          <p className="font-semibold text-[#070707]">
                            <span className="mr-2 text-brand-muted">{item.year}</span>
                            {item.title}
                          </p>
                          {item.role && (
                            <p className="mt-1 text-xs text-brand-muted">{item.role}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {filteredCareerGroups.length > 2 && (
                <button
                  type="button"
                  onClick={() => setShowAllCareers((v) => !v)}
                  className="mt-4 w-full rounded-lg bg-[#070707] py-2.5 text-sm font-semibold text-white hover:opacity-90"
                >
                  {showAllCareers
                    ? "경력 접기"
                    : `경력 전체보기 (+${filteredCareerGroups.length - 2}분류)`}
                </button>
              )}
            </SectionCard>
          )}

          {user?.role === "advertiser" && (
            <section className="rounded-xl border border-brand-border bg-white p-4 sm:p-5">
              <h2 className="text-sm font-bold text-[#070707]">매칭 제안 보내기</h2>
              <p className="mt-1 text-xs text-brand-muted">
                제안 즉시 매칭이 확정되고 채팅방으로 이동합니다.
              </p>
              {campaigns.length === 0 ? (
                <Link
                  href="/campaigns/new"
                  className="mt-4 block rounded-full bg-[#070707] py-3 text-center text-sm font-semibold text-white"
                >
                  공고 등록하러 가기
                </Link>
              ) : (
                <div className="mt-4 space-y-3">
                  <select
                    value={campaignId}
                    onChange={(e) => setCampaignId(e.target.value)}
                    className="w-full rounded-lg border border-brand-border px-3 py-2.5 text-sm"
                  >
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="제안 메시지 (선택)"
                    className="w-full rounded-lg border border-brand-border px-3 py-2.5 text-sm"
                    rows={3}
                  />
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => void proposeMatching()}
                    className="w-full rounded-full bg-[#070707] py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {submitting ? "전송 중..." : "제안 보내고 채팅하기"}
                  </button>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
