# Grupo Lisea Security - Despliegue en Vercel

## Paso 1: Obtener las credenciales de Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** > **Database**
4. Busca la sección **Connection string**
5. Copia la URL de conexión (URI)

### Variables necesarias:

```
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

- `DATABASE_URL`: Para conexiones pool (usar puerto 6543)
- `DIRECT_DATABASE_URL`: Para migraciones directas (usar puerto 5432)

## Paso 2: Configurar Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Importa tu repositorio de GitHub: `grupolisea/Grupo-Lisea-segurity`
3. En **Environment Variables**, agrega:
   - `DATABASE_URL` = tu URL de Supabase (pooler)
   - `DIRECT_DATABASE_URL` = tu URL de Supabase (directa)

## Paso 3: Desplegar

1. Haz clic en **Deploy**
2. Espera a que complete el build
3. ¡Listo!

## Estructura del Proyecto

```
├── src/
│   ├── app/           # Páginas y API routes
│   ├── components/    # Componentes UI
│   └── lib/           # Utilidades y DB
├── prisma/            # Schema de base de datos
├── public/            # Archivos estáticos
└── package.json       # Dependencias
```

## Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | URL de conexión a Supabase (pooler) |
| `DIRECT_DATABASE_URL` | URL directa a Supabase |

## Solución de Problemas

### Error: "No Next.js version detected"
- Asegúrate de que `package.json` esté en la raíz del proyecto
- Verifica que `next` esté en `dependencies`

### Error de base de datos
- Verifica que las variables de entorno estén correctas
- Ejecuta `prisma db push` desde Supabase SQL Editor si es necesario

## Soporte

Para ayuda técnica, contacta al equipo de desarrollo.
