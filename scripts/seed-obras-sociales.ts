/**
 * Seed script: Fetches all Argentine obras sociales from the SSSalud registry
 * and inserts them into the healthcares table.
 *
 * Usage: npx ts-node scripts/seed-obras-sociales.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SSSALUD_URL = "https://www.sssalud.gob.ar/descargas/dump.php";

// SSSalud entity type codes (1-18 cover all obra social types)
const ENTITY_TYPES = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
];

interface ObraSocial {
  rnos: string;
  nombre: string;
  sigla: string;
}

async function fetchObrasSociales(): Promise<ObraSocial[]> {
  const allEntries: ObraSocial[] = [];

  for (const tipo of ENTITY_TYPES) {
    console.log(`Fetching type ${tipo}...`);

    const formData = new URLSearchParams();
    formData.append("obj", "listRnosc");
    formData.append("tipo", String(tipo));

    const res = await fetch(SSSALUD_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!res.ok) {
      console.warn(`  Warning: type ${tipo} returned ${res.status}, skipping`);
      continue;
    }

    // Response is latin1 (ISO-8859-1) encoded TSV
    const buffer = await res.arrayBuffer();
    const text = new TextDecoder("latin1").decode(buffer);

    const lines = text.split("\n").filter((line) => line.trim());

    // Skip first 2 lines: title line + column headers
    let count = 0;
    for (let i = 2; i < lines.length; i++) {
      const cols = lines[i].split("\t");
      // TSV columns: RNAS, nombre, sigla, domicilio, localidad, cp, provincia, telefono, otros_telefonos, e_mail, web, ...
      if (cols.length >= 3) {
        const rnos = cols[0]?.trim();
        const nombre = cols[1]?.trim();
        const sigla = cols[2]?.trim();

        if (rnos && nombre) {
          allEntries.push({ rnos, nombre, sigla: sigla || "" });
          count++;
        }
      }
    }

    console.log(`  → ${count} entries from type ${tipo}`);
  }

  return allEntries;
}

function deduplicateByRnos(entries: ObraSocial[]): ObraSocial[] {
  const seen = new Map<string, ObraSocial>();
  for (const entry of entries) {
    if (!seen.has(entry.rnos)) {
      seen.set(entry.rnos, entry);
    }
  }
  return Array.from(seen.values());
}

async function main() {
  console.log("Fetching obras sociales from SSSalud...\n");

  const raw = await fetchObrasSociales();
  console.log(`\nTotal raw entries: ${raw.length}`);

  const unique = deduplicateByRnos(raw);
  console.log(`Unique by RNOS: ${unique.length}\n`);

  let inserted = 0;
  let skipped = 0;

  for (const os of unique) {
    try {
      await prisma.healthcare.create({
        data: {
          tradeName: os.nombre,
          legalName: os.nombre,
          rnos: os.rnos,
          sigla: os.sigla || null,
          cuit: null,
        },
      });
      inserted++;
    } catch (err: any) {
      // P2002 = unique constraint violation (rnos already exists)
      if (err.code === "P2002") {
        skipped++;
      } else {
        console.error(`Error inserting "${os.nombre}" (RNOS: ${os.rnos}): ${err.message}`);
      }
    }
  }

  console.log("=".repeat(50));
  console.log(`Done! Inserted: ${inserted}, Skipped (already exist): ${skipped}`);
}

main()
  .catch((e) => {
    console.error("Fatal error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
