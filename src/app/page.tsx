"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Shield, ArrowDownToLine, CheckCircle, Smartphone, AlertTriangle, 
  Monitor, XCircle, Settings, Trash2, Users, User, Search, Share,
  ChevronRight, Home, Sparkles
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// ============================================================================
// CONSTANTES Y TIPOS
// ============================================================================

type FlowState = "loading" | "desktop-blocked" | "install-required" | "register" | "access" | "admin" | "error";

const ADMIN_PASSWORD = "LiseaAdmin2026!";

const STORAGE_KEYS = {
  TOKEN: "lisea_token",
  FINGERPRINT: "lisea_fingerprint",
  USERNAME: "lisea_username",
  WELCOME_SHOWN: "lisea_welcome_shown",
};

// Instrucciones por plataforma
const INSTALL_INSTRUCTIONS = {
  ios: {
    title: "Instalación en iPhone/iPad",
    steps: [
      { icon: "share", text: "Toque el botón 'Compartir' en la barra inferior" },
      { icon: "home", text: "Seleccione 'Agregar a pantalla de inicio'" },
      { icon: "add", text: "Toque 'Agregar' en la esquina superior derecha" },
      { icon: "launch", text: "Abra la app desde su pantalla de inicio" },
    ],
    tip: "La app aparecerá como un icono en su pantalla de inicio, igual que cualquier otra aplicación."
  },
  android: {
    title: "Instalación en Android",
    steps: [
      { icon: "menu", text: "Toque el menú ⋮ en la esquina superior derecha" },
      { icon: "download", text: "Seleccione 'Instalar aplicación'" },
      { icon: "confirm", text: "Confirme la instalación" },
      { icon: "launch", text: "Abra la app desde su pantalla de inicio" },
    ],
    tip: "También puede tocar 'Instalar' si aparece un banner en la parte superior."
  },
  default: {
    title: "Instrucciones de Instalación",
    steps: [
      { icon: "menu", text: "Busque la opción 'Instalar' en el navegador" },
      { icon: "download", text: "Seleccione 'Instalar aplicación'" },
      { icon: "confirm", text: "Confirme la instalación" },
      { icon: "launch", text: "Abra la app desde su pantalla de inicio" },
    ],
    tip: "La instalación le dará una mejor experiencia de seguridad."
  }
};

interface DeviceInfo {
  id: string;
  userName: string;
  tokenPreview: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  isValidated: boolean;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function HomePage() {
  // Estados de UI
  const [mounted, setMounted] = useState(false);
  const [flowState, setFlowState] = useState<FlowState>("loading");
  const [loading, setLoading] = useState(false);
  const [accessUrl, setAccessUrl] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [fingerprint, setFingerprint] = useState("");
  const [platform, setPlatform] = useState<"ios" | "android" | "default">("default");
  const [showWelcome, setShowWelcome] = useState(false);
  
  // Estados de usuario
  const [userName, setUserName] = useState("");
  const [savedToken, setSavedToken] = useState<string | null>(null);
  
  // Estados de admin
  const [adminTaps, setAdminTaps] = useState(0);
  const [adminPassword, setAdminPassword] = useState("");
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [deviceStats, setDeviceStats] = useState({ total: 0, validated: 0, totalUsers: 0 });
  const [maxDevices, setMaxDevices] = useState(3);
  const [searchQuery, setSearchQuery] = useState("");
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // FUNCIONES DE UTILIDAD
  // ============================================================================

  const detectPlatform = useCallback(() => {
    if (typeof window === "undefined") return "default";
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("iphone") || ua.includes("ipad") || (ua.includes("macintosh") && "ontouchend" in document)) {
      return "ios";
    }
    if (ua.includes("android")) {
      return "android";
    }
    return "default";
  }, []);

  const checkMobile = useCallback(() => {
    if (typeof window === "undefined") return true;
    const ua = navigator.userAgent.toLowerCase();
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet|kindle|silk|playbook|bb10|meego/i;
    const isMobileDevice = mobileRegex.test(ua);
    const isIpad = ua.includes('macintosh') && 'ontouchend' in document;
    return isMobileDevice || isIpad;
  }, []);

