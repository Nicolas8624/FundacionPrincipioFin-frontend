'use client';

import React, { useEffect, useState } from 'react';
import { X, AlertCircle, Check } from 'lucide-react';

export interface FormModalField {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'textarea' | 'select';
  defaultValue?: string | number | null;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
  options?: { value: string; label: string }[];
}

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  fields: FormModalField[];
  confirmLabel?: string;
  tone?: 'gold' | 'danger';
  /** Devuelve un mensaje de error para mostrarlo, o nada si todo salió bien */
  onConfirm: (values: Record<string, string>) => Promise<string | void> | string | void;
}

export function FormModal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  fields,
  confirmLabel = 'Guardar',
  tone = 'gold',
  onConfirm
}: FormModalProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const init: Record<string, string> = {};
      fields.forEach((f) => {
        init[f.name] = f.defaultValue !== null && f.defaultValue !== undefined ? String(f.defaultValue) : '';
      });
      setValues(init);
      setError(null);
      setIsSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await onConfirm(values);
      if (typeof result === 'string' && result) {
        setError(result);
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Ocurrió un error inesperado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-lg bg-[#1b1b1f] border border-[#262629] text-white placeholder:text-[#99907c]/50 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-md max-h-[85vh] bg-[#131317] border rounded-2xl overflow-hidden shadow-2xl flex flex-col my-auto ${
          tone === 'danger' ? 'border-rose-500/30' : 'border-[#262629]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262629] bg-[#1b1b1f] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            {icon}
            <h3 className="text-white font-montserrat font-semibold text-base">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#262629] text-[#99907c] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 space-y-4 flex-1 overflow-y-auto min-h-0">
            {description && <div className="text-xs text-[#99907c] leading-relaxed">{description}</div>}

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {fields.map((f) => (
              <div key={f.name} className="space-y-1.5">
                <label className="text-[11px] font-montserrat uppercase tracking-wider text-[#99907c]">
                  {f.label} {f.required && '*'}
                </label>
                {f.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    required={f.required}
                    value={values[f.name] ?? ''}
                    placeholder={f.placeholder}
                    onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                    className={`${inputClass} resize-none`}
                  />
                ) : f.type === 'select' ? (
                  <select
                    required={f.required}
                    value={values[f.name] ?? ''}
                    onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                    className={`${inputClass} cursor-pointer`}
                  >
                    {(f.options || []).map((o) => (
                      <option key={o.value} value={o.value} className="bg-[#1b1b1f]">
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type || 'text'}
                    required={f.required}
                    min={f.min}
                    max={f.max}
                    step={f.step}
                    value={values[f.name] ?? ''}
                    placeholder={f.placeholder}
                    onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                    className={inputClass}
                  />
                )}
                {f.hint && <p className="text-[11px] text-[#99907c]/80">{f.hint}</p>}
              </div>
            ))}
          </div>

          <div className="px-6 py-4 border-t border-[#262629] bg-[#1b1b1f] flex items-center justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-[#131317] hover:bg-[#262629] text-[#e4e1e7] text-xs font-montserrat uppercase tracking-wider transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 rounded-lg text-xs font-montserrat uppercase tracking-wider font-semibold transition-all flex items-center gap-2 disabled:opacity-60 ${
                tone === 'danger'
                  ? 'bg-rose-500/90 hover:bg-rose-500 text-white'
                  : 'bg-gradient-to-r from-[#D4AF37] to-[#f2ca50] text-[#0A0A0E] shadow-md shadow-[#D4AF37]/20 hover:brightness-110'
              }`}
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'Guardando...' : confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
