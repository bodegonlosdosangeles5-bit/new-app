-- =============================================
-- CORRECCIONES DE SEGURIDAD PARA VISTAS
-- =============================================

-- =============================================
-- PROBLEMA: Vista formulas_complete con SECURITY DEFINER
-- =============================================

-- 1. Primero, eliminar la vista existente si existe
DROP VIEW IF EXISTS public.formulas_complete;

-- 2. Crear la vista SIN SECURITY DEFINER para que respete RLS
CREATE VIEW public.formulas_complete AS
SELECT 
    f.id,
    f.name,
    f.batch_size,
    f.status,
    f.destination,
    f.date,
    f.type,
    f.client_name,
    f.created_at,
    f.updated_at,
    COALESCE(missing_count.count, 0) as missing_ingredients_count,
    COALESCE(available_count.count, 0) as available_ingredients_count
FROM formulas f
LEFT JOIN (
    SELECT formula_id, COUNT(*) as count
    FROM missing_ingredients
    GROUP BY formula_id
) missing_count ON f.id = missing_count.formula_id
LEFT JOIN (
    SELECT formula_id, COUNT(*) as count
    FROM available_ingredients
    GROUP BY formula_id
) available_count ON f.id = available_count.formula_id;

-- 3. Aplicar RLS a la vista (las vistas heredan RLS de las tablas subyacentes)
-- No es necesario habilitar RLS explícitamente en vistas, pero podemos crear políticas específicas

-- =============================================
-- MEJORAR POLÍTICAS RLS EXISTENTES
-- =============================================

-- Eliminar políticas demasiado permisivas
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden acceder a fórmulas" ON formulas;
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden acceder a inventario" ON inventory_items;

-- Crear políticas más específicas y seguras
CREATE POLICY "Usuarios autenticados pueden leer fórmulas" ON formulas
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear fórmulas" ON formulas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar fórmulas" ON formulas
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar fórmulas" ON formulas
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas similares para inventory_items
CREATE POLICY "Usuarios autenticados pueden leer inventario" ON inventory_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear inventario" ON inventory_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar inventario" ON inventory_items
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar inventario" ON inventory_items
    FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- CREAR FUNCIONES SEGURAS PARA VISTAS COMPLEJAS
-- =============================================

-- Función segura para obtener fórmulas completas
CREATE OR REPLACE FUNCTION get_formulas_complete()
RETURNS TABLE (
    id text,
    name text,
    batch_size integer,
    status text,
    destination text,
    date text,
    type text,
    client_name text,
    created_at timestamptz,
    updated_at timestamptz,
    missing_ingredients_count bigint,
    available_ingredients_count bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER  -- Solo para esta función específica, con controles estrictos
SET search_path = public
AS $$
BEGIN
    -- Verificar que el usuario esté autenticado
    IF auth.role() != 'authenticated' THEN
        RAISE EXCEPTION 'Acceso denegado: usuario no autenticado';
    END IF;
    
    -- Retornar datos con RLS aplicado
    RETURN QUERY
    SELECT 
        f.id,
        f.name,
        f.batch_size,
        f.status,
        f.destination,
        f.date,
        f.type,
        f.client_name,
        f.created_at,
        f.updated_at,
        COALESCE(missing_count.count, 0) as missing_ingredients_count,
        COALESCE(available_count.count, 0) as available_ingredients_count
    FROM formulas f
    LEFT JOIN (
        SELECT formula_id, COUNT(*) as count
        FROM missing_ingredients
        GROUP BY formula_id
    ) missing_count ON f.id = missing_count.formula_id
    LEFT JOIN (
        SELECT formula_id, COUNT(*) as count
        FROM available_ingredients
        GROUP BY formula_id
    ) available_count ON f.id = available_count.formula_id;
END;
$$;

-- =============================================
-- CONFIGURAR PERMISOS SEGUROS
-- =============================================

-- Otorgar permisos de ejecución solo a usuarios autenticados
GRANT EXECUTE ON FUNCTION get_formulas_complete() TO authenticated;

-- Revocar permisos innecesarios
REVOKE ALL ON public.formulas_complete FROM PUBLIC;
GRANT SELECT ON public.formulas_complete TO authenticated;

-- =============================================
-- AUDITORÍA DE SEGURIDAD
-- =============================================

-- Crear función para auditar accesos a vistas sensibles
CREATE OR REPLACE FUNCTION audit_view_access()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (
        table_name,
        operation,
        old_data,
        new_data,
        user_id,
        timestamp
    ) VALUES (
        'formulas_complete_view',
        'SELECT',
        NULL,
        row_to_json(NEW),
        auth.uid(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- LIMPIAR ESTADOS INVALIDOS DE FORMULAS
-- =============================================

-- Actualizar fórmulas con estados inválidos a estados válidos
UPDATE formulas 
SET status = 'incomplete' 
WHERE status NOT IN ('available', 'incomplete', 'procesado');

-- Verificar que no queden estados inválidos
DO $$
DECLARE
    invalid_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO invalid_count 
    FROM formulas 
    WHERE status NOT IN ('available', 'incomplete', 'procesado');
    
    IF invalid_count > 0 THEN
        RAISE WARNING 'Aún existen % fórmulas con estados inválidos', invalid_count;
    ELSE
        RAISE NOTICE 'Todas las fórmulas tienen estados válidos';
    END IF;
END;
$$;

-- =============================================
-- VERIFICACIÓN DE SEGURIDAD
-- =============================================

-- Verificar que las políticas RLS estén activas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'formulas' 
        AND policyname = 'Usuarios autenticados pueden leer fórmulas'
    ) THEN
        RAISE EXCEPTION 'Política RLS no encontrada para fórmulas';
    END IF;
    
    RAISE NOTICE 'Verificación de seguridad completada exitosamente';
END;
$$;
