// Crea el primer usuario ADMIN del dashboard. Se corre una sola vez con:
//   npm run seed:admin
// Lee las credenciales de variables de entorno (no hardcodeadas) para no
// dejar una contraseña fija en el repo.
import { db } from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabase";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME || "Admin";

  if (!email || !password) {
    throw new Error(
      "Definí SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD en .env antes de correr este script.",
    );
  }

  const existing = await db.profile.findFirst({ where: { email } });
  if (existing) {
    console.log(`Ya existe un perfil para ${email}, no se creó nada.`);
    return;
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    throw new Error(`No se pudo crear el usuario en Supabase Auth: ${error?.message}`);
  }

  await db.profile.create({
    data: { id: data.user.id, email, name, role: "ADMIN" },
  });

  console.log(`Admin creado: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
