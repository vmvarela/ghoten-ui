import React from 'react';
import { AlertCircle } from 'lucide-react';

export function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, isDangerous = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-lg max-w-md w-full border border-slate-700">
        <div className="p-6">
          {isDangerous && (
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
          )}
          <h2 className="text-lg font-bold text-white mb-2">{title}</h2>
          <p className="text-slate-400 mb-6">{message}</p>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                isDangerous
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
