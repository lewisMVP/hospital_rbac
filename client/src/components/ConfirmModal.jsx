import React from 'react';
import { Icons } from './Icons';
import './ConfirmModal.css';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger': return Icons.trash;
      case 'warning': return Icons.alertTriangle;
      case 'info': return Icons.info;
      default: return Icons.alertCircle;
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'danger': return 'btn-danger';
      case 'warning': return 'btn-warning';
      case 'info': return 'btn-info';
      default: return 'btn-primary';
    }
  };

  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div className="confirm-content" onClick={(e) => e.stopPropagation()}>
        <div className={`confirm-icon ${type}`}>{getIcon()}</div>
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="btn-secondary" onClick={onClose}>
            {cancelText}
          </button>
          <button className={`btn-confirm ${getButtonClass()}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
