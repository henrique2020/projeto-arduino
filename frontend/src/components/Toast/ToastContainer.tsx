// The ToastContainer rendering logic is integrated within the ToastProvider
// in src/context/ToastContext.tsx for simplicity.
//
// This file re-exports the ToastProvider and useToast hook for convenience
// when importing from the components directory.

export { ToastProvider, useToast } from '../../context/ToastContext';
