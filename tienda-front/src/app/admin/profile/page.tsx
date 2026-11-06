import StoreProfileForm from "@/app/admin/_components/StoreProfileForm";
import { getTranslations } from "next-intl/server";

export default async function AdminStoreProfile() {
  const t = await getTranslations("admin.profile_page");

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">{t("title")}</h1>
        <p className="text-gray-4 text-sm font-medium mt-1">{t("subtitle")}</p>
      </div>
      <StoreProfileForm storeId="me" />
    </div>
  );
}
