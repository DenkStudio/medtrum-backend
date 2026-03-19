import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const email = "superadmin@medtrum.com";
  const password = "1234567";

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const prisma = new PrismaClient();

  try {
    // 1. Create user in Supabase
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    console.log(`Supabase user created: ${data.user.id}`);

    // 2. Create user in Prisma DB
    const user = await prisma.user.create({
      data: {
        email,
        supabaseId: data.user.id,
        role: "superadmin",
        fullName: "Super Admin",
      },
    });

    console.log(`DB user created: ${user.id}, role: ${user.role}`);
    console.log(`\nLogin with:\n  email: ${email}\n  password: ${password}`);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
