import { CampaignDetailClient } from "@/mfe/apps/advertiser-brief/CampaignDetailClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CampaignDetailPage({ params }: Props) {
  const { id } = await params;
  return <CampaignDetailClient campaignId={id} />;
}
