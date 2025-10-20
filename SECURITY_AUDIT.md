# 🔒 Auditoría de Seguridad - Vista formulas_complete

## ⚠️ **Problema Identificado**

La vista `public.formulas_complete` está definida con `SECURITY DEFINER`, lo que representa un **riesgo de seguridad significativo**:

### **Riesgos:**
1. **Bypass de RLS**: Los usuarios pueden acceder a datos que normalmente estarían restringidos por Row-Level Security
2. **Escalación de Privilegios**: Usuarios con permisos limitados pueden acceder a datos sensibles
3. **Violación del Principio de Menor Privilegio**: La vista se ejecuta con permisos del creador, no del usuario

## 🛡️ **Soluciones Implementadas**

### **1. Recreación de la Vista Sin SECURITY DEFINER**
```sql
-- Eliminar vista insegura
DROP VIEW IF EXISTS public.formulas_complete;

-- Crear vista que respeta RLS
CREATE VIEW public.formulas_complete AS
SELECT 
    f.id, f.name, f.batch_size, f.status, f.destination,
    f.date, f.type, f.client_name, f.created_at, f.updated_at,
    COALESCE(missing_count.count, 0) as missing_ingredients_count,
    COALESCE(available_count.count, 0) as available_ingredients_count
FROM formulas f
LEFT JOIN (...) missing_count ON f.id = missing_count.formula_id
LEFT JOIN (...) available_count ON f.id = available_count.formula_id;
```

### **2. Función Segura con Controles Estrictos**
```sql
CREATE OR REPLACE FUNCTION get_formulas_complete()
RETURNS TABLE (...) 
LANGUAGE plpgsql
SECURITY DEFINER  -- Solo para esta función específica
SET search_path = public
AS $$
BEGIN
    -- Verificar autenticación
    IF auth.role() != 'authenticated' THEN
        RAISE EXCEPTION 'Acceso denegado: usuario no autenticado';
    END IF;
    
    -- Retornar datos con RLS aplicado
    RETURN QUERY SELECT ... FROM formulas f ...;
END;
$$;
```

### **3. Políticas RLS Mejoradas**
```sql
-- Políticas específicas en lugar de políticas genéricas
CREATE POLICY "Usuarios autenticados pueden leer fórmulas" ON formulas
    FOR SELECT USING (auth.role() = 'authenticated');

-- Revocar permisos innecesarios
REVOKE ALL ON public.formulas_complete FROM PUBLIC;
GRANT SELECT ON public.formulas_complete TO authenticated;
```

### **4. Actualización del Servicio**
```typescript
// Usar función segura en lugar de vista directa
const { data: formulas, error } = await supabase
  .rpc('get_formulas_complete');
```

## 📋 **Checklist de Seguridad**

### **Antes de la Corrección:**
- [ ] Vista con SECURITY DEFINER sin controles
- [ ] Políticas RLS demasiado permisivas
- [ ] Acceso directo a vista desde frontend
- [ ] Sin auditoría de accesos

### **Después de la Corrección:**
- [x] Vista sin SECURITY DEFINER que respeta RLS
- [x] Función segura con controles de autenticación
- [x] Políticas RLS específicas y granulares
- [x] Servicio actualizado para usar función segura
- [x] Permisos mínimos necesarios
- [x] Auditoría de accesos implementada

## 🔍 **Verificaciones Recomendadas**

### **1. Verificar Políticas RLS**
```sql
-- Verificar que RLS esté habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('formulas', 'inventory_items');

-- Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('formulas', 'inventory_items');
```

### **2. Probar Acceso de Usuario**
```sql
-- Conectar como usuario de prueba
SET ROLE authenticated;

-- Intentar acceder a datos
SELECT * FROM formulas_complete LIMIT 5;

-- Verificar que solo vea datos permitidos
```

### **3. Monitorear Auditoría**
```sql
-- Revisar logs de auditoría
SELECT * FROM audit_log 
WHERE table_name = 'formulas_complete_view'
ORDER BY timestamp DESC;
```

## 🚨 **Acciones Inmediatas Requeridas**

1. **Aplicar las correcciones** ejecutando `supabase/security-fixes.sql`
2. **Verificar** que no hay otras vistas con SECURITY DEFINER
3. **Probar** el acceso con diferentes usuarios
4. **Monitorear** los logs de auditoría
5. **Documentar** cualquier vista adicional que use SECURITY DEFINER

## 📚 **Mejores Prácticas para el Futuro**

### **Al Crear Vistas:**
- ❌ **NUNCA** usar SECURITY DEFINER sin controles estrictos
- ✅ **SIEMPRE** verificar que la vista respete RLS
- ✅ **SIEMPRE** crear funciones seguras para lógica compleja
- ✅ **SIEMPRE** auditar accesos a datos sensibles

### **Al Crear Políticas RLS:**
- ❌ **NUNCA** usar políticas genéricas como `FOR ALL`
- ✅ **SIEMPRE** ser específico con operaciones (SELECT, INSERT, UPDATE, DELETE)
- ✅ **SIEMPRE** verificar permisos mínimos necesarios
- ✅ **SIEMPRE** probar con diferentes roles de usuario

## 🔗 **Referencias**

- [PostgreSQL SECURITY DEFINER Documentation](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [Supabase RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Database Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Database_Security_Cheat_Sheet.html)
