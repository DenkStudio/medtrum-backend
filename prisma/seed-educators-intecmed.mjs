import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Formato: Apellido Nombre
const educators = [
  "Avila Catalina",
  "Oropeza Darlianys",
  "Gutierrez Romina",
  "Oliva Flavia",
  "Visciglio Mayra",
  "Vera Lucila",
  "Bilos Greta",
];

async function main() {
  const intecmed = await prisma.organization.findFirst({
    where: { name: "Intecmed" },
  });

  if (!intecmed) {
    console.error("Organization Intecmed not found!");
    process.exit(1);
  }

  console.log(`Found Intecmed organization: ${intecmed.id}`);

  // Check existing educators to avoid duplicates
  const existing = await prisma.educator.findMany({
    where: { organizationId: intecmed.id },
    select: { name: true },
  });
  const existingNames = new Set(existing.map((e) => e.name.toLowerCase()));

  const toCreate = educators.filter(
    (name) => !existingNames.has(name.toLowerCase())
  );

  if (toCreate.length === 0) {
    console.log("All educators already exist. Nothing to create.");
    return;
  }

  console.log(`Creating ${toCreate.length} educators...`);

  const result = await prisma.educator.createMany({
    data: toCreate.map((name) => ({
      name,
      province: "-",
      organizationId: intecmed.id,
    })),
  });

  console.log(`Inserted ${result.count} educators.`);

  // Verify
  const all = await prisma.educator.findMany({
    where: { organizationId: intecmed.id },
    orderBy: { name: "asc" },
  });
  console.log("\nAll Intecmed educators:");
  all.forEach((e) => console.log(`  - ${e.name} (${e.id})`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
