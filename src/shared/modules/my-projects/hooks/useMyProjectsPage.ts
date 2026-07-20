import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { useLang } from '@/app/providers/LanguageProvider';
import { useProjectStatusLookups } from '@/shared/hooks/useProjectStatusLookups';
import { myProjectsApi } from '../api/myProjects.api';
import {
  PER_PAGE,
  groupMembershipProjectsIntoSections,
  groupSeoProjectsIntoSections,
  resolveMyProjectsConfig,
} from '../utils/myProjects.utils';
import type {
  DashboardProjectCard,
  MyProjectsModule,
  MyProjectsPageConfig,
  PmProject,
  ProjectSection,
  SeoProject,
  StatusLookupItem,
} from '../types/myProjects.types';

export interface UseMyProjectsPageResult {
  config:          MyProjectsPageConfig;
  isAr:            boolean;
  search:          string;
  setSearch:       (v: string) => void;
  status:          string;
  setStatus:       (v: string) => void;
  showDrafts:      boolean;
  setShowDrafts:   (v: boolean) => void;
  page:            number;
  setPage:         (v: number) => void;
  pmProjects:      PmProject[];
  seoProjects:     SeoProject[];
  sections:        ProjectSection[];
  statusOptions:   StatusLookupItem[];
  isLoading:       boolean;
  isError:         boolean;
  total:           number;
  lastPage:        number;
  currentPage:     number;
  isEmpty:         boolean;
}

export function useMyProjectsPage(module: MyProjectsModule): UseMyProjectsPageResult {
  const { user, can } = useAuth();
  const { lang } = useLang();
  const isAr       = lang === 'ar';
  const role       = user!.role;

  const config = useMemo(() => {
    const base = resolveMyProjectsConfig(role, module);
    const createSlug = module === 'seo' ? 'create-seo-project' : 'create-pm-project';
    return { ...base, canCreate: base.canCreate && can(createSlug) };
  }, [role, module, can]);

  const [search, setSearchRaw]     = useState('');
  const [status, setStatusRaw]     = useState('');
  const [showDrafts, setShowDrafts] = useState(false);
  const [page, setPageRaw]         = useState(1);

  const setSearch = (v: string) => { setSearchRaw(v); setPageRaw(1); };
  const setStatus = (v: string) => { setStatusRaw(v); setPageRaw(1); };
  const setPage   = (v: number) => setPageRaw(v);

  const listParams = useMemo(() => ({
    search:   config.canSearch && search.trim() ? search.trim() : undefined,
    status:   config.canFilterStatus && status ? status : undefined,
    // Explicit 0/1 — omitting the param was returning drafts anyway.
    is_draft: config.canToggleDraft ? showDrafts : undefined,
    per_page: PER_PAGE,
    page,
  }), [config, search, status, showDrafts, page]);

  const statusQuery = useProjectStatusLookups(module);

  const paginatedQuery = useQuery({
    queryKey: ['my-projects', module, role, listParams],
    queryFn: async () => {
      if (module === 'pm') {
        // Managers only — employees use sections + listEmployeeProjects
        const res = await myProjectsApi.listPm(listParams, false);
        return res.data.data;
      }
      const res = await myProjectsApi.listSeo(listParams);
      return res.data.data;
    },
    enabled: config.viewMode === 'paginated',
    staleTime: 30_000,
  });

  const sectionsQuery = useQuery({
    queryKey: ['my-projects', 'sections', module, role, statusQuery.data],
    queryFn: async () => {
      const catalog = statusQuery.data ?? [];
      if (module === 'pm') {
        const projects = await myProjectsApi.listEmployeeProjects();
        return groupMembershipProjectsIntoSections(projects, isAr, catalog);
      }
      const projects = await myProjectsApi.listSeoEmployeeProjects();
      return groupSeoProjectsIntoSections(projects, isAr, catalog);
    },
    enabled:  config.viewMode === 'sections',
    staleTime: 30_000,
  });

  const isLoading = config.viewMode === 'paginated'
    ? paginatedQuery.isLoading
    : sectionsQuery.isLoading;

  const isError = config.viewMode === 'paginated'
    ? paginatedQuery.isError
    : sectionsQuery.isError;

  const pmProjects: PmProject[] = module === 'pm' && config.viewMode === 'paginated'
    ? (paginatedQuery.data?.data as PmProject[] ?? [])
    : [];

  const seoProjects: SeoProject[] = module === 'seo' && config.viewMode === 'paginated'
    ? (paginatedQuery.data?.data as SeoProject[] ?? [])
    : [];

  const sections: ProjectSection[] = config.viewMode === 'sections'
    ? (sectionsQuery.data ?? [])
    : [];

  const total       = paginatedQuery.data?.total ?? 0;
  const lastPage    = paginatedQuery.data?.last_page ?? 1;
  const currentPage = paginatedQuery.data?.current_page ?? page;

  const sectionTotal = sections.reduce((sum, s) => sum + s.total, 0);
  const isEmpty = config.viewMode === 'paginated'
    ? !isLoading && total === 0
    : !isLoading && sectionTotal === 0;

  return {
    config,
    isAr,
    search,
    setSearch,
    status,
    setStatus,
    showDrafts,
    setShowDrafts,
    page,
    setPage,
    pmProjects,
    seoProjects,
    sections,
    statusOptions: statusQuery.data ?? [],
    isLoading,
    isError,
    total,
    lastPage,
    currentPage,
    isEmpty,
  };
}

export function flattenSectionProjects(sections: ProjectSection[]): DashboardProjectCard[] {
  return sections.flatMap(s => s.projects);
}
