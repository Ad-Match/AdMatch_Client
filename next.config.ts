import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
};

export default withSerwist(nextConfig);
