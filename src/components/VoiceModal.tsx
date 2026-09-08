import { Mic, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { Language } from '@/lib/types';
import { t } from '@/lib/i18n';
import { parseVoiceInput } from '@/lib/utils';

interface VoiceModalProps {
  lang: Language;
  onResult: (name: string, quantity: number) => void;
  onClose: () => void;
}

export function VoiceModal({ lang, onResult, onClose }: VoiceModalProps) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError(t(lang, 'voiceNotSupported'));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang === 'zh' ? 'zh-TW' : 'en-US';

    recognition.onresult = (event: any) => {
      let text = '';
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);

      if (event.results[event.results.length - 1].isFinal) {
        const parsed = parseVoiceInput(text, lang);
        if (parsed) {
          onResult(parsed.name, parsed.quantity);
        } else {
          setError(t(lang, 'voiceError'));
        }
      }
    };

    recognition.onerror = (event: any) => {
      setError(event.error === 'no-speech' ? t(lang, 'voiceError') : t(lang, 'voiceNotSupported'));
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);

    return () => {
      try {
        recognition.stop();
      } catch {
        // already stopped
      }
    };
  }, [lang, onResult, onClose]);

  const handleRetry = () => {
    setError('');
    setTranscript('');
    recognitionRef.current?.start();
    setListening(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">{t(lang, 'voiceInput')}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              listening
                ? 'bg-red-50 ring-4 ring-red-200 animate-pulse'
                : error
                ? 'bg-slate-100'
                : 'bg-teal-50 ring-4 ring-teal-200'
            }`}
          >
            <Mic
              className={`w-8 h-8 ${listening ? 'text-red-500' : error ? 'text-slate-400' : 'text-teal-600'}`}
            />
          </div>

          <p className="mt-4 text-sm font-medium text-slate-600">
            {listening ? t(lang, 'voiceListening') : error ? error : ''}
          </p>

          {transcript && (
            <div className="mt-3 px-4 py-2.5 bg-slate-50 rounded-lg text-sm text-slate-700 text-center w-full">
              "{transcript}"
            </div>
          )}

          <p className="mt-4 text-xs text-slate-400 text-center">{t(lang, 'voiceHint')}</p>

          {error && !listening && (
            <button
              onClick={handleRetry}
              className="mt-4 px-5 py-2.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 font-medium transition-all"
            >
              {t(lang, 'voiceInput')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
