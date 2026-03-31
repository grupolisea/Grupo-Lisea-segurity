import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    // Obtener configuración
    const config = await db.securityConfig.findFirst();

    if (!config || !config.isActive) {
      return NextResponse.json(
        { error: "Sistema no configurado" },
        { status: 403 }
      );
    }

    // Verificar contraseña
    if (config.passwordHash !== hashPassword(password)) {
      await db.accessLog.create({
        data: {
          action: "failed_attempt",
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
          details: "Contraseña incorrecta",
        },
      });

      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    // Crear token de acceso (sin expiración, acceso infinito)
    const token = generateToken();
    const now = new Date();
    // Fecha muy lejana para acceso infinito
    const farFuture = new Date("2099-12-31");

    await db.accessToken.create({
      data: {
        token,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        expiresAt: farFuture,
        accessExpiresAt: farFuture,
      },
    });

    await db.accessLog.create({
      data: {
        tokenId: token,
        action: "created",
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        details: "Token creado con acceso ilimitado",
      },
    });

    return NextResponse.json({
      success: true,
      token,
    });
  } catch {
    return NextResponse.json(
      { error: "Error al verificar acceso" },
      { status: 500 }
    );
  }
}
