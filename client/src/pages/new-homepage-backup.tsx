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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="absolute top-4 right-4 z-10">
          <LanguageSelector />
        </div>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">
              {t("homepage.title")}
            </h1>
            <p className="text-2xl mb-8 text-blue-100">
              {t("homepage.subtitle")}
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-lg">
                <Bell className="w-4 h-4 mr-2" />
                {t("homepage.features.pushNotifications")}
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-lg">
                <Video className="w-4 h-4 mr-2" />
                {t("homepage.features.videoInterviews")}
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-lg">
                <MessageCircle className="w-4 h-4 mr-2" />
                {t("homepage.features.guestChat")}
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-lg">
                <Upload className="w-4 h-4 mr-2" />
                {t("homepage.features.fileSharing")}
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-lg">
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
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="bedrijven" className="text-lg font-semibold">
              <Building2 className="w-5 h-5 mr-2" />
              {t("homepage.tabs.companies")}
            </TabsTrigger>
            <TabsTrigger value="recruiters" className="text-lg font-semibold">
              <Users className="w-5 h-5 mr-2" />
              {t("homepage.tabs.recruiters")}
            </TabsTrigger>
            <TabsTrigger value="zzp" className="text-lg font-semibold">
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
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {t("homepage.companies.startTrial")}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => setLocation("/jobs")}
                  >
                    {t("homepage.companies.viewCandidates")}
                  </Button>
                </div>
              </div>

              {/* Key Features for Companies */}
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="border-2 hover:border-blue-500 transition-colors">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <MessageCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle>{t("homepage.companies.features.directCommunication.title")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      {t("homepage.companies.features.directCommunication.description")}
                    </p>
                    <ul className="space-y-2 text-sm">
                      {(t("homepage.companies.features.directCommunication.items", { returnObjects: true }) as string[]).map((item: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-blue-500 transition-colors">
                  <CardHeader>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <Target className="w-6 h-6 text-green-600" />
                    </div>
                    <CardTitle>{t("homepage.companies.features.smartMatching.title")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      {t("homepage.companies.features.smartMatching.description")}
                    </p>
                    <ul className="space-y-2 text-sm">
                      {(t("homepage.companies.features.smartMatching.items", { returnObjects: true }) as string[]).map((item: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-blue-500 transition-colors">
                  <CardHeader>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                    </div>
                    <CardTitle>{t("homepage.companies.features.analytics.title")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      {t("homepage.companies.features.analytics.description")}
                    </p>
                    <ul className="space-y-2 text-sm">
                      {(t("homepage.companies.features.analytics.items", { returnObjects: true }) as string[]).map((item: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Benefits */}
              <div className="bg-blue-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-center mb-8">{t("homepage.companies.benefits.title")}</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {(t("homepage.companies.benefits.items", { returnObjects: true }) as any[]).map((benefit: any, index: number) => {
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
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {t("homepage.recruiters.startAsRecruiter")}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => setLocation("/demo")}
                  >
                    {t("homepage.recruiters.viewDemo")}
                  </Button>
                </div>
              </div>

              {/* Problem & Solution */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8">
                <div className="max-w-3xl mx-auto">
                  <h3 className="text-2xl font-bold mb-6 text-center">
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
                <Card className="border-2 hover:border-green-500 transition-colors">
                  <CardHeader>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <Globe className="w-6 h-6 text-green-600" />
                    </div>
                    <CardTitle>{t("homepage.recruiters.features.offerEverywhere.title")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      {t("homepage.recruiters.features.offerEverywhere.description")}
                    </p>
                    <ul className="space-y-2 text-sm">
                      {(t("homepage.recruiters.features.offerEverywhere.items", { returnObjects: true }) as string[]).map((item: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-green-500 transition-colors">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle>{t("homepage.recruiters.features.findClients.title")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      {t("homepage.recruiters.features.findClients.description")}
                    </p>
                    <ul className="space-y-2 text-sm">
                      {(t("homepage.recruiters.features.findClients.items", { returnObjects: true }) as string[]).map((item: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-green-500 transition-colors">
                  <CardHeader>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <Zap className="w-6 h-6 text-purple-600" />
                    </div>
                    <CardTitle>{t("homepage.recruiters.features.freedom.title")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      {t("homepage.recruiters.features.freedom.description")}
                    </p>
                    <ul className="space-y-2 text-sm">
                      {(t("homepage.recruiters.features.freedom.items", { returnObjects: true }) as string[]).map((item: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
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
                  {(t("homepage.recruiters.results.metrics", { returnObjects: true }) as any[]).map((metric: any, index: number) => {
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
                  >
                    {t("homepage.freelancers.viewJobs")}
                  </Button>
                </div>
              </div>

              {/* Key Features for ZZP */}
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="border-2 hover:border-purple-500 transition-colors">
                  <CardHeader>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <Briefcase className="w-6 h-6 text-purple-600" />
                    </div>
                    <CardTitle>Direct Opdrachtgevers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Geen bureaus of bemiddelaars - direct contact met bedrijven.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        100% van je tarief voor jou
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Onderhandel direct over voorwaarden
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Bouw eigen klantrelaties op
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-purple-500 transition-colors">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <Star className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle>Professioneel Profiel</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Presenteer jezelf professioneel met een uitgebreid ZZP profiel.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Portfolio & referenties
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Skills & certificaten
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Beschikbaarheidskalender
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Video introductie mogelijk
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-purple-500 transition-colors">
                  <CardHeader>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <Award className="w-6 h-6 text-green-600" />
                    </div>
                    <CardTitle>Opdracht Matching</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Ontvang alleen relevante opdrachten die bij jouw expertise passen.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        AI-gestuurde opdracht suggesties
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Push notificaties voor nieuwe matches
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Tariefcalculator tool
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Benefits for ZZP */}
              <div className="bg-purple-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-center mb-8">Waarom ZZP'ers kiezen voor Vacature ORBIT</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-lg p-6">
                    <h4 className="font-semibold mb-4 flex items-center">
                      <Rocket className="w-5 h-5 text-purple-600 mr-2" />
                      Eenvoudig & Direct
                    </h4>
                    <ul className="space-y-3 text-gray-700">
                      <li>• Binnen 5 minuten een profiel aangemaakt</li>
                      <li>• Direct zichtbaar voor opdrachtgevers</li>
                      <li>• Geen ingewikkelde procedures</li>
                      <li>• Chat direct met bedrijven</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-6">
                    <h4 className="font-semibold mb-4 flex items-center">
                      <Shield className="w-5 h-5 text-blue-600 mr-2" />
                      Veilig & Betrouwbaar
                    </h4>
                    <ul className="space-y-3 text-gray-700">
                      <li>• Geverifieerde bedrijven</li>
                      <li>• Veilige betaling garantie</li>
                      <li>• Contract templates beschikbaar</li>
                      <li>• GDPR compliant platform</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* CTA for ZZP */}
              <div className="text-center bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-4">
                  Start vandaag nog met opdrachten vinden
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Geen verborgen kosten, geen commissies, geen gedoe. 
                  Gewoon direct contact met opdrachtgevers die jouw expertise zoeken.
                </p>
                <Button 
                  size="lg" 
                  onClick={() => setLocation("/register")}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Registreer als ZZP'er - Gratis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Global Features Section */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Platform Features voor Iedereen
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white rounded-lg p-6 text-center">
              <Bell className="w-10 h-10 text-orange-500 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Push Notificaties</h4>
              <p className="text-sm text-gray-600">
                Mis nooit een belangrijke update
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <Video className="w-10 h-10 text-blue-500 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Video Interviews</h4>
              <p className="text-sm text-gray-600">
                Gratis video gesprekken via Jitsi
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <MessageCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Guest Chat</h4>
              <p className="text-sm text-gray-600">
                Chat zonder account met kandidaten
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <Upload className="w-10 h-10 text-purple-500 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">File Sharing</h4>
              <p className="text-sm text-gray-600">
                Deel CV's en documenten veilig
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <GroupIcon className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Group Chat</h4>
              <p className="text-sm text-gray-600">
                Hiring team gesprekken
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Klaar om te beginnen?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Kies je rol en start vandaag nog - volledig gratis!
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
              Ik ben een Bedrijf
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
              Ik ben een Recruiter
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
              Ik ben ZZP'er
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}