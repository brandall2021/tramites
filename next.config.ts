import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["imapflow", "mailparser", "@prisma/adapter-pg", "@anthropic-ai/sdk"],
};

export default nextConfig;
