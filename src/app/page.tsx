"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowDownToLine, CheckCircle, Smartphone, AlertTriangle, Monitor, XCircle, Settings, Trash2, Users, User, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Estado del flujo
type FlowState = "desktop-blocked" | "install-required" | "register" | "access" | "admin" | "error";

// Contraseña de administrador
const ADMIN_PASSWORD = "LiseaAdmin2026!";

// Instrucciones por defecto
const DEFAULT_INSTRUCTIONS = {
  title: "Instrucciones de Instalación",
  steps: [
    "Busque la opción 'Instalar' en el navegador",
    "Seleccione 'Instalar aplicación'",
    "Confirme la instalación",
    "Abra la app desde su pantalla de inicio"
  ]
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

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [flowState, setFlowState] = useState<FlowState>("install-required");
  const [loading, setLoading] = useState(false);
  const [accessUrl, setAccessUrl] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [fingerprint, setFingerprint] = useState("");
  const [instructions, setInstructions] = useState(DEFAULT_INSTRUCTIONS);
  
  // User state
  const [userName, setUserName] = useState("");
  
  // Admin state
  const [adminTaps, setAdminTaps] = useState(0);
  const [adminPassword, setAdminPassword] = useState("");
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [deviceStats, setDeviceStats] = useState({ total: 0, validated: 0, available: 3 });
  const [maxDevices, setMaxDevices] = useState(3);
  const [searchQuery, setSearchQuery] = useState("");
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detectar si es dispositivo móvil
  const checkMobile = useCallback(() => {
    if (typeof window === "undefined") return true;
    
    const ua = navigator.userAgent.toLowerCase();
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet|kindle|silk|playbook|bb10|meego/i;
    const isMobileDevice = mobileRegex.test(ua);
    const isIpad = ua.includes('macintosh') && 'ontouchend' in document;
    
    return isMobileDevice || isIpad;
  }, []);

  // Generar fingerprint del dispositivo
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

  // Efecto principal
  useEffect(() => {
    setMounted(true);
    
    const mobile = checkMobile();
    setIsMobile(mobile);
    
    if (!mobile) {
      setFlowState("desktop-blocked");
      return;
    }
    
    const fp = generateFingerprint();
    setFingerprint(fp);
    
    const checkStandalone = () => {
      const standalone = window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes("android-app://");
      
      setIsStandalone(standalone);
      
      if (standalone) {
        setFlowState("register");
      }
    };

    checkStandalone();
    
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
      setInstructions({
        title: "Instrucciones para iOS",
        steps: [
          "Toque el botón 'Compartir' en la barra inferior",
          "Seleccione 'Agregar a pantalla de inicio'",
          "Toque 'Agregar' en la esquina superior derecha",
          "Abra la app desde su pantalla de inicio"
        ]
      });
    } else if (userAgent.includes("android")) {
      setInstructions({
        title: "Instrucciones para Android",
        steps: [
          "Toque el menú ⋮ en la esquina superior derecha",
          "Seleccione 'Instalar aplicación'",
          "Confirme la instalación",
          "Abra la app desde su pantalla de inicio"
        ]
      });
    }

    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handler = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
      if (e.matches) {
        setFlowState("register");
      }
    };
    
    mediaQuery.addEventListener("change", handler);
    
    return () => mediaQuery.removeEventListener("change", handler);
  }, [checkMobile, generateFingerprint]);

  // Capturar evento de instalación PWA
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Registrar Service Worker para notificaciones
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registrado:', registration.scope);
        })
        .catch((error) => {
          console.log('SW error:', error);
        });
    }
  }, []);

  // Manejar taps en el escudo
  const handleShieldTap = useCallback(() => {
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }
    
    const newTaps = adminTaps + 1;
    setAdminTaps(newTaps);
    
    if (newTaps >= 5) {
      setFlowState("admin");
      setAdminTaps(0);
      toast({
        title: "Modo Administrador",
        description: "Ingrese la contraseña de administrador",
      });
    } else {
      tapTimeoutRef.current = setTimeout(() => {
        setAdminTaps(0);
      }, 2000);
    }
  }, [adminTaps]);

  // Instalar PWA
  const handleInstall = async () => {
    if (!deferredPrompt) {
      toast({
        title: "Instalación Manual",
        description: "Use el menú del navegador para instalar",
      });
      return;
    }

    const promptEvent = deferredPrompt as unknown as { prompt: () => void; userChoice: Promise<{ outcome: string }> };
    promptEvent.prompt();
    
    try {
      const result = await promptEvent.userChoice;
      if (result.outcome === "accepted") {
        setIsInstallable(false);
        setDeferredPrompt(null);
        toast({
          title: "Instalación Exitosa",
          description: "Abra la aplicación desde su pantalla de inicio",
        });
      }
    } catch (error) {
      console.error("Install error:", error);
    }
  };

  // Registrar dispositivo
  const handleRegister = useCallback(async () => {
    if (!fingerprint) return;
    if (!userName.trim() || userName.trim().length < 2) {
      toast({
        title: "Nombre Requerido",
        description: "Ingrese su nombre para identificar el dispositivo",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          fingerprint, 
          isStandalone: true,
          userAgent: navigator.userAgent,
          userName: userName.trim()
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        handleAccess(data.token);
      } else if (data.reason === "desktop_not_allowed") {
        setFlowState("desktop-blocked");
      } else {
        toast({
          title: "Error",
          description: data.error || "No se pudo generar acceso",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [fingerprint, userName]);

  // Acceder al contenido
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
        toast({
          title: "Acceso Denegado",
          description: data.error || "Token inválido",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Error al validar acceso",
        variant: "destructive",
      });
    }
  }, [fingerprint]);

  // Cargar dispositivos
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
        toast({
          title: "Error",
          description: data.error || "Error al cargar dispositivos",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [adminPassword]);

  // Buscar dispositivos
  const handleSearch = useCallback(() => {
    loadDevices(searchQuery);
  }, [loadDevices, searchQuery]);

  // Eliminar dispositivo
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
        toast({
          title: "Eliminado",
          description: `Dispositivo eliminado`,
        });
        loadDevices(searchQuery);
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Error al eliminar",
        variant: "destructive",
      });
    }
  };

  // Eliminar por usuario
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
        toast({
          title: "Eliminado",
          description: data.message,
        });
        loadDevices(searchQuery);
      }
    } catch {
      toast({
        title: "Error",
        description: "Error al eliminar",
        variant: "destructive",
      });
    }
  };

  // Eliminar todos
  const handleDeleteAll = async () => {
    if (!confirm(`¿Eliminar TODOS los dispositivos?`)) return;
    
    try {
      const response = await fetch("/api/admin/devices", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword, deleteAll: true }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Completado",
          description: data.message,
        });
        loadDevices(searchQuery);
      }
    } catch {
      toast({
        title: "Error",
        description: "Error al eliminar",
        variant: "destructive",
      });
    }
  };

  // Login admin
  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      loadDevices();
    } else {
      toast({
        title: "Error",
        description: "Contraseña incorrecta",
        variant: "destructive",
      });
    }
  };

  // Estado: Acceso - Contenedor de Seguridad Profesional
  if (flowState === "access" && accessUrl) {
    return (
      <div className="fixed inset-0 bg-zinc-950 overflow-hidden" style={{ margin: 0, padding: 0 }}>
        {/* Contenedor de Seguridad Profesional - Grupo Lisea */}
        <iframe
          src={accessUrl}
          style={{
            width: '100vw',
            height: '100vh',
            border: 'none',
            margin: 0,
            padding: 0,
            overflow: 'hidden',
            display: 'block',
            position: 'absolute',
            top: 0,
            left: 0
          }}
          title="Contenido Protegido - Grupo Lisea Seguridad"
          allow="camera; microphone; clipboard-write; notifications; geolocation; fullscreen"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
          allowFullScreen
        />
      </div>
    );
  }

  // Loading skeleton
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 flex flex-col">
      {/* Header */}
      <header className="w-full py-8 md:py-10 flex flex-col items-center justify-center shrink-0">
        <div className="relative cursor-pointer" onClick={handleShieldTap}>
          <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full" />
          <img
            src="/escudo.jpg"
            alt="Escudo Grupo Lisea"
            className="w-28 h-28 md:w-32 md:h-32 object-contain rounded-2xl shadow-2xl shadow-amber-500/20 relative z-10"
          />
        </div>
        <h1 className="mt-6 text-2xl md:text-3xl font-bold text-amber-400 tracking-wider text-center px-4">
          GRUPO LISEA
        </h1>
        <p className="text-amber-500/70 text-sm md:text-base tracking-widest mt-2 uppercase">
          Seguridad Privada Profesional
        </p>
      </header>

      {/* Contenido principal */}
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
                
                <h2 className="mt-4 text-xl font-bold text-red-400">
                  Dispositivo No Compatible
                </h2>
                <p className="text-zinc-400 mt-3 text-sm">
                  Solo funciona en <span className="text-amber-400">dispositivos móviles y tablets</span>
                </p>
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

        {/* Instalación Requerida */}
        {flowState === "install-required" && (
          <Card className="w-full bg-zinc-900/80 border-amber-500/30 backdrop-blur-sm shadow-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-amber-400 flex items-center justify-center gap-2 text-xl">
                <Shield className="w-6 h-6" />
                Instalación Requerida
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="text-center py-4">
                <ArrowDownToLine className="w-20 h-20 text-amber-400 mx-auto animate-bounce" />
                <p className="text-zinc-300 mt-6 text-lg font-medium">
                  Instale la aplicación para continuar
                </p>
                <p className="text-zinc-500 text-sm mt-2">
                  La seguridad solo funciona desde la app instalada
                </p>
              </div>

              {isInstallable ? (
                <Button
                  onClick={handleInstall}
                  className="w-full h-16 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-900 font-bold text-xl shadow-lg shadow-amber-500/40 animate-pulse"
                >
                  <ArrowDownToLine className="w-6 h-6 mr-3" />
                  INSTALAR APLICACIÓN
                </Button>
              ) : (
                <div className="space-y-4">
                  <Button
                    disabled
                    className="w-full h-14 bg-zinc-800 text-amber-400 border-2 border-amber-500/50 border-dashed"
                  >
                    <Smartphone className="w-5 h-5 mr-2" />
                    PREPARANDO...
                  </Button>
                </div>
              )}

              <div className="bg-zinc-800/50 rounded-xl p-5 border border-zinc-700/50">
                <p className="text-amber-300 font-medium mb-4 text-center">
                  {instructions.title}
                </p>
                <ol className="space-y-3 text-sm text-zinc-400">
                  {instructions.steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="bg-amber-500/20 text-amber-400 rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Registro de usuario */}
        {flowState === "register" && (
          <Card className="w-full bg-zinc-900/80 border-amber-500/30 backdrop-blur-sm shadow-xl">
            <CardContent className="space-y-6 pt-8">
              <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/30">
                <p className="text-emerald-300 text-center flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Aplicación Segura Instalada
                </p>
              </div>

              <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                <p className="text-amber-300 text-xs text-center flex items-center justify-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Dispositivo móvil verificado
                </p>
              </div>

              <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                <div className="flex items-start gap-3">
                  <User className="w-6 h-6 text-amber-400 mt-0.5 shrink-0" />
                  <div className="text-sm text-zinc-300">
                    <p className="font-medium text-amber-300 text-base">Identifique su Dispositivo</p>
                    <p className="text-zinc-400 mt-1">
                      Ingrese su nombre. Solo {maxDevices} dispositivos pueden usar el mismo nombre.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="userName" className="text-zinc-300">
                  Nombre del usuario
                </Label>
                <Input
                  id="userName"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Ej: Juan Pérez #123"
                  className="bg-zinc-800/50 border-zinc-700 text-white h-14 text-lg"
                  onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                />
                <p className="text-xs text-zinc-500">
                  Puede usar letras, números y caracteres especiales
                </p>
              </div>

              <Button
                onClick={handleRegister}
                disabled={loading || !userName.trim() || userName.trim().length < 2}
                className="w-full h-16 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-900 font-bold text-xl shadow-lg shadow-amber-500/40"
              >
                {loading ? (
                  <div className="w-7 h-7 border-4 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" />
                ) : (
                  <>
                    <Shield className="w-6 h-6 mr-3" />
                    ACCEDER
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                <Shield className="w-3 h-3" />
                <span>Cifrado Profesional</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Panel de Administración */}
        {flowState === "admin" && (
          <Card className="w-full bg-zinc-900/80 border-amber-500/30 backdrop-blur-sm shadow-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-amber-400 flex items-center justify-center gap-2 text-xl">
                <Settings className="w-6 h-6" />
                Panel de Administración
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              
              {/* Login de admin */}
              {devices.length === 0 && !loading && (
                <div className="space-y-4">
                  <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                    <p className="text-zinc-300 text-sm text-center">
                      Ingrese la contraseña de administrador
                    </p>
                  </div>
                  
                  <Input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Contraseña de administrador"
                    className="bg-zinc-800/50 border-zinc-700 text-white h-12"
                    onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                  />
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setFlowState(isStandalone ? "register" : "install-required")}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleAdminLogin}
                      className="flex-1 bg-amber-600 hover:bg-amber-500 text-zinc-900"
                    >
                      Entrar
                    </Button>
                  </div>
                </div>
              )}

              {/* Panel de dispositivos */}
              {(devices.length > 0 || loading) && (
                <>
                  {/* Estadísticas */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-zinc-800/50 rounded-lg p-3 text-center border border-zinc-700/50">
                      <Users className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-white">{deviceStats.validated}</p>
                      <p className="text-xs text-zinc-400">Registrados</p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-3 text-center border border-zinc-700/50">
                      <Shield className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-white">{maxDevices}</p>
                      <p className="text-xs text-zinc-400">Por Grupo</p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-3 text-center border border-zinc-700/50">
                      <Smartphone className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-white">{deviceStats.total}</p>
                      <p className="text-xs text-zinc-400">Total</p>
                    </div>
                  </div>

                  {/* Buscador */}
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar por nombre..."
                      className="bg-zinc-800/50 border-zinc-700 text-white h-10"
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <Button
                      onClick={handleSearch}
                      className="bg-amber-600 hover:bg-amber-500 text-zinc-900"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Lista de dispositivos */}
                  <div className="space-y-3">
                    <p className="text-sm text-zinc-400 font-medium">Dispositivos Registrados:</p>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {loading ? (
                        <div className="text-center py-4 text-zinc-400">Cargando...</div>
                      ) : devices.length === 0 ? (
                        <div className="text-center py-4 text-zinc-500">No hay dispositivos</div>
                      ) : (
                        devices.map((device, index) => (
                          <div key={device.id} className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="bg-amber-500/20 text-amber-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                    {index + 1}
                                  </span>
                                  <span className="text-sm text-white font-medium">{device.userName}</span>
                                </div>
                                <p className="text-xs text-zinc-500 mt-1 ml-8">
                                  {new Date(device.createdAt).toLocaleDateString('es-MX', { 
                                    day: '2-digit', 
                                    month: 'short'
                                  })}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  onClick={() => handleDeleteByUser(device.userName)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                                  title="Eliminar todos de este usuario"
                                >
                                  <Users className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteDevice(device.id, device.userName)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="space-y-3">
                    <Button
                      onClick={handleDeleteAll}
                      variant="outline"
                      className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar Todos
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setDevices([]);
                        setFlowState(isStandalone ? "register" : "install-required");
                      }}
                      className="w-full bg-zinc-700 hover:bg-zinc-600 text-white"
                    >
                      Salir del Panel
                    </Button>
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
              <Button
                onClick={() => setFlowState(isStandalone ? "register" : "install-required")}
                className="mt-4"
                variant="outline"
              >
                Reintentar
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="shrink-0 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent pt-4 pb-4 px-4">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-zinc-600 text-xs">
            © 2026 Grupo Lisea - Seguridad Privada Profesional
          </p>
        </div>
      </footer>
    </div>
  );
}
