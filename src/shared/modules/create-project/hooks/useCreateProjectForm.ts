import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { useLang } from '@/app/providers/LanguageProvider';
import { ROUTES } from '@/app/router/routes';
import { extractApiError, extractApiFieldErrors } from '@/shared/utils/error.utils';
import { resolveDisplayText } from '@/modules/hr/employees/types/employee.types';
import {
  optionalLink,
  optionalContractDurationMonths,
  validateProjectOptionalFields,
} from '@/shared/utils/projectOptionalFields.utils';
import { translateProjectLookup } from '@/shared/utils/projectLookup.i18n';
import { createProjectApi } from '../api/createProject.api';
import { activeProjectTypes, projectTypeLabel } from '../utils/createProject.utils';
import type {
  CreateProjectFieldErrors,
  CreateProjectModule,
  CreateProjectTypePayload,
} from '../types/createProject.types';

export interface UseCreateProjectFormOptions {
  module:      CreateProjectModule;
  templateId?: string;
}

export function useCreateProjectForm({ module, templateId }: UseCreateProjectFormOptions) {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const { user }    = useAuth();
  const { lang }    = useLang();
  const isAr        = lang === 'ar';
  const isAdmin     = user?.role === 'admin';

  const [departmentId, setDepartmentId] = useState('');
  const [projectTypeId, setProjectTypeId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetDomain, setTargetDomain] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [contractDurationMonths, setContractDurationMonths] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('not_started');
  const [saveAsDraft, setSaveAsDraft] = useState(false);
  const [managerIds, setManagerIds] = useState<string[]>([]);
  const [employeeIds, setEmployeeIds] = useState<string[]>([]);
  const [managerSearch, setManagerSearch] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<CreateProjectFieldErrors>({});
  const [saved, setSaved] = useState(false);
  const [savedAsDraft, setSavedAsDraft] = useState(false);
  const [showAddType, setShowAddType] = useState(false);

  const deptNum = departmentId ? Number(departmentId) : undefined;
  const typeNum = projectTypeId ? Number(projectTypeId) : undefined;

  const departmentsQ = useQuery({
    queryKey: ['create-project', 'departments'],
    queryFn:  () => createProjectApi.departments(),
    enabled:  isAdmin,
    staleTime: 5 * 60 * 1000,
  });

  const typesQ = useQuery({
    queryKey: ['create-project', module, 'types', isAdmin ? (deptNum ?? 'none') : 'default'],
    queryFn:  () => (isAdmin && deptNum
      ? createProjectApi.projectTypesForDepartment(module, deptNum)
      : createProjectApi.projectTypes(module)),
    enabled:  !isAdmin || !!deptNum,
    staleTime: 60_000,
  });

  const statusesQ = useQuery({
    queryKey: ['create-project', module, 'statuses'],
    queryFn:  () => createProjectApi.statuses(module),
    staleTime: 5 * 60 * 1000,
  });

  const employeesQ = useQuery({
    queryKey: ['create-project', module, 'employees', typeNum, employeeSearch],
    queryFn:  () => createProjectApi.employees(module, typeNum!, employeeSearch.trim() || undefined),
    enabled:  !!typeNum,
    staleTime: 30_000,
  });

  // SEO/PM employees: pre-select themselves so the project appears under "My Projects".
  useEffect(() => {
    if (user?.role !== 'seo-member' && user?.role !== 'employee') return;
    if (employeeIds.length > 0) return;
    const selfId = user.employeeId || user.id;
    if (!selfId) return;
    const inList = (employeesQ.data?.data ?? []).some((e) => String(e.id) === String(selfId));
    if (inList) setEmployeeIds([String(selfId)]);
  }, [user?.role, user?.employeeId, user?.id, employeesQ.data, employeeIds.length]);

  const managersQ = useQuery({
    queryKey: ['create-project', module, 'managers', typeNum ?? 'all'],
    queryFn:  () => createProjectApi.managersForCreate(module, typeNum),
    enabled:  isAdmin,
    staleTime: 60_000,
  });

  const projectTypes = useMemo(
    () => activeProjectTypes(typesQ.data ?? []),
    [typesQ.data],
  );

  const departmentItems = useMemo(() =>
    (departmentsQ.data ?? []).map(d => ({
      id:    String(d.id),
      label: isAr && d.nameAr ? d.nameAr : d.name,
    })),
  [departmentsQ.data, isAr]);

  const projectTypeItems = useMemo(() =>
    projectTypes.map(t => ({
      id:    String(t.id),
      label: projectTypeLabel(t, isAr),
    })),
  [projectTypes, isAr]);

  const statusItems = useMemo(() =>
    (statusesQ.data ?? []).map(s => ({
      id:    s.value,
      label: translateProjectLookup(s.value, s.label, isAr),
    })),
  [statusesQ.data, isAr]);

  const employeeItems = useMemo(() =>
    (employeesQ.data?.data ?? []).map(e => ({
      id:     e.id,
      label:  e.name,
      detail: e.email,
      meta:   [e.jobTitle, e.department]
        .map(v => resolveDisplayText(v, isAr))
        .filter(Boolean)
        .join(' · '),
    })),
  [employeesQ.data, isAr]);

  const managerItems = useMemo(() => {
    const q = managerSearch.trim().toLowerCase();
    return (managersQ.data ?? [])
      .filter(m => !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q))
      .map(m => ({
        id:     m.id,
        label:  m.name,
        detail: m.email,
      }));
  }, [managersQ.data, managerSearch]);

  useEffect(() => {
    setProjectTypeId('');
    setManagerIds([]);
    setEmployeeIds([]);
    setEmployeeSearch('');
  }, [departmentId]);

  useEffect(() => {
    setManagerIds([]);
    setEmployeeIds([]);
    setEmployeeSearch('');
  }, [projectTypeId]);

  useEffect(() => {
    const options = statusesQ.data ?? [];
    if (options.length === 0) return;
    if (!options.some(s => s.value === status)) {
      setStatus(options[0].value);
    }
  }, [statusesQ.data, status]);

  const validateOptionalFields = useCallback(() => {
    const optional = validateProjectOptionalFields(githubLink, driveLink, contractDurationMonths, isAr);
    setFieldErrors(prev => {
      const next = { ...prev };
      delete next.githubLink;
      delete next.driveLink;
      delete next.contractDurationMonths;
      return { ...next, ...optional };
    });
    return Object.keys(optional).length === 0;
  }, [githubLink, driveLink, contractDurationMonths, isAr]);

  const createMutation = useMutation({
    mutationFn: async (asDraft: boolean) => {
      const common = {
        name:                   name.trim(),
        description:            description.trim() || null,
        projectTypeId:          Number(projectTypeId),
        githubLink:             optionalLink(githubLink),
        driveLink:              optionalLink(driveLink),
        contractDurationMonths: optionalContractDurationMonths(contractDurationMonths),
        employeeIds:            employeeIds.length ? employeeIds : undefined,
        status:                 status || 'not_started',
        isDraft:                asDraft,
        startDate:              startDate || null,
      };

      if (module === 'pm') {
        return createProjectApi.createPm({
          ...common,
          deadline:   endDate || null,
          templateId: templateId || null,
          managerIds: isAdmin ? managerIds : undefined,
        }, attachment);
      }

      return createProjectApi.createSeo({
        ...common,
        targetDomain:     targetDomain.trim() || null,
        expectedEndDate:  endDate || null,
        managerIds:       isAdmin ? managerIds : undefined,
      }, attachment);
    },
    onSuccess: (res, asDraft) => {
      const newId = res.data?.data?.id;
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
      queryClient.invalidateQueries({ queryKey: ['seo-member-dashboard'] });
      queryClient.invalidateQueries({ queryKey: module === 'pm' ? ['pm-dashboard'] : ['seo-leader', 'projects'] });
      setSavedAsDraft(asDraft);
      setSaved(true);
      if (newId == null) {
        toast.success(asDraft
          ? (isAr ? 'تم حفظ المسودة' : 'Draft saved')
          : (isAr ? 'تم إنشاء المشروع' : 'Project created'));
        return;
      }
      const path = module === 'pm'
        ? ROUTES.PROJECT_MANAGER.DETAILS(String(newId))
        : (user?.role === 'seo-member'
          ? ROUTES.SEO_MEMBER.DETAILS(String(newId))
          : ROUTES.SEO_LEADER.DETAILS(String(newId)));
      setTimeout(() => navigate(path), 1200);
    },
    onError: (err) => {
      const apiFieldErrors = extractApiFieldErrors(err);
      if (Object.keys(apiFieldErrors).length > 0) {
        setFieldErrors(prev => ({ ...prev, ...apiFieldErrors }));
        toast.error(extractApiError(err) || (isAr ? 'راجع الحقول المطلوبة' : 'Please check the required fields'));
      } else {
        toast.error(extractApiError(err));
      }
    },
  });

  const addTypeMutation = useMutation({
    mutationFn: (payload: CreateProjectTypePayload) =>
      createProjectApi.createProjectType(module, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['create-project', module, 'types'] });
      setShowAddType(false);
      toast.success(isAr ? 'تم إضافة نوع المشروع' : 'Project type added');
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  function validate(asDraft: boolean): boolean {
    const errors: CreateProjectFieldErrors = {};

    if (!name.trim()) {
      errors.name = isAr ? 'اسم المشروع مطلوب' : 'Project name is required';
    }
    if (!projectTypeId) {
      errors.projectTypeId = isAr ? 'نوع المشروع مطلوب' : 'Project type is required';
    }
    if (module === 'seo' && !targetDomain.trim() && !asDraft) {
      errors.targetDomain = isAr ? 'الدومين المستهدف مطلوب' : 'Target domain is required';
    }
    if (isAdmin && managerIds.length === 0) {
      errors.managerIds = isAr
        ? 'يجب اختيار مدير مشروع واحد على الأقل'
        : 'At least one project manager must be selected';
    }
    if (!asDraft && employeeIds.length === 0) {
      errors.employeeIds = isAr
        ? 'يجب تعيين موظف واحد على الأقل قبل النشر'
        : 'Assign at least one employee before publishing';
    }

    setFieldErrors(errors);
    const optionalOk = validateOptionalFields();
    return Object.keys(errors).length === 0 && optionalOk;
  }

  function handleSave(asDraft = saveAsDraft) {
    if (createMutation.isPending) return;
    if (!validate(asDraft)) {
      toast.error(isAr ? 'راجع الحقول المطلوبة قبل الإنشاء' : 'Please fill the required fields');
      return;
    }
    createMutation.mutate(asDraft);
  }

  const cancelPath = module === 'pm'
    ? (user?.role === 'employee' ? ROUTES.EMPLOYEE.MY_PROJECTS : ROUTES.PROJECT_MANAGER.DASHBOARD)
    : (user?.role === 'seo-member' ? ROUTES.SEO_MEMBER.MY_PROJECTS : ROUTES.SEO_LEADER.DASHBOARD);

  const isValid = !!name.trim() && !!projectTypeId && (!isAdmin || managerIds.length > 0);

  return {
    module,
    isAr,
    isAdmin,
    isValid,
    saved,
    savedAsDraft,
    isSaving: createMutation.isPending,
    cancelPath,
    handleSave,
    // fields
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
    // lookups
    departmentItems,
    projectTypeItems,
    statusItems,
    employeeItems,
    managerItems,
    typesLoading: typesQ.isLoading,
    statusesLoading: statusesQ.isLoading,
    employeesLoading: employeesQ.isLoading,
    managersLoading: managersQ.isLoading,
    showDepartment: isAdmin,
    showManagers: isAdmin,
    showAddType, setShowAddType,
    submitAddType: (payload: CreateProjectTypePayload) => addTypeMutation.mutate(payload),
    addingType: addTypeMutation.isPending,
    selectedDepartmentId: deptNum ?? 0,
    clearFieldError: (key: keyof CreateProjectFieldErrors) =>
      setFieldErrors(prev => { const n = { ...prev }; delete n[key]; return n; }),
  };
}
