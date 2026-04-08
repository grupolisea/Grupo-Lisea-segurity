import { NextResponse } from "next/server";
import crypto from "crypto";

// Almacenamiento en memoria (se reinicia en cada deploy, pero funciona para uso básico)
// Para producción persistente, se puede migrar a Vercel KV, Upstash, etc.

interface Device {
  id: string;
  userName: string;
  token: string;
  fingerprint: string;
  userAgent: string;
  createdAt: Date;
  isValidated: boolean;
}

interface Config {
  passwordHash: string;
  protectedUrl: string;
  accessLifetime: number;
  accessWindow: number;
  maxDevices: number;
  isActive: boolean;
}

// Store global
declare global {
  // eslint-disable-next-line no-var
  var liseaDevices: Device[] | undefined;
  // eslint-disable-next-line no-var
  var liseaConfig: Config | undefined;
}

const devices = globalThis.liseaDevices || [];
globalThis.liseaDevices = devices;

const config = globalThis.liseaConfig || {
  passwordHash: hashPassword("LiseaAdmin2026!"),
  protectedUrl: "https://guardian-qr-suite.emergent.host",
  accessLifetime: 20,
  accessWindow: 5,
  maxDevices: 3,
  isActive: true,
};
globalThis.liseaConfig = config;

// Contraseña de administrador
const ADMIN_PASSWORD = "LiseaAdmin2026!";

// Funciones de utilidad
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export function getDevices(): Device[] {
  return devices;
}

export function addDevice(device: Omit<Device, "id" | "token" | "createdAt" | "isValidated">): Device {
  const newDevice: Device = {
    ...device,
    id: crypto.randomBytes(8).toString("hex"),
    token: generateToken(),
    createdAt: new Date(),
    isValidated: true,
  };
  devices.push(newDevice);
  return newDevice;
}

export function removeDevice(deviceId: string): boolean {
  const index = devices.findIndex(d => d.id === deviceId);
  if (index > -1) {
    devices.splice(index, 1);
    return true;
  }
  return false;
}

export function removeDevicesByUser(userName: string): number {
  const initialLength = devices.length;
  const remaining = devices.filter(d => d.userName !== userName);
  devices.length = 0;
  devices.push(...remaining);
  return initialLength - remaining.length;
}

export function removeAllDevices(): number {
  const count = devices.length;
  devices.length = 0;
  return count;
}

export function getConfig(): Config {
  return config;
}

export function updateConfig(newConfig: Partial<Config>): Config {
  Object.assign(config, newConfig);
  return config;
}

export function getStats() {
  return {
    total: devices.length,
    validated: devices.filter(d => d.isValidated).length,
    maxDevices: config.maxDevices,
  };
}

export function countDevicesByUser(userName: string): number {
  return devices.filter(d => d.userName === userName).length;
}

export function getDeviceByToken(token: string): Device | undefined {
  return devices.find(d => d.token === token);
}

export { ADMIN_PASSWORD, devices, config };
