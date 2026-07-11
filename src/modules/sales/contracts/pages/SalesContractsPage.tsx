import { FileSignature } from 'lucide-react';
import { SalesPagePlaceholder } from '@/modules/sales/shared/components/SalesPagePlaceholder';

export function SalesContractsPage() {
  return (
    <SalesPagePlaceholder
      icon={<FileSignature size={26} className="text-[#709028] dark:text-[#A0CD39]" />}
      titleAr="العقود" titleEn="Contracts"
      subtitleAr="إدارة عقود العملاء وتوقيعها" subtitleEn="Manage and sign customer contracts"
    />
  );
}
