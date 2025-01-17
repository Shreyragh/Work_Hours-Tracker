"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteWorkLog } from "@/actions/work-logs";
import { useToast } from "@/hooks/use-toast";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface DeleteLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logId: number;
  date: string;
}

const DeleteLogDialog = ({
  open,
  onOpenChange,
  logId,
  date,
}: DeleteLogDialogProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteWorkLog(logId);

      if (result.success) {
        toast({
          title: "Success",
          description: "Work log deleted successfully",
        });
        onOpenChange(false);
        startTransition(() => {
          router.refresh();
        });
      } else {
        throw new Error("Failed to delete work log");
      }
    } catch (error) {
      console.error("Error deleting work log:", error);
      toast({
        title: "Error",
        description: "Failed to delete work log",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Work Log</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this work log from {date}? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting || isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || isPending}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteLogDialog;
