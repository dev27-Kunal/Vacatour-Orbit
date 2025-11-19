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

function JobPage() {
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

  const tabArrays = [
    {
      name: t("newLanding.features.pushNotifications"),
      textColor: "bg-heroTabGradientOrange",
      Icon: <Bell className="text-white w-4 h-4" />,
    },
    {
      name: t("newLanding.features.videoInterviews"),
      textColor: "bg-heroTabGradientBlue",
      Icon: <Video className="text-white w-4 h-4" />,
    },
    {
      name: t("newLanding.features.guestChat"),
      textColor: "bg-heroTabGradientGreen",
      Icon: <MessageSquare className="text-white w-4 h-4" />,
    },
    {
      name: t("newLanding.features.fileSharing"),
      textColor: "bg-heroTabGradientPurple",
      Icon: <Share className="text-white w-4 h-4" />,
    },
    {
      name: t("newLanding.features.groupChat"),
      textColor: "bg-heroTabGradientRed",
      Icon: <Users className="text-white w-4 h-4" />,
    },
  ];

  const platformTabArrays = [
    {
      name: t("newLanding.platformFeaturesForEveryone.pushNotifications.name"),
      textColor: "bg-heroTabGradientOrange",
      Icon: <Bell className="text-white w-10 h-10" />,
      borderColor: "border-[#FFEDD4]",
      description: t(
        "newLanding.platformFeaturesForEveryone.pushNotifications.description"
      ),
    },
    {
      name: t("newLanding.platformFeaturesForEveryone.videoInterviews.name"),
      textColor: "bg-heroTabGradientBlue",
      Icon: <Video className="text-white w-10 h-10" />,
      borderColor: "border-[#DCFCE7]",
      description: t(
        "newLanding.platformFeaturesForEveryone.videoInterviews.description"
      ),
    },
    {
      name: t("newLanding.platformFeaturesForEveryone.guestChat.name"),
      textColor: "bg-heroTabGradientGreen",
      Icon: <MessageSquare className="text-white w-10 h-10" />,
      borderColor: "border-[#DCFCE7]",
      description: t(
        "newLanding.platformFeaturesForEveryone.guestChat.description"
      ),
    },
    {
      name: t("newLanding.platformFeaturesForEveryone.fileSharing.name"),
      textColor: "bg-heroTabGradientPurple",
      Icon: <Share className="text-white w-10 h-10" />,
      borderColor: "border-[#F3E8FF]",
      description: t(
        "newLanding.platformFeaturesForEveryone.fileSharing.description"
      ),
    },
    {
      name: t("newLanding.platformFeaturesForEveryone.groupChat.name"),
      textColor: "bg-heroTabGradientRed",
      Icon: <Users className="text-white w-10 h-10" />,
      borderColor: "border-[#FFE2E2]",
      description: t(
        "newLanding.platformFeaturesForEveryone.groupChat.description"
      ),
    },
  ];

  const jobCardArray = [
    {
      Icon: <MessageSquare className="text-white w-8 h-8" />,
      iconBtnColor: "bg-jobsFirstCardIconGradient",
      title: t("newLanding.jobCards.directCommunication.title"),
      description: t("newLanding.jobCards.directCommunication.description"),
      features: getArrayItems(
        "newLanding.jobCards.directCommunication.features"
      ),
      borderColor: "border-[#DCFCE7]",
      arcGradient: "bg-jobsFirstCardArcGradient",
    },
    {
      Icon: <Target className="text-white w-8 h-8" />,
      iconBtnColor: "bg-jobsSecondCardIconGradient",
      title: t("newLanding.jobCards.smartMatching.title"),
      description: t("newLanding.jobCards.smartMatching.description"),
      features: getArrayItems("newLanding.jobCards.smartMatching.features"),
      borderColor: "border-[#FFEDD4]",
      arcGradient: "bg-jobsSecondCardArcGradient",
    },
    {
      Icon: <ChartColumn className="text-white w-8 h-8" />,
      iconBtnColor: "bg-jobsThirdCardIconGradient",
      title: t("newLanding.jobCards.analytics.title"),
      description: t("newLanding.jobCards.analytics.description"),
      features: getArrayItems("newLanding.jobCards.analytics.features"),
      borderColor: "border-[#F3E8FF]",
      arcGradient: "bg-jobsThirdCardArcGradient",
    },
  ];

  const jobPercentCard = [
    {
      Icon: <Clock className="text-white w-8 h-8" />,
      iconBtnColor: "bg-blueGradient",
      percentage: 70,
      title: t("newLanding.benefits.fasterHiring"),
      percentageColor: "bg-jobsFirstPercentageColor",
      borderColor: "border-[#DCFCE7]",
    },
    {
      Icon: <TrendingUp className="text-white w-8 h-8" />,
      iconBtnColor: "bg-jobsFirstCardIconGradient",
      percentage: 50,
      title: t("newLanding.benefits.lowerCosts"),
      percentageColor: "bg-jobsSecondPercentageColor",
      borderColor: "border-[#DCFCE7]",
    },
    {
      Icon: <Users className="text-white w-8 h-8" />,
      iconBtnColor: "bg-violetGradient",
      percentage: 95,
      title: t("newLanding.benefits.betterMatches"),
      percentageColor: "bg-jobsThirdPercentageColor",
      borderColor: "border-[#F3E8FF]",
    },
    {
      Icon: <Shield className="text-white w-8 h-8" />,
      iconBtnColor: "bg-jobsFourthPercentageBg",
      percentage: 100,
      title: t("newLanding.benefits.gdprCompliant"),
      percentageColor: "bg-jobsFourthPercentageColor",
      borderColor: "border-[#FFE2E2]",
    },
  ];
  return (
    <section className="flex flex-col items-center gap-8 sm:gap-12 md:gap-16 mb-16 sm:mb-20 md:mb-28 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-4 sm:gap-5 md:gap-6">
        <div className="flex gap-2 items-center py-1.5 sm:py-2 px-3 sm:px-4 bg-heroTitleGradient rounded-full border border-[#E9D4FF80]">
          <Sparkles className="text-[#9810FA] w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-[11px] sm:text-[13px]">
            {t("newLanding.platformFeatures.badge")}
          </span>
        </div>
        <h2
          className="text-[clamp(24px,4vw,45px)] text-[#0A0A0A] bg-clip-text text-center px-4"
          style={{ lineHeight: "1.2" }}
        >
          {t("newLanding.platformFeatures.title")}
        </h2>
        <span className="text-[14px] sm:text-[16px] md:text-[18.4px] text-[#4A5565] text-center px-4 max-w-2xl">
          {t("newLanding.platformFeatures.subtitle")}
        </span>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
          <button 
            onClick={() => setLocation("/register")}
            className="flex text-[#FFFFFF] bg-jobsSectionBtnGradient py-3 sm:py-4 px-4 sm:px-6 rounded-[14px] gap-2 items-center w-full sm:w-auto hover:opacity-90 transition-opacity cursor-pointer"
          >
            <span className="text-sm sm:text-base">
              {t("newLanding.platformFeatures.startTrial")}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setLocation("/jobs")}
            className="flex text-[#0A0A0A] bg-[#FFFFFF] py-3 sm:py-4 px-4 sm:px-6 rounded-[14px] gap-2 items-center border-2 border-[#0000001A] w-full sm:w-auto hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <span className="text-sm sm:text-base">
              {t("newLanding.platformFeatures.viewCandidates")}
            </span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-stretch w-full max-w-7xl gap-4 sm:gap-6 md:gap-8">
        {jobCardArray.map((item, index) => (
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
      </div>
    </section>
  );
}

export default JobPage;
