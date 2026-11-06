import StoreProfileForm from "@/app/admin/_components/StoreProfileForm";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { IconArrowLeft } from "@/components/ui/Icons";

export default async function SuperAdminEditStore({ params }: { params: Promise<{ storeId: string }> }) {
  const resolvedParams = await params;
  const t = await getTranslations("stores_page");

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <Link href="/superadmin/stores" className="text-blue hover:text-indigo-400 text-sm font-bold flex items-center gap-2 mb-4">
          <IconArrowLeft className="w-4 h-4" />
          <span>{t("back_to_stores")}</span>
        </Link>
        <h1 className="text-2xl font-bold text-white tracking-tight">{t("edit_title")}</h1>
        <p className="text-gray-4 text-sm font-medium mt-1">{t("edit_subtitle")}</p>
      </div>
      <StoreProfileForm storeId={resolvedParams.storeId} />
    </div>
  );
}
