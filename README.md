# 🔐 Grupo Lisea - Sistema de Acceso Seguro

**Plataforma de Seguridad Privada Profesional**

Sistema PWA de protección de acceso con control de dispositivos, cifrado profesional y panel de administración.

---

## ✨ Características

- 🔒 **PWA Obligatoria** - El enlace protegido nunca es visible
- 📱 **Solo Móvil/Tablet** - Bloqueo automático de desktop
- 👥 **3 Dispositivos por Usuario** - Control de acceso estricto
- 🔐 **Cifrado AES-256** - Seguridad de nivel profesional
- 🔔 **Notificaciones Push** - Alertas en tiempo real
- 📷 **Permisos de Cámara/Micrófono** - Para aplicaciones de seguridad
- ⚙️ **Panel Admin** - Gestión completa de dispositivos
- 🗄️ **PostgreSQL (Supabase)** - Base de datos escalable

---

## 🛠️ Tecnologías

- **Next.js 16** - Framework React
- **Prisma** - ORM de base de datos
- **PostgreSQL (Supabase)** - Base de datos en la nube
- **Tailwind CSS** - Estilos
- **shadcn/ui** - Componentes UI
- **PWA** - Progressive Web App

---

## 🚀 Despliegue en Vercel + Supabase

### PASO 1: Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta y una organización
3. Crea un nuevo proyecto llamado `grupo-lisea-security`
4. Espera a que se cree la base de datos

### PASO 2: Obtener URLs de conexión

1. En el dashboard de Supabase, haz clic en **"Conectar"**
2. Busca la sección **"Session pooler"** y copia la URI
3. También copia la URI de **"Transaction pooler"** (puerto 5432)

### PASO 3: Desplegar en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Conecta tu cuenta de GitHub
3. Importa el repositorio `grupo-lisea-security`
4. Agrega las variables de entorno:
   - `DATABASE_URL` = URL del Session pooler (puerto 6543) + `?pgbouncer=true`
   - `DIRECT_DATABASE_URL` = URL del Transaction pooler (puerto 5432)
5. Haz clic en **"Deploy"**

### PASO 4: Ejecutar migraciones

Después del primer deploy, ejecuta:

```bash
npx prisma db push
```

O en Vercel, ve a la pestaña **Storage** → **Prisma** y ejecuta las migraciones.

---

## 📱 Uso

1. Acceder desde **móvil o tablet**
2. **Instalar la PWA** (obligatorio)
3. Registrar **nombre de usuario**
4. Acceder al **contenido protegido**

### Panel Admin
- Tocar el escudo **5 veces**
- Contraseña: `LiseaAdmin2026!`

---

## 🔧 Variables de Entorno

```env
# Base de datos Supabase (PostgreSQL)
DATABASE_URL="postgresql://postgres.xxxxx:PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_DATABASE_URL="postgresql://postgres.xxxxx:PASSWORD@aws-0-region.pooler.supabase.com:5432/postgres"

# Claves de encriptación (opcional)
ENCRYPTION_KEY="tu-clave-de-encriptacion"
HMAC_KEY="tu-clave-hmac"
```

---

## 📋 Desarrollo Local

```bash
# Clonar repositorio
git clone https://github.com/TU_USUARIO/grupo-lisea-security.git

# Instalar dependencias
bun install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de Supabase

# Crear tablas en la base de datos
bun run db:push

# Iniciar servidor de desarrollo
bun run dev
```

---

## 📄 Licencia

© 2026 Grupo Lisea - Seguridad Privada Profesional

---

## 👥 Soporte

Para soporte técnico, contactar a Grupo Lisea.
