import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Mapping: plan tradeName → parent tradeName
const planToParent = {
  "OSDE 310": "OSDE",
  "OSDE 210": "OSDE",
  "Sancor 2000": "Sancor Salud",
  "Sancor 3000": "Sancor Salud",
  "Medicus Plan Celeste": "Medicus",
  "Medicus Plan Ford": "Medicus",
  "Omint F": "Omint",
  "Medifé Plata": "Medifé",
};

async function main() {
  // 1. Fetch all relevant healthcare entries
  const allNames = [
    ...new Set([
      ...Object.keys(planToParent),
      ...Object.values(planToParent),
    ]),
  ];

  const healthcares = await prisma.healthcare.findMany({
    where: { tradeName: { in: allNames } },
  });

  const byName = Object.fromEntries(healthcares.map((h) => [h.tradeName, h]));

  // 2. Validate all entries exist
  const missingParents = [];
  const missingPlans = [];

  for (const [plan, parent] of Object.entries(planToParent)) {
    if (!byName[parent]) missingParents.push(parent);
    if (!byName[plan]) missingPlans.push(plan);
  }

  if (missingParents.length > 0) {
    console.error("Missing parent entries:", missingParents);
    process.exit(1);
  }

  if (missingPlans.length > 0) {
    console.warn("Plans already removed (skipping):", missingPlans);
  }

  const plansToProcess = Object.entries(planToParent).filter(
    ([plan]) => byName[plan]
  );

  if (plansToProcess.length === 0) {
    console.log("All plans already consolidated. Nothing to do.");
    return;
  }

  // 3. Execute in a transaction
  await prisma.$transaction(async (tx) => {
    for (const [planName, parentName] of plansToProcess) {
      const plan = byName[planName];
      const parent = byName[parentName];

      // Reassign users
      const result = await tx.user.updateMany({
        where: { healthcareId: plan.id },
        data: { healthcareId: parent.id },
      });

      console.log(
        `"${planName}" → "${parentName}": ${result.count} user(s) reassigned`
      );

      // Delete the plan entry
      await tx.healthcare.delete({ where: { id: plan.id } });
      console.log(`  Deleted "${planName}" (id: ${plan.id})`);
    }
  });

  console.log("\nConsolidation complete.");

  // 4. Verify
  const remaining = await prisma.healthcare.findMany({
    where: { tradeName: { in: Object.keys(planToParent) } },
  });

  if (remaining.length > 0) {
    console.error("ERROR: Some plans still exist:", remaining.map((h) => h.tradeName));
  } else {
    console.log("Verification passed: all plan entries removed.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
