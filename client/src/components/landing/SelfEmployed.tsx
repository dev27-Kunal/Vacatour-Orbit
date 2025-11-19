import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LanguageSelector } from "@/components/language-selector";
import {
  Building2,
  Users,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  MessageCircle,
  Globe,
  Shield,
  Zap,
  Target,
  BarChart3,
  Clock,
  Euro,
  UserCheck,
  FileText,
  Video,
  Upload,
  Bell,
  GroupIcon,
  ArrowRight,
  Star,
  Award,
  Rocket,
  Sparkles,
  MessageSquare,
  Share,
  ChartColumn,
} from "lucide-react";
import { Icon } from "@radix-ui/react-select";

function SelfEmployed() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const getArrayItems = (keyPath: string): string[] => {
    const items: string[] = [];
    let index = 0;
    while (index < 10) {
      // Safety limit to prevent infinite loops
      const key = `${keyPath}.${index}`;
      const item = t(key);
      if (!item || item === key) {
        break;
      }
      items.push(item);
      index++;
    }
    return items;
  };

  const SelfEmployedFeatures = [
    {
      Icon: <Briefcase className="text-white w-8 h-8" />,
      iconBtnColor: "bg-violetGradient",
      title: t("newLanding.selfEmployed.features.directClients.title"),
      description: t(
        "newLanding.selfEmployed.features.directClients.description"
      ),
      features: getArrayItems(
        "newLanding.selfEmployed.features.directClients.items"
      ),
      borderColor: "border-[#F3E8FF]",
      arcGradient: "bg-recruiterFeatureFirstArcIcon",
    },
    {
      Icon: <UserCheck className="text-white w-8 h-8" />,
      iconBtnColor: "bg-blueGradient",
      title: t("newLanding.selfEmployed.features.professionalProfile.title"),
      description: t(
        "newLanding.selfEmployed.features.professionalProfile.description"
      ),
      features: getArrayItems(
        "newLanding.selfEmployed.features.professionalProfile.items"
      ),
      borderColor: "border-[#DCFCE7]",
      arcGradient: "bg-recruiterFeatureSecondArcIcon",
    },
    {
      Icon: <TrendingUp className="text-white w-8 h-8" />,
      iconBtnColor: "bg-darkBlueGradient",
      title: t("newLanding.selfEmployed.features.assignmentMatching.title"),
      description: t(
        "newLanding.selfEmployed.features.assignmentMatching.description"
      ),
      features: getArrayItems(
        "newLanding.selfEmployed.features.assignmentMatching.items"
      ),
      borderColor: "border-[#FFE2E2]",
      arcGradient: "bg-recruiterFeatureThirdArcIcon",
    },
  ];

  const thirdSectionFeatures = [
    {
      Icon: <Zap className="text-white w-6 h-6" />,
      iconBtnColor: "bg-SelfEmployedYellowGradient",
      title: t("newLanding.selfEmployed.whyChoose.simple.title"),
      subTitle: t("newLanding.selfEmployed.whyChoose.simple.subtitle"),
      features: getArrayItems("newLanding.selfEmployed.whyChoose.simple.items"),
    },
    {
      Icon: <Shield className="text-white w-6 h-6" />,
      iconBtnColor: "bg-SelfEmployedGreenGradient",
      title: t("newLanding.selfEmployed.whyChoose.secure.title"),
      subTitle: t("newLanding.selfEmployed.whyChoose.secure.subtitle"),
      features: getArrayItems("newLanding.selfEmployed.whyChoose.secure.items"),
    },
  ];

  return (
    <section className="flex flex-col items-center gap-8 sm:gap-12 md:gap-16 mb-16 sm:mb-20 md:mb-28 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-4 sm:gap-5 md:gap-6">
        <div className="flex gap-2 items-center py-1.5 sm:py-2 px-3 sm:px-4 bg-SelfEmployedTitleGradient rounded-full border border-[#E9D4FF80]">
          <Target className="text-[#00A63E] w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-[11px] sm:text-[13px]">
            {t("newLanding.selfEmployed.badge")}
          </span>
        </div>
        <h2
          className="text-[clamp(24px,4vw,45px)] text-[#0A0A0A] bg-clip-text text-center px-4"
          style={{ lineHeight: "1.2" }}
        >
          {t("newLanding.selfEmployed.title")}
        </h2>
        <span className="text-[14px] sm:text-[16px] md:text-[18.4px] text-[#4A5565] text-center px-4 max-w-2xl">
          {t("newLanding.selfEmployed.subtitle")}
        </span>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
          <button
            onClick={() => setLocation("/register")}
            className="flex text-[#FFFFFF] bg-jobsSectionBtnGradient py-3 sm:py-4 px-4 sm:px-6 rounded-[14px] gap-2 items-center w-full sm:w-auto hover:opacity-90 transition-opacity cursor-pointer"
          >
            <span className="text-sm sm:text-base">
              {t("newLanding.selfEmployed.createProfile")}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLocation("/jobs")}
            className="flex text-[#0A0A0A] bg-[#FFFFFF] py-3 sm:py-4 px-4 sm:px-6 rounded-[14px] gap-2 items-center border-2 border-[#0000001A] w-full sm:w-auto hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <span className="text-sm sm:text-base">
              {t("newLanding.selfEmployed.viewAssignments")}
            </span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-stretch w-full max-w-7xl gap-4 sm:gap-6 md:gap-8">
        {SelfEmployedFeatures.map((item, index) => (
          <div
            key={index}
            className={`flex flex-col items-start bg-[#FFFFFFCC] p-6 sm:p-8 md:p-[34px] rounded-[14px] relative gap-4 sm:gap-5 md:gap-6 border-2 ${item.borderColor} h-full`}
          >
            <div
              className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 ${item.arcGradient} absolute top-0 right-0 rounded-bl-full`}
            ></div>
            <div
              className={`${item.iconBtnColor} p-4 sm:p-5 rounded-lg shadow-lg`}
            >
              {item.Icon}
            </div>
            <h6 className="text-[#0A0A0A] text-[18px] sm:text-[20px] md:text-[22.5px] font-semibold">
              {item.title}
            </h6>
            <span className="text-[#4A5565] text-[12px] sm:text-[13px]">
              {item.description}
            </span>
            <div className="flex flex-col gap-2 sm:gap-3">
              {item.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-[#DCFCE7] p-1 rounded-full flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-[#00A63E]" />
                  </div>
                  <span className="text-[#0A0A0A] text-[12px] sm:text-[13.1px]">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-SelfEmployedThirdSectionBg w-full max-w-7xl pt-8 sm:pt-12 md:pt-16 px-4 sm:px-6 md:px-12 pb-8 sm:pb-10 md:pb-12 rounded-3xl flex flex-col items-center gap-4 sm:gap-6">
        <div className="flex flex-col items-center gap-4 sm:gap-6">
          <div className="flex gap-2 items-center py-1.5 sm:py-2 px-3 sm:px-4 bg-[#FFFFFF33] rounded-full border border-[#FFFFFF4D]">
            <Star className="text-white w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-[11px] sm:text-[13px] text-white">
              {t("newLanding.selfEmployed.whyChoose.badge")}
            </span>
          </div>
          <h1 className="text-white text-[clamp(24px,4vw,34.6px)] text-center px-4">
            {t("newLanding.selfEmployed.whyChoose.title")}
          </h1>
          <span className="text-[14px] sm:text-[15px] md:text-[16.7px] text-white text-center px-4 max-w-2xl">
            {t("newLanding.selfEmployed.whyChoose.subtitle")}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 items-stretch w-full gap-4 sm:gap-6 md:gap-8">
          {thirdSectionFeatures.map((item, index) => (
            <div
              key={index}
              className={`flex flex-col items-start bg-[#FFFFFF1A] p-6 sm:p-8 md:p-[34px] rounded-[14px] relative gap-6 sm:gap-8 md:gap-10 border border-[#FFFFFF33] h-full`}
            >
              <div className="flex gap-3 sm:gap-4 items-center">
                <div
                  className={`${item.iconBtnColor} p-[8px] sm:p-[10px] md:p-[14px] rounded-lg shadow-lg flex-shrink-0`}
                >
                  {item.Icon}
                </div>
                <div className="flex flex-col items-start gap-1.5 sm:gap-2">
                  <h1
                    className={`text-[18px] sm:text-[20px] md:text-[22.7px] text-white font-semibold`}
                  >
                    {item.title}
                  </h1>
                  <h2 className="text-[#FFFFFFCC] text-[12px] sm:text-[13.2px]">
                    {item.subTitle}
                  </h2>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:gap-3">
                {item.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1 rounded-full flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#05DF72]" />
                    </div>
                    <span className="text-[#FFFFFFE5] text-[11px] sm:text-[12px] md:text-[13.1px]">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full max-w-7xl pt-8 sm:pt-12 md:pt-16 px-4 sm:px-6 md:px-12 pb-8 sm:pb-10 md:pb-12 rounded-3xl flex flex-col items-center gap-4 sm:gap-5 md:gap-6 bg-SelfEmployedLastSectionBg shadow-md">
        <h1 className="text-[#0A0A0A] text-[clamp(20px,3vw,28px)] font-semibold text-center px-4">
          {t("newLanding.selfEmployed.cta.title")}
        </h1>
        <span className="text-[#4A5565] text-[13px] sm:text-[14px] md:text-[14.8px] w-full max-w-xl text-center font-medium px-4">
          {t("newLanding.selfEmployed.cta.description")}
        </span>
        <button
          onClick={() => setLocation("/register")}
          className="flex text-[#FFFFFF] bg-jobsSectionBtnGradient py-3 sm:py-[14px] px-4 sm:px-6 rounded-[14px] gap-2 items-center justify-center w-full sm:w-auto hover:opacity-90 transition-opacity cursor-pointer"
        >
          <span className="text-sm sm:text-base">
            {t("newLanding.selfEmployed.cta.button")}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}

export default SelfEmployed;
