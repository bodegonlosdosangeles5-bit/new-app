# 🔐 Configuración de Seguridad Supabase

## 📋 Pasos para implementar la seguridad en Supabase

### **Paso 1: Acceder al Dashboard de Supabase**
1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto: `xfkgrcygkqfusfsjvdly`

### **Paso 2: Ejecutar Scripts de Seguridad**

#### **2.1 Script Principal de Seguridad**
1. Ve a **SQL Editor** en el menú lateral
2. Haz clic en **"New query"**
3. Copia y pega el contenido completo del archivo `supabase/setup.sql`
4. Haz clic en **"Run"** para ejecutar el script
5. Verifica que no hay errores en la consola

#### **2.2 Verificar Políticas RLS**
1. Ve a **Authentication** → **Policies**
2. Verifica que todas las tablas tengan políticas RLS habilitadas
3. Deberías ver políticas para: formulas, inventory_items, missing_ingredients, etc.

### **Paso 3: Configurar Autenticación**

#### **3.1 Habilitar Email/Password**
1. Ve a **Authentication** → **Settings**
2. En **"Auth Providers"**, asegúrate de que **"Email"** esté habilitado
3. En **"Email"**, configura:
   - ✅ **Enable email confirmations**: Deshabilitado (para desarrollo)
   - ✅ **Enable email change confirmations**: Deshabilitado (para desarrollo)

#### **3.2 Configurar URLs de Redirección**
1. En **Authentication** → **URL Configuration**
2. Agrega estas URLs:
   - **Site URL**: `http://localhost:8081`
   - **Redirect URLs**: 
     - `http://localhost:8081/auth/callback`
     - `http://localhost:8081`

### **Paso 4: Crear Usuario de Prueba**

#### **4.1 Desde el Dashboard**
1. Ve a **Authentication** → **Users**
2. Haz clic en **"Add user"**
3. Completa:
   - **Email**: `admin@planta.com`
   - **Password**: `admin123456`
   - **Email Confirm**: ✅ (marcado)
4. Haz clic en **"Create user"**

#### **4.2 Desde la Aplicación**
1. Ve a `http://localhost:8081`
2. Verás la pantalla de login
3. Haz clic en **"Crear Cuenta"**
4. Usa un email válido y contraseña de al menos 6 caracteres

### **Paso 5: Verificar Seguridad**

#### **5.1 Verificar RLS**
1. Ve a **Table Editor**
2. Selecciona cualquier tabla (ej: `formulas`)
3. Intenta hacer una consulta sin autenticación
4. Deberías ver un error de permisos

#### **5.2 Verificar Auditoría**
1. Ve a **Table Editor** → **audit_log**
2. Realiza alguna acción en la aplicación
3. Verifica que se registren los cambios en la tabla

### **Paso 6: Configuración de Producción**

#### **6.1 Variables de Entorno de Producción**
Cuando despliegues a producción, actualiza tu archivo `.env`:

```env
# Producción
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_de_produccion
VITE_APP_URL=https://tu-dominio.com
VITE_AUTH_REDIRECT_URL=https://tu-dominio.com/auth/callback
VITE_DEV_MODE=false
```

#### **6.2 URLs de Producción en Supabase**
1. Ve a **Authentication** → **URL Configuration**
2. Actualiza:
   - **Site URL**: `https://tu-dominio.com`
   - **Redirect URLs**: `https://tu-dominio.com/auth/callback`

## 🚨 **Verificación de Seguridad**

### **✅ Checklist de Seguridad**
- [ ] RLS habilitado en todas las tablas
- [ ] Políticas de acceso configuradas
- [ ] Autenticación funcionando
- [ ] Auditoría de cambios activa
- [ ] Variables de entorno configuradas
- [ ] URLs de redirección configuradas

### **🔍 Pruebas de Seguridad**
1. **Sin autenticación**: No deberías poder acceder a los datos
2. **Con autenticación**: Deberías poder ver y modificar datos
3. **Logout**: Al cerrar sesión, no deberías poder acceder
4. **Auditoría**: Los cambios deberían registrarse en `audit_log`

## 🆘 **Solución de Problemas**

### **Error: "Row Level Security"**
- Verifica que RLS esté habilitado en todas las tablas
- Ejecuta el script `supabase/setup.sql` completo

### **Error: "Invalid JWT"**
- Verifica que las variables de entorno estén correctas
- Reinicia el servidor de desarrollo

### **Error: "Email not confirmed"**
- En desarrollo, deshabilita la confirmación de email
- O verifica tu email y haz clic en el enlace de confirmación

### **Error: "CORS"**
- Verifica que las URLs de redirección estén configuradas correctamente
- Asegúrate de que la URL de la aplicación coincida con la configurada

## 📞 **Soporte**

Si tienes problemas:
1. Revisa los logs en la consola del navegador
2. Verifica la configuración en Supabase Dashboard
3. Asegúrate de que todos los scripts se ejecutaron correctamente
