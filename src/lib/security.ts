import crypto from "crypto";

// Clave de cifrado (en producción usar variable de entorno)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "lisea-security-2024-ultra-secure-key-pro";
const HMAC_KEY = process.env.HMAC_KEY || "lisea-hmac-signature-key-2024-secure";

// Cifrar datos con AES-256-GCM (más seguro que CBC)
export function encryptData(data: string): string {
  const key = crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag();
  
  // Formato: iv:authTag:encrypted
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

// Descifrar datos con AES-256-GCM
export function decryptData(encryptedData: string): string {
  try {
    const key = crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();
    const [ivHex, authTagHex, encrypted] = encryptedData.split(":");
    
    if (!ivHex || !authTagHex || !encrypted) return "";
    
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch {
    return "";
  }
}

// Crear firma HMAC para tokens
export function signToken(data: string): string {
  return crypto.createHmac("sha256", HMAC_KEY).update(data).digest("hex");
}

// Verificar firma HMAC
export function verifyToken(data: string, signature: string): boolean {
  const expectedSignature = signToken(data);
  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expectedSignature, "hex")
  );
}

// Generar token de sesión seguro
export function generateSecureToken(fingerprint: string): string {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(32).toString("hex");
  const payload = `${fingerprint}:${timestamp}:${randomBytes}`;
  const signature = signToken(payload);
  
  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

// Verificar token de sesión
export function verifySecureToken(token: string, fingerprint: string): { valid: boolean; payload?: string } {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(":");
    
    if (parts.length < 5) return { valid: false };
    
    const tokenFingerprint = parts[0];
    const signature = parts.slice(4).join(":");
    const payload = parts.slice(0, 4).join(":");
    
    // Verificar firma
    if (!verifyToken(payload, signature)) {
      return { valid: false };
    }
    
    // Verificar fingerprint
    if (tokenFingerprint !== fingerprint) {
      return { valid: false };
    }
    
    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}

// Hash para fingerprint del dispositivo
export function hashFingerprint(components: string): string {
  return crypto.createHash("sha256").update(components).digest("hex").substring(0, 32);
}
