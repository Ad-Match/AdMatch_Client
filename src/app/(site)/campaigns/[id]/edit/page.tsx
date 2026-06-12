import CampaignEditClient from "./CampaignEditClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CampaignEditPage({ params }: Props) {
  const { id } = await params;
  return <CampaignEditClient campaignId={id} />;
}
