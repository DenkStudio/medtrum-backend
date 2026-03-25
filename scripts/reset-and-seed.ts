/**
 * RESET & SEED SCRIPT
 *
 * Keeps: organizations, healthcares (obras sociales), doctors, localidades
 * Deletes: users, claims, hardware, deliveries, calendar events, medical entries, educators
 * Creates: 1 superadmin user
 *
 * Usage: npx ts-node scripts/reset-and-seed.ts
 */

import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const SUPERADMIN_EMAIL = "ezequielotero@denk-studio.com";
const SUPERADMIN_PASSWORD = "1234567";

async function deleteAllSupabaseUsers() {
  console.log("Deleting all Supabase auth users...");
  let page = 1;
  let totalDeleted = 0;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) { console.error("Error listing users:", error.message); break; }
    if (!data.users || data.users.length === 0) break;

    for (const user of data.users) {
      const { error: delErr } = await supabase.auth.admin.deleteUser(user.id);
      if (delErr) console.error(`  Error deleting ${user.email}: ${delErr.message}`);
      else totalDeleted++;
    }

    if (data.users.length < 100) break;
    page++;
  }

  console.log(`  → Deleted ${totalDeleted} Supabase users\n`);
}

async function truncateTransactionalTables() {
  console.log("Truncating transactional tables (keeping orgs, doctors, obras sociales, localidades)...");

  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      medical_entries,
      calendar_events,
      deliveries,
      claims,
      hardware_supplies,
      educators,
      users
    CASCADE
  `);

  console.log("  → Done\n");
}

async function seedSuperadmin() {
  console.log(`Creating superadmin: ${SUPERADMIN_EMAIL}...`);

  // Get first organization (Mec)
  const org = await prisma.organization.findFirst({ where: { name: "Mec" } });
  if (!org) throw new Error("Organization 'Mec' not found. Make sure organizations exist.");

  // Create in Supabase
  const { data, error } = await supabase.auth.admin.createUser({
    email: SUPERADMIN_EMAIL,
    password: SUPERADMIN_PASSWORD,
    email_confirm: true,
  });
  if (error) throw new Error(`Supabase error: ${error.message}`);

  // Create in Prisma
  const user = await prisma.user.create({
    data: {
      email: SUPERADMIN_EMAIL,
      supabaseId: data.user.id,
      role: "superadmin",
      fullName: "Ezequiel Otero",
      organizationId: org.id,
    },
  });

  console.log(`  → Created: ${user.email} (role: ${user.role}, org: ${org.name})\n`);
}

async function main() {
  console.log("=".repeat(50));
  console.log("  MEDTRUM DATABASE RESET & SEED");
  console.log("=".repeat(50) + "\n");

  await deleteAllSupabaseUsers();
  await truncateTransactionalTables();
  await seedSuperadmin();

  console.log("=".repeat(50));
  console.log("  DONE!");
  console.log(`  Login: ${SUPERADMIN_EMAIL} / ${SUPERADMIN_PASSWORD}`);
  console.log("=".repeat(50));
}

main()
  .catch((e) => { console.error("Fatal error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
