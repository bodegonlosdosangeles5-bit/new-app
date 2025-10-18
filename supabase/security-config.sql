-- =============================================
-- CONFIGURACIÓN DE SEGURIDAD SUPABASE
-- =============================================

-- =============================================
-- CONFIGURACIÓN DE AUTENTICACIÓN
-- =============================================

-- Configurar políticas de contraseña
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Política para usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden ver su propio perfil" ON auth.users
    FOR SELECT USING (auth.uid() = id);

-- =============================================
-- CONFIGURACIÓN DE RLS PARA TABLAS PÚBLICAS
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
-- POLÍTICAS DE SEGURIDAD PARA FORMULAS
-- =============================================

-- Solo usuarios autenticados pueden ver fórmulas
CREATE POLICY "Solo usuarios autenticados pueden ver fórmulas" ON formulas
    FOR SELECT USING (auth.role() = 'authenticated');

-- Solo usuarios autenticados pueden crear fórmulas
CREATE POLICY "Solo usuarios autenticados pueden crear fórmulas" ON formulas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Solo usuarios autenticados pueden actualizar fórmulas
CREATE POLICY "Solo usuarios autenticados pueden actualizar fórmulas" ON formulas
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Solo usuarios autenticados pueden eliminar fórmulas
CREATE POLICY "Solo usuarios autenticados pueden eliminar fórmulas" ON formulas
    FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- POLÍTICAS DE SEGURIDAD PARA INVENTARIO
-- =============================================

CREATE POLICY "Solo usuarios autenticados pueden ver inventario" ON inventory_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden crear inventario" ON inventory_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden actualizar inventario" ON inventory_items
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden eliminar inventario" ON inventory_items
    FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- POLÍTICAS DE SEGURIDAD PARA INGREDIENTES FALTANTES
-- =============================================

CREATE POLICY "Solo usuarios autenticados pueden ver ingredientes faltantes" ON missing_ingredients
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden crear ingredientes faltantes" ON missing_ingredients
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden actualizar ingredientes faltantes" ON missing_ingredients
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden eliminar ingredientes faltantes" ON missing_ingredients
    FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- POLÍTICAS DE SEGURIDAD PARA INGREDIENTES DISPONIBLES
-- =============================================

CREATE POLICY "Solo usuarios autenticados pueden ver ingredientes disponibles" ON available_ingredients
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden crear ingredientes disponibles" ON available_ingredients
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden actualizar ingredientes disponibles" ON available_ingredients
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden eliminar ingredientes disponibles" ON available_ingredients
    FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- POLÍTICAS DE SEGURIDAD PARA ENVÍOS
-- =============================================

CREATE POLICY "Solo usuarios autenticados pueden ver envíos" ON envios
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden crear envíos" ON envios
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden actualizar envíos" ON envios
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden eliminar envíos" ON envios
    FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- POLÍTICAS DE SEGURIDAD PARA REMITOS
-- =============================================

CREATE POLICY "Solo usuarios autenticados pueden ver remitos" ON remitos
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden crear remitos" ON remitos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden actualizar remitos" ON remitos
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden eliminar remitos" ON remitos
    FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- POLÍTICAS DE SEGURIDAD PARA ITEMS DE REMITO
-- =============================================

CREATE POLICY "Solo usuarios autenticados pueden ver items de remito" ON remito_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden crear items de remito" ON remito_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden actualizar items de remito" ON remito_items
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden eliminar items de remito" ON remito_items
    FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- POLÍTICAS DE SEGURIDAD PARA ENVÍOS-REMITOS
-- =============================================

CREATE POLICY "Solo usuarios autenticados pueden ver envíos-remitos" ON envios_remitos
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden crear envíos-remitos" ON envios_remitos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden actualizar envíos-remitos" ON envios_remitos
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden eliminar envíos-remitos" ON envios_remitos
    FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- POLÍTICAS DE SEGURIDAD PARA MATERIAS PRIMAS
-- =============================================

CREATE POLICY "Solo usuarios autenticados pueden ver materias primas" ON materias_primas
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden crear materias primas" ON materias_primas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden actualizar materias primas" ON materias_primas
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden eliminar materias primas" ON materias_primas
    FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- POLÍTICAS DE SEGURIDAD PARA TEST_CONNECTION
-- =============================================

CREATE POLICY "Solo usuarios autenticados pueden ver test_connection" ON test_connection
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden crear test_connection" ON test_connection
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden actualizar test_connection" ON test_connection
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden eliminar test_connection" ON test_connection
    FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- CONFIGURACIÓN DE FUNCIONES DE SEGURIDAD
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

-- Función para verificar permisos de usuario
CREATE OR REPLACE FUNCTION auth.has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Por ahora, todos los usuarios autenticados tienen todos los permisos
  -- En el futuro, esto se puede conectar con una tabla de permisos
  RETURN auth.role() = 'authenticated';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- CONFIGURACIÓN DE TRIGGERS DE SEGURIDAD
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

-- Aplicar trigger a tabla de fórmulas
CREATE TRIGGER formulas_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON formulas
  FOR EACH ROW EXECUTE FUNCTION audit_formulas_changes();

-- =============================================
-- CONFIGURACIÓN DE ÍNDICES DE SEGURIDAD
-- =============================================

-- Índices para mejorar rendimiento de consultas de seguridad
CREATE INDEX IF NOT EXISTS idx_formulas_user_id ON formulas(id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_user_id ON inventory_items(id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);

-- =============================================
-- CONFIGURACIÓN DE VISTAS DE SEGURIDAD
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
-- CONFIGURACIÓN DE ALERTAS DE SEGURIDAD
-- =============================================

-- Función para detectar actividad sospechosa
CREATE OR REPLACE FUNCTION detect_suspicious_activity()
RETURNS TRIGGER AS $$
DECLARE
  request_count INTEGER;
BEGIN
  -- Contar requests del usuario en la última hora
  SELECT COUNT(*) INTO request_count
  FROM audit_log
  WHERE user_id = auth.uid()
    AND timestamp > NOW() - INTERVAL '1 hour';

  -- Si hay más de 1000 requests en una hora, es sospechoso
  IF request_count > 1000 THEN
    INSERT INTO security_alerts (
      alert_type,
      description,
      user_id,
      severity,
      timestamp
    ) VALUES (
      'HIGH_REQUEST_RATE',
      'Usuario con alta frecuencia de requests: ' || request_count || ' en la última hora',
      auth.uid(),
      'HIGH',
      NOW()
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Aplicar trigger de detección de actividad sospechosa
CREATE TRIGGER detect_suspicious_activity_trigger
  AFTER INSERT ON audit_log
  FOR EACH ROW EXECUTE FUNCTION detect_suspicious_activity();

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

-- Programar limpieza automática (ejecutar diariamente)
-- Esto se puede configurar en el dashboard de Supabase o con pg_cron
