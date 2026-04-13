export default function Modal({ open, onClose, title, children, onSave, saveText = 'Save Changes', onCancel, cancelText = 'Close' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-gray-500/75" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        {title && (
          <h3 className="mb-4 text-xl font-bold text-gray-900">{title}</h3>
        )}
        {children}
        {(onSave || onCancel) && (
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {onCancel && (
              <button 
                onClick={onCancel}
                className="w-full rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50 sm:w-auto"
              >
                {cancelText}
              </button>
            )}
            {onSave && (
              <button 
                onClick={onSave}
                className="w-full rounded-lg bg-primary-500 px-5 py-2.5 font-medium text-white hover:bg-primary-600 sm:w-auto"
              >
                {saveText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-gray-500/75" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <div className="mb-5 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-100">
            <svg className="h-8 w-8 stroke-danger-500" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        <h3 className="mb-3 text-center text-xl font-bold text-gray-900">{title}</h3>
        <p className="mb-6 text-center text-gray-600">{message}</p>
        <div className="flex flex-col gap-3">
          <button 
            onClick={onConfirm}
            className="w-full rounded-lg bg-danger-500 px-5 py-2.5 font-medium text-white hover:bg-danger-600"
          >
            {confirmText}
          </button>
          <button 
            onClick={onClose}
            className="w-full rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AlertModal({ open, onClose, title, message, buttonText = 'Aceptar', type = 'info' }) {
  if (!open) return null;

  const styles = {
    info: { bg: 'bg-primary-100', stroke: 'stroke-primary-500' },
    success: { bg: 'bg-success-100', stroke: 'stroke-success-500' },
    warning: { bg: 'bg-warning-100', stroke: 'stroke-warning-500' },
    danger: { bg: 'bg-danger-100', stroke: 'stroke-danger-500' },
  };
  const style = styles[type] || styles.info;

  const icons = {
    info: <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    success: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
    warning: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />,
    danger: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-gray-500/75" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <div className="mb-5 flex items-center justify-center">
          <div className={`flex h-16 w-16 items-center justify-center rounded-full ${style.bg}`}>
            <svg className={`h-8 w-8 ${style.stroke}`} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {icons[type]}
            </svg>
          </div>
        </div>
        <h3 className="mb-3 text-center text-xl font-bold text-gray-900">{title}</h3>
        <p className="mb-6 text-center text-gray-600">{message}</p>
        <div className="flex justify-center">
          <button 
            onClick={onClose}
            className="w-full rounded-lg bg-primary-500 px-5 py-2.5 font-medium text-white hover:bg-primary-600"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}