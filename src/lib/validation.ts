// =============================================
// VALIDACIÓN DE DATOS - SEGURIDAD
// =============================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// =============================================
// VALIDACIÓN DE FÓRMULAS
// =============================================

export const validateFormula = (formula: any): ValidationResult => {
  const errors: string[] = [];

  // Validar ID
  if (!formula.id || typeof formula.id !== 'string') {
    errors.push('ID de fórmula es requerido y debe ser una cadena');
  } else if (formula.id.length < 3 || formula.id.length > 50) {
    errors.push('ID de fórmula debe tener entre 3 y 50 caracteres');
  } else if (!/^[a-zA-Z0-9-_]+$/.test(formula.id)) {
    errors.push('ID de fórmula solo puede contener letras, números, guiones y guiones bajos');
  }

  // Validar nombre
  if (!formula.name || typeof formula.name !== 'string') {
    errors.push('Nombre de fórmula es requerido');
  } else if (formula.name.length < 2 || formula.name.length > 100) {
    errors.push('Nombre de fórmula debe tener entre 2 y 100 caracteres');
  } else if (!/^[a-zA-Z0-9\s\-_áéíóúÁÉÍÓÚñÑ]+$/.test(formula.name)) {
    errors.push('Nombre de fórmula contiene caracteres no válidos');
  }

  // Validar batch size
  if (typeof formula.batchSize !== 'number' || formula.batchSize <= 0) {
    errors.push('Tamaño de lote debe ser un número positivo');
  } else if (formula.batchSize > 10000) {
    errors.push('Tamaño de lote no puede ser mayor a 10,000 kg');
  }

  // Validar destino
  const validDestinations = ['Villa Martelli', 'Florencio Varela'];
  if (!formula.destination || !validDestinations.includes(formula.destination)) {
    errors.push('Destino debe ser "Villa Martelli" o "Florencio Varela"');
  }

  // Validar estado
  const validStatuses = ['available', 'incomplete'];
  if (!formula.status || !validStatuses.includes(formula.status)) {
    errors.push('Estado debe ser uno de: available, incomplete');
  }

  // Validar tipo
  const validTypes = ['stock', 'client', 'cliente', 'exportacion'];
  if (!formula.type || !validTypes.includes(formula.type)) {
    errors.push('Tipo debe ser uno de: stock, client, cliente, exportacion');
  }

  // Validar fecha
  if (formula.date) {
    const date = new Date(formula.date);
    if (isNaN(date.getTime())) {
      errors.push('Fecha debe ser una fecha válida');
    } else if (date > new Date()) {
      errors.push('Fecha no puede ser futura');
    }
  }

  // Validar nombre de cliente si es tipo cliente
  if (formula.type === 'client' || formula.type === 'cliente') {
    if (!formula.clientName || typeof formula.clientName !== 'string') {
      errors.push('Nombre de cliente es requerido para fórmulas de tipo cliente');
    } else if (formula.clientName.length < 2 || formula.clientName.length > 100) {
      errors.push('Nombre de cliente debe tener entre 2 y 100 caracteres');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// =============================================
// VALIDACIÓN DE INGREDIENTES FALTANTES
// =============================================

export const validateMissingIngredient = (ingredient: any): ValidationResult => {
  const errors: string[] = [];

  // Validar nombre
  if (!ingredient.name || typeof ingredient.name !== 'string') {
    errors.push('Nombre de ingrediente es requerido');
  } else if (ingredient.name.length < 2 || ingredient.name.length > 100) {
    errors.push('Nombre de ingrediente debe tener entre 2 y 100 caracteres');
  } else if (!/^[a-zA-Z0-9\s\-_áéíóúÁÉÍÓÚñÑ]+$/.test(ingredient.name)) {
    errors.push('Nombre de ingrediente contiene caracteres no válidos');
  }

  // Validar cantidad requerida
  if (typeof ingredient.required !== 'number' || ingredient.required <= 0) {
    errors.push('Cantidad requerida debe ser un número positivo');
  } else if (ingredient.required > 1000) {
    errors.push('Cantidad requerida no puede ser mayor a 1,000');
  }

  // Validar unidad
  const validUnits = ['kg', 'g', 'L', 'ml', 'unidades'];
  if (!ingredient.unit || !validUnits.includes(ingredient.unit)) {
    errors.push('Unidad debe ser una de: kg, g, L, ml, unidades');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// =============================================
// VALIDACIÓN DE ITEMS DE INVENTARIO
// =============================================

export const validateInventoryItem = (item: any): ValidationResult => {
  const errors: string[] = [];

  // Validar nombre
  if (!item.name || typeof item.name !== 'string') {
    errors.push('Nombre de item es requerido');
  } else if (item.name.length < 2 || item.name.length > 100) {
    errors.push('Nombre de item debe tener entre 2 y 100 caracteres');
  }

  // Validar certificado
  if (!item.certificate || typeof item.certificate !== 'string') {
    errors.push('Certificado es requerido');
  } else if (item.certificate.length < 3 || item.certificate.length > 50) {
    errors.push('Certificado debe tener entre 3 y 50 caracteres');
  }

  // Validar stock actual
  if (typeof item.currentStock !== 'number' || item.currentStock < 0) {
    errors.push('Stock actual debe ser un número no negativo');
  }

  // Validar stock mínimo
  if (typeof item.minStock !== 'number' || item.minStock < 0) {
    errors.push('Stock mínimo debe ser un número no negativo');
  }

  // Validar stock máximo
  if (typeof item.maxStock !== 'number' || item.maxStock < 0) {
    errors.push('Stock máximo debe ser un número no negativo');
  }

  // Validar que stock mínimo no sea mayor que máximo
  if (item.minStock > item.maxStock) {
    errors.push('Stock mínimo no puede ser mayor que stock máximo');
  }

  // Validar ubicación
  if (!item.location || typeof item.location !== 'string') {
    errors.push('Ubicación es requerida');
  } else if (item.location.length < 2 || item.location.length > 50) {
    errors.push('Ubicación debe tener entre 2 y 50 caracteres');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// =============================================
// VALIDACIÓN DE ENVÍOS
// =============================================

export const validateEnvio = (envio: any): ValidationResult => {
  const errors: string[] = [];

  // Validar número de envío
  if (!envio.numero_envio || typeof envio.numero_envio !== 'string') {
    errors.push('Número de envío es requerido');
  } else if (!/^ENV-\d{4}-\d{2}-\d{2}-\d{4}$/.test(envio.numero_envio)) {
    errors.push('Número de envío debe tener formato ENV-YYYY-MM-DD-XXXX');
  }

  // Validar destino
  const validDestinations = ['Villa Martelli', 'Florencio Varela'];
  if (!envio.destino || !validDestinations.includes(envio.destino)) {
    errors.push('Destino debe ser "Villa Martelli" o "Florencio Varela"');
  }

  // Validar estado
  const validStatuses = ['pendiente', 'en_transito', 'entregado', 'cancelado'];
  if (!envio.estado || !validStatuses.includes(envio.estado)) {
    errors.push('Estado debe ser uno de: pendiente, en_transito, entregado, cancelado');
  }

  // Validar total kilos
  if (typeof envio.total_kilos !== 'number' || envio.total_kilos < 0) {
    errors.push('Total de kilos debe ser un número no negativo');
  }

  // Validar total remitos
  if (typeof envio.total_remitos !== 'number' || envio.total_remitos < 0) {
    errors.push('Total de remitos debe ser un número no negativo');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// =============================================
// FUNCIONES DE SANITIZACIÓN
// =============================================

export const sanitizeString = (str: string): string => {
  return str
    .trim()
    .replace(/[<>]/g, '') // Remover caracteres HTML peligrosos
    .replace(/javascript:/gi, '') // Remover javascript: URLs
    .replace(/on\w+=/gi, ''); // Remover event handlers
};

export const sanitizeNumber = (num: any): number => {
  const parsed = parseFloat(num);
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
};

// =============================================
// VALIDACIÓN DE SQL INJECTION
// =============================================

export const containsSQLInjection = (input: string): boolean => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\s+'.*?'\s*=\s*'.*?')/i,
    /(\b(OR|AND)\s+".*?"\s*=\s*".*?")/i,
    /(UNION\s+SELECT)/i,
    /(DROP\s+TABLE)/i,
    /(DELETE\s+FROM)/i,
    /(INSERT\s+INTO)/i,
    /(UPDATE\s+SET)/i,
    /(ALTER\s+TABLE)/i,
    /(CREATE\s+TABLE)/i,
    /(EXEC\s*\()/i,
    /(SCRIPT\s*\()/i,
    /(--|\/\*|\*\/)/,
    /(;|\||&)/,
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
};

// =============================================
// VALIDACIÓN DE XSS
// =============================================

export const containsXSS = (input: string): boolean => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,
    /<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
    /onmouseover\s*=/gi,
    /onfocus\s*=/gi,
    /onblur\s*=/gi,
    /onchange\s*=/gi,
    /onsubmit\s*=/gi,
    /onreset\s*=/gi,
    /onselect\s*=/gi,
    /onkeydown\s*=/gi,
    /onkeyup\s*=/gi,
    /onkeypress\s*=/gi,
  ];

  return xssPatterns.some(pattern => pattern.test(input));
};
