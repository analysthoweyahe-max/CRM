import { Sun, Moon, Globe } from 'lucide-react';
import { useTheme }   from '@/app/providers/ThemeProvider';
import { useLang }    from '@/app/providers/LanguageProvider';
import { Card }       from '@/shared/components/ui/Card';
import { FormField }  from '@/shared/components/form/FormField';
import { Combobox }   from '@/shared/components/form/Combobox';

const LANG_ITEMS = [
  { id: 'ar', label: 'العربية' },
  { id: 'en', label: 'English'  },
];

interface ThemeBtnProps {
  active:  boolean;
  icon:    React.ReactNode;
  label:   string;
  onClick: () => void;
}

function ThemeBtn({ active, icon, label, onClick }: ThemeBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex items-center justify-center gap-2 h-11 rounded-xl',
        'text-sm font-semibold transition-all border',
        active
          ? 'border-transparent text-gray-800'
          : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-[#A0CD39]/50',
      ].join(' ')}
      style={active ? { background: '#A0CD39' } : {}}
    >
      {icon}
      {label}
    </button>
  );
}

export function AppearanceCard({ isAr }: { isAr: boolean }) {
  const { isDark, toggleTheme } = useTheme();
  const { lang, toggleLang }    = useLang();

  const cbProps = {
    searchPlaceholder: isAr ? 'ابحث...'  : 'Search...',
    noResultsText:     isAr ? 'لا نتائج' : 'No results',
  };

  return (
    <Card padding="lg">
      <div className="mb-5">
        <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">
          {isAr ? 'المظهر' : 'Appearance'}
        </h2>
        <p className="text-xs mt-0.5 text-gray-500 dark:text-gray-400">
          {isAr ? 'اختر سمة الواجهة' : 'Choose interface theme'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ThemeBtn
          active={!isDark}
          icon={<Sun size={16} />}
          label={isAr ? 'فاتح' : 'Light'}
          onClick={() => isDark && toggleTheme()}
        />
        <ThemeBtn
          active={isDark}
          icon={<Moon size={16} />}
          label={isAr ? 'داكن' : 'Dark'}
          onClick={() => !isDark && toggleTheme()}
        />
      </div>

      <div className="border-t border-gray-100 dark:border-gray-700 mt-5 pt-5">
        <FormField
          label={isAr ? 'اللغة' : 'Language'}
          icon={<Globe size={15} className="text-gray-400" />}
        >
          <Combobox
            items={LANG_ITEMS}
            value={lang}
            onChange={(v) => { if (v !== lang) toggleLang(); }}
            placeholder={isAr ? 'اختر اللغة' : 'Select language'}
            {...cbProps}
          />
        </FormField>
      </div>
    </Card>
  );
}
