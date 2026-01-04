import React from 'react';
import { Loader } from 'lucide-react';

export function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader className="w-8 h-8 animate-spin text-blue-400 mb-4" />
      <p className="text-slate-400">{message}</p>
    </div>
  );
}

export default LoadingSpinner;
