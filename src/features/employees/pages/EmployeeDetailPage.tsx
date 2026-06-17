import { useParams } from 'react-router-dom';

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900">ملف الموظف — {id}</h2>
    </div>
  );
}
