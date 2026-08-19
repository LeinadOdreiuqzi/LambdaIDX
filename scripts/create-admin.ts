import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import readline from "readline";
import crypto from "crypto";

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

function promptInput(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log("\n=======================================================");
  console.log("[AUTH SYSTEM] LambdaIDX - Creador de Usuario Administrador");
  console.log("=======================================================\n");

  const rawConnectionString = process.env.DATABASE_URL;
  if (!rawConnectionString) {
    console.error("[ERROR] La variable de entorno DATABASE_URL no esta configurada.\n");
    console.log("Uso local: pnpm run admin:create");
    console.log('Uso produccion: $env:DATABASE_URL="postgresql://..." ; pnpm run admin:create\n');
    process.exit(1);
  }

  // Normalizar sslmode para evitar warnings de conexion SSL
  const connectionString = rawConnectionString
    .replace("sslmode=require", "sslmode=verify-full")
    .replace("sslmode=prefer", "sslmode=verify-full")
    .replace("sslmode=verify-ca", "sslmode=verify-full");

  // Configurar Prisma con el adapter de PostgreSQL (Prisma 7)
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  // Mostrar confirmacion segura del host
  const urlParts = rawConnectionString.split("@");
  const hostPart = urlParts.length > 1 ? urlParts[1].split("?")[0] : "base de datos";
  console.log(`[INFO] Conectando a host: ${hostPart}\n`);

  // Extraer argumentos de CLI si se suministraron (ej: --email admin@lambda.com --password 123)
  const args = process.argv.slice(2);
  let email = "";
  let password = "";
  let fullName = "Super Administrador";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--email" && args[i + 1]) email = args[i + 1];
    if (args[i] === "--password" && args[i + 1]) password = args[i + 1];
    if (args[i] === "--name" && args[i + 1]) fullName = args[i + 1];
  }

  if (!email) {
    email = await promptInput("Ingresa el correo electronico del Administrador: ");
  }

  if (!email || !email.includes("@")) {
    console.error("[ERROR] Correo electronico no valido.");
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  }

  if (!password) {
    password = await promptInput("Ingresa la contrasena (minimo 6 caracteres): ");
  }

  if (!password || password.length < 6) {
    console.error("[ERROR] La contrasena debe tener al menos 6 caracteres.");
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  }

  console.log("\n[PROCESS] Generando hash criptografico y persistiendo usuario...");

  const passwordHash = hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: {
      passwordHash,
      role: UserRole.SUPERADMIN,
      fullName,
      updatedAt: new Date(),
    },
    create: {
      email: email.toLowerCase(),
      passwordHash,
      role: UserRole.SUPERADMIN,
      fullName,
      username: email.split("@")[0].toLowerCase(),
    },
  });

  console.log("\n[SUCCESS] Administrador creado / actualizado correctamente.");
  console.log("-------------------------------------------------------");
  console.log(`ID Usuario:   ${user.id}`);
  console.log(`Email:        ${user.email}`);
  console.log(`Rol:          ${user.role}`);
  console.log(`Nombre:       ${user.fullName}`);
  console.log("-------------------------------------------------------\n");
  console.log("[READY] Acceso disponible en /login con estas credenciales.\n");

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error("\n[ERROR] Fallo al crear el administrador:", e);
  process.exit(1);
});
