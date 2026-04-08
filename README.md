# 🔐 Grupo Lisea - Sistema de Acceso Seguro

<div align="center">

![Grupo Lisea](https://img.shields.io/badge/Grupo%20Lisea-Seguridad%20Privada-amber?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![PWA](https://img.shields.io/badge/PWA-Ready-purple?style=for-the-badge)

**Plataforma de Seguridad Privada Profesional**

Sistema PWA de protección de acceso con control de dispositivos y panel de administración.

[Ver Demo](https://grupo-lisea-segurity.vercel.app) · [Reportar Bug](https://github.com/grupolisea/Grupo-Lisea-segurity/issues) · [Solicitar Feature](https://github.com/grupolisea/Grupo-Lisea-segurity/issues)

</div>

---

## 📋 Descripción

**Grupo Lisea Seguridad** es una aplicación web progresiva (PWA) diseñada para proteger el acceso a contenido sensible mediante un sistema de seguridad multicapa. La aplicación garantiza que solo usuarios autorizados en dispositivos móviles/tablets puedan acceder al contenido protegido.

### 🎯 Caso de Uso Principal
Protección de aplicaciones internas de seguridad privada, donde el acceso debe estar restringido a:
- Dispositivos móviles y tablets únicamente
- Usuarios previamente registrados
- Máximo 3 dispositivos por nombre de usuario

---

## ✨ Características Principales

| Característica | Descripción |
|---------------|-------------|
| 🔒 **PWA Obligatoria** | El contenido protegido nunca es visible en el navegador; requiere instalación de la app |
| 📱 **Solo Móvil/Tablet** | Bloqueo automático de equipos de escritorio (desktop) |
| 👥 **Control de Dispositivos** | Límite de 3 dispositivos por nombre de usuario |
| 🔐 **Cifrado AES-256** | Seguridad de nivel profesional para tokens de acceso |
| 🔔 **Notificaciones Push** | Alertas en tiempo real mediante Service Worker |
| 📷 **Permisos Integrados** | Solicitud de cámara y micrófono para aplicaciones de seguridad |
| ⚙️ **Panel Admin** | Gestión completa de dispositivos registrados |
| 🎨 **UI Profesional** | Interfaz moderna con tema oscuro y acentos dorados |

---

## 🛡️ Flujo de Seguridad

```
┌─────────────────┐
│  Usuario accede │
└────────┬────────┘
         ▼
┌─────────────────┐     NO      ┌──────────────────┐
│  ¿Es móvil?     │────────────▶│  BLOQUEADO       │
└────────┬────────┘             │  (Desktop)       │
         │ SÍ                   └──────────────────┘
         ▼
┌─────────────────┐     NO      ┌──────────────────┐
│  ¿PWA instalada?│────────────▶│  INSTALAR APP    │
└────────┬────────┘             │  (Instrucciones) │
         │ SÍ                   └──────────────────┘
         ▼
┌─────────────────┐     NO      ┌──────────────────┐
│  ¿Dispositivos  │────────────▶│  REGISTRO        │
│  disponibles?   │             │  (Nuevo usuario) │
└────────┬────────┘             └──────────────────┘
         │ SÍ
         ▼
┌─────────────────┐
│  ✅ ACCESO      │
│  (Contenido     │
│   protegido)    │
└─────────────────┘
```

---

## 🛠️ Stack Tecnológico

### Frontend
- **[Next.js 16.1.1](https://nextjs.org/)** - Framework React con App Router
- **[TypeScript 5](https://www.typescriptlang.org/)** - Tipado estático
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Estilos utilitarios
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes UI accesibles
- **[Lucide Icons](https://lucide.dev/)** - Iconografía
- **[Framer Motion](https://www.framer.com/motion/)** - Animaciones

### Backend & Storage
- **API Routes** - Endpoints serverless
- **In-Memory Store** - Almacenamiento en memoria (sin base de datos externa)

### PWA
- **Service Worker** - Cache y notificaciones
- **Web App Manifest** - Instalación en dispositivos

---

## 🚀 Despliegue Rápido

### Opción 1: Vercel (Recomendado)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/grupolisea/Grupo-Lisea-segurity)

1. Haz clic en el botón de arriba
2. Conecta tu cuenta de GitHub
3. Haz clic en **Deploy**
4. ¡Listo! Tu aplicación estará disponible en minutos

### Opción 2: Manual

```bash
# 1. Clonar el repositorio
git clone https://github.com/grupolisea/Grupo-Lisea-segurity.git

# 2. Entrar al directorio
cd Grupo-Lisea-segurity

# 3. Instalar dependencias
bun install
# o con npm
npm install

# 4. Iniciar en desarrollo
bun run dev
# o
npm run dev

# 5. Abrir http://localhost:3000
```

---

## 📱 Uso de la Aplicación

### Para Usuarios

1. **Acceder desde móvil o tablet** (desktop está bloqueado)
2. **Instalar la PWA** siguiendo las instrucciones en pantalla
3. **Registrar nombre de usuario** (mínimo 2 caracteres)
4. **Acceder al contenido protegido**

### Para Administradores

1. Tocar el **escudo del logo 5 veces** seguidas
2. Ingresar la contraseña de administrador
3. Gestionar dispositivos:
   - Ver dispositivos registrados
   - Buscar por nombre de usuario
   - Eliminar dispositivos individuales
   - Eliminar todos los dispositivos de un usuario
   - Eliminar todos los dispositivos

**Contraseña de administrador:** `LiseaAdmin2026!`

---

## 📁 Estructura del Proyecto

```
grupo-lisea-security/
├── 📁 public/                 # Archivos estáticos
│   ├── 📄 manifest.json       # PWA manifest
│   ├── 📄 sw.js              # Service Worker
│   ├── 🖼️ escudo.jpg         # Logo
│   └── 🖼️ icon-*.png         # Iconos PWA
├── 📁 src/
│   ├── 📁 app/               # App Router
│   │   ├── 📄 page.tsx       # Página principal
│   │   ├── 📄 layout.tsx     # Layout raíz
│   │   ├── 📄 globals.css    # Estilos globales
│   │   └── 📁 api/           # API Routes
│   │       ├── 📁 access/    # Validación de acceso
│   │       ├── 📁 admin/     # Panel de administración
│   │       ├── 📁 proxy/     # Proxy de contenido
│   │       ├── 📁 token/     # Generación de tokens
│   │       └── 📁 verify/    # Verificación de dispositivo
│   ├── 📁 components/        # Componentes React
│   │   └── 📁 ui/            # Componentes shadcn/ui
│   ├── 📁 hooks/             # Custom hooks
│   └── 📁 lib/               # Utilidades y store
├── 📄 package.json           # Dependencias
├── 📄 next.config.ts         # Configuración Next.js
├── 📄 tailwind.config.ts     # Configuración Tailwind
└── 📄 tsconfig.json          # Configuración TypeScript
```

---

## 🔌 API Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/token` | POST | Generar token de acceso |
| `/api/access` | POST | Validar token y obtener URL |
| `/api/verify` | GET | Verificar estado del dispositivo |
| `/api/admin/devices` | GET | Listar dispositivos (admin) |
| `/api/admin/devices` | DELETE | Eliminar dispositivos (admin) |
| `/api/proxy` | GET | Proxy para contenido protegido |

---

## ⚙️ Configuración

### Cambiar URL Protegida

Edita el archivo `src/lib/store.ts`:

```typescript
const DEFAULT_CONFIG = {
  protectedUrl: "https://tu-url-protegida.com",
  maxDevicesPerUser: 3,
  adminPassword: "TuContraseñaSegura!",
};
```

### Cambiar Límite de Dispositivos

Modifica `maxDevicesPerUser` en la configuración.

---

## 🔒 Consideraciones de Seguridad

- ✅ Los tokens expiran automáticamente
- ✅ Fingerprinting del dispositivo para prevenir duplicados
- ✅ Validación de modo PWA antes de acceder
- ✅ Bloqueo de user agents de escritorio
- ✅ El contenido protegido se carga en iframe con sandbox

---

## 📊 Estado del Proyecto

| Estado | Descripción |
|--------|-------------|
| ✅ Producción | Desplegado en Vercel |
| ✅ PWA | Service Worker activo |
| ✅ Responsive | Diseño móvil-first |
| ✅ Accesibilidad | Componentes accesibles |

---

## 🤝 Contribuir

Las contribuciones son bienvenidas:

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

---

## 📄 Licencia

© 2026 **Grupo Lisea** - Seguridad Privada Profesional

Todos los derechos reservados. Este software es propiedad de Grupo Lisea y su uso está restringido a fines autorizados.

---

## 👥 Contacto

**Grupo Lisea - Seguridad Privada Profesional**

- 📧 Email: contacto@grupolisea.com
- 🌐 Web: [grupolisea.com](https://grupolisea.com)
- 💼 GitHub: [@grupolisea](https://github.com/grupolisea)

---

<div align="center">

**Desarrollado con ❤️ para Grupo Lisea**

![Footer](https://img.shields.io/badge/Seguridad-Profesional-amber?style=flat-square)

</div>
