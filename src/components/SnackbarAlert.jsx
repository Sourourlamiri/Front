import React from 'react';
import { Snackbar, Alert } from '@mui/material';

/**
 * Reusable Snackbar component for displaying notifications
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the snackbar is open
 * @param {string} props.message - Message to display
 * @param {string} props.severity - Severity level (error, warning, info, success)
 * @param {function} props.onClose - Function to call when snackbar is closed
 * @param {number} props.autoHideDuration - Duration in ms before auto-hiding (default: 6000)
 * @param {string} props.anchorOrigin - Position of the snackbar on screen
 * @returns {React.ReactElement} - Snackbar component
 */
const SnackbarAlert = ({
    open,
    message,
    severity = 'info',
    onClose,
    autoHideDuration = 6000,
    anchorOrigin = { vertical: 'top', horizontal: 'right' }
}) => {
    return (
        <Snackbar
            open={open}
            autoHideDuration={autoHideDuration}
            onClose={onClose}
            anchorOrigin={anchorOrigin}
        >
            <Alert
                onClose={onClose}
                severity={severity}
                variant="filled"
                sx={{ width: '100%' }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
};

export default SnackbarAlert; 