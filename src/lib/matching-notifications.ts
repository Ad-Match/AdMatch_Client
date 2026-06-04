import { apiFetch } from "@/lib/api";
import type { Campaign, Matching, ModelProfile, Paginated, User } from "@/lib/types";

export type MatchingNotification = {
  matchingId: string;
  campaignId: string;
  modelId: string;
  status: Matching["status"];
  score: number;
  message?: string;
  createdAt: string;
  campaignTitle?: string;
  modelName?: string;
  /** 광고주만 수락/거절 가능 */
  actionable: boolean;
};

const READ_KEY = "admatch_read_notifications";

export function getReadNotificationIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(READ_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function markNotificationsRead(ids: string[]) {
  const current = getReadNotificationIds();
  ids.forEach((id) => current.add(id));
  localStorage.setItem(READ_KEY, JSON.stringify([...current]));
}

export function markAllNotificationsRead(notifications: MatchingNotification[]) {
  markNotificationsRead(notifications.map((n) => n.matchingId));
}

export async function loadMatchingHistory(user: User) {
  if (user.role === "model") {
    const profile = await apiFetch<ModelProfile>(`/models/user/${user.id}`);
    const matchings = await apiFetch<Matching[]>(
      `/matchings?modelId=${profile.id}`,
    );
    return enrichMatchings(matchings);
  }

  const campaigns = await apiFetch<Paginated<Campaign>>("/campaigns?limit=100");
  const mine = campaigns.items.filter((c) => c.advertiserId === user.id);
  const batches = await Promise.all(
    mine.map((c) =>
      apiFetch<Matching[]>(`/matchings?campaignId=${c.id}`).catch(() => []),
    ),
  );
  const matchings = batches.flat();
  return enrichMatchings(matchings);
}

async function enrichMatchings(matchings: Matching[]) {
  return Promise.all(
    matchings.map(async (m) => {
      try {
        const [campaign, model] = await Promise.all([
          apiFetch<Campaign>(`/campaigns/${m.campaignId}`),
          apiFetch<ModelProfile>(`/models/${m.modelId}`),
        ]);
        return { ...m, campaign, modelName: model.name };
      } catch {
        return { ...m, campaign: undefined as Campaign | undefined, modelName: undefined as string | undefined };
      }
    }),
  );
}

export async function loadMatchingNotifications(
  user: User,
): Promise<{ important: MatchingNotification[]; general: MatchingNotification[] }> {
  const history = await loadMatchingHistory(user).catch(() => []);

  const notifications: MatchingNotification[] = history.map((m) => {
    const actionable = user.role === "advertiser" && m.status === "pending";
    return {
      matchingId: m.id,
      campaignId: m.campaignId,
      modelId: m.modelId,
      status: m.status,
      score: m.score,
      message: m.message,
      createdAt: m.createdAt,
      campaignTitle: m.campaign?.title,
      modelName: m.modelName,
      actionable,
    };
  });

  notifications.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const important = notifications.filter((n) => n.actionable);
  const general = notifications.filter((n) => !n.actionable);

  return { important, general };
}

export function countUnreadImportant(
  important: MatchingNotification[],
): number {
  const read = getReadNotificationIds();
  return important.filter((n) => !read.has(n.matchingId)).length;
}
