-- =============================================
-- POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE missing_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE available_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE envios ENABLE ROW LEVEL SECURITY;
ALTER TABLE remitos ENABLE ROW LEVEL SECURITY;
ALTER TABLE remito_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE envios_remitos ENABLE ROW LEVEL SECURITY;
ALTER TABLE materias_primas ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_connection ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLÍTICAS PARA TABLA FORMULAS
-- =============================================

-- Permitir lectura a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden leer fórmulas" ON formulas
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir inserción solo a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden crear fórmulas" ON formulas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir actualización solo a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden actualizar fórmulas" ON formulas
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Permitir eliminación solo a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden eliminar fórmulas" ON formulas
    FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- POLÍTICAS PARA TABLA INVENTORY_ITEMS
-- =============================================

CREATE POLICY "Usuarios autenticados pueden leer inventario" ON inventory_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear inventario" ON inventory_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar inventario" ON inventory_items
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar inventario" ON inventory_items
    FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- POLÍTICAS PARA TABLA MISSING_INGREDIENTS
-- =============================================

CREATE POLICY "Usuarios autenticados pueden leer ingredientes faltantes" ON missing_ingredients
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear ingredientes faltantes" ON missing_ingredients
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar ingredientes faltantes" ON missing_ingredients
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar ingredientes faltantes" ON missing_ingredients
    FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- POLÍTICAS PARA TABLA AVAILABLE_INGREDIENTS
-- =============================================

CREATE POLICY "Usuarios autenticados pueden leer ingredientes disponibles" ON available_ingredients
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear ingredientes disponibles" ON available_ingredients
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar ingredientes disponibles" ON available_ingredients
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar ingredientes disponibles" ON available_ingredients
    FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- POLÍTICAS PARA TABLA ENVIOS
-- =============================================

CREATE POLICY "Usuarios autenticados pueden leer envíos" ON envios
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear envíos" ON envios
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar envíos" ON envios
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar envíos" ON envios
    FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- POLÍTICAS PARA TABLA REMITOS
-- =============================================

CREATE POLICY "Usuarios autenticados pueden leer remitos" ON remitos
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear remitos" ON remitos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar remitos" ON remitos
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar remitos" ON remitos
    FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- POLÍTICAS PARA TABLA REMITO_ITEMS
-- =============================================

CREATE POLICY "Usuarios autenticados pueden leer items de remito" ON remito_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear items de remito" ON remito_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar items de remito" ON remito_items
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar items de remito" ON remito_items
    FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- POLÍTICAS PARA TABLA ENVIOS_REMITOS
-- =============================================

CREATE POLICY "Usuarios autenticados pueden leer envíos-remitos" ON envios_remitos
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear envíos-remitos" ON envios_remitos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar envíos-remitos" ON envios_remitos
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar envíos-remitos" ON envios_remitos
    FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- POLÍTICAS PARA TABLA MATERIAS_PRIMAS
-- =============================================

CREATE POLICY "Usuarios autenticados pueden leer materias primas" ON materias_primas
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear materias primas" ON materias_primas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar materias primas" ON materias_primas
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar materias primas" ON materias_primas
    FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- POLÍTICAS PARA TABLA TEST_CONNECTION
-- =============================================

CREATE POLICY "Usuarios autenticados pueden leer test_connection" ON test_connection
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear test_connection" ON test_connection
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar test_connection" ON test_connection
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar test_connection" ON test_connection
    FOR DELETE USING (auth.role() = 'authenticated');
