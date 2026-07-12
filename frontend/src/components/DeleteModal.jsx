// src/components/DeleteModal.jsx
import React from "react";

export default function DeleteModal({ isOpen, title, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Delete Slide?</h3>
        <p>
          Are you sure you want to delete <strong>{title}</strong>?
        </p>
        <div className="modal-actions">
          <button className="btn-no" onClick={onClose}>
            No
          </button>
          <button className="btn-yes" onClick={onConfirm}>
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
