import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["imapflow", "mailparser", "@prisma/adapter-pg", "openai"],
};

export default nextConfig;
