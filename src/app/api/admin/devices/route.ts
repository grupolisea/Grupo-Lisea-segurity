import { NextRequest, NextResponse } from "next/server";
import {
  getDevices,
  getStats,
  verifyAdminPassword,
  removeDevice,
  removeDevicesByUser,
  removeAllDevices,
  getConfig,
} from "@/lib/store";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminPassword = searchParams.get("password");
    const searchUser = searchParams.get("search") || "";

    if (!adminPassword || !verifyAdminPassword(adminPassword)) {
      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    const config = getConfig();
    let devices = getDevices();

    // Filtrar por búsqueda
    if (searchUser.trim()) {
      devices = devices.filter((d) =>
        d.userName.toLowerCase().includes(searchUser.trim().toLowerCase())
      );
    }

    const stats = getStats();

    return NextResponse.json({
      success: true,
      maxDevices: config.maxDevicesPerUser,
      stats,
      devices: devices.map((d) => ({
        id: d.id,
        userName: d.userName,
        tokenPreview: d.token.substring(0, 8) + "...",
        userAgent: d.userAgent || "N/A",
        ipAddress: d.ipAddress || "N/A",
        createdAt: d.createdAt.toISOString(),
        isValidated: d.isValidated,
      })),
    });
  } catch (error) {
    console.error("Admin error:", error);
    return NextResponse.json(
      { error: "Error al obtener dispositivos" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, deviceId, deleteAll, deleteByUser } = body;

    if (!password || !verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    if (deleteAll) {
      const count = removeAllDevices();
      return NextResponse.json({
        success: true,
        message: `${count} dispositivos eliminados`,
      });
    }

    if (deleteByUser) {
      const count = removeDevicesByUser(deleteByUser);
      return NextResponse.json({
        success: true,
        message: `${count} dispositivos de "${deleteByUser}" eliminados`,
      });
    }

    if (deviceId) {
      const removed = removeDevice(deviceId);
      if (removed) {
        return NextResponse.json({
          success: true,
          message: "Dispositivo eliminado",
        });
      }
      return NextResponse.json(
        { error: "Dispositivo no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Especifique deviceId, deleteByUser o deleteAll" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}