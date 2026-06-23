import { useState }      from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate }   from 'react-router-dom';
import { Button }        from '@/shared/components/ui/Button';
import { Modal }         from '@/shared/components/ui/Modal';
import { ROUTES }        from '@/app/router/routes';
import { deleteProject } from '../store/projectStore';

interface Props {
  projectId:   string;
  projectName: string;
  isAr:        boolean;
}

export function DangerZoneCard({ projectId, projectName, isAr }: Props) {
  const navigate  = useNavigate();
  const [open, setOpen] = useState(false);

  function handleConfirm() {
    deleteProject(projectId);
    setOpen(false);
    navigate(ROUTES.PROJECT_MANAGER.DASHBOARD);
  }

  return (
    <>
      <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 p-6 space-y-3">
        <h2 className="text-base font-bold text-red-600 dark:text-red-400 text-end">
          {isAr ? 'منطقة الخطر' : 'Danger Zone'}
        </h2>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Button
            variant="danger"
            startIcon={<Trash2 size={15} />}
            onClick={() => setOpen(true)}
          >
            {isAr ? 'حذف المشروع نهائياً' : 'Delete Project'}
          </Button>
          <p className="text-sm text-red-500 dark:text-red-400 text-end flex-1">
            {isAr
              ? 'حذف المشروع نهائياً مع جميع مهامه وبياناته.'
              : 'Permanently delete this project along with all its tasks and data.'}
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        size="sm"
        title={isAr ? 'حذف المشروع نهائياً' : 'Delete Project'}
        footer={
          <div className="flex items-center gap-3 justify-start flex-row-reverse">
            <Button variant="danger" onClick={handleConfirm}>
              {isAr ? 'حذف نهائي' : 'Delete'}
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        }
      >
        {/* Icon + body text */}
        <div className="flex flex-col items-end gap-4 text-end">
          {/* Amber warning icon */}
          <div className="self-center w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <AlertTriangle size={28} className="text-red-400" />
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300">
            {isAr
              ? <>سيتم حذف <span className="font-semibold text-gray-900 dark:text-gray-100">"{projectName}"</span> وكل ما يتعلق به.</>
              : <>Project <span className="font-semibold text-gray-900 dark:text-gray-100">"{projectName}"</span> and all its data will be deleted.</>
            }
          </p>

          {/* Warning notice */}
          <div className="w-full rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-2.5 text-center">
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
              {isAr ? 'لا يمكن التراجع عن هذا الإجراء' : 'This action cannot be undone'}
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
}
