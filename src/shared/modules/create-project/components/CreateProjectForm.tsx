import { useRef, useState } from 'react';
import { Plus, Paperclip, X, FileText } from 'lucide-react';
import { Combobox } from '@/shared/components/form/Combobox';
import { ProjectOptionalFields } from '@/shared/components/form/ProjectOptionalFields';
import { Button } from '@/shared/components/ui/Button';
import { MultiSelectChecklist } from './MultiSelectChecklist';
import { AddProjectTypeModal } from './AddProjectTypeModal';
import type { useCreateProjectForm } from '../hooks/useCreateProjectForm';

const INPUT = [
  'w-full rounded-xl border border-gray-200 dark:border-gray-600',
  'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
  'px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
  'focus:outline-none focus:ring-2 focus:ring-[#A0CD39] focus:border-transparent',
  'transition-shadow duration-150',
].join(' ');

const LABEL = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

type FormState = ReturnType<typeof useCreateProjectForm>;

interface Props {
  form: FormState;
}

export function CreateProjectForm({ form }: Props) {
  const {
    module, isAr, isAdmin,
    departmentId, setDepartmentId,
    projectTypeId, setProjectTypeId,
    name, setName,
    description, setDescription,
    targetDomain, setTargetDomain,
    githubLink, setGithubLink,
    driveLink, setDriveLink,
    contractDurationMonths, setContractDurationMonths,
    startDate, setStartDate,
    endDate, setEndDate,
    status, setStatus,
    saveAsDraft, setSaveAsDraft,
    managerIds, setManagerIds,
    managerSearch, setManagerSearch,
    employeeIds, setEmployeeIds,
    employeeSearch, setEmployeeSearch,
    attachment, setAttachment,
    fieldErrors,
    departmentItems, projectTypeItems, statusItems, employeeItems, managerItems,
    typesLoading, statusesLoading, employeesLoading, managersLoading,
    showDepartment, showManagers,
    showAddType, setShowAddType,
    submitAddType, addingType, selectedDepartmentId,
    clearFieldError,
  } = form;

  const endLabel = module === 'pm'
    ? (isAr ? 'الموعد النهائي' : 'Deadline')
    : (isAr ? 'تاريخ الانتهاء المتوقع' : 'Expected End Date');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (file) setAttachment(file);
  }

  function fmtSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-6">
      {showDepartment && (
        <div>
          <label className={LABEL}>
            {isAr ? 'القسم' : 'Department'}
            <span className="text-red-500 ms-1">*</span>
          </label>
          <Combobox
            items={departmentItems}
            value={departmentId}
            onChange={setDepartmentId}
            placeholder={isAr ? '-- اختر القسم --' : '-- Select Department --'}
            searchPlaceholder={isAr ? 'بحث...' : 'Search...'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <label className={LABEL.replace(' mb-1.5', '')}>
            {isAr ? 'نوع المشروع' : 'Project Type'}
            <span className="text-red-500 ms-1">*</span>
          </label>
          {isAdmin && selectedDepartmentId > 0 && (
            <Button variant="ghost" size="sm" startIcon={<Plus size={14} />} onClick={() => setShowAddType(true)}>
              {isAr ? 'نوع جديد' : 'Add Type'}
            </Button>
          )}
        </div>
        <Combobox
          items={projectTypeItems}
          value={projectTypeId}
          onChange={(v) => { setProjectTypeId(v); clearFieldError('projectTypeId'); }}
          placeholder={
            typesLoading
              ? (isAr ? 'جاري التحميل...' : 'Loading...')
              : (isAr ? '-- اختر النوع --' : '-- Select Type --')
          }
          searchPlaceholder={isAr ? 'بحث...' : 'Search...'}
          noResultsText={isAr ? 'لا توجد أنواع' : 'No types found'}
          disabled={showDepartment && !departmentId}
        />
        {fieldErrors.projectTypeId && (
          <p className="mt-1 text-xs text-red-500">{fieldErrors.projectTypeId}</p>
        )}
      </div>

      <div>
        <label className={LABEL}>
          {isAr ? 'اسم المشروع' : 'Project Name'}
          <span className="text-red-500 ms-1">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={e => { setName(e.target.value); clearFieldError('name'); }}
          placeholder={isAr ? 'مثال: موقع الشركة' : 'e.g. Company Website'}
          className={INPUT}
        />
        {fieldErrors.name && <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>}
      </div>

      {module === 'seo' && (
        <div>
          <label className={LABEL}>
            {isAr ? 'الدومين المستهدف' : 'Target Domain'}
            <span className="text-red-500 ms-1">*</span>
          </label>
          <input
            type="text"
            value={targetDomain}
            onChange={e => { setTargetDomain(e.target.value); clearFieldError('targetDomain'); }}
            placeholder="example.com"
            className={INPUT}
            dir="ltr"
          />
          {fieldErrors.targetDomain && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.targetDomain}</p>
          )}
        </div>
      )}

      <div>
        <label className={LABEL}>{isAr ? 'وصف المشروع' : 'Description'}</label>
        <textarea
          rows={3}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={isAr ? 'نبذة عن المشروع' : 'Brief about the project'}
          className={`${INPUT} resize-none`}
        />
      </div>

      <ProjectOptionalFields
        githubLink={githubLink}
        driveLink={driveLink}
        contractDurationMonths={contractDurationMonths}
        errors={fieldErrors}
        isAr={isAr}
        showGithubLink={module !== 'seo'}
        onGithubLinkChange={v => { setGithubLink(v); clearFieldError('githubLink'); }}
        onDriveLinkChange={v => { setDriveLink(v); clearFieldError('driveLink'); }}
        onContractMonthsChange={v => { setContractDurationMonths(v); clearFieldError('contractDurationMonths'); }}
      />

      <div>
        <label className={LABEL}>{isAr ? 'مرفق' : 'Attachment'}</label>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={e => { handleFile(e.target.files); e.target.value = ''; }}
        />

        {attachment ? (
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-600 px-4 py-2.5">
            <FileText size={18} className="text-gray-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-700 dark:text-gray-200 truncate">{attachment.name}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{fmtSize(attachment.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => setAttachment(null)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files); }}
            className={[
              'border-2 border-dashed rounded-xl px-4 py-5 flex flex-col items-center gap-1.5 cursor-pointer transition-colors',
              dragOver
                ? 'border-[#A0CD39] bg-[#D8EBAE]/20 dark:bg-[#A0CD39]/10'
                : 'border-gray-200 dark:border-gray-600 hover:border-[#A0CD39]/50 hover:bg-[#D8EBAE]/10',
            ].join(' ')}
          >
            <Paperclip size={20} className={dragOver ? 'text-[#A0CD39]' : 'text-gray-300 dark:text-gray-600'} />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {isAr ? 'اسحب ملف هنا أو انقر للتصفح' : 'Drag a file here or click to browse'}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>{isAr ? 'تاريخ البدء' : 'Start Date'}</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>{endLabel}</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={INPUT} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>{isAr ? 'الحالة' : 'Status'}</label>
          <Combobox
            items={statusItems}
            value={status}
            onChange={setStatus}
            placeholder={
              statusesLoading
                ? (isAr ? 'جاري التحميل...' : 'Loading...')
                : (isAr ? '-- اختر الحالة --' : '-- Select Status --')
            }
            searchPlaceholder={isAr ? 'بحث...' : 'Search...'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
            disabled={statusesLoading || statusItems.length === 0}
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2.5 cursor-pointer select-none pb-2.5">
            <input
              type="checkbox"
              checked={saveAsDraft}
              onChange={e => setSaveAsDraft(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#A0CD39] focus:ring-[#A0CD39]"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isAr ? 'حفظ كمسودة' : 'Save as draft'}
            </span>
          </label>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
          {isAr ? 'الموظفون (من قسم نوع المشروع)' : 'Employees (from project type department)'}
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
          {isAr
            ? 'يظهر الموظفون المرتبطون بنفس قسم نوع المشروع المختار'
            : 'Only employees from the selected project type department are listed'}
        </p>
        <MultiSelectChecklist
          items={employeeItems}
          selected={employeeIds}
          onChange={ids => { setEmployeeIds(ids); clearFieldError('employeeIds'); }}
          isAr={isAr}
          searchable
          searchValue={employeeSearch}
          onSearch={setEmployeeSearch}
          loading={employeesLoading}
          emptyText={
            !projectTypeId
              ? (isAr ? 'اختر نوع المشروع أولاً' : 'Select a project type first')
              : (isAr ? 'لا يوجد موظفون في هذا القسم' : 'No employees in this department')
          }
          error={fieldErrors.employeeIds}
        />
      </div>

      {showManagers && (
        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
            {isAr ? 'مديرو المشروع' : 'Project Managers'}
            <span className="text-red-500 ms-1">*</span>
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
            {isAr ? 'يمكن اختيار أكثر من مدير' : 'You can select multiple managers'}
          </p>
          <MultiSelectChecklist
            items={managerItems}
            selected={managerIds}
            onChange={ids => { setManagerIds(ids); clearFieldError('managerIds'); }}
            isAr={isAr}
            searchable
            searchValue={managerSearch}
            onSearch={setManagerSearch}
            loading={managersLoading}
            emptyText={
              managersLoading
                ? undefined
                : (isAr
                  ? (module === 'pm'
                    ? 'لا يوجد مدراء متاحون. عيّن دور «مدير مشاريع» لأدمن من صفحة المديرون.'
                    : 'لا يوجد مدراء متاحون. عيّن دور «مدير SEO» لأدمن من صفحة المديرون.')
                  : (module === 'pm'
                    ? 'No managers available. Assign the "project-manager" role to an admin from the Managers page.'
                    : 'No managers available. Assign the "seo-manager" role to an admin from the Managers page.'))
            }
            error={fieldErrors.managerIds}
          />
        </div>
      )}

      <AddProjectTypeModal
        open={showAddType}
        onClose={() => setShowAddType(false)}
        onSubmit={submitAddType}
        departmentId={selectedDepartmentId}
        isLoading={addingType}
        isAr={isAr}
      />
    </div>
  );
}
