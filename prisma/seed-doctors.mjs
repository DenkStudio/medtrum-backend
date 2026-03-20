import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { resolve } from "path";

const prisma = new PrismaClient();

// Compound last name prefixes
const PREFIXES = new Set([
  "de",
  "di",
  "da",
  "del",
  "le",
  "san",
  "la",
  "los",
  "las",
]);

function parseName(raw) {
  const trimmed = raw.trim();

  // Handle comma-separated: "García, Ana Laura" → lastName="García", firstName="Ana Laura"
  if (trimmed.includes(",")) {
    const [last, first] = trimmed.split(",").map((s) => s.trim());
    return { lastName: last, firstName: first || "" };
  }

  // Handle slash (two doctors in one entry) - take the first one
  const entry = trimmed.includes("/") ? trimmed.split("/")[0].trim() : trimmed;

  const parts = entry.split(/\s+/);
  if (parts.length === 1) {
    return { lastName: parts[0], firstName: "" };
  }

  // Check for compound last name prefixes
  if (parts.length >= 3 && PREFIXES.has(parts[0].toLowerCase())) {
    // e.g. "De Valle Ana Paula" → lastName="De Valle", firstName="Ana Paula"
    return { lastName: `${parts[0]} ${parts[1]}`, firstName: parts.slice(2).join(" ") };
  }

  // Default: first word = lastName, rest = firstName
  return { lastName: parts[0], firstName: parts.slice(1).join(" ") };
}

async function main() {
  // Read CSV from xlsx-cli output piped to file, or parse directly
  // We'll use the raw CSV data embedded
  const csvPath = resolve(
    new URL(".", import.meta.url).pathname,
    "doctores.csv",
  );
  const content = readFileSync(csvPath, "utf-8");
  const lines = content.split("\n").filter((l) => l.trim());

  // Skip header
  const doctors = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Format: N°,Name — first comma separates number from name
    const commaIdx = line.indexOf(",");
    if (commaIdx === -1) continue;
    const nameRaw = line.slice(commaIdx + 1).trim();
    if (!nameRaw) continue;

    // Handle quoted fields: "García, Ana Laura"
    let nameClean = nameRaw;
    if (nameClean.startsWith('"') && nameClean.endsWith('"')) {
      nameClean = nameClean.slice(1, -1);
    }

    const { lastName, firstName } = parseName(nameClean);
    doctors.push({ lastName, firstName });
  }

  console.log(`Parsed ${doctors.length} doctors. Seeding...`);

  // Clear existing doctors (set user references to null first)
  await prisma.$executeRaw`UPDATE users SET doctor_id = NULL WHERE doctor_id IS NOT NULL`;
  await prisma.doctor.deleteMany();

  // Insert all
  const result = await prisma.doctor.createMany({
    data: doctors,
  });

  console.log(`Inserted ${result.count} doctors.`);

  // Verify
  const sample = await prisma.doctor.findMany({ take: 5 });
  console.log("Sample:", sample);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
