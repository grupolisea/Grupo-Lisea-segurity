import { NextRequest, NextResponse } from "next/server";
import { getConfig, updateConfig, verifyAdminPassword, hashPassword } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, protectedUrl, accessLifetime, accessWindow, maxDevices } = body;

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    const updates: Record<string, unknown> = {};

    if (protectedUrl) {
      updates.protectedUrl = protectedUrl;
    }
    if (accessLifetime) {
      updates.accessLifetime = Number(accessLifetime);
    }
    if (accessWindow) {
      updates.accessWindow = Number(accessWindow);
    }
    if (maxDevices) {
      updates.maxDevices = Number(maxDevices);
    }

    const config = updateConfig(updates);

    return NextResponse.json({
      success: true,
      config: {
        protectedUrl: config.protectedUrl,
        accessLifetime: config.accessLifetime,
        accessWindow: config.accessWindow,
        maxDevices: config.maxDevices,
      },
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Error al configurar el sistema" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const config = getConfig();
    return NextResponse.json({
      configured: true,
      protectedUrl: config.protectedUrl,
      accessWindow: config.accessWindow,
      accessLifetime: config.accessLifetime,
      maxDevices: config.maxDevices,
    });
  } catch {
    return NextResponse.json(
      { error: "Error al verificar configuración" },
      { status: 500 }
    );
  }
}
