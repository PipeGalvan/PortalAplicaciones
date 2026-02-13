import { CheckCircle2, XCircle, Clock, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

export function HealthCheck({ environment, onCheck, result, isLoading }) {
  const getStatusIcon = () => {
    if (isLoading) {
      return <Loader2 className="w-5 h-5 animate-spin text-gray-400" />;
    }
    
    if (!result) {
      return <Clock className="w-5 h-5 text-gray-400" />;
    }
    
    switch (result.status) {
      case 'healthy':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'unhealthy':
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'timeout':
        return <XCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    if (isLoading) return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
    if (!result) return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
    
    switch (result.status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'unhealthy':
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'timeout':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getStatusText = () => {
    if (isLoading) return 'Verificando...';
    if (!result) return 'Verificar';
    if (result.message) return result.message;
    if (result.error) return result.error;
    return result.responseTime || 'Verificar';
  };

  const getTooltip = () => {
    if (!result) return 'Verificar estado del servidor';
    if (result.statusCode) {
      return `${result.message} - HTTP ${result.statusCode}\nTiempo: ${result.responseTime}\nURL: ${result.url || environment.url}`;
    }
    if (result.error) {
      return `${result.message}\nError: ${result.error}\nTiempo: ${result.responseTime}`;
    }
    return `Estado: ${result.message || result.status}\nTiempo: ${result.responseTime}`;
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onCheck(environment)}
        disabled={isLoading}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-help',
          getStatusColor(),
          isLoading && 'opacity-70 cursor-not-allowed'
        )}
        title={getTooltip()}
      >
        {getStatusIcon()}
        <span className="truncate max-w-[150px]">
          {getStatusText()}
        </span>
      </button>
    </div>
  );
}
