import { useState, useRef, useEffect } from "react";
import {
  Menu,
  Moon,
  Sun,
  Keyboard,
  Settings,
  Info,
  FileText,
  Globe,
  Mail,
  Heart,
} from "lucide-react";
import GenericModal from "./generic-modal";

type Theme = "light" | "dark";

type GlobalMenuProps = {
  theme: Theme;
  onToggleTheme: () => void;
};

export default function GlobalMenu({ theme, onToggleTheme }: GlobalMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const closeModal = () => setActiveModal(null);

  return (
    <div className="relative z-[60]" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        aria-label="Menu"
      >
        <Menu size={24} strokeWidth={2} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl p-1.5 origin-top-right animate-in fade-in zoom-in-95 duration-150 z-[70]">
          {/* Group 1: Core */}
          <div className="space-y-0.5">
            <button
              onClick={() => {
                setIsOpen(false);
                setActiveModal("shortcuts");
              }}
              className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors w-full text-left group"
            >
              <Keyboard size={16} className="group-hover:text-chrono-accent transition-colors" />
              Keyboard Shortcuts
            </button>

            <button
              onClick={() => {
                onToggleTheme();
              }}
              className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors w-full text-left group"
            >
              {theme === "dark" ? (
                <Sun size={16} className="group-hover:text-chrono-warning transition-colors" />
              ) : (
                <Moon size={16} className="group-hover:text-chrono-accent transition-colors" />
              )}
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                setActiveModal("settings");
              }}
              className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors w-full text-left group"
            >
              <Settings size={16} className="group-hover:text-chrono-accent transition-colors" />
              Settings
            </button>
          </div>

          <div className="h-px bg-border/50 my-1 mx-2" />

          {/* Group 2: Info */}
          <div className="space-y-0.5">
            <button
              onClick={() => {
                setIsOpen(false);
                setActiveModal("about");
              }}
              className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors w-full text-left group"
            >
              <Info size={16} className="group-hover:text-blue-400 transition-colors" />
              About
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                setActiveModal("changelog");
              }}
              className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors w-full text-left group"
            >
              <FileText size={16} className="group-hover:text-blue-400 transition-colors" />
              Changelog
            </button>

            <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/40 font-medium select-none ml-8">
              Version v0.1
            </div>
          </div>

          <div className="h-px bg-border/50 my-1 mx-2" />

          {/* Group 3: External */}
          <div className="space-y-0.5">
            <a
              href="https://github.com/bappygolder/minimal-stopwatch"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors w-full text-left group"
              onClick={() => setIsOpen(false)}
            >
              <Globe size={16} className="group-hover:text-foreground transition-colors" />
              GitHub Repo
            </a>

            <a
              href="mailto:feedback@example.com"
              className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors w-full text-left group"
              onClick={() => setIsOpen(false)}
            >
              <Mail size={16} className="group-hover:text-foreground transition-colors" />
              Feedback
            </a>

            <button
              onClick={() => {
                setIsOpen(false);
                setActiveModal("support");
              }}
              className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors w-full text-left group"
            >
              <Heart size={16} className="group-hover:text-chrono-danger transition-colors" />
              Donate / Support
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <GenericModal
        isOpen={activeModal === "shortcuts"}
        onClose={closeModal}
        title="Keyboard Shortcuts"
      >
        <div className="flex flex-col items-center justify-center py-8 text-center opacity-60">
          <Keyboard size={48} strokeWidth={1} className="mb-4" />
          <p>Keyboard shortcuts guide is coming soon.</p>
        </div>
      </GenericModal>

      <GenericModal
        isOpen={activeModal === "settings"}
        onClose={closeModal}
        title="Settings"
      >
        <div className="flex flex-col items-center justify-center py-8 text-center opacity-60">
          <Settings size={48} strokeWidth={1} className="mb-4" />
          <p>Advanced settings are coming soon.</p>
        </div>
      </GenericModal>

      <GenericModal
        isOpen={activeModal === "about"}
        onClose={closeModal}
        title="About Minimal Stopwatch"
      >
        <div className="space-y-4">
          <p>
            A clean, distraction-free stopwatch designed for focus and simplicity.
            Built with React, Tailwind, and Framer Motion.
          </p>
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs opacity-60">
              Maintained by Bappy Golder.
              <br />
              © 2025 oLab.
            </p>
          </div>
        </div>
      </GenericModal>

      <GenericModal
        isOpen={activeModal === "changelog"}
        onClose={closeModal}
        title="Changelog"
      >
        <div className="flex flex-col items-center justify-center py-8 text-center opacity-60">
          <FileText size={48} strokeWidth={1} className="mb-4" />
          <p>Version history and updates will appear here.</p>
        </div>
      </GenericModal>

      <GenericModal
        isOpen={activeModal === "support"}
        onClose={closeModal}
        title="Support Options"
      >
        <div className="flex flex-col items-center justify-center py-8 text-center opacity-60">
          <Heart size={48} strokeWidth={1} className="mb-4" />
          <p>Support options are coming soon.</p>
        </div>
      </GenericModal>
    </div>
  );
}
