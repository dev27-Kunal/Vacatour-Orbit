import React, { useState } from "react";
import {
  Sparkles,
  Briefcase,
  Hospital,
  Users,
  Globe,
  Menu,
} from "lucide-react";
import { useLanguageContext } from "@/context/LanguageContext";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const languages = [
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

interface LandingHeaderProps {
  activeTab: number;
  setActiveTab: (tab: number) => void;
}

function LandingHeader({ activeTab, setActiveTab }: LandingHeaderProps) {
  const { currentLanguage, changeLanguage } = useLanguageContext();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentLang =
    languages.find((lang) => lang.code === currentLanguage) || languages[0];

  const navigationButtons = [
    {
      label: t("newLanding.header.companies"),
      icon: <Briefcase className="text-white text-xl" />,
      gradient: "bg-violetGradient",
    },
    {
      label: t("newLanding.header.recruiters"),
      icon: <Hospital className="text-white text-xl" />,
      gradient: "bg-blueGradient",
    },
    {
      label: t("newLanding.header.freelancers"),
      icon: <Users className="text-white text-xl" />,
      gradient: "bg-darkBlueGradient",
    },
  ];

  return (
    <header className="flex justify-between items-center fixed top-0 left-0 right-0 z-50 py-2 px-4 sm:py-3 sm:px-6 lg:justify-evenly lg:px-0 backdrop-blur-sm">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="bg-primaryGradient p-1.5 sm:p-2 rounded-[14px]">
          <Sparkles className="text-white text-lg sm:text-2xl" />
        </div>
        <span className="text-lg sm:text-xl text-[#0A0A0A] font-normal">
          ORBIT
        </span>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:grid grid-flow-col items-center w-1/2 gap-2 bg-white py-1 px-1 rounded-2xl shadow-xl">
        {navigationButtons.map((btn, index) => (
          <button
            key={index}
            onClick={() => {
              setActiveTab(index);
              setTimeout(() => {
                const scrollContainer = document.querySelector('.overflow-y-auto');
                if (scrollContainer) {
                  scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }, 100);
            }}
            className={`flex items-center gap-2 sm:gap-3 justify-center py-3 sm:py-4 rounded-[14px] transition-all duration-200 cursor-pointer ${
              activeTab === index
                ? "bg-headerActiveGradient"
                : "hover:bg-gray-100"
            }`}
          >
            <div
              className={`p-[8px] sm:p-[10px] rounded-[10px] ${btn.gradient}`}
            >
              {btn.icon}
            </div>
            <span className="text-sm sm:text-base whitespace-nowrap">
              {btn.label}
            </span>
          </button>
        ))}
      </div>

      {/* Mobile Menu Button */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-[#FFFFFFCC] rounded-[8px]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="gap-1 sm:gap-2 px-0 py-0 h-auto text-[#0A0A0A] hover:text-[#0A0A0A] hover:bg-transparent"
              >
                <Globe className="text-[#0A0A0A] w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-[10px] sm:text-xs text-[#0A0A0A] hidden sm:inline">
                  {currentLang.flag} {currentLang.name}
                </span>
                <span className="text-[10px] sm:text-xs text-[#0A0A0A] sm:hidden">
                  {currentLang.flag}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((language) => (
                <DropdownMenuItem
                  key={language.code}
                  onClick={() => changeLanguage(language.code)}
                  className={`cursor-pointer ${
                    currentLanguage === language.code ? "bg-primary/10" : ""
                  }`}
                >
                  <span className="mr-2">{language.flag}</span>
                  {language.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden text-[#0A0A0A] hover:bg-gray-100"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      </div>

      {/* Mobile Menu Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-white">
          <SheetHeader>
            <SheetTitle className="text-left">
              {t("newLanding.header.navigation")}
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 mt-8">
            {navigationButtons.map((btn, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveTab(index);
                  setMobileMenuOpen(false);
                  setTimeout(() => {
                    const scrollContainer = document.querySelector('.overflow-y-auto');
                    if (scrollContainer) {
                      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }, 100);
                }}
                className={`flex items-center gap-3 justify-start py-4 px-4 rounded-[14px] w-full transition-all duration-200 cursor-pointer ${
                  activeTab === index
                    ? "bg-headerActiveGradient"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className={`p-[10px] rounded-[10px] ${btn.gradient}`}>
                  {btn.icon}
                </div>
                <span className="text-base font-medium">{btn.label}</span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}

export default LandingHeader;
