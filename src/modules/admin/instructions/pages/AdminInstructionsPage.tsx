import { useLang }    from '@/app/providers/LanguageProvider';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SendInstructionForm }     from '../components/SendInstructionForm';
import { InstructionsHistoryList } from '../components/InstructionsHistoryList';
import { useAdminInstructionsPage } from '../hooks/useAdminInstructionsPage';

export function AdminInstructionsPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const {
    title, setTitle, body, setBody,
    audienceType, setAudienceType,
    departmentId, setDepartmentId,
    employeeId, setEmployeeId,
    departmentItems, employeeItems,
    isValid, sending, submit,
    history, loadingHistory,
  } = useAdminInstructionsPage(isAr);

  return (
    <div className="space-y-5">
      <PageHeader
        title={isAr ? 'تعليمات فورية' : 'Realtime Instructions'}
        subtitle={isAr
          ? 'أرسل تعليمات فورية للجميع (الموظفين والمدراء)، أو قسم معين، أو موظف محدد، أو المدراء فقط'
          : 'Send realtime instructions to everyone (employees & managers), a department, a specific employee, or managers only'}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <SendInstructionForm
          title={title} setTitle={setTitle}
          body={body} setBody={setBody}
          audienceType={audienceType} setAudienceType={setAudienceType}
          departmentId={departmentId} setDepartmentId={setDepartmentId}
          employeeId={employeeId} setEmployeeId={setEmployeeId}
          departmentItems={departmentItems} employeeItems={employeeItems}
          isValid={isValid} sending={sending} onSubmit={submit}
          isAr={isAr}
        />
        <InstructionsHistoryList history={history} isLoading={loadingHistory} isAr={isAr} />
      </div>
    </div>
  );
}
