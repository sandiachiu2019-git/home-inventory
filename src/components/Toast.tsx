import { CheckCircle2, X, Info } from 'lucide-react';
import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle2, iconColor: 'text-green-500' },
    error: { bg: 'bg-red-50', text: 'text-red-700', icon: X, iconColor: 'text-red-500' },
    info: { bg: 'bg-blue-50', text: 'text-blue-700', icon: Info, iconColor: 'text-blue-500' },
  };
  const style = styles[type];
  const Icon = style.icon;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl ${style.bg} ${style.text} shadow-lg border border-slate-100`}>
        <Icon className={`w-5 h-5 ${style.iconColor}`} />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}
