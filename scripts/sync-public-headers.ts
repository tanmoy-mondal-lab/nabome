import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderStaticHeadersFile } from "../api/_lib/http-headers";

const outputPath = resolve(process.cwd(), "public/_headers");
writeFileSync(outputPath, renderStaticHeadersFile(), "utf8");
console.log(`[headers] Wrote ${outputPath}`);
