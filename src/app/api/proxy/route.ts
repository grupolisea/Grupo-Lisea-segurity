import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function decryptUrl(encrypted: string): string {
  try {
    const key = crypto.createHash("sha256").update("lisea-security-key-2024").digest();
    
    if (encrypted.startsWith("http://") || encrypted.startsWith("https://")) {
      return encrypted;
    }
    
    const iv = Buffer.alloc(16, 0);
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch {
    if (encrypted.startsWith("http://") || encrypted.startsWith("https://")) {
      return encrypted;
    }
    return "";
  }
}

// Script para protección de navegación elegante
const PROTECTION_SCRIPT = `
<script>
(function() {
  'use strict';
  
  // Dominio permitido
  const ALLOWED_DOMAIN = window.ALLOWED_DOMAIN;
  
  // Estilos para el aviso elegante
  const styles = \`
    .lisea-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #0c0a09 0%, #1c1917 50%, #0c0a09 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .lisea-modal {
      background: linear-gradient(145deg, #1c1917, #292524);
      border: 1px solid #78716c;
      border-radius: 20px;
      padding: 40px 30px;
      max-width: 320px;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(217, 119, 6, 0.1);
    }
    .lisea-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #b45309, #d97706);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      box-shadow: 0 10px 30px rgba(217, 119, 6, 0.3);
    }
    .lisea-icon svg {
      width: 40px;
      height: 40px;
      fill: #fef3c7;
    }
    .lisea-title {
      color: #fef3c7;
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 10px;
      letter-spacing: 0.5px;
    }
    .lisea-subtitle {
      color: #78716c;
      font-size: 14px;
      margin-bottom: 25px;
      line-height: 1.5;
    }
    .lisea-brand {
      color: #d97706;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #292524;
    }
    .lisea-btn {
      background: linear-gradient(135deg, #b45309, #d97706);
      color: #fef3c7;
      border: none;
      padding: 14px 40px;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(217, 119, 6, 0.3);
    }
    .lisea-btn:active {
      transform: scale(0.98);
    }
  \`;
  
  // Función para verificar si un enlace es externo
  function isExternalLink(url) {
    try {
      if (!url) return false;
      if (url.startsWith('javascript:')) return false;
      if (url.startsWith('#')) return false;
      if (url.startsWith('data:')) return false;
      
      const link = new URL(url, window.location.origin);
      return link.hostname !== ALLOWED_DOMAIN;
    } catch {
      return false;
    }
  }
  
  // Mostrar aviso elegante
  function showRestrictedAccess() {
    const existing = document.querySelector('.lisea-overlay');
    if (existing) existing.remove();
    
    const overlay = document.createElement('div');
    overlay.className = 'lisea-overlay';
    overlay.innerHTML = \`
      <style>\${styles}</style>
      <div class="lisea-modal">
        <div class="lisea-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M12 8v4M12 16h.01"/>
          </svg>
        </div>
        <div class="lisea-title">Acceso Restringido</div>
        <div class="lisea-subtitle">Estás intentando salir del entorno seguro.<br>Esta acción no está permitida.</div>
        <button class="lisea-btn" onclick="this.closest('.lisea-overlay').remove()">Continuar en el Sitio</button>
        <div class="lisea-brand">Entorno Protegido por Grupo Lisea</div>
      </div>
    \`;
    document.body.appendChild(overlay);
  }
  
  // Inyectar estilos
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
  
  // Bloquear clics en enlaces externos
  document.addEventListener('click', function(e) {
    let target = e.target;
    while (target && target.tagName !== 'A') {
      target = target.parentElement;
    }
    
    if (target && target.tagName === 'A') {
      const href = target.getAttribute('href');
      if (isExternalLink(href)) {
        e.preventDefault();
        e.stopPropagation();
        showRestrictedAccess();
        return false;
      }
    }
  }, true);
  
  // Bloquear formularios externos
  document.addEventListener('submit', function(e) {
    const form = e.target;
    if (form && form.tagName === 'FORM') {
      const action = form.getAttribute('action');
      if (isExternalLink(action)) {
        e.preventDefault();
        showRestrictedAccess();
        return false;
      }
    }
  }, true);
  
  // Bloquear window.open
  const originalOpen = window.open;
  window.open = function(url) {
    if (isExternalLink(url)) {
      showRestrictedAccess();
      return null;
    }
    return originalOpen.apply(this, arguments);
  };
  
  // Bloquear navegación por location
  const originalAssign = window.location.assign.bind(window.location);
  window.location.assign = function(url) {
    if (isExternalLink(url)) {
      showRestrictedAccess();
      return;
    }
    return originalAssign(url);
  };
  
  // Bloquear location.replace
  const originalReplace = window.location.replace.bind(window.location);
  window.location.replace = function(url) {
    if (isExternalLink(url)) {
      showRestrictedAccess();
      return;
    }
    return originalReplace(url);
  };
  
  // Bloquear location.href setter
  let _href = window.location.href;
  Object.defineProperty(window.location, 'href', {
    get: function() { return _href; },
    set: function(url) {
      if (isExternalLink(url)) {
        showRestrictedAccess();
        return _href;
      }
      window.location.assign(url);
      return url;
    }
  });
  
  console.log('🔒 Protección Activa: Entorno Protegido por Grupo Lisea');
  console.log('📍 Dominio Permitido:', ALLOWED_DOMAIN);
})();
</script>
`;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return new NextResponse("Token requerido", { status: 400 });
    }

    // Verificar el token
    const accessToken = await db.accessToken.findFirst({
      where: { token },
    });

    if (!accessToken) {
      return new NextResponse("Token inválido", { status: 401 });
    }

    // Obtener la URL protegida
    const config = await db.securityConfig.findFirst();
    if (!config) {
      return new NextResponse("Sistema no configurado", { status: 500 });
    }

    const protectedUrl = decryptUrl(config.protectedUrl);
    if (!protectedUrl) {
      return new NextResponse("URL no válida", { status: 500 });
    }

    // Hacer fetch del contenido protegido
    const response = await fetch(protectedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "es-MX,es;q=0.9,en;q=0.8",
      },
    });

    let html = await response.text();

    // Obtener el dominio base
    const baseUrl = new URL(protectedUrl).origin;
    const baseDomain = new URL(protectedUrl).hostname;
    
    // Inyectar variable del dominio permitido y protección
    const domainScript = `<script>window.ALLOWED_DOMAIN = "${baseDomain}";</script>`;
    const baseTag = `<base href="${baseUrl}/">`;
    
    // Inyectar scripts al inicio del head
    if (html.includes("<head>")) {
      html = html.replace("<head>", `<head>${baseTag}${domainScript}${PROTECTION_SCRIPT}`);
    } else if (html.includes("<HEAD>")) {
      html = html.replace("<HEAD>", `<HEAD>${baseTag}${domainScript}${PROTECTION_SCRIPT}`);
    } else {
      html = baseTag + domainScript + PROTECTION_SCRIPT + html;
    }

    // Reescribir URLs relativas
    html = html.replace(/href="\/(?!\/)/g, `href="${baseUrl}/`);
    html = html.replace(/src="\/(?!\/)/g, `src="${baseUrl}/`);
    html = html.replace(/href='\/(?!\/)/g, `href='${baseUrl}/`);
    html = html.replace(/src='\/(?!\/)/g, `src='${baseUrl}/`);

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Frame-Options": "SAMEORIGIN",
        "Content-Security-Policy": `default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; frame-src 'self';`,
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new NextResponse("Error al cargar el contenido", { status: 500 });
  }
}
