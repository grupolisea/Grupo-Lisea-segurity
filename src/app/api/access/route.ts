import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function decryptUrl(encrypted: string): string {
  try {
    const key = crypto.createHash("sha256").update("lisea-key-2026").digest();
    const [ivHex, encryptedData] = encrypted.split(":");
    if (!ivHex || !encryptedData) return "";
    
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch {
    return "";
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, fingerprint } = body;

    if (!token) {
      return NextResponse.json({ error: "Token requerido" }, { status: 400 });
    }

    // Buscar el token en la base de datos
    const accessToken = await db.accessToken.findFirst({
      where: { token },
    });

    if (!accessToken) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Obtener la URL protegida
    const config = await db.securityConfig.findFirst();
    if (!config) {
      return NextResponse.json({ error: "Sistema no configurado" }, { status: 500 });
    }

    const protectedUrl = decryptUrl(config.protectedUrl);
    if (!protectedUrl) {
      return NextResponse.json({ error: "Error al procesar" }, { status: 500 });
    }

    // Registrar acceso
    await db.accessLog.create({
      data: {
        action: "access_granted",
        userName: accessToken.userName,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        details: `Acceso para: ${accessToken.userName}`,
      },
    });

    return NextResponse.json({ success: true, accessUrl: protectedUrl });
  } catch (error) {
    console.error("Access error:", error);
    return NextResponse.json({ error: "Error del sistema" }, { status: 500 });
  }
}