  const generateFingerprint = useCallback(() => {
    if (typeof window === "undefined") return "";
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width.toString(),
      screen.height.toString(),
      screen.colorDepth.toString(),
      new Date().getTimezoneOffset().toString(),
      navigator.hardwareConcurrency?.toString() || "unknown",
      !!window.localStorage ? "ls" : "",
      !!window.sessionStorage ? "ss" : "",
      !!window.indexedDB ? "idb" : "",
    ].join("|");
    
    let hash = 0;
    for (let i = 0; i < components.length; i++) {
      const char = components.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(16, "0") + Date.now().toString(16).slice(-16);
  }, []);

  // ============================================================================
  // EFECTOS DE INICIALIZACIÓN
  // ============================================================================

  useEffect(() => {
    setMounted(true);
    
    const plt = detectPlatform();
    setPlatform(plt);
    
    const mobile = checkMobile();
    setIsMobile(mobile);
    
    if (!mobile) {
      setFlowState("desktop-blocked");
      return;
    }
    
    let fp = localStorage.getItem(STORAGE_KEYS.FINGERPRINT);
    if (!fp) {
      fp = generateFingerprint();
      localStorage.setItem(STORAGE_KEYS.FINGERPRINT, fp);
    }
    setFingerprint(fp);
    
    const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const storedUserName = localStorage.getItem(STORAGE_KEYS.USERNAME);
    const welcomeShown = localStorage.getItem(STORAGE_KEYS.WELCOME_SHOWN);
    
    if (storedToken && storedUserName) {
      setSavedToken(storedToken);
      setUserName(storedUserName);
    }
    
    const checkStandalone = () => {
      const standalone = window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes("android-app://") ||
        (plt === "ios" && !!(window.navigator as unknown as { standalone?: boolean }).standalone);
      
      setIsStandalone(standalone);
      return standalone;
    };

    const standalone = checkStandalone();
    
    if (plt === "ios" && !welcomeShown) {
      setShowWelcome(true);
    }
    
    if (standalone) {
      verifyDevice(fp, storedToken);
    } else {
      setFlowState("install-required");
    }

    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handler = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
      if (e.matches) {
        verifyDevice(fp, storedToken);
      }
    };
    
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [checkMobile, generateFingerprint, detectPlatform]);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  // ============================================================================
  // FUNCIONES DE VERIFICACIÓN
  // ============================================================================

