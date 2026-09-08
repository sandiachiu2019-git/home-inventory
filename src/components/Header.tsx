import { Boxes, Globe, Mic } from 'lucide-react';
import type { Language } from '@/lib/types';
import { t } from '@/lib/i18n';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  onVoiceInput: () => void;
  voiceSupported: boolean;
  isListening: boolean;
}

export function Header({ lang, onToggleLang, onVoiceInput, voiceSupported, isListening }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Boxes className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-slate-800 truncate leading-tight">
                {t(lang, 'appName')}
              </h1>
              <p className="text-xs text-slate-500 truncate hidden sm:block">{t(lang, 'tagline')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {voiceSupported && (
              <button
                onClick={onVoiceInput}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isListening
                    ? 'bg-red-50 text-red-600 ring-2 ring-red-400 animate-pulse'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title={t(lang, 'voiceInput')}
              >
                <Mic className="w-4 h-4" />
                <span className="hidden sm:inline">{isListening ? t(lang, 'voiceListening') : t(lang, 'scanVoice')}</span>
              </button>
            )}

            <button
              onClick={onToggleLang}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all text-sm font-medium"
              title={t(lang, 'language')}
            >
              <Globe className="w-4 h-4" />
              <span className="font-semibold">{lang === 'en' ? '繁中' : 'EN'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
