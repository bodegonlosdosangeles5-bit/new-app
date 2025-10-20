-- =============================================
-- CORRECCIÓN URGENTE PARA ERRORES 403
-- =============================================
-- Ejecutar este SQL en Supabase Dashboard > SQL Editor

-- 1. PRIMERO: Deshabilitar temporalmente RLS para verificar que funciona
ALTER TABLE formulas DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE missing_ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE available_ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE remitos DISABLE ROW LEVEL SECURITY;
ALTER TABLE remito_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE materias_primas DISABLE ROW LEVEL SECURITY;

-- 2. Verificar que las tablas existen y tienen datos
SELECT 'formulas' as tabla, COUNT(*) as registros FROM formulas
UNION ALL
SELECT 'inventory_items' as tabla, COUNT(*) as registros FROM inventory_items
UNION ALL
SELECT 'missing_ingredients' as tabla, COUNT(*) as registros FROM missing_ingredients
UNION ALL
SELECT 'available_ingredients' as tabla, COUNT(*) as registros FROM available_ingredients
UNION ALL
SELECT 'remitos' as tabla, COUNT(*) as registros FROM remitos
UNION ALL
SELECT 'remito_items' as tabla, COUNT(*) as registros FROM remito_items
UNION ALL
SELECT 'materias_primas' as tabla, COUNT(*) as registros FROM materias_primas;

-- 3. AHORA: Habilitar RLS nuevamente
ALTER TABLE formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE missing_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE available_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE remitos ENABLE ROW LEVEL SECURITY;
ALTER TABLE remito_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE materias_primas ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas PERMISIVAS para usuarios autenticados
-- (Estas políticas permiten acceso a cualquier usuario autenticado)

-- Políticas para formulas
CREATE POLICY "Permitir acceso a fórmulas para usuarios autenticados" ON formulas
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para inventory_items
CREATE POLICY "Permitir acceso a inventario para usuarios autenticados" ON inventory_items
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para missing_ingredients
CREATE POLICY "Permitir acceso a ingredientes faltantes para usuarios autenticados" ON missing_ingredients
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para available_ingredients
CREATE POLICY "Permitir acceso a ingredientes disponibles para usuarios autenticados" ON available_ingredients
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para remitos
CREATE POLICY "Permitir acceso a remitos para usuarios autenticados" ON remitos
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para remito_items
CREATE POLICY "Permitir acceso a items de remito para usuarios autenticados" ON remito_items
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para materias_primas
CREATE POLICY "Permitir acceso a materias primas para usuarios autenticados" ON materias_primas
    FOR ALL USING (auth.role() = 'authenticated');

-- 5. Verificar que las políticas se crearon correctamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('formulas', 'inventory_items', 'missing_ingredients', 'available_ingredients', 'remitos', 'remito_items', 'materias_primas')
ORDER BY tablename, policyname;

-- 6. Crear un usuario de prueba si no existe
-- (Opcional - solo si necesitas probar la autenticación)
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES (
--     gen_random_uuid(),
--     'test@example.com',
--     crypt('testpassword123', gen_salt('bf')),
--     NOW(),
--     NOW(),
--     NOW()
-- );

-- 7. Verificar el estado final
SELECT 
    'RLS Status' as check_type,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('formulas', 'inventory_items', 'missing_ingredients', 'available_ingredients', 'remitos', 'remito_items', 'materias_primas')
AND schemaname = 'public';
