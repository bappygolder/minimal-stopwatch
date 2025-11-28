import { useEffect, useRef } from "react";
import { X } from "lucide-react";

type GenericModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export default function GenericModal({
  isOpen,
  onClose,
  title,
  children,
}: GenericModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md p-6 rounded-2xl bg-card border border-border shadow-2xl animate-in zoom-in-95 duration-200 mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="text-muted-foreground text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
