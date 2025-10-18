// =============================================
// MIDDLEWARE DE SEGURIDAD
// =============================================

import { supabase } from '@/integrations/supabase/client';
import { containsSQLInjection, containsXSS, sanitizeString } from './validation';

export interface SecurityContext {
  userId?: string;
  userRole?: string;
  isAuthenticated: boolean;
  ipAddress?: string;
  userAgent?: string;
}

// =============================================
// MIDDLEWARE DE AUTENTICACIÓN
// =============================================

export const requireAuth = async (): Promise<SecurityContext> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      throw new Error('Usuario no autenticado');
    }

    return {
      userId: session.user.id,
      userRole: session.user.role || 'authenticated',
      isAuthenticated: true,
    };
  } catch (error) {
    console.error('Error de autenticación:', error);
    throw new Error('Error de autenticación');
  }
};

// =============================================
// MIDDLEWARE DE VALIDACIÓN DE DATOS
// =============================================

export const validateInput = (input: any, type: 'formula' | 'ingredient' | 'inventory' | 'envio'): boolean => {
  // Verificar SQL Injection
  const inputString = JSON.stringify(input);
  if (containsSQLInjection(inputString)) {
    console.warn('🚨 Intento de SQL Injection detectado:', input);
    return false;
  }

  // Verificar XSS
  if (containsXSS(inputString)) {
    console.warn('🚨 Intento de XSS detectado:', input);
    return false;
  }

  // Sanitizar strings
  if (typeof input === 'object' && input !== null) {
    for (const key in input) {
      if (typeof input[key] === 'string') {
        input[key] = sanitizeString(input[key]);
      }
    }
  }

  return true;
};

// =============================================
// MIDDLEWARE DE RATE LIMITING
// =============================================

const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (identifier: string, maxRequests: number = 100, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const key = identifier;
  
  const current = requestCounts.get(key);
  
  if (!current || now > current.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= maxRequests) {
    console.warn(`🚨 Rate limit excedido para ${identifier}`);
    return false;
  }
  
  current.count++;
  return true;
};

// =============================================
// MIDDLEWARE DE LOGGING DE SEGURIDAD
// =============================================

export const logSecurityEvent = (event: string, details: any, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    event,
    severity,
    details,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
  };

  console.log(`🔒 [${severity.toUpperCase()}] ${event}:`, logEntry);

  // En producción, enviar a un servicio de logging
  if (import.meta.env.PROD) {
    // Aquí podrías enviar a un servicio como Sentry, LogRocket, etc.
    // sendToLoggingService(logEntry);
  }
};

// =============================================
// MIDDLEWARE DE VALIDACIÓN DE PERMISOS
// =============================================

export const checkPermission = async (action: string, resource: string): Promise<boolean> => {
  try {
    const context = await requireAuth();
    
    // Verificar si el usuario tiene permisos para la acción
    const { data: permissions, error } = await supabase
      .from('user_permissions')
      .select('*')
      .eq('user_id', context.userId)
      .eq('action', action)
      .eq('resource', resource)
      .single();

    if (error || !permissions) {
      logSecurityEvent('PERMISSION_DENIED', { action, resource, userId: context.userId }, 'medium');
      return false;
    }

    return true;
  } catch (error) {
    logSecurityEvent('PERMISSION_CHECK_ERROR', { action, resource, error }, 'high');
    return false;
  }
};

// =============================================
// MIDDLEWARE DE VALIDACIÓN DE CORS
// =============================================

export const validateCORS = (origin: string): boolean => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:8081',
    'https://tu-dominio-produccion.com',
  ];

  return allowedOrigins.includes(origin);
};

// =============================================
// MIDDLEWARE DE VALIDACIÓN DE HEADERS
// =============================================

export const validateHeaders = (headers: Headers): boolean => {
  const requiredHeaders = ['content-type'];
  const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip', 'x-cluster-client-ip'];

  // Verificar headers requeridos
  for (const header of requiredHeaders) {
    if (!headers.get(header)) {
      logSecurityEvent('MISSING_HEADER', { header }, 'low');
      return false;
    }
  }

  // Verificar headers sospechosos
  for (const header of suspiciousHeaders) {
    if (headers.get(header)) {
      logSecurityEvent('SUSPICIOUS_HEADER', { header, value: headers.get(header) }, 'medium');
    }
  }

  return true;
};

// =============================================
// MIDDLEWARE DE VALIDACIÓN DE TAMAÑO DE REQUEST
// =============================================

