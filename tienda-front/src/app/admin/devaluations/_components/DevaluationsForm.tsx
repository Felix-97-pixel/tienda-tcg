"use client";
import React from "react";
import { useTranslations } from "next-intl";
import Loader from "@/components/ui/Loader";
import { Button } from "@/components/ui/Button";
import { IconCoins, IconGlobe } from "@/components/ui/Icons";
import { useStoreProfile } from "@/app/admin/_components/hooks/useStoreProfile";
import { PenaltySlider } from "@/components/ui/PenaltySlider";
import SegmentedControl from "@/components/ui/SegmentedControl";

export default function DevaluationsForm() {
  const t = useTranslations("devaluations_page");
  const { loading, saving, formData, setFormData, saveProfile } = useStoreProfile("me");
  const [selectedGameId, setSelectedGameId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!loading && formData.supportedGames && formData.supportedGames.length > 0 && !selectedGameId) {
      setSelectedGameId(formData.supportedGames[0].id);
    }
  }, [loading, formData.supportedGames, selectedGameId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGameId) {
      await saveProfile(selectedGameId);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader text={t("loading_rules")} className="min-h-[40vh] bg-transparent py-10" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      {/* Selector de Juego */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {formData.supportedGames?.length === 0 ? (
          <div className="text-red-400 text-sm py-2 px-4 bg-red-400/10 rounded-full border border-red-500/20">
            {t("configure_one_game")}
          </div>
        ) : (
          <SegmentedControl
            fullWidth={false}
            value={selectedGameId || ""}
            onChange={(val) => setSelectedGameId(val)}
            options={(formData.supportedGames || []).map((game) => ({
              value: game.id,
              label: game.name,
              variant: "default",
            }))}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0E121B] rounded-3xl shadow-xl p-8 border border-white/10 space-y-6">
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-red/10 border border-red/20 flex items-center justify-center shadow-inner">
                <IconCoins className="w-6 h-6 text-red" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight">{t("title")}</h2>
                <p className="text-xs text-white/40 font-medium mt-1">
                  {t("subtitle")} 
                  <strong className="text-white ml-1">{t("base_near_mint")}</strong>
                </p>
              </div>
            </div>

            <div className="bg-[#080B12] border border-white/10 p-6 rounded-2xl space-y-4">
              {formData.devaluations && formData.devaluations.filter(d => d.gameId === selectedGameId).map((dev) => {
                const isNM = dev.conditionName.toLowerCase() === "near mint" || dev.conditionName.toLowerCase() === "near_mint" || dev.conditionName.toLowerCase() === "nm";
                const index = formData.devaluations!.findIndex(d => d.conditionId === dev.conditionId && d.gameId === selectedGameId);
                return (
                  <div key={`${dev.conditionId}-${dev.gameId}`}>
                    <PenaltySlider
                      label={dev.conditionName}
                      value={isNM ? 100 : Math.round(dev.multiplier * 100)}
                      disabled={isNM}
                      onChange={(val) => {
                        const newMult = val / 100;
                        const newDevals = [...(formData.devaluations || [])];
                        newDevals[index] = { ...dev, multiplier: newMult };
                        setFormData(prev => ({ ...prev, devaluations: newDevals }));
                      }}
                    />
                  </div>
                );
              })}

              {(!formData.devaluations?.length || !selectedGameId) && (
                <div className="text-white/40 text-sm text-center py-6">{t("no_conditions")}</div>
              )}
            </div>

            <div className="flex items-center gap-4 mb-6 mt-8">
              <div className="w-12 h-12 rounded-2xl bg-red/10 border border-red/20 flex items-center justify-center shadow-inner text-red">
                <IconGlobe className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight">{t("language_rules_title")}</h2>
                <p className="text-xs text-white/40 font-medium mt-1">
                  {t("language_rules_desc")}
                  <strong className="text-white ml-1">{t("base_english")}</strong>
                </p>
              </div>
            </div>

            <div className="bg-[#080B12] border border-white/10 p-6 rounded-2xl space-y-4">
              {formData.languageDevaluations && formData.languageDevaluations.filter(d => d.gameId === selectedGameId).map((dev) => {
                const isEnglish = dev.languageName.toLowerCase() === "english" || dev.languageName.toLowerCase() === "inglés" || dev.languageName.toLowerCase() === "ingles";
                const index = formData.languageDevaluations!.findIndex(d => d.languageId === dev.languageId && d.gameId === selectedGameId);
                return (
                  <div key={`${dev.languageId}-${dev.gameId}`}>
                    <PenaltySlider
                      label={dev.languageName}
                      value={isEnglish ? 100 : Math.round(dev.multiplier * 100)}
                      disabled={isEnglish}
                      onChange={(val) => {
                        const newMult = val / 100;
                        const newDevals = [...(formData.languageDevaluations || [])];
                        newDevals[index] = { ...dev, multiplier: newMult };
                        setFormData(prev => ({ ...prev, languageDevaluations: newDevals }));
                      }}
                    />
                  </div>
                );
              })}

              {(!formData.languageDevaluations?.length || !selectedGameId) && (
                <div className="text-white/40 text-sm text-center py-6">{t("no_languages")}</div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                variant="primary"
                type="button"
                onClick={handleSave}
                isLoading={saving}
                className="min-w-[170px]"
              >
                {t("save_rules_btn")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
