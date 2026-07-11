import { useNavigate, useParams } from 'react-router-dom';
import { useQuery }               from '@tanstack/react-query';
import { useLang }                from '@/app/providers/LanguageProvider';
import { ROUTES }                 from '@/app/router/routes';
import { useAuth }                from '@/modules/auth/context/AuthContext';
import { campaignApi }            from '../api/campaign.api';
import { seoTeamApi }             from '../../team/api/seoTeam.api';
import type { SeoProjectMember }  from '../../team/types/seoTeam.types';
import { useAddSeoTask }          from '../components/useAddSeoTask';

export function useAddSeoTaskPage() {
  const { lang }    = useLang();
  const isAr        = lang === 'ar';
  const navigate    = useNavigate();
  const { user }    = useAuth();
  const { id = '' } = useParams<{ id: string }>();

  const detailsPath = user?.role === 'seo-member'
    ? ROUTES.SEO_MEMBER.DETAILS(id)
    : ROUTES.SEO_LEADER.DETAILS(id);

  const { data: campaign, isLoading: campaignLoading } = useQuery({
    queryKey: ['campaign-detail', id],
    queryFn:  async () => (await campaignApi.getById(id)).data.data,
    enabled:   !!id,
    staleTime: 30_000,
  });

  const { data: teamItems = [], isLoading: teamLoading } = useQuery({
    queryKey: ['campaign-team', id],
    queryFn:  async () => {
      const teamRes = await seoTeamApi.getProjectTeam(id);
      // The endpoint may return either a plain array or a { data: [...] } wrapper —
      // handle both so the assignee list is not silently empty.
      const payload = teamRes.data?.data as unknown;
      const members: SeoProjectMember[] = Array.isArray(payload)
        ? (payload as SeoProjectMember[])
        : ((payload as { data?: SeoProjectMember[] })?.data ?? []);
      return members.map(m => ({ id: m.id, label: m.name }));
    },
    enabled:   !!id,
    staleTime: 30_000,
  });

  const prefillUrl = campaign?.targetDomain ?? '';

  const taskForm = useAddSeoTask(
    id,
    prefillUrl,
    () => navigate(detailsPath),
  );

  return {
    isAr,
    id,
    campaign,
    campaignLoading,
    teamItems,
    teamLoading,
    prefillUrl,
    ...taskForm,
    goBack: () => navigate(detailsPath),
  };
}
