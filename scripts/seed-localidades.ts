/**
 * Seed script: Fetches all Argentine localidades from the Georef AR API
 * and inserts them into the database (organizationId = null = shared).
 *
 * Usage: npx ts-node scripts/seed-localidades.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const GEOREF_BASE = "https://apis.datos.gob.ar/georef/api";

// Map Georef province names → our ARGENTINA_PROVINCES constant
const PROVINCE_NAME_MAP: Record<string, string> = {
  "Tierra del Fuego, Antártida e Islas del Atlántico Sur": "Tierra del Fuego",
};

interface GeorefLocalidad {
  id: string;
  nombre: string;
  provincia_nombre: string;
}

async function fetchLocalidades(
  provinciaId: string,
): Promise<GeorefLocalidad[]> {
  const url = `${GEOREF_BASE}/localidades?provincia=${provinciaId}&max=5000&campos=id,nombre,provincia.nombre&orden=nombre&aplanar=true`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Georef API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data.localidades || [];
}

async function fetchProvincias(): Promise<
  { id: string; nombre: string }[]
> {
  const url = `${GEOREF_BASE}/provincias?campos=id,nombre&orden=nombre&max=30`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Georef API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data.provincias || [];
}

function normalizeProvinceName(georefName: string): string {
  return PROVINCE_NAME_MAP[georefName] || georefName;
}

async function main() {
  console.log("Fetching provinces from Georef AR API...");
  const provincias = await fetchProvincias();
  console.log(`Found ${provincias.length} provinces.\n`);

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const prov of provincias) {
    const provinceName = normalizeProvinceName(prov.nombre);
    console.log(`Processing: ${provinceName} (Georef ID: ${prov.id})...`);

    const localidades = await fetchLocalidades(prov.id);
    console.log(`  → ${localidades.length} localidades from API`);

    // Deduplicate by name within province (Georef can have duplicates)
    const seen = new Set<string>();
    const unique: GeorefLocalidad[] = [];
    for (const loc of localidades) {
      const key = loc.nombre.trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(loc);
      }
    }

    let inserted = 0;
    let skipped = 0;

    for (const loc of unique) {
      const name = loc.nombre.trim();
      if (!name) continue;

      try {
        await prisma.localidad.create({
          data: {
            name,
            province: provinceName,
            organizationId: null,
          },
        });
        inserted++;
      } catch (err: any) {
        // Unique constraint violation → already exists
        if (err.code === "P2002") {
          skipped++;
        } else {
          console.error(`  Error inserting "${name}": ${err.message}`);
        }
      }
    }

    console.log(
      `  → Inserted: ${inserted}, Skipped (already exist): ${skipped}\n`,
    );
    totalInserted += inserted;
    totalSkipped += skipped;
  }

  console.log("=".repeat(50));
  console.log(`Done! Total inserted: ${totalInserted}, skipped: ${totalSkipped}`);
}

main()
  .catch((e) => {
    console.error("Fatal error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
