import { NextRequest, NextResponse } from "next/server";
import {
  addDevice,
  countDevicesByUser,
  getConfig,
  hashPassword,
} from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fingerprint, isStandalone, userAgent, userName } = body;

    if (!userName || userName.trim().length < 2) {
      return NextResponse.json(
        { error: "Nombre de usuario requerido (mínimo 2 caracteres)" },
        { status: 400 }
      );
    }

    if (!fingerprint) {
      return NextResponse.json(
        { error: "Fingerprint requerido" },
        { status: 400 }
      );
    }

    const config = getConfig();
    const currentDevices = countDevicesByUser(userName.trim());

    if (currentDevices >= config.maxDevices) {
      return NextResponse.json(
        {
          error: `Máximo ${config.maxDevices} dispositivos por usuario`,
          reason: "max_devices_reached",
        },
        { status: 403 }
      );
    }

    // Crear nuevo dispositivo
    const device = addDevice({
      userName: userName.trim(),
      fingerprint,
      userAgent: userAgent || "Unknown",
    });

    return NextResponse.json({
      success: true,
      token: device.token,
      message: "Dispositivo registrado correctamente",
    });
  } catch (error) {
    console.error("Token error:", error);
    return NextResponse.json(
      { error: "Error al registrar dispositivo" },
      { status: 500 }
    );
  }
}
