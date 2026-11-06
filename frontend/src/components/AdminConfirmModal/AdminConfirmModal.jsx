import { useEffect } from "react";
import "./AdminConfirmModal.css";

const AdminConfirmModal = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  eyebrow = "Confirmation required",
  loadingLabel = "Saving...",
  closeLabel = "Close",
  variant = "success",
  loading = false,
  onConfirm,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) {
    return null;
  }

  const iconClass =
    variant === "danger" ? "bi-exclamation-triangle" : "bi-check2";

  return (
    <div
      className="admin-confirm-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        className="admin-confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        aria-describedby="admin-confirm-message"
      >
        <button
          type="button"
          className="admin-confirm-close"
          onClick={onClose}
          disabled={loading}
          aria-label={closeLabel}
        >
          <i className="bi bi-x-lg"></i>
        </button>

        <div className={`admin-confirm-icon ${variant}`}>
          <i className={`bi ${iconClass}`}></i>
        </div>

        <div className="admin-confirm-content">
          <span className="admin-confirm-eyebrow">{eyebrow}</span>

          <h3 id="admin-confirm-title">{title}</h3>

          <p id="admin-confirm-message">{message}</p>
        </div>

        <div className="admin-confirm-actions">
          <button
            type="button"
            className="admin-confirm-cancel"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            className={`admin-confirm-submit ${variant}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="admin-confirm-spinner"></span>
                {loadingLabel}
              </>
            ) : (
              <>
                <i className={`bi ${iconClass}`}></i>
                {confirmLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminConfirmModal;
