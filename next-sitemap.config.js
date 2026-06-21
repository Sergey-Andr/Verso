/** @type {import("next-sitemap").IConfig} */
import path from "node:path";
import { readFile } from "node:fs/promises";

const weather = encodeURIComponent("погода");

const config = {
  siteUrl: "https://example.com",
  generateRobotsTxt: true,

  additionalPaths: async (config) => {
    const filePath = path.join(process.cwd(), "public", "UA.tsv");
    const cities = await readFile(filePath, "utf-8");
    const lines = cities.split("\n").filter(Boolean);

    return lines.map((line) => {
      const [cityName, lat, lon] = line.split("\t");

      return {
        loc: `/${weather}/${encodeURIComponent(cityName)}/${lat}/${lon}`,
        changefreq: "daily",
        lastmod: new Date().toISOString(),
        priority: 0.7,
      };
    });
  },
};

export default config;
