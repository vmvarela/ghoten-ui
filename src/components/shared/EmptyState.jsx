import React from 'react';
import { FolderOpen, Plus } from 'lucide-react';

export function EmptyState({ icon: Icon = FolderOpen, title, message, action = null }) {
  return (
    <div className="text-center py-12">
      <Icon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 mb-6">{message}</p>
      {action && (
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          {action}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