  const verifyDevice = async (fp: string, token: string | null) => {
    setLoading(true);
    
    try {
      if (token) {
        const response = await fetch(`/api/verify?token=${token}&fingerprint=${fp}`);
        const data = await response.json();
        
        if (data.valid && data.registered) {
          setUserName(data.userName);
          localStorage.setItem(STORAGE_KEYS.USERNAME, data.userName);
          setSavedToken(token);
          handleAccess(token);
          return;
        }
      }
      
      const response = await fetch(`/api/verify?fingerprint=${fp}`);
      const data = await response.json();
      
      if (data.valid && data.registered) {
        setUserName(data.userName);
        setSavedToken(data.token);
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
        localStorage.setItem(STORAGE_KEYS.USERNAME, data.userName);
        handleAccess(data.token);
      } else {
        setFlowState("register");
      }
    } catch {
      setFlowState("register");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // FUNCIONES DE ACCIÓN
  // ============================================================================

  const handleShieldTap = useCallback(() => {
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    
    const newTaps = adminTaps + 1;
    setAdminTaps(newTaps);
    
    if (newTaps >= 5) {
      setFlowState("admin");
      setAdminTaps(0);
      toast({ title: "Modo Administrador", description: "Ingrese la contraseña" });
    } else {
      tapTimeoutRef.current = setTimeout(() => setAdminTaps(0), 2000);
    }
  }, [adminTaps]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      toast({ title: "Instalación Manual", description: "Use el menú del navegador" });
      return;
    }

    const promptEvent = deferredPrompt as unknown as { prompt: () => void; userChoice: Promise<{ outcome: string }> };
    promptEvent.prompt();
    
    try {
      const result = await promptEvent.userChoice;
      if (result.outcome === "accepted") {
        setIsInstallable(false);
        setDeferredPrompt(null);
        toast({ title: "Instalación Exitosa", description: "Abra la app desde su pantalla de inicio" });
      }
    } catch {}
  };

  const handleDismissWelcome = () => {
    localStorage.setItem(STORAGE_KEYS.WELCOME_SHOWN, "true");
    setShowWelcome(false);
  };

  const handleRegister = useCallback(async () => {
    if (!fingerprint) return;
    if (!userName.trim() || userName.trim().length < 2) {
      toast({ title: "Nombre Requerido", description: "Ingrese su nombre", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fingerprint, userAgent: navigator.userAgent, userName: userName.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
        localStorage.setItem(STORAGE_KEYS.USERNAME, userName.trim());
        setSavedToken(data.token);
        handleAccess(data.token);
        toast({ title: "Registro Exitoso", description: data.isExisting ? "Bienvenido de nuevo" : "Dispositivo registrado" });
      } else {
        toast({ title: "Error", description: data.error || "No se pudo registrar", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Error de conexión", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [fingerprint, userName]);

  const handleAccess = useCallback(async (accessToken: string) => {
    try {
      const response = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: accessToken, fingerprint }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAccessUrl(data.accessUrl);
        setFlowState("access");
      } else {
        toast({ title: "Acceso Denegado", description: data.error || "Token inválido", variant: "destructive" });
        setFlowState("register");
      }
    } catch {
      toast({ title: "Error", description: "Error al validar", variant: "destructive" });
      setFlowState("register");
    }
  }, [fingerprint]);

  const loadDevices = useCallback(async (search: string = "") => {
    setLoading(true);
    try {
      const url = `/api/admin/devices?password=${encodeURIComponent(adminPassword)}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setDevices(data.devices);
        setDeviceStats(data.stats);
        setMaxDevices(data.maxDevices);
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Error de conexión", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [adminPassword]);

  const handleSearch = useCallback(() => loadDevices(searchQuery), [loadDevices, searchQuery]);

  const handleDeleteDevice = async (deviceId: string, deviceName: string) => {
    if (!confirm(`¿Eliminar el dispositivo de "${deviceName}"?`)) return;
    try {
      const response = await fetch("/api/admin/devices", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword, deviceId }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast({ title: "Eliminado", description: "Dispositivo eliminado" });
        loadDevices(searchQuery);
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Error al eliminar", variant: "destructive" });
    }
  };

  const handleDeleteByUser = async (userToDelete: string) => {
    if (!confirm(`¿Eliminar TODOS los dispositivos de "${userToDelete}"?`)) return;
    try {
      const response = await fetch("/api/admin/devices", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword, deleteByUser: userToDelete }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast({ title: "Eliminado", description: data.message });
        loadDevices(searchQuery);
      }
    } catch {
      toast({ title: "Error", description: "Error al eliminar", variant: "destructive" });
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm("¿Eliminar TODOS los dispositivos?")) return;
    try {
      const response = await fetch("/api/admin/devices", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword, deleteAll: true }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast({ title: "Completado", description: data.message });
        loadDevices(searchQuery);
      }
    } catch {
      toast({ title: "Error", description: "Error al eliminar", variant: "destructive" });
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      loadDevices();
    } else {
      toast({ title: "Error", description: "Contraseña incorrecta", variant: "destructive" });
    }
  };

  // ============================================================================
  // RENDER DE ICONOS
  // ============================================================================

  const renderInstructionIcon = (icon: string) => {
    switch (icon) {
      case "share": return <Share className="w-5 h-5 text-amber-400" />;
      case "home": return <Home className="w-5 h-5 text-amber-400" />;
      case "add": return <ArrowDownToLine className="w-5 h-5 text-amber-400" />;
      case "launch": return <Sparkles className="w-5 h-5 text-amber-400" />;
      case "menu": return <Settings className="w-5 h-5 text-amber-400" />;
      case "download": return <ArrowDownToLine className="w-5 h-5 text-amber-400" />;
      case "confirm": return <CheckCircle className="w-5 h-5 text-amber-400" />;
      default: return <ChevronRight className="w-5 h-5 text-amber-400" />;
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (flowState === "access" && accessUrl) {
    return (
      <div className="fixed inset-0 bg-zinc-950 overflow-hidden" style={{ margin: 0, padding: 0 }}>
        <iframe
          src={accessUrl}
          style={{ width: '100vw', height: '100vh', border: 'none', margin: 0, padding: 0, overflow: 'hidden', display: 'block', position: 'absolute', top: 0, left: 0 }}
          title="Contenido Protegido - Grupo Lisea Seguridad"
          allow="camera; microphone; clipboard-write; notifications; geolocation; fullscreen"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
          allowFullScreen
        />
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-32 h-32 bg-zinc-800 rounded-2xl" />
          <div className="h-8 w-48 bg-zinc-800 rounded" />
        </div>
      </div>
    );
  }

  if (flowState === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-amber-400 text-sm">Verificando dispositivo...</p>
        </div>
      </div>
    );
  }

  const instructions = INSTALL_INSTRUCTIONS[platform];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 flex flex-col">
      <header className="w-full py-8 md:py-10 flex flex-col items-center justify-center shrink-0">
        <div className="relative cursor-pointer" onClick={handleShieldTap}>
          <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full" />
          <img src="/escudo.jpg" alt="Escudo Grupo Lisea" className="w-28 h-28 md:w-32 md:h-32 object-contain rounded-2xl shadow-2xl shadow-amber-500/20 relative z-10" />
        </div>
        <h1 className="mt-6 text-2xl md:text-3xl font-bold text-amber-400 tracking-wider text-center px-4">GRUPO LISEA</h1>
        <p className="text-amber-500/70 text-sm md:text-base tracking-widest mt-2 uppercase">Seguridad Privada Profesional</p>
      </header>

      <main className="flex-1 w-full max-w-lg mx-auto px-4 pb-6 flex items-center justify-center">
        
        {/* Desktop Bloqueado */}
        {flowState === "desktop-blocked" && (
          <Card className="w-full bg-zinc-900/80 border-red-500/40 backdrop-blur-sm shadow-xl">
            <CardContent className="space-y-6 pt-8">
              <div className="text-center py-4">
                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                  <Monitor className="w-12 h-12 text-red-400" />
                </div>
                <XCircle className="relative -top-6 left-1/2 -translate-x-1/2 w-8 h-8 text-red-500 bg-zinc-900 rounded-full" />
                <h2 className="mt-4 text-xl font-bold text-red-400">Dispositivo No Compatible</h2>
                <p className="text-zinc-400 mt-3 text-sm">Solo funciona en <span className="text-amber-400">dispositivos móviles y tablets</span></p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 bg-zinc-800/50 rounded-lg p-3">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm text-zinc-300">iPhone</span>
                </div>
                <div className="flex items-center gap-2 bg-zinc-800/50 rounded-lg p-3">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm text-zinc-300">iPad</span>
                </div>
                <div className="flex items-center gap-2 bg-zinc-800/50 rounded-lg p-3">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm text-zinc-300">Android</span>
                </div>
                <div className="flex items-center gap-2 bg-zinc-800/50 rounded-lg p-3">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm text-zinc-300">Tablets</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bienvenida iOS */}
        {showWelcome && platform === "ios" && flowState === "install-required" && (
          <Card className="w-full bg-zinc-900/80 border-amber-500/30 backdrop-blur-sm shadow-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-amber-400 flex items-center justify-center gap-2 text-xl">
                <Sparkles className="w-6 h-6" />
                ¡Bienvenido a Lisea Security!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="text-center py-2">
                <p className="text-zinc-300 text-sm">Para una <span className="text-amber-400 font-medium">experiencia segura</span>, instale la aplicación en su dispositivo.</p>
              </div>
              <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 rounded-xl p-4 border border-amber-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-amber-300 font-medium text-sm">Beneficios de instalar</p>
                    <p className="text-zinc-500 text-xs">App dedicada en su pantalla</p>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-zinc-400">
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-emerald-400" />Acceso rápido desde pantalla de inicio</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-emerald-400" />Sin barra de URL (más seguridad)</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-emerald-400" />Funciona como app nativa</li>
                </ul>
              </div>
              <Button onClick={handleDismissWelcome} className="w-full h-12 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-900 font-bold shadow-lg shadow-amber-500/40">
                Ver Instrucciones de Instalación
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Instalación Requerida */}
        {flowState === "install-required" && !showWelcome && (
          <Card className="w-full bg-zinc-900/80 border-amber-500/30 backdrop-blur-sm shadow-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-amber-400 flex items-center justify-center gap-2 text-xl">
                <Shield className="w-6 h-6" />
                {instructions.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="text-center py-2">
                <ArrowDownToLine className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
                <p className="text-zinc-300 mt-4 text-base font-medium">Instale la aplicación para continuar</p>
                <p className="text-zinc-500 text-sm mt-1">La seguridad solo funciona desde la app instalada</p>
              </div>

              {platform === "android" && isInstallable && (
                <Button onClick={handleInstall} className="w-full h-14 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-900 font-bold text-lg shadow-lg shadow-amber-500/40 animate-pulse">
                  <ArrowDownToLine className="w-5 h-5 mr-2" />INSTALAR APLICACIÓN
                </Button>
              )}

              <div className="bg-zinc-800/50 rounded-xl p-5 border border-zinc-700/50">
                <ol className="space-y-4">
                  {instructions.steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="bg-amber-500/20 text-amber-400 rounded-full w-8 h-8 flex items-center justify-center shrink-0 font-bold text-sm">{index + 1}</span>
                      <div className="flex items-center gap-2 pt-1">
                        {renderInstructionIcon(step.icon)}
                        <span className="text-sm text-zinc-300">{step.text}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/30">
                <p className="text-emerald-300 text-xs flex items-start gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{instructions.tip}</span>
                </p>
              </div>

              <Button onClick={() => verifyDevice(fingerprint, savedToken)} variant="outline" className="w-full border-zinc-600 text-zinc-400 hover:text-zinc-300">
                Ya tengo la app instalada
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Registro */}
        {flowState === "register" && (
          <Card className="w-full bg-zinc-900/80 border-amber-500/30 backdrop-blur-sm shadow-xl">
            <CardContent className="space-y-6 pt-8">
              <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/30">
                <p className="text-emerald-300 text-center flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />Aplicación Segura Instalada
                </p>
              </div>

              {platform === "ios" && (
                <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                  <p className="text-amber-300 text-xs text-center flex items-center justify-center gap-2">
                    <Smartphone className="w-4 h-4" />Dispositivo iOS verificado
                  </p>
                </div>
              )}

              <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                <div className="flex items-start gap-3">
                  <User className="w-6 h-6 text-amber-400 mt-0.5 shrink-0" />
                  <div className="text-sm text-zinc-300">
                    <p className="font-medium text-amber-300 text-base">Identifique su Dispositivo</p>
                    <p className="text-zinc-400 mt-1">Ingrese su nombre. Máximo {maxDevices} dispositivos por usuario.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="userName" className="text-zinc-300">Nombre del usuario</Label>
                <Input id="userName" type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Ej: Juan Pérez #123" className="bg-zinc-800/50 border-zinc-700 text-white h-14 text-lg" onKeyDown={(e) => e.key === "Enter" && handleRegister()} autoComplete="name" autoCapitalize="words" />
                <p className="text-xs text-zinc-500">Puede usar letras, números y caracteres especiales</p>
              </div>

              <Button onClick={handleRegister} disabled={loading || !userName.trim() || userName.trim().length < 2} className="w-full h-16 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-900 font-bold text-xl shadow-lg shadow-amber-500/40">
                {loading ? <div className="w-7 h-7 border-4 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" /> : <><Shield className="w-6 h-6 mr-3" />ACCEDER</>}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                <Shield className="w-3 h-3" /><span>Cifrado Profesional</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin */}
        {flowState === "admin" && (
          <Card className="w-full bg-zinc-900/80 border-amber-500/30 backdrop-blur-sm shadow-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-amber-400 flex items-center justify-center gap-2 text-xl">
                <Settings className="w-6 h-6" />Panel de Administración
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {devices.length === 0 && !loading && (
                <div className="space-y-4">
                  <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                    <p className="text-zinc-300 text-sm text-center">Ingrese la contraseña de administrador</p>
                  </div>
                  <Input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Contraseña" className="bg-zinc-800/50 border-zinc-700 text-white h-12" onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()} />
                  <div className="flex gap-3">
                    <Button onClick={() => setFlowState(isStandalone ? "register" : "install-required")} variant="outline" className="flex-1">Cancelar</Button>
                    <Button onClick={handleAdminLogin} className="flex-1 bg-amber-600 hover:bg-amber-500 text-zinc-900">Entrar</Button>
                  </div>
                </div>
              )}

              {(devices.length > 0 || loading) && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-zinc-800/50 rounded-lg p-3 text-center border border-zinc-700/50">
                      <Users className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-white">{deviceStats.totalUsers}</p>
                      <p className="text-xs text-zinc-400">Usuarios</p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-3 text-center border border-zinc-700/50">
                      <Shield className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-white">{maxDevices}</p>
                      <p className="text-xs text-zinc-400">Por Usuario</p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-3 text-center border border-zinc-700/50">
                      <Smartphone className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-white">{deviceStats.total}</p>
                      <p className="text-xs text-zinc-400">Dispositivos</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar..." className="bg-zinc-800/50 border-zinc-700 text-white h-10" onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
                    <Button onClick={handleSearch} className="bg-amber-600 hover:bg-amber-500 text-zinc-900"><Search className="w-4 h-4" /></Button>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-zinc-400 font-medium">Dispositivos:</p>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {loading ? <div className="text-center py-4 text-zinc-400">Cargando...</div> : devices.length === 0 ? <div className="text-center py-4 text-zinc-500">No hay dispositivos</div> : devices.map((device, index) => (
                        <div key={device.id} className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="bg-amber-500/20 text-amber-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">{index + 1}</span>
                                <span className="text-sm text-white font-medium">{device.userName}</span>
                              </div>
                              <p className="text-xs text-zinc-500 mt-1 ml-8">{new Date(device.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button onClick={() => handleDeleteByUser(device.userName)} variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"><Users className="w-4 h-4" /></Button>
                              <Button onClick={() => handleDeleteDevice(device.id, device.userName)} variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button onClick={handleDeleteAll} variant="outline" className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"><Trash2 className="w-4 h-4 mr-2" />Eliminar Todos</Button>
                    <Button onClick={() => { setDevices([]); setFlowState(isStandalone ? "register" : "install-required"); }} className="w-full bg-zinc-700 hover:bg-zinc-600 text-white">Salir del Panel</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {flowState === "error" && (
          <Card className="w-full bg-zinc-900/80 border-red-500/30 backdrop-blur-sm">
            <CardContent className="py-8 text-center">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-400">Error de seguridad</p>
              <Button onClick={() => setFlowState(isStandalone ? "register" : "install-required")} className="mt-4" variant="outline">Reintentar</Button>
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="shrink-0 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent pt-4 pb-4 px-4">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-zinc-600 text-xs">© 2026 Grupo Lisea - Seguridad Privada Profesional</p>
        </div>
      </footer>
    </div>
  );
}