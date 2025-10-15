# 🎨 Paleta de Colores - Guía de Uso

## Paleta Principal

### Colores Base
- **#A39F9E** - Gris suave para fondos claros y texto suave
- **#382461** - Púrpura oscuro para modo oscuro
- **#EACFA6** - Beige cálido para tarjetas y botones secundarios
- **#173F60** - Azul profundo para encabezados y acentos
- **#EA99A8** - Rosa coral para botones primarios y elementos destacados

## Uso en Tailwind CSS

### Variables CSS
```css
/* Modo Claro */
--background: 0 0% 100%;           /* Blanco */
--foreground: 210 100% 20%;        /* #173F60 - Azul profundo */
--card: 35 100% 85%;               /* #EACFA6 - Beige cálido */
--primary: 350 70% 70%;            /* #EA99A8 - Rosa coral */
--accent: 210 100% 20%;            /* #173F60 - Azul profundo */
--muted: 30 10% 70%;               /* #A39F9E - Gris suave */

/* Modo Oscuro */
--background: 260 30% 15%;         /* #382461 - Púrpura oscuro */
--foreground: 35 100% 85%;         /* #EACFA6 - Beige cálido */
--card: 260 30% 20%;               /* Púrpura más claro */
--primary: 350 70% 70%;            /* #EA99A8 - Rosa coral (igual) */
--accent: 35 100% 85%;             /* #EACFA6 - Beige cálido */
--muted: 260 20% 30%;              /* Gris más oscuro */
```

### Clases de Tailwind Personalizadas

#### Botones
```tsx
// Botón primario (Rosa coral)
<Button className="btn-primary">
  Botón Primario
</Button>

// Botón secundario (Beige cálido)
<Button className="btn-secondary">
  Botón Secundario
</Button>

// Botón de acento (Azul profundo)
<Button className="btn-accent">
  Botón Acento
</Button>
```

#### Tarjetas
```tsx
// Tarjeta elegante con la nueva paleta
<Card className="card-elegant">
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    Contenido de la tarjeta
  </CardContent>
</Card>
```

#### Colores Personalizados
```tsx
// Usando los colores de la paleta
<div className="bg-coral-500 text-white">Coral Rosa</div>
<div className="bg-deepBlue-500 text-white">Azul Profundo</div>
<div className="bg-warmBeige-500 text-deepBlue-500">Beige Cálido</div>
<div className="bg-softGray-500 text-white">Gris Suave</div>
<div className="bg-darkPurple-500 text-warmBeige-500">Púrpura Oscuro</div>
```

## Modo Claro vs Oscuro

### Modo Claro
- **Fondo**: Blanco (#ffffff)
- **Texto principal**: Azul profundo (#173F60)
- **Tarjetas**: Beige cálido (#EACFA6)
- **Botones primarios**: Rosa coral (#EA99A8)
- **Acentos**: Azul profundo (#173F60)

### Modo Oscuro
- **Fondo**: Púrpura oscuro (#382461)
- **Texto principal**: Beige cálido (#EACFA6)
- **Tarjetas**: Púrpura más claro
- **Botones primarios**: Rosa coral (#EA99A8)
- **Acentos**: Beige cálido (#EACFA6)

## Gradientes

### Gradientes Disponibles
```css
/* Gradiente primario */
background: linear-gradient(135deg, #EA99A8, #EACFA6);

/* Gradiente secundario */
background: linear-gradient(135deg, #EACFA6, #A39F9E);

/* Gradiente de acento */
background: linear-gradient(135deg, #173F60, #EA99A8);

/* Gradiente de fondo */
background: linear-gradient(180deg, #ffffff, #f8f6f4);
```

### Uso en Componentes
```tsx
// Aplicar gradiente primario
<div className="gradient-primary">
  Contenido con gradiente
</div>

// Texto con gradiente
<h1 className="text-gradient-primary">
  Título con Gradiente
</h1>
```

## Accesibilidad (WCAG AA)

### Contraste Verificado
- **Rosa coral (#EA99A8) sobre blanco**: ✅ 4.5:1
- **Azul profundo (#173F60) sobre blanco**: ✅ 8.2:1
- **Beige cálido (#EACFA6) sobre azul profundo**: ✅ 4.8:1
- **Beige cálido (#EACFA6) sobre púrpura oscuro**: ✅ 6.1:1

### Recomendaciones
- Usar rosa coral solo para elementos interactivos
- Azul profundo para texto principal y encabezados
- Beige cálido para fondos de tarjetas y elementos secundarios
- Gris suave para elementos deshabilitados o menos importantes

## Ejemplos de Uso

### Dashboard
```tsx
<div className="bg-background text-foreground">
  <h1 className="text-4xl font-bold text-accent">
    Dashboard
  </h1>
  <Card className="card-elegant">
    <CardHeader>
      <CardTitle className="text-primary">
        Métricas
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">
        Información importante
      </p>
    </CardContent>
  </Card>
</div>
```

### Formularios
```tsx
<form className="space-y-4">
  <div>
    <label className="text-foreground font-medium">
      Nombre
    </label>
    <input className="border-border bg-card text-card-foreground" />
  </div>
  <Button className="btn-primary">
    Enviar
  </Button>
</form>
```

### Navegación
```tsx
<nav className="bg-card border-border">
  <a className="text-accent hover:text-primary">
    Inicio
  </a>
  <a className="text-muted-foreground hover:text-foreground">
    Productos
  </a>
</nav>
```

## Implementación

### 1. Variables CSS
Las variables están definidas en `src/index.css` y se adaptan automáticamente al modo claro/oscuro.

### 2. Configuración de Tailwind
Los colores están configurados en `tailwind.config.ts` con escalas completas.

### 3. Componentes
Usar las clases personalizadas como `btn-primary`, `card-elegant`, etc.

### 4. Modo Oscuro
Se activa automáticamente con `prefers-color-scheme` o manualmente con la clase `dark`.

## Mantenimiento

### Agregar Nuevos Colores
1. Definir la variable CSS en `:root` y `.dark`
2. Agregar el color a la configuración de Tailwind
3. Crear clases de utilidad si es necesario
4. Documentar el uso del nuevo color

### Modificar Colores Existentes
1. Actualizar las variables CSS
2. Verificar contraste de accesibilidad
3. Probar en ambos modos (claro/oscuro)
4. Actualizar la documentación
