import { ApiError, apiFetch } from "@/lib/api";
import type { Campaign, Matching, ModelProfile, Paginated, User } from "@/lib/types";

export type AppNotification = {
  id: string;
  kind: "matching" | "new_campaign";
  createdAt: string;
  campaignId: string;
  campaignTitle?: string;
  category?: string;
  pay?: string;
  matchingId?: string;
  modelId?: string;
  status?: Matching["status"];
  score?: number;
  message?: string;
  modelName?: string;
  /** 광고주 · pending 지원 건 수락/거절 */
  actionable?: boolean;
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

export function markAllNotificationsRead(notifications: AppNotification[]) {
  markNotificationsRead(notifications.map((n) => n.id));
}

export function countUnread(notifications: AppNotification[]): number {
  const read = getReadNotificationIds();
  return notifications.filter((n) => !read.has(n.id)).length;
}

export async function loadMatchingHistory(user: User) {
  if (!user.role) return [];

  if (user.role === "model") {
    try {
      const profile = await apiFetch<ModelProfile>(`/models/user/${user.id}`);
      const matchings = await apiFetch<Matching[]>(
        `/matchings?modelId=${profile.id}`,
      );
      return enrichMatchings(matchings);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        return [];
      }
      throw err;
    }
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
        return {
          ...m,
          campaign: undefined as Campaign | undefined,
          modelName: undefined as string | undefined,
        };
      }
    }),
  );
}

async function loadNewCampaignNotifications(): Promise<AppNotification[]> {
  const data = await apiFetch<Paginated<Campaign>>(
    "/campaigns?status=진행중&limit=100",
  );
  return data.items.map((c) => ({
    id: `campaign-${c.id}`,
    kind: "new_campaign" as const,
    createdAt: c.createdAt,
    campaignId: c.id,
    campaignTitle: c.title,
    category: c.category,
    pay: c.pay,
  }));
}

async function loadMatchingNotificationsForUser(
  user: User,
): Promise<AppNotification[]> {
  const history = await loadMatchingHistory(user).catch(() => []);

  return history.map((m) => ({
    id: `matching-${m.id}`,
    kind: "matching" as const,
    matchingId: m.id,
    campaignId: m.campaignId,
    modelId: m.modelId,
    status: m.status,
    score: m.score,
    message: m.message,
    createdAt: m.createdAt,
    campaignTitle: m.campaign?.title,
    modelName: m.modelName,
    actionable: user.role === "advertiser" && m.status === "pending",
  }));
}

export async function loadNotifications(user: User): Promise<AppNotification[]> {
  if (user.role === "model") {
    const items = await loadNewCampaignNotifications();
    items.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return items;
  }

  const items = await loadMatchingNotificationsForUser(user);
  items.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return items;
}
