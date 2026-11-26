import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../components/ui/ConfirmDialog";

const UnsavedChangesContext = createContext({
    isDirty: false,
    setIsDirty: () => {},
    confirmNavigation: (action) => action(),
});

export const UnsavedChangesProvider = ({ children }) => {
    const [isDirty, setIsDirty] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    // Protect tab close / reload
    useEffect(() => {
        if (!isDirty) return;
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = "";
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty]);

    const confirmNavigation = useCallback(
        (action) => {
            if (!isDirty) {
                action();
                return;
            }
            setPendingAction(() => action);
        },
        [isDirty]
    );

    const handleDiscard = () => {
        const action = pendingAction;
        setPendingAction(null);
        setIsDirty(false);
        action?.();
    };

    return (
        <UnsavedChangesContext.Provider value={{ isDirty, setIsDirty, confirmNavigation }}>
            <ConfirmDialog
                open={Boolean(pendingAction)}
                title="Discard unsaved changes?"
                message="You have unsaved edits on this page. Leaving now will discard them."
                confirmLabel="Discard Changes"
                onConfirm={handleDiscard}
                onCancel={() => setPendingAction(null)}
            />
            {children}
        </UnsavedChangesContext.Provider>
    );
};

/**
 * Registers a form's dirty state with the Mod Studio navigation guard
 * and enables browser beforeunload protection.
 */
export const useUnsavedChanges = (dirty) => {
    const { setIsDirty, confirmNavigation } = useContext(UnsavedChangesContext);
    const navigate = useNavigate();

    useEffect(() => {
        setIsDirty(Boolean(dirty));
        return () => setIsDirty(false);
    }, [dirty, setIsDirty]);

    const guardedNavigate = useCallback(
        (to) => confirmNavigation(() => navigate(to)),
        [confirmNavigation, navigate]
    );

    return { confirmNavigation, guardedNavigate };
};

export const useUnsavedContext = () => useContext(UnsavedChangesContext);
