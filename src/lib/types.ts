export type UserRole = "advertiser" | "model";

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export type AuthResponse = {
  accessToken: string;
  user: User;
};

export type ModelProfile = {
  id: string;
  userId?: string;
  name: string;
  age: string;
  body: string;
  height?: string;
  weight?: string;
  bio?: string;
  profileImageUrl?: string;
  tags: string[];
  verified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Campaign = {
  id: string;
  category: string;
  title: string;
  pay: string;
  due: string;
  posted: string;
  status: "진행중" | "마감";
  advertiserId: string;
  requiredTags: string[];
  createdAt: string;
  updatedAt: string;
};

export type Matching = {
  id: string;
  campaignId: string;
  modelId: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  score: number;
  message?: string;
  createdAt: string;
  updatedAt: string;
};

export type ModelRecommendation = {
  modelId: string;
  score: number;
  reason: string;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type MatchingWithCampaign = Matching & {
  campaign?: Campaign;
};

export type ChatRoom = {
  id: string;
  matchingId: string;
  campaignId: string;
  modelId: string;
  modelUserId: string;
  advertiserUserId: string;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessage = {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: string;
};

export type ChatRoomSummary = ChatRoom & {
  campaignTitle?: string;
  modelName?: string;
  lastMessage?: string;
};
