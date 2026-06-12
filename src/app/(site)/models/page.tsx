import { AuthGate } from "@/components/auth/AuthGate";
import { DiscoveryMfe } from "@/mfe/apps/model-discovery/DiscoveryMfe";

export default function ModelsPage() {
  return (
    <AuthGate roles={["advertiser"]}>
      <DiscoveryMfe />
    </AuthGate>
  );
}
