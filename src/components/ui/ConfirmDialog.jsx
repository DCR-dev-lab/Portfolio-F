import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

/**
 * ConfirmDialog — reusable delete / destructive action confirmation modal.
 *
 * Props:
 *   open        {boolean}   Whether the dialog is visible
 *   title       {string}    Dialog heading
 *   message     {string}    Body text
 *   confirmLabel {string}   Text on the confirm button (default "Delete")
 *   onConfirm   {function}  Called when user clicks confirm
 *   onCancel    {function}  Called when user clicks cancel or presses Escape
 *   loading     {boolean}   Shows a spinner on the confirm button while processing
 */
const ConfirmDialog = ({
    open,
    title = "Are you sure?",
    message = "This action cannot be undone.",
    confirmLabel = "Delete",
    onConfirm,
    onCancel,
    loading = false,
}) => {
    const cancelRef = useRef(null);

    // Focus cancel button when dialog opens (accessibility)
    useEffect(() => {
        if (open) cancelRef.current?.focus();
    }, [open]);

    // Close on Escape key
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === "Escape") onCancel?.(); };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open, onCancel]);

    if (!open) return null;

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 px-4"
            onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
        >
            {/* Panel */}
            <div className="w-full max-w-sm rounded-xl border border-stone-800/80 bg-stone-950 p-6">
                {/* Header */}
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-950/60">
                            <AlertTriangle size={18} className="text-red-400" />
                        </div>
                        <h2 id="confirm-title" className="text-base font-semibold text-cream">
                            {title}
                        </h2>
                    </div>
                    <button
                        onClick={onCancel}
                        className="shrink-0 rounded p-1 text-stone-500 transition-colors hover:text-stone-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:opacity-80"
                        aria-label="Close"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Message */}
                <p className="mb-6 text-sm leading-relaxed text-stone-400">{message}</p>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button
                        ref={cancelRef}
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded-lg border border-stone-700/70 px-4 py-2 text-sm font-medium text-stone-400 transition-colors hover:border-stone-600 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:opacity-80 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-[background-color,transform] hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading && (
                            <span className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none rounded-full border-2 border-white/30 border-t-white" />
                        )}
                        {loading ? "Deleting…" : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
