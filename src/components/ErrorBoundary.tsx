import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Error capturado por ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="mt-2">
                <h3 className="font-semibold text-lg mb-2">
                  ¡Oops! Algo salió mal
                </h3>
                <p className="text-sm mb-4">
                  Ha ocurrido un error inesperado en la aplicación. 
                  Esto puede deberse a problemas de conexión o permisos.
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={this.handleRetry}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reintentar
                  </Button>
                  <Button 
                    onClick={this.handleReload}
                    variant="default"
                    size="sm"
                  >
                    Recargar página
                  </Button>
                </div>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-xs font-mono">
                      Detalles del error (desarrollo)
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                )}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para manejar errores de forma programática
export const useErrorHandler = () => {
  const handleError = (error: Error, context?: string) => {
    console.error(`🚨 Error en ${context || 'aplicación'}:`, error);
    
    // Si es un error de autenticación, redirigir al login
    if (error.message?.includes('403') || error.message?.includes('JWT')) {
      console.log('🔄 Error de autenticación detectado, redirigiendo al login...');
      window.location.href = '/login';
      return;
    }

    // Si es un error de red, mostrar mensaje
    if (error.message?.includes('Failed to fetch') || error.message?.includes('Network')) {
      console.log('🌐 Error de red detectado');
      // Aquí podrías mostrar un toast o notificación
      return;
    }

    // Para otros errores, re-lanzar para que sea manejado por el ErrorBoundary
    throw error;
  };

  return { handleError };
};
