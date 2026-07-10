"use client";

import { useState, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
}

export function FormField({
  label,
  required,
  error,
  hint,
  children,
}: FieldProps & { children: React.ReactNode }) {
  return (
    <div className="min-w-0 space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-aksanti-red"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs text-aksanti-red">{error}</p>}
    </div>
  );
}

/** text-base (16px) évite le zoom automatique iOS/Android au focus */
const inputClass =
  "box-border w-full min-w-0 max-w-full rounded-xl border-2 border-foreground/15 bg-white px-4 py-3 text-base outline-none transition focus:border-aksanti-red focus:ring-2 focus:ring-aksanti-red/20 disabled:bg-surface disabled:text-muted";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputClass} ${className}`.trim()} {...props} />;
}

export function PasswordInput({
  className = "",
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        className={`${inputClass} pr-12 ${className}`.trim()}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted transition hover:text-foreground"
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
      >
        {visible ? (
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
            />
          </svg>
        ) : (
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

export function Select({
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${inputClass} ${className}`.trim()} {...props} />;
}

export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputClass} ${className}`.trim()} {...props} />;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline";
}) {
  const variants = {
    primary:
      "bg-aksanti-red text-white shadow-lg shadow-aksanti-red/20 hover:bg-aksanti-red-dark",
    secondary:
      "bg-ship-orange text-white shadow-lg shadow-ship-orange/20 hover:bg-ship-orange-dark",
    outline:
      "border-2 border-aksanti-red text-aksanti-red hover:bg-aksanti-red hover:text-white",
  };
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function Alert({
  type = "info",
  children,
}: {
  type?: "info" | "success" | "warning" | "error";
  children: React.ReactNode;
}) {
  const styles = {
    info: "border-blue-200 bg-blue-50 text-blue-800",
    success: "border-green-200 bg-green-50 text-green-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    error: "border-red-200 bg-red-50 text-red-800",
  };
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles[type]}`}>{children}</div>
  );
}
