import { create } from "zustand";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle } from "lucide-react";

interface ErrorModalState {
  isOpen: boolean;
  message: string;
  showModal: (message: string) => void;
  closeModal: () => void;
}

export const useErrorModal = create<ErrorModalState>((set) => ({
  isOpen: false,
  message: "",
  showModal: (message: string) => set({ isOpen: true, message }),
  closeModal: () => set({ isOpen: false, message: "" }),
}));

export default function ErrorModal() {
  const { isOpen, message, closeModal } = useErrorModal();

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start mb-2">
            <AlertCircle className="text-destructive mr-2 h-5 w-5" />
            <AlertDialogTitle>Error</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {message || "An error occurred. Please try again."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={closeModal}>Close</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
