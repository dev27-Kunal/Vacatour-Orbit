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
  CircleX,
  CircleCheck,
} from "lucide-react";
import { Icon } from "@radix-ui/react-select";

function Recruiters() {
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

  const recruitersFirstRow = [
    {
      Icon: <CircleX className="text-white w-7 h-7" />,
      iconBtnColor: "bg-jobsFourthPercentageBg",
      title: t("newLanding.recruiters.problem.title"),
      tag: t("newLanding.recruiters.problem.tag"),
      tagBgColor: "bg-[#FFE2E2]",
      tagColor: "text-[#C10007]",
      description: t("newLanding.recruiters.problem.description"),
      borderColor: "border-[#FFC9C9]",
      arcBg: "bg-[#FB2C361A]",
    },
    {
      Icon: <CircleCheck className="text-white w-7 h-7" />,
      iconBtnColor: "bg-recruiterSecondCardIconGradient",
      title: t("newLanding.recruiters.solution.title"),
      tag: t("newLanding.recruiters.solution.tag"),
      tagBgColor: "bg-[#B9F8CF]",
      tagColor: "text-[#008236]",
      description: t("newLanding.recruiters.solution.description"),
      borderColor: "border-[#B9F8CF]",
      arcBg: "bg-[#00C9501A]",
    },
  ];

  const recruiterCardArray = [
    {
      Icon: <Globe className="text-white w-8 h-8" />,
      iconBtnColor: "bg-violetGradient",
      title: t("newLanding.recruiters.features.offerEverywhere.title"),
      description: t(
        "newLanding.recruiters.features.offerEverywhere.description"
      ),
      features: getArrayItems(
        "newLanding.recruiters.features.offerEverywhere.items"
      ),
      borderColor: "border-[#F3E8FF]",
      arcGradient: "bg-recruiterFeatureFirstArcIcon",
    },
    {
      Icon: <TrendingUp className="text-white w-8 h-8" />,
      iconBtnColor: "bg-blueGradient",
      title: t("newLanding.recruiters.features.professionalProfile.title"),
      description: t(
        "newLanding.recruiters.features.professionalProfile.description"
      ),
      features: getArrayItems(
        "newLanding.recruiters.features.professionalProfile.items"
      ),
      borderColor: "border-[#DCFCE7]",
      arcGradient: "bg-recruiterFeatureSecondArcIcon",
    },
    {
      Icon: <Zap className="text-white w-8 h-8" />,
      iconBtnColor: "bg-darkBlueGradient",
      title: t("newLanding.recruiters.features.jobMatching.title"),
      description: t("newLanding.recruiters.features.jobMatching.description"),
      features: getArrayItems(
        "newLanding.recruiters.features.jobMatching.items"
      ),
      borderColor: "border-[#FFE2E2]",
      arcGradient: "bg-recruiterFeatureThirdArcIcon",
    },
  ];

  const recruiterStatistics = [
    {
      IconComponent: TrendingUp,
      value: "85%",
      title: t("newLanding.recruiters.results.statistics.candidatesPlaced"),
    },
    {
      IconComponent: Users,
      value: "3.2x",
      title: t("newLanding.recruiters.results.statistics.newClients"),
    },
    {
      IconComponent: Euro,
      value: "€0",
      title: t("newLanding.recruiters.results.statistics.platformCosts"),
    },
    {
      IconComponent: Clock,
      value: "24/7",
      title: t("newLanding.recruiters.results.statistics.presentCandidates"),
    },
  ];
  return (
    <section className="flex flex-col items-center gap-8 sm:gap-12 md:gap-16 mb-16 sm:mb-20 md:mb-28 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-4 sm:gap-5 md:gap-6">
        <div className="flex gap-2 items-center py-1.5 sm:py-2 px-3 sm:px-4 bg-recruiterTitleGradient rounded-full border border-[#FFD6A780]">
          <Rocket className="text-[#F54900] w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-[11px] sm:text-[13px] text-[#0A0A0A]">
            {t("newLanding.recruiters.badge")}
          </span>
        </div>
        <h2
          className="text-[clamp(24px,4vw,45px)] text-[#0A0A0A] bg-clip-text text-center px-4"
          style={{ lineHeight: "1.2" }}
        >
          {t("newLanding.recruiters.title")}
        </h2>
        <span className="text-[14px] sm:text-[16px] md:text-[18.4px] text-[#4A5565] text-center px-4 max-w-2xl">
          {t("newLanding.recruiters.subtitle")}
        </span>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
          <button
            onClick={() => setLocation("/register")}
            className="flex text-[#FFFFFF] bg-jobsSectionBtnGradient py-3 sm:py-4 px-4 sm:px-6 rounded-[14px] gap-2 items-center w-full sm:w-auto hover:opacity-90 transition-opacity cursor-pointer"
          >
            <span className="text-sm sm:text-base">
              {t("newLanding.recruiters.startAsRecruiter")}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLocation("/demo")}
            className="flex text-[#0A0A0A] bg-[#FFFFFF] py-3 sm:py-4 px-4 sm:px-6 rounded-[14px] gap-2 items-center border-2 border-[#0000001A] w-full sm:w-auto hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <span className="text-sm sm:text-base">
              {t("newLanding.recruiters.viewDemo")}
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 items-stretch w-full max-w-7xl gap-4 sm:gap-6 md:gap-8">
        {recruitersFirstRow.map((item, index) => (
          <div
            key={index}
            className={`flex flex-col items-start bg-recruiterFirstCardBgGradient p-6 sm:p-8 md:p-[34px] rounded-[14px] relative gap-4 sm:gap-5 md:gap-9 border-2 ${item.borderColor} h-full overflow-hidden`}
          >
            <div
              className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 ${item.arcBg} absolute top-0 right-0 rounded-bl-full`}
            ></div>
            <div className="flex gap-3 sm:gap-4 items-center">
              <div
                className={`${item.iconBtnColor} p-[8px] sm:p-[10px] md:p-[14px] rounded-lg shadow-lg flex-shrink-0`}
              >
                {item.Icon}
              </div>
              <div className="flex flex-col items-start gap-2 sm:gap-[10px]">
                <div
                  className={`${item.tagBgColor} py-[3px] px-[7px] sm:px-[9px] text-[10px] sm:text-[11.4px] ${item.tagColor} rounded-[8px] whitespace-nowrap`}
                >
                  {item.tag}
                </div>
                <h6 className="text-[#0A0A0A] text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22.7px] font-semibold">
                  {item.title}
                </h6>
              </div>
            </div>
            <span className="text-[#364153] text-[11px] sm:text-[12px] md:text-[14.9px] leading-relaxed">
              {item.description}
            </span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-stretch w-full max-w-7xl gap-4 sm:gap-6 md:gap-8">
        {recruiterCardArray.map((item, index) => (
          <div
            key={index}
            className={`flex flex-col items-start bg-[#FFFFFFCC] p-6 sm:p-8 md:p-[34px] rounded-[14px] relative gap-4 sm:gap-5 md:gap-6 border-2 ${item.borderColor} h-full overflow-hidden`}
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
      <div className="bg-recruiterThirdSectionBg w-full max-w-7xl flex flex-col items-center py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-12 rounded-3xl gap-6 sm:gap-8 md:gap-12">
        <h6 className="text-[clamp(20px,3vw,28.4px)] text-white text-center px-4">
          {t("newLanding.recruiters.results.title")}
        </h6>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-stretch w-full gap-6 sm:gap-8 md:gap-12 lg:gap-16">
          {recruiterStatistics.map((item, index) => {
            const IconComponent = item.IconComponent;
            return (
              <div
                key={index}
                className="flex flex-col items-center gap-2 sm:gap-3"
              >
                <div className="p-4 sm:p-5 bg-[#FFFFFF33] border border-[#FFFFFF4D] rounded-2xl">
                  <IconComponent className="text-white w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10" />
                </div>
                <h2 className="text-[clamp(32px,5vw,47.1px)] text-[#FFFFFF] font-bold">
                  {item.value}
                </h2>
                <span className="text-[11px] sm:text-[12px] md:text-[13px] text-[#FFFFFFCC] text-center px-2">
                  {item.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-stretch w-full max-w-7xl gap-4 sm:gap-6 md:gap-8">
        {jobCardArray.map((item, index) => (
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-stretch w-full max-w-7xl gap-4 sm:gap-6 md:gap-8">
        {jobPercentCard.map((item, index) => (
          <div
            key={index}
            className={`flex flex-col items-center bg-[#FFFFFFCC] p-6 sm:p-8 md:p-[34px] rounded-[14px] gap-4 sm:gap-5 md:gap-6 border-2 ${item.borderColor} h-full`}
          >
            <div
              className={`${item.iconBtnColor} p-4 sm:p-5 rounded-lg shadow-lg`}
            >
              {item.Icon}
            </div>
            <span
              className={`${item.percentageColor} bg-clip-text text-transparent text-3xl sm:text-4xl font-bold`}
            >
              {item.percentage}%
            </span>
            <span className="text-[#4A5565] text-[12px] sm:text-[13.2px] text-center">
              {item.title}
            </span>
          </div>
        ))}
      </div> */}
    </section>
  );
}

export default Recruiters;
