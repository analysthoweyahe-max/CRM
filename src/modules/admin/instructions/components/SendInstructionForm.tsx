import { Send } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { FormField } from '@/shared/components/form/FormField';
import { Combobox } from '@/shared/components/form/Combobox';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import type { InstructionAudienceType } from '../types/instruction.types';

interface Props {
  title: string;
  setTitle: (v: string) => void;
  body: string;
  setBody: (v: string) => void;
  audienceType: InstructionAudienceType;
  setAudienceType: (v: InstructionAudienceType) => void;
  departmentId: string;
  setDepartmentId: (v: string) => void;
  employeeId: string;
  setEmployeeId: (v: string) => void;
  departmentItems: ComboboxItem[];
  employeeItems: ComboboxItem[];
  isValid: boolean;
  sending: boolean;
  onSubmit: () => void;
  isAr: boolean;
}

const AUDIENCE_OPTIONS: { value: InstructionAudienceType; ar: string; en: string }[] = [
  { value: 'all', ar: 'الجميع', en: 'Everyone' },
  { value: 'department', ar: 'قسم معين', en: 'A Department' },
  { value: 'employee', ar: 'موظف معين', en: 'An Employee' },
  { value: 'managers', ar: 'المدراء', en: 'Managers' },
];

export function SendInstructionForm({
  title, setTitle, body, setBody,
  audienceType, setAudienceType,
  departmentId, setDepartmentId,
  employeeId, setEmployeeId,
  departmentItems, employeeItems,
  isValid, sending, onSubmit, isAr,
}: Props) {
  return (
    <Card padding="lg" className="space-y-5">
      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
        {isAr ? 'إرسال تعليمات جديدة' : 'Send New Instruction'}
      </h3>

      <FormField label={isAr ? 'العنوان' : 'Title'} required>
        <Input value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder={isAr ? 'مثال: تنويه هام' : 'e.g. Important Notice'} />
      </FormField>

      <FormField label={isAr ? 'نص التعليمات' : 'Instruction Body'} required>
        <textarea
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={isAr ? 'اكتب نص التعليمات هنا...' : 'Write the instruction here...'}
          className="w-full rounded-lg border text-sm text-gray-800 dark:text-gray-200
                     bg-white dark:bg-gray-700/50 border-gray-200 dark:border-gray-600
                     outline-none transition placeholder:text-gray-400 dark:placeholder:text-gray-500
                     focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 p-3 resize-none"
        />
      </FormField>

      <FormField label={isAr ? 'الجهة المستهدفة' : 'Audience'} required>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {AUDIENCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setAudienceType(opt.value)}
              className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors
                ${audienceType === opt.value
                  ? 'border-[#A0CD39] bg-[#D8EBAE] text-[#709028] dark:bg-[#D8EBAE]/10 dark:text-[#A0CD39]'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
            >
              {isAr ? opt.ar : opt.en}
            </button>
          ))}
        </div>
      </FormField>

      {audienceType === 'department' && (
        <FormField label={isAr ? 'القسم' : 'Department'} required>
          <Combobox
            items={departmentItems}
            value={departmentId}
            onChange={setDepartmentId}
            placeholder={isAr ? 'اختر القسم' : 'Select department'}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
            noResultsText={isAr ? 'لا نتائج' : 'No results'}
          />
        </FormField>
      )}

      {audienceType === 'employee' && (
        <FormField label={isAr ? 'الموظف' : 'Employee'} required>
          <Combobox
            items={employeeItems}
            value={employeeId}
            onChange={setEmployeeId}
            placeholder={isAr ? 'اختر الموظف' : 'Select employee'}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
            noResultsText={isAr ? 'لا نتائج' : 'No results'}
          />
        </FormField>
      )}

      <Button variant="primary" startIcon={<Send size={15} />} disabled={!isValid} isLoading={sending} onClick={onSubmit}>
        {isAr ? 'إرسال التعليمات' : 'Send Instruction'}
      </Button>
    </Card>
  );
}
