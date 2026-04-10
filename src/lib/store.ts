import crypto from "crypto";

// Interface para dispositivo
interface Device {
  id: string;
  userName: string;
  token: string;
  fingerprint: string;
  userAgent: string;
  ipAddress: string;
  createdAt: Date;
  lastAccessAt: Date;
  isValidated: boolean;
}

// Interface para configuración
interface Config {
  passwordHash: string;
  protectedUrl: string;
  accessLifetime: number;
  accessWindow: number;
  maxDevicesPerUser: number;
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
  maxDevicesPerUser: 3,
  isActive: true,
};
globalThis.liseaConfig = config;

const ADMIN_PASSWORD = "LiseaAdmin2026!";

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

export function getDeviceByToken(token: string): Device | undefined {
  return devices.find(d => d.token === token);
}

export function getDeviceByFingerprint(fingerprint: string): Device | undefined {
  return devices.find(d => d.fingerprint === fingerprint);
}

export function getDeviceByTokenAndFingerprint(token: string, fingerprint: string): Device | undefined {
  return devices.find(d => d.token === token && d.fingerprint === fingerprint);
}

export function countDevicesByUser(userName: string): number {
  return devices.filter(d => d.userName === userName).length;
}

export function findExistingDevice(fingerprint: string): Device | undefined {
  return devices.find(d => d.fingerprint === fingerprint);
}

export function addDevice(
  deviceData: {
    userName: string;
    fingerprint: string;
    userAgent: string;
    ipAddress?: string;
  }
): { success: boolean; device?: Device; error?: string } {
  const { userName, fingerprint, userAgent, ipAddress } = deviceData;
  
  const existingDevice = findExistingDevice(fingerprint);
  if (existingDevice) {
    return { success: true, device: existingDevice };
  }
  
  const currentCount = countDevicesByUser(userName);
  if (currentCount >= config.maxDevicesPerUser) {
    return {
      success: false,
      error: `Límite alcanzado: Ya tiene ${config.maxDevicesPerUser} dispositivos registrados`,
    };
  }
  
  const newDevice: Device = {
    id: crypto.randomBytes(8).toString("hex"),
    userName: userName.trim(),
    token: generateToken(),
    fingerprint,
    userAgent: userAgent || "Unknown",
    ipAddress: ipAddress || "Unknown",
    createdAt: new Date(),
    lastAccessAt: new Date(),
    isValidated: true,
  };
  
  devices.push(newDevice);
  return { success: true, device: newDevice };
}

export function updateLastAccess(deviceId: string): void {
  const device = devices.find(d => d.id === deviceId);
  if (device) {
    device.lastAccessAt = new Date();
  }
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
  const uniqueUsers = new Set(devices.map(d => d.userName));
  return {
    total: devices.length,
    validated: devices.filter(d => d.isValidated).length,
    totalUsers: uniqueUsers.size,
    maxDevicesPerUser: config.maxDevicesPerUser,
  };
}

export function getUserStats(userName: string) {
  const userDevices = devices.filter(d => d.userName === userName);
  return {
    userName,
    deviceCount: userDevices.length,
    maxDevices: config.maxDevicesPerUser,
    available: config.maxDevicesPerUser - userDevices.length,
    devices: userDevices.map(d => ({
      id: d.id,
      createdAt: d.createdAt,
      lastAccessAt: d.lastAccessAt,
      userAgent: d.userAgent,
    })),
  };
}

export { ADMIN_PASSWORD, devices, config };
export type { Device, Config };