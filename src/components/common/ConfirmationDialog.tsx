import React from 'react';
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';

interface ConfirmationDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
                                                                   open,
                                                                   onClose,
                                                                   onConfirm,
                                                                   title,
                                                                   description,
                                                                   confirmText = 'Confirm',
                                                                   cancelText = 'Cancel',
                                                                   isLoading = false,
                                                               }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="confirmation-dialog-title"
            aria-describedby="confirmation-dialog-description"
        >
            <DialogTitle id="confirmation-dialog-title">{title}</DialogTitle>
            <DialogContent>
                <DialogContentText id="confirmation-dialog-description">
                    {description}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isLoading} color="secondary">
                    {cancelText}
                </Button>
                <Button onClick={onConfirm} disabled={isLoading} color="primary" variant="contained" autoFocus>
                    {isLoading ? <CircularProgress size={24} color="inherit"/> : confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmationDialog;
