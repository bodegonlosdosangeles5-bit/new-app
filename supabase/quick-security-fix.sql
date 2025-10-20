-- =============================================
-- CORRECCIÓN RÁPIDA DE SEGURIDAD
-- =============================================

-- 1. Eliminar políticas conflictivas
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden acceder a fórmulas" ON formulas;
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden acceder a inventario" ON inventory_items;

-- 2. Crear políticas específicas para fórmulas
CREATE POLICY "Usuarios autenticados pueden leer fórmulas" ON formulas
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear fórmulas" ON formulas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar fórmulas" ON formulas
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar fórmulas" ON formulas
    FOR DELETE USING (auth.role() = 'authenticated');

-- 3. Crear políticas específicas para inventario
CREATE POLICY "Usuarios autenticados pueden leer inventario" ON inventory_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear inventario" ON inventory_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar inventario" ON inventory_items
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar inventario" ON inventory_items
    FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Crear políticas para ingredientes faltantes
CREATE POLICY "Usuarios autenticados pueden leer ingredientes faltantes" ON missing_ingredients
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear ingredientes faltantes" ON missing_ingredients
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar ingredientes faltantes" ON missing_ingredients
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar ingredientes faltantes" ON missing_ingredients
    FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Crear políticas para ingredientes disponibles
CREATE POLICY "Usuarios autenticados pueden leer ingredientes disponibles" ON available_ingredients
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear ingredientes disponibles" ON available_ingredients
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar ingredientes disponibles" ON available_ingredients
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar ingredientes disponibles" ON available_ingredients
    FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Crear políticas para remitos
CREATE POLICY "Usuarios autenticados pueden leer remitos" ON remitos
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear remitos" ON remitos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar remitos" ON remitos
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar remitos" ON remitos
    FOR DELETE USING (auth.role() = 'authenticated');

-- 7. Crear políticas para items de remito
CREATE POLICY "Usuarios autenticados pueden leer items de remito" ON remito_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear items de remito" ON remito_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar items de remito" ON remito_items
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar items de remito" ON remito_items
    FOR DELETE USING (auth.role() = 'authenticated');

-- 8. Crear políticas para materias primas
CREATE POLICY "Usuarios autenticados pueden leer materias primas" ON materias_primas
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear materias primas" ON materias_primas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar materias primas" ON materias_primas
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar materias primas" ON materias_primas
    FOR DELETE USING (auth.role() = 'authenticated');

-- 9. Verificar que RLS esté habilitado
ALTER TABLE formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE missing_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE available_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE remitos ENABLE ROW LEVEL SECURITY;
ALTER TABLE remito_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE materias_primas ENABLE ROW LEVEL SECURITY;
