import { NextRequest, NextResponse } from "next/server";
import { getDeviceByToken, getConfig, verifyAdminPassword } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, adminPassword } = body;

    if (!token) {
      return NextResponse.json({ error: "Token requerido" }, { status: 400 });
    }

    const device = getDeviceByToken(token);

    if (!device) {
      return NextResponse.json(
        { valid: false, error: "Token inválido o expirado" },
        { status: 401 }
      );
    }

    const config = getConfig();

    return NextResponse.json({
      valid: true,
      userName: device.userName,
      accessUrl: config.protectedUrl,
    });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ error: "Error de verificación" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const adminPassword = searchParams.get("password");

    if (!token) {
      return NextResponse.json({ valid: false, error: "Token requerido" }, { status: 400 });
    }

    const device = getDeviceByToken(token);

    if (!device) {
      return NextResponse.json({ valid: false }, { status: 200 });
    }

    return NextResponse.json({
      valid: true,
      userName: device.userName,
    });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ error: "Error de verificación" }, { status: 500 });
  }
}
