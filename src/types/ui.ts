export interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string; // defaults to "Confirm"
  cancelText?: string; // defaults to "Cancel"
  onConfirm: () => void;
  onCancel: () => void;
}
