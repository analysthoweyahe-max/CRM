import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';
import { Card } from '@/shared/components/ui/Card';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { ROUTES } from '@/app/router/routes';
import { useProjectDetails } from '../hooks/useProjectDetails';
import { ProjectDetailsContent } from '../components/ProjectDetailsContent';
import { ProjectDetailsSkeleton } from '../components/ProjectDetailsSkeleton';

export function ProjectInfoPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();

  const { project, isLoading, isError } = useProjectDetails(id);

  const BackIcon = isAr ? ArrowRight : ArrowLeft;
  const goBack   = () => navigate(ROUTES.PROJECT_MANAGER.DETAILS(id));

  if (isLoading) return <ProjectDetailsSkeleton />;

  if (isError || !project) {
    navigate(ROUTES.PROJECT_MANAGER.DASHBOARD);
    return null;
  }

  return (
    <div className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>
      <PageHeader
        title={isAr ? 'تفاصيل المشروع' : 'Project Details'}
        subtitle={project.name}
        start={
          <Button variant="ghost" startIcon={<BackIcon size={15} />} onClick={goBack}>
            {isAr ? 'العودة' : 'Back'}
          </Button>
        }
      />

      <Card className="p-5">
        <ProjectDetailsContent project={project} isAr={isAr} />
      </Card>
    </div>
  );
}
