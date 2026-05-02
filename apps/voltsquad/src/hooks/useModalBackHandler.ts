import { useEffect } from "react";

/**
 * Pushes a history entry when a modal opens, and pops it on close.
 * If the user presses the browser back button, the modal closes instead of navigating away.
 */
export function useModalBackHandler(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;

    // Push a dummy state so "back" fires popstate instead of leaving the page
    const key = `modal-${Date.now()}`;
    window.history.pushState({ modal: key }, "");

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      // If the modal is being closed programmatically (not via back button),
      // remove the dummy history entry we added
      if (window.history.state?.modal === key) {
        window.history.back();
      }
    };
  }, [open, onClose]);
}

