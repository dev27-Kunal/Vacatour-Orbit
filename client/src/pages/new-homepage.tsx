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
  Rocket
} from "lucide-react";

export default function NewHomepage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("bedrijven");
  const { t } = useTranslation();

  // Helper function to get array items from translations
  const getArrayItems = (keyPath: string): string[] => {
    const items: string[] = [];
    let index = 0;
    while (index < 10) { // Safety limit to prevent infinite loops
      const key = `${keyPath}.${index}`;
      const item = t(key);
      if (!item || item === key) {break;}
      items.push(item);
      index++;
    }
    return items;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50 light">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-secondary overflow-hidden text-white">
        <div className="absolute top-4 right-4 z-10">
          <LanguageSelector />
        </div>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">
              {t("homepage.title")}
            </h1>
            <p className="text-2xl mb-8 text-white/90">
              {t("homepage.subtitle")}
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2 text-lg hover:bg-white/30 transition-all">
                <Bell className="w-4 h-4 mr-2" />
                {t("homepage.features.pushNotifications")}
              </Badge>
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2 text-lg hover:bg-white/30 transition-all">
                <Video className="w-4 h-4 mr-2" />
                {t("homepage.features.videoInterviews")}
              </Badge>
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2 text-lg hover:bg-white/30 transition-all">
                <MessageCircle className="w-4 h-4 mr-2" />
                {t("homepage.features.guestChat")}
              </Badge>
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2 text-lg hover:bg-white/30 transition-all">
                <Upload className="w-4 h-4 mr-2" />
                {t("homepage.features.fileSharing")}
              </Badge>
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2 text-lg hover:bg-white/30 transition-all">
                <GroupIcon className="w-4 h-4 mr-2" />
                {t("homepage.features.groupChat")}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Tabs */}
      <section className="container mx-auto px-4 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 !bg-gray-100 p-2 rounded-xl">
            <TabsTrigger value="bedrijven" className="text-lg font-semibold data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary rounded-lg">
              <Building2 className="w-5 h-5 mr-2" />
              {t("homepage.tabs.companies")}
            </TabsTrigger>
            <TabsTrigger value="recruiters" className="text-lg font-semibold data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary rounded-lg">
              <Users className="w-5 h-5 mr-2" />
              {t("homepage.tabs.recruiters")}
            </TabsTrigger>
            <TabsTrigger value="zzp" className="text-lg font-semibold data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary rounded-lg">
              <Briefcase className="w-5 h-5 mr-2" />
              {t("homepage.tabs.freelancers")}
            </TabsTrigger>
          </TabsList>

          {/* Bedrijven Tab */}
          <TabsContent value="bedrijven">
            <div className="space-y-12">
              {/* Hero for Companies */}
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-4xl font-bold mb-4 text-gray-900">
                  {t("homepage.companies.title")}
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  {t("homepage.companies.subtitle")}
                </p>
                <div className="flex gap-4 justify-center">
                  <Button 
                    size="lg" 
                    onClick={() => setLocation("/register")}
                    className="btn-gradient"
                  >
                    {t("homepage.companies.startTrial")}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => setLocation("/jobs")}
                    className="bg-card text-foreground !border-gray-300 hover:!bg-background"
                  >
                    {t("homepage.companies.viewCandidates")}
                  </Button>
                </div>
              </div>

              {/* Key Features for Companies */}
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="feature-card card-hover bg-card text-foreground">
                  <CardHeader>
                    <div className="icon-box icon-box-gradient mb-4">
                      <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-foreground">{t("homepage.companies.features.directCommunication.title")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {t("homepage.companies.features.directCommunication.description")}
                    </p>
                    <ul className="space-y-2 text-sm">
                      {getArrayItems("homepage.companies.features.directCommunication.items").map((item: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle2 className="w-4 h-4 !text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="feature-card card-hover bg-card text-foreground">
                  <CardHeader>
                    <div className="icon-box bg-gradient-to-r from-secondary to-accent mb-4">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-foreground">{t("homepage.companies.features.smartMatching.title")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {t("homepage.companies.features.smartMatching.description")}
                    </p>
                    <ul className="space-y-2 text-sm">
                      {getArrayItems("homepage.companies.features.smartMatching.items").map((item: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle2 className="w-4 h-4 !text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="feature-card card-hover bg-card text-foreground">
                  <CardHeader>
                    <div className="icon-box bg-gradient-to-r from-accent to-primary mb-4">
                      <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-foreground">{t("homepage.companies.features.analytics.title")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {t("homepage.companies.features.analytics.description")}
                    </p>
                    <ul className="space-y-2 text-sm">
                      {getArrayItems("homepage.companies.features.analytics.items").map((item: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle2 className="w-4 h-4 !text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Benefits */}
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 backdrop-blur-sm">
                <h3 className="text-2xl font-bold text-center mb-8 text-gradient">{t("homepage.companies.benefits.title")}</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { title: t("homepage.companies.benefits.items.0.title"), description: t("homepage.companies.benefits.items.0.description") },
                    { title: t("homepage.companies.benefits.items.1.title"), description: t("homepage.companies.benefits.items.1.description") },
                    { title: t("homepage.companies.benefits.items.2.title"), description: t("homepage.companies.benefits.items.2.description") },
                    { title: t("homepage.companies.benefits.items.3.title"), description: t("homepage.companies.benefits.items.3.description") }
                  ].map((benefit, index) => {
                    const icons = [Clock, Euro, UserCheck, Shield];
                    const colors = ["text-blue-600", "text-green-600", "text-purple-600", "text-red-600"];
                    const IconComponent = icons[index];
                    return (
                      <div key={index} className="text-center">
                        <IconComponent className={`w-8 h-8 ${colors[index]} mx-auto mb-3`} />
                        <h4 className="font-semibold mb-2">{benefit.title}</h4>
                        <p className="text-sm text-gray-600">{benefit.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Recruiters Tab */}
          <TabsContent value="recruiters">
            <div className="space-y-12">
              {/* Hero for Recruiters */}
              <div className="text-center max-w-4xl mx-auto">
                <h2 className="text-4xl font-bold mb-4 text-gray-900">
                  {t("homepage.recruiters.title")}
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  {t("homepage.recruiters.subtitle")}
                </p>
                <div className="flex gap-4 justify-center">
                  <Button 
                    size="lg" 
                    onClick={() => setLocation("/register")}
                    className="btn-gradient-alt"
                  >
                    {t("homepage.recruiters.startAsRecruiter")}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => setLocation("/demo")}
                    className="bg-card text-foreground !border-gray-300 hover:!bg-background"
                  >
                    {t("homepage.recruiters.viewDemo")}
                  </Button>
                </div>
              </div>

              {/* Problem & Solution */}
              <div className="bg-gradient-to-r from-secondary/10 to-accent/10 rounded-2xl p-8 backdrop-blur-sm">
                <div className="max-w-3xl mx-auto">
                  <h3 className="text-2xl font-bold mb-6 text-center text-gradient">
                    {t("homepage.recruiters.problem.title")}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white rounded-lg p-6">
                      <div className="text-red-600 font-semibold mb-3">{t("homepage.recruiters.problem.problemTitle")}</div>
                      <p className="text-gray-700">
                        {t("homepage.recruiters.problem.problemDescription")}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-6">
                      <div className="text-green-600 font-semibold mb-3">{t("homepage.recruiters.problem.solutionTitle")}</div>
                      <p className="text-gray-700">
                        {t("homepage.recruiters.problem.solutionDescription")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Features for Recruiters */}
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="feature-card card-hover bg-card text-foreground">
                  <CardHeader>
                    <div className="icon-box bg-gradient-to-r from-primary to-accent mb-4">
                      <Globe className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-foreground">{t("homepage.recruiters.features.offerEverywhere.title")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {t("homepage.recruiters.features.offerEverywhere.description")}
                    </p>
                    <ul className="space-y-2 text-sm">
                      {getArrayItems("homepage.recruiters.features.offerEverywhere.items").map((item: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle2 className="w-4 h-4 !text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="feature-card card-hover bg-card text-foreground">
                  <CardHeader>
                    <div className="icon-box bg-gradient-to-r from-secondary to-primary mb-4">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-foreground">{t("homepage.recruiters.features.findClients.title")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {t("homepage.recruiters.features.findClients.description")}
                    </p>
                    <ul className="space-y-2 text-sm">
                      {getArrayItems("homepage.recruiters.features.findClients.items").map((item: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle2 className="w-4 h-4 !text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="feature-card card-hover bg-card text-foreground">
                  <CardHeader>
                    <div className="icon-box bg-gradient-to-r from-accent to-secondary mb-4">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-foreground">{t("homepage.recruiters.features.freedom.title")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {t("homepage.recruiters.features.freedom.description")}
                    </p>
                    <ul className="space-y-2 text-sm">
                      {getArrayItems("homepage.recruiters.features.freedom.items").map((item: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle2 className="w-4 h-4 !text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Success Metrics */}
              <div className="bg-green-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-center mb-8">{t("homepage.recruiters.results.title")}</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { value: t("homepage.recruiters.results.metrics.0.value"), description: t("homepage.recruiters.results.metrics.0.description") },
                    { value: t("homepage.recruiters.results.metrics.1.value"), description: t("homepage.recruiters.results.metrics.1.description") },
                    { value: t("homepage.recruiters.results.metrics.2.value"), description: t("homepage.recruiters.results.metrics.2.description") },
                    { value: t("homepage.recruiters.results.metrics.3.value"), description: t("homepage.recruiters.results.metrics.3.description") }
                  ].map((metric, index) => {
                    const colors = ["text-green-600", "text-blue-600", "text-purple-600", "text-orange-600"];
                    return (
                      <div key={index} className="text-center">
                        <div className={`text-3xl font-bold ${colors[index]} mb-2`}>{metric.value}</div>
                        <p className="text-sm text-gray-600">{metric.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ZZP Tab */}
          <TabsContent value="zzp">
            <div className="space-y-12">
              {/* Hero for ZZP */}
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-4xl font-bold mb-4 text-gray-900">
                  {t("homepage.freelancers.title")}
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  {t("homepage.freelancers.subtitle")}
                </p>
                <div className="flex gap-4 justify-center">
                  <Button 
                    size="lg" 
                    onClick={() => setLocation("/register")}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {t("homepage.freelancers.createProfile")}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => setLocation("/jobs")}
                    className="bg-card text-foreground !border-gray-300 hover:!bg-background"
                  >
                    {t("homepage.freelancers.viewJobs")}
                  </Button>
                </div>
              </div>

              {/* Key Features for ZZP */}
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="feature-card card-hover bg-card text-foreground">
                  <CardHeader>
                    <div className="icon-box bg-gradient-to-r from-accent to-secondary mb-4">
                      <Briefcase className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-foreground">{t("homepage.freelancers.features.directClients.title")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {t("homepage.freelancers.features.directClients.description")}
                    </p>
                    <ul className="space-y-2 text-sm">
                      {getArrayItems("homepage.freelancers.features.directClients.items").map((item: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle2 className="w-4 h-4 !text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="feature-card card-hover bg-card text-foreground">
                  <CardHeader>
                    <div className="icon-box bg-gradient-to-r from-primary to-secondary mb-4">
                      <Star className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-foreground">{t("homepage.freelancers.features.professionalProfile.title")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {t("homepage.freelancers.features.professionalProfile.description")}
                    </p>
                    <ul className="space-y-2 text-sm">
                      {getArrayItems("homepage.freelancers.features.professionalProfile.items").map((item: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle2 className="w-4 h-4 !text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="feature-card card-hover bg-card text-foreground">
                  <CardHeader>
                    <div className="icon-box bg-gradient-to-r from-secondary to-accent mb-4">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-foreground">{t("homepage.freelancers.features.jobMatching.title")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {t("homepage.freelancers.features.jobMatching.description")}
                    </p>
                    <ul className="space-y-2 text-sm">
                      {getArrayItems("homepage.freelancers.features.jobMatching.items").map((item: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle2 className="w-4 h-4 !text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Benefits for ZZP */}
              <div className="bg-purple-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-center mb-8">{t("homepage.freelancers.benefits.title")}</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-lg p-6">
                    <h4 className="font-semibold mb-4 flex items-center">
                      <Rocket className="w-5 h-5 text-purple-600 mr-2" />
                      {t("homepage.freelancers.benefits.simple.title")}
                    </h4>
                    <ul className="space-y-3 text-gray-700">
                      {getArrayItems("homepage.freelancers.benefits.simple.items").map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-6">
                    <h4 className="font-semibold mb-4 flex items-center">
                      <Shield className="w-5 h-5 text-blue-600 mr-2" />
                      {t("homepage.freelancers.benefits.secure.title")}
                    </h4>
                    <ul className="space-y-3 text-gray-700">
                      {getArrayItems("homepage.freelancers.benefits.secure.items").map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* CTA for ZZP */}
              <div className="text-center bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-4">
                  {t("homepage.freelancers.cta.title")}
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  {t("homepage.freelancers.cta.description")}
                </p>
                <Button 
                  size="lg" 
                  onClick={() => setLocation("/register")}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {t("homepage.freelancers.cta.button")}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Global Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            {t("homepage.globalFeatures.title")}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { title: t("homepage.globalFeatures.features.0.title"), description: t("homepage.globalFeatures.features.0.description") },
              { title: t("homepage.globalFeatures.features.1.title"), description: t("homepage.globalFeatures.features.1.description") },
              { title: t("homepage.globalFeatures.features.2.title"), description: t("homepage.globalFeatures.features.2.description") },
              { title: t("homepage.globalFeatures.features.3.title"), description: t("homepage.globalFeatures.features.3.description") },
              { title: t("homepage.globalFeatures.features.4.title"), description: t("homepage.globalFeatures.features.4.description") }
            ].map((feature, index) => {
              const icons = [Bell, Video, MessageCircle, Upload, GroupIcon];
              const colors = ["text-orange-500", "text-blue-500", "text-green-500", "text-purple-500", "text-red-500"];
              const IconComponent = icons[index];
              return (
                <div key={index} className="bg-white rounded-lg p-6 text-center shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                  <IconComponent className={`w-10 h-10 ${colors[index]} mx-auto mb-3`} />
                  <h4 className="font-bold mb-2 text-gray-900">{feature.title}</h4>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t("homepage.finalCta.title")}
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            {t("homepage.finalCta.subtitle")}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => {
                setActiveTab("bedrijven");
                window.scrollTo({ top: 600, behavior: 'smooth' });
              }}
            >
              <Building2 className="mr-2 w-5 h-5" />
              {t("homepage.finalCta.buttons.company")}
            </Button>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => {
                setActiveTab("recruiters");
                window.scrollTo({ top: 600, behavior: 'smooth' });
              }}
            >
              <Users className="mr-2 w-5 h-5" />
              {t("homepage.finalCta.buttons.recruiter")}
            </Button>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => {
                setActiveTab("zzp");
                window.scrollTo({ top: 600, behavior: 'smooth' });
              }}
            >
              <Briefcase className="mr-2 w-5 h-5" />
              {t("homepage.finalCta.buttons.freelancer")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}