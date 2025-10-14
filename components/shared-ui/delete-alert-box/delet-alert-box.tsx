"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface AlertBoxProps {
  trigger: React.ReactNode;       // The button or icon that opens the alert
  title: string;                  // Alert title
  description: string;            // Alert message
  confirmText?: string;           // Text on confirm button
  cancelText?: string;            // Text on cancel button
  onConfirm: (e?: React.MouseEvent) => void;          // What to do if user clicks confirm
  isLoading?: boolean;            // For disabling buttons during API calls
}

const AlertBox: React.FC<AlertBoxProps> = ({
  trigger,
  title,
  description,
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  isLoading = false,
}) => {
  return (
    <AlertDialog>
      {/* The button or icon that opens the alert */}
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? "Processing..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertBox;
