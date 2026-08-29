const ComponentConfirmModal = ({ isOpen, title, body, confirmLabel, onConfirm, onCancel }: { isOpen: boolean; title: string; body: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void; }) => {
    if (!isOpen) {
        return null;
    }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-4 shadow-xl">
                <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
                <p className="mt-1 text-xs text-zinc-400">{body}</p>
                <div className="mt-4 flex justify-end gap-2">
                    <button type="button" aria-label="Cancel" onClick={() => { onCancel(); }} className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700">Cancel</button>
                    <button type="button" aria-label={confirmLabel} onClick={() => { onConfirm(); }} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700">{confirmLabel}</button>
                </div>
            </div>
        </div>
    );
};
export default ComponentConfirmModal;
