import { NextRequest, NextResponse } from "next/server";
import { getConfig, verifyAdminPassword } from "@/lib/store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get("password");

    if (!password || !verifyAdminPassword(password)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const config = getConfig();

    return NextResponse.json({
      success: true,
      protectedUrl: config.protectedUrl,
      accessLifetime: config.accessLifetime,
      accessWindow: config.accessWindow,
      maxDevices: config.maxDevices,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
