import Modal from "react-modal";
import { LucideAlertTriangle, LucideX } from "lucide-react";

export type TaskConfirmModalProps = {
    isOpen: boolean;
    title: string;
    body: string;
    confirmLabel: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
};

const TaskConfirmModal = ({
    isOpen,
    title,
    body,
    confirmLabel,
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
}: TaskConfirmModalProps) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onCancel}
            contentLabel={title}
            shouldCloseOnOverlayClick={true}
            shouldCloseOnEsc={true}
            overlayClassName="fixed inset-0 z-[1000] flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-3"
            className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-4 shadow-xl outline-none sm:p-5"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-950 text-amber-300">
                        <LucideAlertTriangle className="h-4 w-4" strokeWidth={2} aria-hidden />
                    </span>
                    <h2 className="text-sm font-semibold text-zinc-100">{title}</h2>
                </div>
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-md p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                    aria-label="Close confirm dialog"
                >
                    <LucideX className="h-4 w-4" strokeWidth={2} aria-hidden />
                </button>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-zinc-400">{body}</p>
            <div className="mt-4 flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
                    aria-label={cancelLabel}
                >
                    {cancelLabel}
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                    aria-label={confirmLabel}
                >
                    {confirmLabel}
                </button>
            </div>
        </Modal>
    );
};

export default TaskConfirmModal;
