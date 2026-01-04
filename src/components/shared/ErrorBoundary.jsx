import React from 'react';
import { AlertCircle } from 'lucide-react';

export function ErrorBoundary({ children, fallback = null }) {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const handleError = (event) => {
      setHasError(true);
      setError(event.error?.message || 'An unexpected error occurred');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      fallback || (
        <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-400">Error</h3>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )
    );
  }

  return children;
}

export default ErrorBoundary;
