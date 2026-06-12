export type UserRole = "advertiser" | "model";

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole | null;
  needsOnboarding?: boolean;
  provider?: string | null;
};

export type AuthResponse = {
  accessToken: string;
  user: User;
};

export type ModelHobby = {
  name: string;
  rating: number;
};

export type ModelCareer = {
  category: string;
  year: string;
  title: string;
  role?: string;
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
  galleryImageUrls?: string[];
  videoUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  education?: string;
  residence?: string;
  hobbies?: ModelHobby[];
  careers?: ModelCareer[];
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
  description?: string;
  requirements?: string;
  deliverables?: string;
  location?: string;
  imageUrl?: string;
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
  chatRoomId?: string;
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
  modelName?: string;
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
