// Detección de dispositivo móvil
export function isMobileDevice(userAgent: string): boolean {
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet|kindle|silk|playbook|bb10|meego/i;
  return mobileRegex.test(userAgent.toLowerCase());
}

// Detección más estricta - excluye tablets grandes que parecen desktop
export function isStrictMobileDevice(userAgent: string, screenWidth?: number): boolean {
  const ua = userAgent.toLowerCase();
  
  // Dispositivos móviles permitidos
  const mobileDevices = /android|webos|iphone|ipod|blackberry|iemobile|opera mini|mobile|kindle|silk|playbook|bb10|meego/i;
  
  // iPads modernos se reportan como Mac
  const isIpad = ua.includes('macintosh') && 'ontouchend' in (globalThis as unknown as { ontouchend?: boolean });
  
  // Tablets Android
  const isAndroidTablet = ua.includes('android') && !ua.includes('mobile');
  
  // Si es iPad o tablet Android, permitir (son móviles)
  if (isIpad || isAndroidTablet) return true;
  
  // Si detecta patrones móviles
  if (mobileDevices.test(ua)) return true;
  
  return false;
}

// Mensaje de dispositivo no soportado
export function getUnsupportedDeviceMessage(): { title: string; message: string; allowed: string[] } {
  return {
    title: "Dispositivo No Compatible",
    message: "Esta aplicación de seguridad solo funciona en dispositivos móviles y tablets. Por favor acceda desde su smartphone o tablet.",
    allowed: [
      "iPhone",
      "iPad", 
      "Android (celulares y tablets)",
      "Otros dispositivos móviles"
    ]
  };
}
