import { NextRequest, NextResponse } from "next/server";
import {
  addDevice,
  findExistingDevice,
  getConfig,
} from "@/lib/store";

export const dynamic = 'force-dynamic';

/**
 * API para registrar o obtener token de dispositivo
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fingerprint, userAgent, userName } = body;

    // Validaciones básicas
    if (!fingerprint) {
      return NextResponse.json(
        { error: "Fingerprint requerido", reason: "missing_fingerprint" },
        { status: 400 }
      );
    }

    if (!userName || userName.trim().length < 2) {
      return NextResponse.json(
        { error: "Nombre de usuario requerido (mínimo 2 caracteres)", reason: "missing_username" },
        { status: 400 }
      );
    }

    const config = getConfig();
    const trimmedUserName = userName.trim();

    // Verificar si el dispositivo ya está registrado
    const existingDevice = findExistingDevice(fingerprint);
    
    if (existingDevice) {
      if (existingDevice.userName !== trimmedUserName) {
        return NextResponse.json(
          { 
            error: "Este dispositivo ya está registrado con otro usuario",
            reason: "device_registered_other_user",
            registeredAs: existingDevice.userName,
          },
          { status: 403 }
        );
      }
      
      return NextResponse.json({
        success: true,
        token: existingDevice.token,
        message: "Dispositivo ya registrado",
        isExisting: true,
        userName: existingDevice.userName,
      });
    }

    // Obtener IP del cliente
    const ipAddress = request.headers.get("x-forwarded-for") || 
                      request.headers.get("x-real-ip") || 
                      "Unknown";

    // Registrar nuevo dispositivo
    const result = addDevice({
      userName: trimmedUserName,
      fingerprint,
      userAgent: userAgent || "Unknown",
      ipAddress,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || "No se pudo registrar el dispositivo",
          reason: "max_devices_reached",
          maxDevices: config.maxDevicesPerUser,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      token: result.device?.token,
      message: "Dispositivo registrado correctamente",
      isExisting: false,
      userName: result.device?.userName,
      deviceId: result.device?.id,
    });

  } catch (error) {
    console.error("Token API error:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud", reason: "server_error" },
      { status: 500 }
    );
  }
}

/**
 * GET - Verificar estado del dispositivo
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fingerprint = searchParams.get("fingerprint");

    if (fingerprint) {
      const device = findExistingDevice(fingerprint);
      
      if (device) {
        return NextResponse.json({
          valid: true,
          registered: true,
          userName: device.userName,
          token: device.token,
          message: "Dispositivo encontrado",
        });
      }
    }

    return NextResponse.json({
      valid: false,
      registered: false,
      message: "Dispositivo no registrado",
    });

  } catch (error) {
    console.error("Token GET error:", error);
    return NextResponse.json(
      { error: "Error de verificación" },
      { status: 500 }
    );
  }
}