export const validateRequestSize = (data: any, maxSizeKB: number = 1024): boolean => {
  const size = new Blob([JSON.stringify(data)]).size;
  const sizeKB = size / 1024;

  if (sizeKB > maxSizeKB) {
    logSecurityEvent('REQUEST_TOO_LARGE', { sizeKB, maxSizeKB }, 'medium');
    return false;
  }

  return true;
};

// =============================================
// MIDDLEWARE DE VALIDACIÓN DE CONTENT TYPE
// =============================================

export const validateContentType = (contentType: string): boolean => {
  const allowedTypes = [
    'application/json',
    'application/x-www-form-urlencoded',
    'multipart/form-data',
  ];

  const isValid = allowedTypes.some(type => contentType.includes(type));
  
  if (!isValid) {
    logSecurityEvent('INVALID_CONTENT_TYPE', { contentType }, 'medium');
  }

  return isValid;
};

// =============================================
// MIDDLEWARE DE VALIDACIÓN DE IP
// =============================================

export const validateIP = (ip: string): boolean => {
  // Lista de IPs bloqueadas (ejemplo)
  const blockedIPs = [
    '127.0.0.1', // Localhost (solo para desarrollo)
    '0.0.0.0',
  ];

  if (blockedIPs.includes(ip)) {
    logSecurityEvent('BLOCKED_IP', { ip }, 'high');
    return false;
  }

  // Validar formato de IP
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (!ipRegex.test(ip)) {
    logSecurityEvent('INVALID_IP_FORMAT', { ip }, 'medium');
    return false;
  }

  return true;
};

// =============================================
// MIDDLEWARE DE VALIDACIÓN DE USER AGENT
// =============================================

export const validateUserAgent = (userAgent: string): boolean => {
  // Lista de User Agents sospechosos
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /php/i,
  ];

  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
  
  if (isSuspicious) {
    logSecurityEvent('SUSPICIOUS_USER_AGENT', { userAgent }, 'medium');
  }

  return !isSuspicious;
};

// =============================================
// MIDDLEWARE DE VALIDACIÓN DE REFERER
// =============================================

export const validateReferer = (referer: string): boolean => {
  const allowedReferers = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:8081',
    'https://tu-dominio-produccion.com',
  ];

  const isValid = allowedReferers.some(allowed => referer.startsWith(allowed));
  
  if (!isValid) {
    logSecurityEvent('INVALID_REFERER', { referer }, 'medium');
  }

  return isValid;
};

// =============================================
// MIDDLEWARE DE VALIDACIÓN DE CSRF
// =============================================

export const validateCSRF = (token: string, sessionToken: string): boolean => {
  if (!token || !sessionToken) {
    logSecurityEvent('MISSING_CSRF_TOKEN', {}, 'high');
    return false;
  }

  if (token !== sessionToken) {
    logSecurityEvent('INVALID_CSRF_TOKEN', {}, 'high');
    return false;
  }

  return true;
};

// =============================================
// MIDDLEWARE DE VALIDACIÓN DE SESSION
// =============================================

export const validateSession = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      logSecurityEvent('INVALID_SESSION', { error }, 'high');
      return false;
    }

    // Verificar si la sesión ha expirado
    if (session.expires_at && new Date(session.expires_at) < new Date()) {
      logSecurityEvent('EXPIRED_SESSION', { expiresAt: session.expires_at }, 'medium');
      return false;
    }

    return true;
  } catch (error) {
    logSecurityEvent('SESSION_VALIDATION_ERROR', { error }, 'high');
    return false;
  }
};

// =============================================
// MIDDLEWARE DE VALIDACIÓN DE REQUEST COMPLETO
// =============================================

export const validateRequest = async (request: Request, data: any): Promise<{ isValid: boolean; errors: string[] }> => {
  const errors: string[] = [];

  try {
    // Validar headers
    if (!validateHeaders(request.headers)) {
      errors.push('Headers de request inválidos');
    }

    // Validar content type
    const contentType = request.headers.get('content-type') || '';
    if (!validateContentType(contentType)) {
      errors.push('Content type inválido');
    }

    // Validar tamaño de request
    if (!validateRequestSize(data)) {
      errors.push('Request demasiado grande');
    }

    // Validar input
    if (!validateInput(data, 'formula')) {
      errors.push('Input contiene contenido malicioso');
    }

    // Validar sesión
    if (!(await validateSession())) {
      errors.push('Sesión inválida o expirada');
    }

    // Validar rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(clientIP)) {
      errors.push('Demasiadas requests');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  } catch (error) {
    logSecurityEvent('REQUEST_VALIDATION_ERROR', { error }, 'high');
    return {
      isValid: false,
      errors: ['Error interno de validación']
    };
  }
};
