
type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'default' | 'danger';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmVariant = 'default',
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />

      {/* Panel */}
      <div className="relative w-[92%] max-w-md rounded-xl bg-slate-900 p-5 shadow-2xl ring-1 ring-black/30">
        <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        {description && <p className="mt-2 text-sm text-slate-300">{description}</p>}

        <div className="mt-5 flex justify-end gap-3">
          <button
            className="rounded-md bg-slate-700 px-4 py-2 text-slate-100 hover:bg-slate-600"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            className={
              `rounded-md px-4 py-2 font-medium text-white ${
                confirmVariant === 'danger'
                  ? 'bg-rose-600 hover:bg-rose-500'
                  : 'bg-purple-600 hover:bg-purple-500'
              } ${loading ? 'opacity-60' : ''}`
            }
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Procesando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
