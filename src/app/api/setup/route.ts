import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";

// Función para hashear contraseña
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Función para encriptar URL
function encryptUrl(url: string): string {
  const key = process.env.ENCRYPTION_KEY || "lisea-security-key-2024";
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    crypto.createHash("sha256").update(key).digest(),
    Buffer.alloc(16, 0)
  );
  let encrypted = cipher.update(url, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password, protectedUrl, accessLifetime, accessWindow } = body;

    // Verificar si ya existe configuración
    const existingConfig = await db.securityConfig.findFirst();

    if (existingConfig) {
      // Actualizar configuración existente
      const updated = await db.securityConfig.update({
        where: { id: existingConfig.id },
        data: {
          passwordHash: hashPassword(password),
          protectedUrl: encryptUrl(protectedUrl),
          accessLifetime: accessLifetime || 20,
          accessWindow: accessWindow || 5,
          isActive: true,
        },
      });
      return NextResponse.json({ success: true, configId: updated.id });
    }

    // Crear nueva configuración
    const config = await db.securityConfig.create({
      data: {
        passwordHash: hashPassword(password),
        protectedUrl: encryptUrl(protectedUrl),
        accessLifetime: accessLifetime || 20,
        accessWindow: accessWindow || 5,
      },
    });

    return NextResponse.json({ success: true, configId: config.id });
  } catch {
    return NextResponse.json(
      { error: "Error al configurar el sistema" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const config = await db.securityConfig.findFirst();
    if (!config) {
      return NextResponse.json({ configured: false });
    }
    return NextResponse.json({
      configured: true,
      accessWindow: config.accessWindow,
      accessLifetime: config.accessLifetime,
    });
  } catch {
    return NextResponse.json(
      { error: "Error al verificar configuración" },
      { status: 500 }
    );
  }
}
