import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const ADMIN_PASSWORD = "LiseaAdmin2026!";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminPassword = searchParams.get("password");
    const searchUser = searchParams.get("search") || "";

    if (!adminPassword || hashPassword(adminPassword) !== hashPassword(ADMIN_PASSWORD)) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }

    const config = await db.securityConfig.findFirst();
    const maxDevices = config?.maxDevices || 3;

    // Para SQLite, usamos contains que es case-insensitive por defecto
    const whereClause = searchUser.trim()
      ? { userName: { contains: searchUser.trim() } }
      : {};

    const devices = await db.accessToken.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    const total = await db.accessToken.count();
    const validated = await db.accessToken.count({ where: { isValidated: true } });

    return NextResponse.json({
      success: true,
      maxDevices,
      stats: { total, validated, available: Math.max(0, 100 - validated) },
      devices: devices.map((d) => ({
        id: d.id,
        userName: d.userName,
        tokenPreview: d.token.substring(0, 8) + "...",
        ipAddress: d.ipAddress || "N/A",
        userAgent: d.userAgent || "N/A",
        createdAt: d.createdAt.toISOString(),
        isValidated: d.isValidated,
      })),
    });
  } catch (error) {
    console.error("Admin error:", error);
    return NextResponse.json({ error: "Error al obtener dispositivos" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, deviceId, deleteAll, deleteByUser } = body;

    if (!password || hashPassword(password) !== hashPassword(ADMIN_PASSWORD)) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }

    if (deleteAll) {
      const result = await db.accessToken.deleteMany({});
      await db.accessLog.create({
        data: { action: "admin_reset_all", details: `${result.count} eliminados` },
      });
      return NextResponse.json({ success: true, message: `${result.count} eliminados` });
    }

    if (deleteByUser) {
      const result = await db.accessToken.deleteMany({
        where: { userName: deleteByUser },
      });
      await db.accessLog.create({
        data: { action: "admin_reset_user", userName: deleteByUser, details: `${result.count} eliminados` },
      });
      return NextResponse.json({ success: true, message: `${result.count} de "${deleteByUser}" eliminados` });
    }

    if (deviceId) {
      await db.accessToken.delete({ where: { id: deviceId } });
      await db.accessLog.create({
        data: { action: "device_removed", details: deviceId },
      });
      return NextResponse.json({ success: true, message: "Dispositivo eliminado" });
    }

    return NextResponse.json({ error: "Especifique deviceId, deleteByUser o deleteAll" }, { status: 400 });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
