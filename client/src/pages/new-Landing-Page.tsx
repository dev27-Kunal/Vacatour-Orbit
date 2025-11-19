import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import {
  Building2,
  Users,
  Briefcase,
  CheckCircle2,
  Video,
  Bell,
  Rocket,
  Sparkles,
  MessageSquare,
  Share,
} from "lucide-react";
import LandingHeader from "@/components/landing/LandingHeader";
import JobPage from "@/components/landing/JobPage";
import Recruiters from "@/components/landing/Recruiters";
import SelfEmployed from "@/components/landing/SelfEmployed";

export default function NewLandingpage() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  // Use ref to persist tab across remounts (when language changes)
  const activeTabRef = useRef<number>(0);
  const [activeTab, setActiveTab] = useState(() => {
    // Try to restore from localStorage on initial mount
    const saved = localStorage.getItem("landingPageActiveTab");
    const tab = saved ? parseInt(saved, 10) : 0;
    activeTabRef.current = tab;
    return tab;
  });

  // Sync ref with state whenever activeTab changes
  useEffect(() => {
    activeTabRef.current = activeTab;
    localStorage.setItem("landingPageActiveTab", activeTab.toString());
  }, [activeTab]);

  // Smooth scroll when tab changes
  useEffect(() => {
    const scrollContainer = document.querySelector(".overflow-y-auto");
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [activeTab]);

  // Helper function to get array items from translations
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

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Fixed background with gradient and overlays */}
      <div className="fixed inset-0 bg-landingBgGradient light">
        <div className="w-[clamp(200px,31.25vw,600px)] h-[clamp(200px,31.25vw,600px)] border rounded-full absolute -bottom-[10%] left-[1%] blur-2xl bg-[#8EC5FF33]"></div>
        <div className="w-[clamp(200px,31.25vw,500px)] h-[clamp(200px,31.25vw,500px)] border rounded-full absolute -top-[0%] -right-[2%] blur-2xl bg-[#DAB2FF33]"></div>
      </div>

      {/* Scrollable content */}
      <div
        className="relative z-10 h-screen overflow-y-auto"
        style={{ touchAction: "pan-y" }}
      >
        <LandingHeader activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex flex-col">
          <section className="flex flex-col items-center py-40 sm:py-52 gap-6 sm:gap-8 md:gap-10 justify-center px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 items-center py-1.5 sm:py-2 px-3 sm:px-4 bg-heroTitleGradient rounded-full border border-[#E9D4FF80]">
              <Sparkles className="text-[#9810FA] w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-[11px] sm:text-[13px]">
                {t("newLanding.hero.badge")}
              </span>
            </div>
            <h1
              className="text-[clamp(32px,5vw,70px)] font-semibold bg-heroHeadingGradient bg-clip-text text-transparent text-center px-4"
              style={{ lineHeight: "1.1" }}
            >
              {t("newLanding.hero.title")}
            </h1>
            <span className="text-[16px] sm:text-[18px] md:text-[22px] text-center px-4 max-w-3xl">
              {t("newLanding.hero.subtitle")}
            </span>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 px-4 max-w-6xl">
              {tabArrays.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center py-2 sm:py-3 px-3 sm:px-4 md:px-5 gap-1.5 sm:gap-2 bg-[#FFFFFF] rounded-full shadow-lg"
                >
                  <div className={`${item.textColor} p-1.5 sm:p-2 rounded-lg`}>
                    {item.Icon}
                  </div>
                  <span className="text-xs sm:text-sm md:text-base whitespace-nowrap">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {activeTab === 0 && <JobPage />}
          {activeTab === 1 && <Recruiters />}
          {activeTab === 2 && <SelfEmployed />}

          <section className="flex flex-col items-center gap-8 sm:gap-12 md:gap-16 mb-16 sm:mb-20 md:mb-28 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-4 sm:gap-5 md:gap-6">
              <h2
                className="text-[clamp(24px,4vw,45px)] text-[#0A0A0A] bg-clip-text text-center px-4"
                style={{ lineHeight: "1.2" }}
              >
                {t("newLanding.platformFeaturesForEveryone.title")}
              </h2>
              <span className="text-[14px] sm:text-[16px] md:text-[18.4px] text-[#4A5565] text-center px-4 max-w-2xl">
                {t("newLanding.platformFeaturesForEveryone.subtitle")}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 w-full max-w-7xl gap-4 sm:gap-6">
              {platformTabArrays.map((item, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-center p-6 sm:p-8 gap-4 sm:gap-5 md:gap-6 bg-[#FFFFFF] rounded-[14px] border-2 ${item.borderColor}`}
                >
                  <div
                    className={`${item.textColor} p-4 sm:p-5 rounded-lg shadow-lg`}
                  >
                    {item.Icon}
                  </div>
                  <span className="text-[13px] sm:text-[14.8px] text-[#0A0A0A] font-medium text-center">
                    {item.name}
                  </span>
                  <span className="text-[12px] sm:text-[13.1px] text-[#4A5565] text-center">
                    {item.description}
                  </span>
                </div>
              ))}
            </div>
          </section>
          <section className="flex flex-col items-center gap-6 sm:gap-8 md:gap-10 bg-lastSectionGradient py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 items-center py-1.5 sm:py-2 px-3 sm:px-4 bg-[#FFFFFF33] rounded-full border border-[#FFFFFF4D]">
              <Rocket className="text-[#FFFFFF] w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-[11px] sm:text-[13px] text-[#FFFFFF]">
                {t("newLanding.cta.badge")}
              </span>
            </div>
            <h2
              className="text-[clamp(28px,5vw,52.2px)] text-[#FFFFFF] bg-clip-text text-center px-4"
              style={{ lineHeight: "1.2" }}
            >
              {t("newLanding.cta.title")}
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center items-center w-full max-w-4xl">
              <button
                onClick={() => {
                  setActiveTab(0);
                  setTimeout(() => {
                    const scrollContainer =
                      document.querySelector(".overflow-y-auto");
                    if (scrollContainer) {
                      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }, 100);
                }}
                className="bg-[#FFFFFF] flex items-center justify-center gap-3 sm:gap-4 py-2.5 sm:py-3 px-4 sm:px-6 text-[#9810FA] rounded-[14px] w-full sm:w-auto hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Briefcase className="w-4 h-4" />
                <span className="text-[14px] sm:text-[15px] md:text-[16.9px]">
                  {t("newLanding.cta.company")}
                </span>
              </button>
              <button
                onClick={() => {
                  setActiveTab(1);
                  setTimeout(() => {
                    const scrollContainer =
                      document.querySelector(".overflow-y-auto");
                    if (scrollContainer) {
                      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }, 100);
                }}
                className="bg-[#FFFFFF] flex items-center justify-center gap-3 sm:gap-4 py-2.5 sm:py-3 px-4 sm:px-6 text-[#9810FA] rounded-[14px] w-full sm:w-auto hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Building2 className="w-4 h-4" />
                <span className="text-[14px] sm:text-[15px] md:text-[16.9px]">
                  {t("newLanding.cta.recruiter")}
                </span>
              </button>
              <button
                onClick={() => {
                  setActiveTab(2);
                  setTimeout(() => {
                    const scrollContainer =
                      document.querySelector(".overflow-y-auto");
                    if (scrollContainer) {
                      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }, 100);
                }}
                className="bg-[#FFFFFF] flex items-center justify-center gap-3 sm:gap-4 py-2.5 sm:py-3 px-4 sm:px-6 text-[#9810FA] rounded-[14px] w-full sm:w-auto hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span className="text-[14px] sm:text-[15px] md:text-[16.9px]">
                  {t("newLanding.cta.freelancer")}
                </span>
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 justify-center items-center flex-wrap">
              <div className="text-[#FFFFFFCC] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span className="text-[12px] sm:text-[13px]">
                  {t("newLanding.cta.noCreditCard")}
                </span>
              </div>
              <div className="text-[#FFFFFFCC] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span className="text-[12px] sm:text-[13px]">
                  {t("newLanding.cta.freeTrial")}
                </span>
              </div>
              <div className="text-[#FFFFFFCC] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span className="text-[12px] sm:text-[13px]">
                  {t("newLanding.cta.cancelAnytime")}
                </span>
              </div>
            </div>
            <span className="text-[16px] sm:text-[18px] md:text-[22.3px] text-[#FFFFFFE5] text-center px-4 max-w-3xl">
              {t("newLanding.cta.subtitle")}
            </span>
          </section>
          <footer className="flex flex-col items-center gap-3 sm:gap-4 bg-[#0F172B] py-8 sm:py-10 md:py-12 px-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-primaryGradient p-1.5 sm:p-2 rounded-[14px]">
                <Sparkles className="text-white w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-xl sm:text-2xl text-[#FFFFFF] font-normal">
                {t("newLanding.hero.title")}
              </span>
            </div>
            <span className="text-[#FFFFFF99] text-[11px] sm:text-[12px] md:text-[13.1px] text-center">
              {t("newLanding.footer.copyright")}
            </span>
          </footer>
        </div>
      </div>
    </div>
  );
}
