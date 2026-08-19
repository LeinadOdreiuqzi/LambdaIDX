import { PrismaClient, UserRole } from "@prisma/client";
import readline from "readline";
import crypto from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

function promptInput(query: string, hideText = false): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    if (hideText) {
      process.stdout.write(query);
      const stdin = process.stdin;
      const onData = (char: Buffer) => {
        const charStr = char.toString("utf-8");
        if (charStr === "\n" || charStr === "\r" || charStr === "\u0004") {
          stdin.removeListener("data", onData);
        }
      };
      stdin.on("data", onData);

      rl.question("", (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    } else {
      rl.question(query, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
}

async function main() {
  console.log("\n=======================================================");
  console.log("🔒 LambdaIDX — Creador de Usuario Administrador");
  console.log("=======================================================\n");

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ ERROR: La variable de entorno DATABASE_URL no está configurada.\n");
    console.log("👉 Uso local: npx tsx scripts/create-admin.ts");
    console.log('👉 Uso con Vercel/Producción: DATABASE_URL="postgresql://..." npx tsx scripts/create-admin.ts\n');
    process.exit(1);
  }

  // Obfuscar URL para mostrar confirmación segura
  const urlParts = dbUrl.split("@");
  const hostPart = urlParts.length > 1 ? urlParts[1] : "base de datos";
  console.log(`📡 Conectando a: ${hostPart}\n`);

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
    email = await promptInput("📧 Ingresa el Correo Electrónico del Admin: ");
  }

  if (!email || !email.includes("@")) {
    console.error("❌ Correo electrónico no válido.");
    process.exit(1);
  }

  if (!password) {
    password = await promptInput("🔑 Ingresa la Contraseña (mínimo 6 caracteres): ");
  }

  if (!password || password.length < 6) {
    console.error("❌ La contraseña debe tener al menos 6 caracteres.");
    process.exit(1);
  }

  console.log("\n⏳ Generando hash criptográfico y registrando usuario...");

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

  console.log("\n✅ ¡ADMINISTRADOR CREADO / ACTUALIZADO CON ÉXITO!");
  console.log("-------------------------------------------------------");
  console.log(`🆔 ID Usuario:   ${user.id}`);
  console.log(`📧 Email:        ${user.email}`);
  console.log(`👑 Rol:          ${user.role}`);
  console.log(`👤 Nombre:       ${user.fullName}`);
  console.log("-------------------------------------------------------\n");
  console.log("🚀 Ya puedes ingresar a /login con estas credenciales.\n");
}

main()
  .catch((e) => {
    console.error("\n❌ Error al crear el administrador:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
