import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';
import { useLanguage, Language } from '@/contexts/LanguageContext';

const languageNames = {
  en: 'English',
  hi: 'हिंदी',
  ml: 'മലയാളം',
};

const languageFlags = {
  en: '🇺🇸',
  hi: '🇮🇳',
  ml: '🇮🇳',
};

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">{languageFlags[language]} {languageNames[language]}</span>
          <span className="sm:hidden">{languageFlags[language]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
          {t('language.select')}
        </div>
        {Object.entries(languageNames).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code as Language)}
            className={`flex items-center gap-3 ${
              language === code ? 'bg-accent' : ''
            }`}
          >
            <span className="text-lg">{languageFlags[code as Language]}</span>
            <span>{name}</span>
            {language === code && (
              <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};