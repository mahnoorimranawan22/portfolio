import { useCallback, useEffect, useRef, useState } from 'react';

/** Admin toast hook — returns { toast (node), show(message, type) }. */
export function useAdminToast() {
    const [toast, setToast] = useState(null);
    const timer = useRef(null);

    useEffect(() => () => clearTimeout(timer.current), []);

    // Stable identity so pages can depend on `show` in useCallback/useEffect
    // without re-running their data loads on every render.
    const show = useCallback((message, type = 'success') => {
        clearTimeout(timer.current);
        setToast({ message, type });
        timer.current = setTimeout(() => setToast(null), 3200);
    }, []);

    const node = toast && (
        <div className={`admin-toast admin-toast-${toast.type}`} role="status" aria-live="polite">
            <i
                className={toast.type === 'error' ? 'fas fa-circle-exclamation' : 'fas fa-circle-check'}
                aria-hidden="true"
            ></i>
            <span>{toast.message}</span>
        </div>
    );

    return { toast: node, show };
}
