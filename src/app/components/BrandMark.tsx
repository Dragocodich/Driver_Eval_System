import { ShieldCheck } from 'lucide-react';

interface BrandMarkProps {
  className?: string;
  iconClassName?: string;
}

export function BrandMark({
  className = '',
  iconClassName = 'h-6 w-6',
}: BrandMarkProps) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-950/20 ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-white/10" />
      <ShieldCheck className={`relative ${iconClassName}`} strokeWidth={2.2} />
    </div>
  );
}
