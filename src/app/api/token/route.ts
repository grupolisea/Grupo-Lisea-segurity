import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function encryptUrl(url: string): string {
  const key = crypto.createHash("sha256").update("lisea-key-2026").digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(url, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fingerprint, isStandalone, userAgent, userName } = body;

    const name = userName ? String(userName).trim() : "";
    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Ingrese su nombre (mínimo 2 caracteres)" },
        { status: 400 }
      );
    }

    if (!isStandalone) {
      return NextResponse.json(
        { error: "Instale la aplicación primero" },
        { status: 403 }
      );
    }

    if (!fingerprint || fingerprint.length < 16) {
      return NextResponse.json(
        { error: "Error de validación del dispositivo" },
        { status: 400 }
      );
    }

    const ua = userAgent || "unknown";
    const ip = request.headers.get("x-forwarded-for") || "unknown";

    let config = await db.securityConfig.findFirst();
    const maxDevices = config?.maxDevices || 3;

    const sameNameCount = await db.accessToken.count({
      where: { userName: name, isValidated: true }
    });

    if (sameNameCount >= maxDevices) {
      return NextResponse.json(
        { error: `"${name}" ya tiene ${maxDevices} dispositivos` },
        { status: 403 }
      );
    }

    const token = generateToken();

    if (!config) {
      config = await db.securityConfig.create({
        data: {
          passwordHash: "disabled",
          protectedUrl: encryptUrl("https://guardian-qr-suite.emergent.host"),
          accessLifetime: 999999,
          accessWindow: 999999,
          maxDevices: maxDevices,
        },
      });
    }

    await db.accessToken.create({
      data: {
        token,
        userName: name,
        ipAddress: ip,
        userAgent: ua,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isValidated: true,
      },
    });

    await db.accessLog.create({
      data: {
        action: "token_generated",
        userName: name,
        ipAddress: ip,
        userAgent: ua,
        details: `Token para: ${name}`,
      },
    });

    return NextResponse.json({ success: true, token });
  } catch (error) {
    console.error("Token error:", error);
    return NextResponse.json({ error: "Error del sistema" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const config = await db.securityConfig.findFirst();
    return NextResponse.json({
      configured: !!config,
      maxDevices: config?.maxDevices || 3,
    });
  } catch {
    return NextResponse.json({ configured: false, maxDevices: 3 });
  }
}
