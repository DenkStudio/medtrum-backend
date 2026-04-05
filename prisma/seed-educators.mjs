import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const educators = [
  "Pedró Lucia",
  "Mazzeo Camila",
  "Fowler Maria Sol",
  "Baldi Franca",
  "Pachuck Cecilia",
  "Pascual Mariana",
  "Soria Ma Belen",
  "Cabrera Ariana",
  "Valentini Julieta",
];

async function main() {
  // Find MEC organization
  const mec = await prisma.organization.findFirst({
    where: { name: "Mec" },
  });

  if (!mec) {
    console.error("Organization MEC not found!");
    process.exit(1);
  }

  console.log(`Found MEC organization: ${mec.id}`);

  // Check existing educators to avoid duplicates
  const existing = await prisma.educator.findMany({
    where: { organizationId: mec.id },
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
      organizationId: mec.id,
    })),
  });

  console.log(`Inserted ${result.count} educators.`);

  // Verify
  const all = await prisma.educator.findMany({
    where: { organizationId: mec.id },
    orderBy: { name: "asc" },
  });
  console.log("\nAll MEC educators:");
  all.forEach((e) => console.log(`  - ${e.name} (${e.id})`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
