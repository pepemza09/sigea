import { useEffect, useRef } from 'react';

export default function Dialog({ isOpen, onClose, title, children, size = 'lg' }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      window.dialog?.showModal?.call(dialogRef.current);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    full: 'max-w-full'
  };

  return (
    <el-dialog
      ref={dialogRef}
      className="fixed inset-0 size-auto max-h-none max-w-none overflow-y-auto bg-transparent backdrop:bg-transparent"
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <dialog-backdrop class="fixed inset-0 bg-gray-500/75 transition-opacity" />
      <div tabIndex={-1} className="flex min-h-full items-end justify-center p-4 text-center focus:outline-none sm:items-center sm:p-0">
        <el-dialog-panel className={`relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full ${sizeClasses[size] || 'max-w-lg'} data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:data-closed:sm:translate-y-0 sm:data-closed:sm:scale-95`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
              <button 
                type="button" 
                command="close" 
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                ✕
              </button>
            </div>
            {children}
          </div>
        </el-dialog-panel>
      </div>
    </el-dialog>
  );
}