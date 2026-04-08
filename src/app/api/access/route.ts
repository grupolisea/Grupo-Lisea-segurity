import { NextRequest, NextResponse } from "next/server";
import { getDeviceByToken, getConfig } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, fingerprint } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Token requerido" },
        { status: 400 }
      );
    }

    const device = getDeviceByToken(token);

    if (!device) {
      return NextResponse.json(
        { error: "Token inválido o expirado" },
        { status: 401 }
      );
    }

    const config = getConfig();

    // Crear URL de acceso con parámetros de sesión
    const accessUrl = `${config.protectedUrl}?session=${token}&user=${encodeURIComponent(device.userName)}&time=${Date.now()}`;

    return NextResponse.json({
      success: true,
      accessUrl,
      userName: device.userName,
    });
  } catch (error) {
    console.error("Access error:", error);
    return NextResponse.json(
      { error: "Error al validar acceso" },
      { status: 500 }
    );
  }
}
