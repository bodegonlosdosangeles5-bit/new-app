-- =============================================
-- CONFIGURACIÓN INICIAL DE SEGURIDAD SUPABASE
-- =============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CONFIGURACIÓN DE AUTENTICACIÓN
-- =============================================

-- Configurar políticas de contraseña más estrictas
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Política para usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden ver su propio perfil" ON auth.users
    FOR SELECT USING (auth.uid() = id);

-- =============================================
-- HABILITAR RLS EN TODAS LAS TABLAS
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
-- POLÍTICAS BÁSICAS DE SEGURIDAD
-- =============================================

-- Solo usuarios autenticados pueden acceder a los datos
CREATE POLICY "Solo usuarios autenticados pueden acceder a fórmulas" ON formulas
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden acceder a inventario" ON inventory_items
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden acceder a ingredientes faltantes" ON missing_ingredients
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden acceder a ingredientes disponibles" ON available_ingredients
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden acceder a envíos" ON envios
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden acceder a remitos" ON remitos
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden acceder a items de remito" ON remito_items
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden acceder a envíos-remitos" ON envios_remitos
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden acceder a materias primas" ON materias_primas
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden acceder a test_connection" ON test_connection
    FOR ALL USING (auth.role() = 'authenticated');

-- =============================================
-- FUNCIONES DE SEGURIDAD
-- =============================================

-- Función para verificar si un usuario está autenticado
CREATE OR REPLACE FUNCTION auth.is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.role() = 'authenticated';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener el ID del usuario actual
CREATE OR REPLACE FUNCTION auth.current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- TABLA DE AUDITORÍA
-- =============================================

-- Crear tabla de auditoría
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES auth.users(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en tabla de auditoría
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Solo administradores pueden ver logs de auditoría
CREATE POLICY "Solo administradores pueden ver audit_log" ON audit_log
    FOR SELECT USING (auth.role() = 'service_role');

-- =============================================
-- TRIGGER DE AUDITORÍA PARA FORMULAS
-- =============================================

-- Trigger para auditar cambios en fórmulas
CREATE OR REPLACE FUNCTION audit_formulas_changes()
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
    'formulas',
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END,
    auth.uid(),
    NOW()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger a tabla de fórmulas
DROP TRIGGER IF EXISTS formulas_audit_trigger ON formulas;
CREATE TRIGGER formulas_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON formulas
  FOR EACH ROW EXECUTE FUNCTION audit_formulas_changes();

-- =============================================
-- ÍNDICES DE SEGURIDAD
-- =============================================

-- Índices para mejorar rendimiento de consultas de seguridad
CREATE INDEX IF NOT EXISTS idx_formulas_user_id ON formulas(id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_user_id ON inventory_items(id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);

-- =============================================
-- CONFIGURACIÓN DE ALERTAS DE SEGURIDAD
-- =============================================

-- Crear tabla de alertas de seguridad
CREATE TABLE IF NOT EXISTS security_alerts (
  id SERIAL PRIMARY KEY,
  alert_type TEXT NOT NULL,
  description TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE
);

-- Habilitar RLS en tabla de alertas
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;

-- Solo administradores pueden ver alertas de seguridad
CREATE POLICY "Solo administradores pueden ver security_alerts" ON security_alerts
    FOR SELECT USING (auth.role() = 'service_role');

-- =============================================
-- VISTA DE ESTADÍSTICAS DE SEGURIDAD
-- =============================================

-- Vista para estadísticas de seguridad (solo para administradores)
CREATE OR REPLACE VIEW security_stats AS
SELECT
  COUNT(*) as total_requests,
  COUNT(CASE WHEN timestamp > NOW() - INTERVAL '1 hour' THEN 1 END) as requests_last_hour,
  COUNT(CASE WHEN timestamp > NOW() - INTERVAL '1 day' THEN 1 END) as requests_last_day,
  COUNT(DISTINCT user_id) as unique_users
FROM audit_log
WHERE timestamp > NOW() - INTERVAL '7 days';

-- Política de seguridad para la vista
CREATE POLICY "Solo administradores pueden ver security_stats" ON security_stats
    FOR SELECT USING (auth.role() = 'service_role');

-- =============================================
-- CONFIGURACIÓN DE LIMPIEZA AUTOMÁTICA
-- =============================================

-- Función para limpiar logs antiguos
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS VOID AS $$
BEGIN
  -- Eliminar logs de auditoría más antiguos de 90 días
  DELETE FROM audit_log WHERE timestamp < NOW() - INTERVAL '90 days';
  
  -- Eliminar alertas resueltas más antiguas de 30 días
  DELETE FROM security_alerts 
  WHERE resolved = TRUE AND timestamp < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
