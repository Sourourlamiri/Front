/**
 *utilites fonction pour la gestion des avatars
 */

/**
 *genere un code couleur hexadécimal pour l'avatar d'un utilisateur
 * @param {string} name - The user's name
 * @returns {string} - A hex color code
 */
export const generateAvatarColor = (name) => {
  if (!name) return '#8f5ab8'; // Default color if no name
  
  // Simple hash function to generate a consistent color based on name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // List of purple palette colors matching RecruitEase theme
  const colors = [
    '#8f5ab8', // Main purple
    '#a77bc7', // Light purple
    '#6b4199', // Dark purple 
    '#9865cb', // Bright purple
    '#774aa0', // Medium purple
    '#b083db', // Soft purple
    '#552b88', // Deep purple
    '#d8c3f0'  // Very light purple
  ];
  
  // Use the hash to pick a color from our palette
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

/**
 * Gets the first letter of a user's name for the avatar
 * @param {Object} user - The user object
 * @returns {string} - The first letter of the user's name
 */
export const getInitial = (user) => {
  if (!user) return '?';
  
  // Try to get the first letter from the name - check both lowercase and uppercase property names
  if (user.nom && typeof user.nom === 'string') {
    return user.nom.charAt(0).toUpperCase();
  }
  
  if (user.Nom && typeof user.Nom === 'string') {
    return user.Nom.charAt(0).toUpperCase();
  }
  
  // Fallback to other name fields if available
  if (user.prenom && typeof user.prenom === 'string') {
    return user.prenom.charAt(0).toUpperCase();
  }
  
  if (user.Prenom && typeof user.Prenom === 'string') {
    return user.Prenom.charAt(0).toUpperCase();
  }
  
  // Fallback to email if available - check both lowercase and uppercase
  if (user.email && typeof user.email === 'string') {
    return user.email.charAt(0).toUpperCase();
  }
  
  if (user.Email && typeof user.Email === 'string') {
    return user.Email.charAt(0).toUpperCase();
  }
  
  // If no name or email, return a question mark
  return '?';
};

/**
 * Renders either an image avatar or a letter avatar based on whether the user has an image
 * @param {Object} user - The user object
 * @param {string} baseUrl - The base URL for images
 * @param {string} size - Size of the avatar ('small' or 'large')
 * @returns {Object} - JSX for rendering the avatar
 */
export const renderAvatar = (user, baseUrl, size = 'small') => {
  if (!user) {
    return {
      type: 'letter',
      initial: '?',
      color: '#8f5ab8',
      className: size === 'large' ? 'letter-avatar-large' : 'letter-avatar'
    };
  }
  
  if (user.image) {
    return {
      type: 'image',
      src: `${baseUrl}${user.image}`,
      className: size === 'large' ? 'profile-dropdown-avatar' : 'profile-avatar',
      alt: (user.nom || user.Nom || 'Profil')
    };
  }
  
  const initial = getInitial(user);
  const color = generateAvatarColor(user.nom || user.Nom || user.Email || user.email || '');
  
  return {
    type: 'letter',
    initial,
    color,
    className: size === 'large' ? 'letter-avatar-large' : 'letter-avatar'
  };
};

