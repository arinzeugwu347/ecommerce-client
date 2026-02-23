"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, AlertCircle, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: "danger" | "warning" | "info"
    isLoading?: boolean
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "info",
    isLoading = false
}: ConfirmModalProps) {

    const getIcon = () => {
        switch (variant) {
            case "danger": return <AlertCircle className="h-6 w-6 text-red-500" />
            case "warning": return <AlertTriangle className="h-6 w-6 text-amber-500" />
            default: return <HelpCircle className="h-6 w-6 text-blue-500" />
        }
    }

    const getButtonStyles = () => {
        switch (variant) {
            case "danger": return "bg-red-600 hover:bg-red-700 text-white"
            case "warning": return "bg-amber-600 hover:bg-amber-700 text-white"
            default: return "bg-primary hover:bg-primary/90"
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={cn(
                            "p-3 rounded-xl flex-shrink-0",
                            variant === "danger" ? "bg-red-100 dark:bg-red-500/10" :
                                variant === "warning" ? "bg-amber-100 dark:bg-amber-500/10" :
                                    "bg-blue-100 dark:bg-blue-500/10"
                        )}>
                            {getIcon()}
                        </div>
                        <div className="space-y-1">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
                                <DialogDescription className="text-base text-muted-foreground pt-1">
                                    {description}
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                    </div>
                </div>

                <DialogFooter className="bg-muted/50 p-4 gap-3 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 sm:flex-none font-semibold rounded-xl"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            onConfirm();
                        }}
                        disabled={isLoading}
                        className={cn(
                            "flex-1 sm:flex-none font-semibold rounded-xl",
                            getButtonStyles()
                        )}
                    >
                        {isLoading ? "Processing..." : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
