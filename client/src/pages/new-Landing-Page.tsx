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
} from "lucide-react";
import LandingHeader from "@/components/landing/LandingHeader";

export default function NewLandingpage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("bedrijven");
  const { t } = useTranslation();

  const tabArrays = [
    {
      name: "Push Notifications",
      textColor: "bg-heroTabGradientOrange",
      Icon: <Bell className="text-white w-4 h-4" />,
    },
    {
      name: "Video Interviews",
      textColor: "bg-heroTabGradientBlue",
      Icon: <Video className="text-white w-4 h-4" />,
    },
    {
      name: "Guest Chat",
      textColor: "bg-heroTabGradientGreen",
      Icon: <MessageSquare className="text-white w-4 h-4" />,
    },
    {
      name: "File Sharing",
      textColor: "bg-heroTabGradientPurple",
      Icon: <Share className="text-white w-4 h-4" />,
    },
    {
      name: "Group Chat",
      textColor: "bg-heroTabGradientRed",
      Icon: <Users className="text-white w-4 h-4" />,
    },
  ];

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

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Fixed background with gradient and overlays */}
      <div className="fixed inset-0 bg-landingBgGradient light">
        <div className="w-[clamp(200px,31.25vw,600px)] h-[clamp(200px,31.25vw,600px)] border rounded-full absolute -bottom-[10%] left-[1%] blur-2xl bg-[#8EC5FF33]"></div>
        <div className="w-[clamp(200px,31.25vw,500px)] h-[clamp(200px,31.25vw,500px)] border rounded-full absolute -top-[0%] -right-[2%] blur-2xl bg-[#DAB2FF33]"></div>
      </div>

      {/* Scrollable content */}
      <div className="relative z-10 h-screen overflow-y-auto">
        <LandingHeader />
        <div className="">
          <section className="flex flex-col items-center min-h-[80vh] gap-10 justify-center">
            <div className="flex gap-2 items-center py-2 px-4 bg-heroTitleGradient rounded-full">
              <Sparkles className="text-[#9810FA] w-4 h-4 text-2xl" />
              <span className="text-[13px]">
                Het nieuwe recruitment platform van Nederland
              </span>
            </div>
            <h1
              className="text-[clamp(48px,3.326vw,70px)] font-semibold bg-heroHeadingGradient bg-clip-text text-transparent"
              style={{ lineHeight: "clamp(48px,3.326vw,70px)" }}
            >
              Vacature ORBIT
            </h1>
            <span className="text-[22px]">
              Het complete recruitment platform voor iedereen in de arbeidsmarkt
            </span>
            <div className="flex gap-4">
              {tabArrays.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center py-3 px-5 gap-2 bg-[#FFFFFF] rounded-full shadow-lg"
                >
                  <div className={`${item.textColor} p-2 rounded-lg`}>
                    {item.Icon}
                  </div>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </section>
          <div className="flex flex-col items-center gap-16">
            <div className="flex flex-col items-center gap-6">
              <h2
                className="text-[clamp(32px,2.326vw,45px)] bg-[#0A0A0A] bg-clip-text text-transparent"
                style={{ lineHeight: "clamp(32px,2.326vw,45px)" }}
              >
                Platform Features voor Iedereen
              </h2>
              <span className="text-[18.4px]">
                Alles wat je nodig hebt voor succesvol recruitment
              </span>
            </div>
            <div className="flex gap-4">
              {tabArrays.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center py-3 px-5 gap-2 bg-[#FFFFFF] rounded-full shadow-lg"
                >
                  <div className={`${item.textColor} p-2 rounded-lg`}>
                    {item.Icon}
                  </div>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
