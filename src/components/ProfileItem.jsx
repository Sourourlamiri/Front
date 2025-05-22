import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

/**
 * Component for displaying a profile item with consistent styling
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Title of the item
 * @param {string|React.ReactNode} props.subtitle - Subtitle information
 * @param {string} [props.description] - Optional description text
 * @param {Function} props.onEdit - Function to call when edit button is clicked
 * @param {Function} props.onDelete - Function to call when delete button is clicked
 * @param {React.ReactNode} [props.extraContent] - Optional additional content
 * @returns {React.ReactElement}
 */
const ProfileItem = ({ 
  title, 
  subtitle, 
  description, 
  onEdit, 
  onDelete, 
  extraContent
}) => {
  return (
    <div className="list-group-item border-0 py-3 hover-light">
      <div className="d-flex justify-content-between align-items-center">
        <div style={{ width: extraContent ? '80%' : 'auto' }}>
          <h5 className="mb-1 fw-bold">{title}</h5>
          {subtitle && (
            <small className="text-muted d-block mb-1">
              {subtitle}
            </small>
          )}
          {description && (
            <p className="mt-2 mb-0 small text-secondary">{description}</p>
          )}
          {extraContent}
        </div>
        <div className="btn-group">
          <button
            onClick={onEdit}
            className="btn btn-sm btn-outline-primary rounded-circle me-1"
            title="Modifier"
          >
            <FiEdit2 size={14} />
          </button>
          <button
            onClick={onDelete}
            className="btn btn-sm btn-outline-danger rounded-circle"
            title="Supprimer"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileItem; 