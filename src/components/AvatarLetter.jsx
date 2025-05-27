import React from 'react';
import PropTypes from 'prop-types';
import { renderAvatar } from '../utils/avatarUtils';

/**
 * AvatarLetter component displays a user's avatar as an image or a letter-based avatar.
 * It supports different sizes and custom dimensions, and provides a fallback letter avatar
 * if no user image is available.
 * 
 * @param {Object} props Component props
 * @param {Object} props.user User object containing name and image information
 * @param {string} props.size Size of the avatar ('small' or 'large')
 * @param {string} props.baseUrl Base URL for image paths
 * @param {string} props.className Additional CSS classes to apply
 * @param {Object} props.style Additional inline styles to apply
 * @param {number} props.width Custom width in pixels
 * @param {number} props.height Custom height in pixels
 * @param {string} props.customSize CSS size value (e.g., '150px')
 * @returns {React.ReactElement} The avatar component
 */
const AvatarLetter = ({ 
  user, 
  size = 'small', 
baseUrl = `${process.env.REACT_APP_BACKEND_URL}/file/`,
  className = '',
  style = {},
  width,
  height,
  customSize,
}) => {
  // Function to get dimensions based on custom size or width/height props
  const getDimensions = () => {
    if (customSize) {
      return { width: customSize, height: customSize };
    }
    if (width || height) {
      return { 
        width: width ? `${width}px` : 'auto',
        height: height ? `${height}px` : 'auto'
      };
    }
    return {};
  };


  if (!user) { // utiliser si l'utilisateur n'est pas défini
    // If no user is provided, return a default letter avatar
    return (
      <div 
        className={`letter-avatar ${size === 'large' ? 'letter-avatar-large' : ''} ${className}`}
        style={{ 
          backgroundColor: '#8f5ab8',
          ...getDimensions(),
          ...style 
        }}
      >
        ?
      </div>
    );
  }

  // get the avatar details using the utility function
  const avatar = renderAvatar(user, baseUrl, size);

  // Render either an image or a letter avatar
  return avatar.type === 'image' ? (
    <img 
      src={avatar.src} 
      alt={avatar.alt} 
      className={`${avatar.className} ${className}`} 
      style={{
        ...getDimensions(),
        objectFit: 'cover',
        ...style
      }}
    />
  ) : (
    <div 
      className={`${avatar.className} ${className}`}
      style={{ 
        backgroundColor: avatar.color,
        ...getDimensions(),
        ...style
      }}
    >
      {avatar.initial}
    </div>
  );
};

AvatarLetter.propTypes = {
  user: PropTypes.shape({
    nom: PropTypes.string,
    Nom: PropTypes.string,
    prenom: PropTypes.string,
    Prenom: PropTypes.string,
    email: PropTypes.string,
    Email: PropTypes.string,
    image: PropTypes.string
  }),
  size: PropTypes.oneOf(['small', 'large']),
  baseUrl: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  width: PropTypes.number,
  height: PropTypes.number,
  customSize: PropTypes.string
};

export default AvatarLetter; 