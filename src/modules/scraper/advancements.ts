import { ADVANCEMENTS_URL } from "@/modules/utils/constants";
import axios from "axios";
import { JSDOM } from "jsdom";
import path from "node:path";
import fs from "node:fs/promises";

const HEADERS = {
  Icon: 1,
  Advancement: 2,
  InGameDescription: 3,
  Parent: 4,
  Requirements: 5,
  ResourceLocation: 6,
  Rewards: 7,
} as const;

const advancements: Advancement[] = [];

async function fetchAdvancements() {
  const resp = await axios.get(ADVANCEMENTS_URL);
  const html = resp.data;

  const dom = new JSDOM(html);

  const tables = dom.window.document.querySelectorAll(
    "table[data-description=advancements]"
  );

  tables.forEach((table) => {
    const rows = table.querySelector("tbody")!.querySelectorAll("tr");

    rows.forEach((row) => {
      const idEl = row.querySelector(
        `td:nth-child(${HEADERS.ResourceLocation})`
      );
      const titleEl = row.querySelector(`td:nth-child(${HEADERS.Advancement})`);
      const descEl = row.querySelector(
        `td:nth-child(${HEADERS.InGameDescription})`
      );

      const id = idEl?.textContent?.trim();
      const title = titleEl?.textContent?.trim();
      const description = descEl?.textContent?.trim();

      if (!id || !title || !description) return;

      const category = id.split("/")[0];

      advancements.push({ id, title, description, category });
    });
  });

  const data = JSON.stringify(advancements);
  const outPath = path.join(process.cwd(), "assets", "advancements.json");

  await fs.writeFile(outPath, data);
}

fetchAdvancements();
