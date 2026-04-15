export default function Dialog({ isOpen, onClose, title, children, size = 'lg' }) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-500/75" onClick={onClose} />
      <div className={`relative z-10 w-full rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl ${sizeClasses[size] || 'max-w-lg'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 text-xl"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}