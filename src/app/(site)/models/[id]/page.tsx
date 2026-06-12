import { AuthGate } from "@/components/auth/AuthGate";
import { ModelDetailClient } from "@/mfe/apps/model-discovery/ModelDetailClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ModelDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <AuthGate roles={["advertiser"]}>
      <ModelDetailClient modelId={id} />
    </AuthGate>
  );
}
