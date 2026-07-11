import { Package } from 'lucide-react';
import { SalesPagePlaceholder } from '@/modules/sales/shared/components/SalesPagePlaceholder';

export function SalesProductsPage() {
  return (
    <SalesPagePlaceholder
      icon={<Package size={26} className="text-[#709028] dark:text-[#A0CD39]" />}
      titleAr="المنتجات والخدمات" titleEn="Products & Services"
      subtitleAr="كتالوج المنتجات والخدمات المعروضة" subtitleEn="Catalog of products and services offered"
    />
  );
}
