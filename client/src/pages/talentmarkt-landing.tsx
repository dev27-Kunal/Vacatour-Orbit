import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  Mail, 
  X,
  Search,
  Menu,
  ChevronDown,
  Rocket,
  Play,
  Bolt,
  TrendingUp,
  Network,
  Eye,
  Check,
  Users,
  Globe,
  MessageCircle,
  BarChart3,
  Brain,
  ArrowUp,
  ArrowDown,
  Handshake,
  Building,
  PhoneOff,
  Scale,
  Briefcase
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

export default function TalentMarktLanding() {
  const [, setLocation] = useLocation();
  const [showBanner, setShowBanner] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const handleGetStarted = () => {
    setLocation("/register");
  };

  const handleLogin = () => {
    setLocation("/login");
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Banner */}
      {showBanner && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center p-3 flex items-center justify-between">
          <div className="flex items-center mx-auto space-x-6">
            <p className="font-medium">{t('landing.banner', { defaultValue: 'New platform feature: Direct chat with candidates!' })}</p>
            <div className="hidden md:flex items-center space-x-4 text-sm">
              <span className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                +31 20 123 4567
              </span>
              <span className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                info@talentmarkt.nl
              </span>
            </div>
          </div>
          <button 
            onClick={() => setShowBanner(false)}
            className="text-white hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-blue-600 mr-2">TalentMarkt</div>
            <div className="text-sm text-gray-600 hidden md:block">{t('landing.tagline', { defaultValue: 'The marketplace for talent' })}</div>
          </div>
          
          <nav className="hidden lg:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('voor-bedrijven')}
              className="text-gray-700 hover:text-blue-600 flex items-center"
            >
              {t('landing.nav.forCompanies', { defaultValue: 'For Companies' })} <ChevronDown className="ml-1 w-3 h-3" />
            </button>
            <button 
              onClick={() => scrollToSection('voor-bureaus')}
              className="text-gray-700 hover:text-blue-600 flex items-center"
            >
              {t('landing.nav.forAgencies', { defaultValue: 'For Agencies' })} <ChevronDown className="ml-1 w-3 h-3" />
            </button>
            <button 
              onClick={() => scrollToSection('voor-zzpers')}
              className="text-gray-700 hover:text-blue-600 flex items-center"
            >
              {t('landing.nav.forFreelancers', { defaultValue: 'For Freelancers' })} <ChevronDown className="ml-1 w-3 h-3" />
            </button>
            <button 
              onClick={() => scrollToSection('voor-recruiters')}
              className="text-gray-700 hover:text-blue-600 flex items-center"
            >
              {t('landing.nav.forRecruiters', { defaultValue: 'For Recruiters' })} <ChevronDown className="ml-1 w-3 h-3" />
            </button>
            <button 
              onClick={() => scrollToSection('waarom-talentmarkt')}
              className="text-gray-700 hover:text-blue-600 cursor-pointer"
            >
              {t('landing.nav.howItWorks', { defaultValue: 'How it works' })}
            </button>
            <button 
              onClick={() => scrollToSection('prijzen')}
              className="text-gray-700 hover:text-blue-600 cursor-pointer"
            >
              {t('landing.nav.pricing', { defaultValue: 'Pricing' })}
            </button>
          </nav>
          
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-blue-600">
              <Search className="w-5 h-5" />
            </button>
            <button 
              onClick={handleLogin}
              className="text-gray-700 hover:text-blue-600 hidden md:inline cursor-pointer"
            >
              {t('common.login', { defaultValue: 'Login' })}
            </button>
            <Button 
              onClick={handleGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium"
            >
              {t('landing.getStarted', { defaultValue: 'Get Started Free' })}
            </Button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-gray-600"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-12 lg:mb-0">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {t('landing.hero.title', { defaultValue: 'The marketplace for talent' })}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {t('landing.hero.subtitle', { defaultValue: 'One platform. An entire industry searching for you. Find the right candidate faster.' })}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleGetStarted}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center"
              >
                <Rocket className="mr-2 w-5 h-5" />
                {t('landing.cta.startFree', { defaultValue: 'Start Free' })}
              </Button>
              <Button 
                variant="outline"
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-600 hover:text-white flex items-center justify-center"
              >
                <Play className="mr-2 w-5 h-5" />
                {t('landing.cta.viewDemo', { defaultValue: 'View Demo' })}
              </Button>
            </div>
          </div>
          
          <div className="lg:w-1/2 lg:pl-12">
            <div className="space-y-6">
              <Card className="hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">Senior Developer - React</h3>
                      <p className="text-blue-600 font-bold text-xl">€80/uur</p>
                      <p className="text-gray-600">TechCorp • 2 uur geleden</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">12 reacties • 3 geselecteerd</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-blue-100 text-blue-800">React</Badge>
                    <Badge className="bg-blue-100 text-blue-800">TypeScript</Badge>
                    <Badge className="bg-green-100 text-green-800">Remote</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">Marketing Manager</h3>
                      <p className="text-blue-600 font-bold text-xl">€4500/mnd</p>
                      <p className="text-gray-600">StartupXYZ • 5 uur geleden</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">8 reacties • 1 geselecteerd</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-purple-100 text-purple-800">SEO</Badge>
                    <Badge className="bg-purple-100 text-purple-800">Content</Badge>
                    <Badge className="bg-orange-100 text-orange-800">Amsterdam</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Waarom TalentMarkt */}
      <section id="waarom-talentmarkt" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Waarom TalentMarkt?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Een revolutionair platform dat de traditionele recruitment-wereld op zijn kop zet. Meer keuze, minder gedoe, hogere snelheid.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bolt className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Snellere Matches</h3>
              <p className="text-gray-600">Directe toegang tot honderden bureaus, recruiters en ZZP'ers zorgt voor snellere matches.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Marktwerking</h3>
              <p className="text-gray-600">Marktwerking zorgt voor concurrerende prijzen en transparante voorwaarden.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Network className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Grootste Netwerk</h3>
              <p className="text-gray-600">Toegang tot het grootste netwerk van gespecialiseerde recruitment professionals.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Transparantie</h3>
              <p className="text-gray-600">Alle fees en voorwaarden zijn vooraf bekend. Geen verborgen kosten.</p>
            </div>
          </div>
          
          {/* Comparison */}
          <div className="bg-background rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-center mb-12">Traditioneel vs TalentMarkt</h3>
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <div className="flex items-start mb-6">
                  <div className="bg-red-100 p-2 rounded-full mr-4 mt-1">
                    <X className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Traditieel: Gestalkt worden door tientallen bureaus</h4>
                    <p className="text-gray-600">Eindeloze telefoontjes en emails van recruiters die allemaal hetzelfde aanbieden.</p>
                  </div>
                </div>
                
                <div className="flex items-start mb-6">
                  <div className="bg-red-100 p-2 rounded-full mr-4 mt-1">
                    <X className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Ondoorzichtige prijsafspraken</h4>
                    <p className="text-gray-600">Elke bureau hanteert eigen tarieven en voorwaarden.</p>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-start mb-6">
                  <div className="bg-green-100 p-2 rounded-full mr-4 mt-1">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">TalentMarkt: Jij bepaalt de regels</h4>
                    <p className="text-gray-600">Zet je vacature online en bepaal je prijs. Laat de markt naar jou komen.</p>
                  </div>
                </div>
                
                <div className="flex items-start mb-6">
                  <div className="bg-green-100 p-2 rounded-full mr-4 mt-1">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Volledige transparantie</h4>
                    <p className="text-gray-600">Alle fees en voorwaarden zijn vooraf door jou bepaald.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Voor Bedrijven */}
      <section id="voor-bedrijven" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Voor Bedrijven</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Revolutioneer je recruitment proces en vind sneller de juiste kandidaten via één overzichtelijk portaal
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1 font-bold">1</div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">Direct vacature online</h3>
                  <p className="text-gray-600">Bereik honderden bureaus, freelance recruiters én zzp'ers in één keer.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1 font-bold">2</div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">Één platform voor alles</h3>
                  <p className="text-gray-600">Geen losse afspraken met elk bureau meer – alles via één platform.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1 font-bold">3</div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">Jij bepaalt de voorwaarden</h3>
                  <p className="text-gray-600">Bepaal zelf je fee of tarief en laat de markt reageren.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1 font-bold">4</div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">Behoud + uitbreiden</h3>
                  <p className="text-gray-600">Behoud je preferred suppliers maar krijg er honderden nieuwe bij.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1 font-bold">5</div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">Snellere kandidaten</h3>
                  <p className="text-gray-600">Sneller kandidaten door directe toegang tot specialisten.</p>
                </div>
              </div>
            </div>
            
            <Card className="shadow-xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Klaar om te starten?</h3>
                <p className="text-gray-600 mb-6">Join 200+ bedrijven die al gebruik maken van ons platform</p>
                <Button 
                  onClick={handleGetStarted}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center"
                >
                  <Rocket className="mr-2 w-5 h-5" />
                  Start nu gratis
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Voor Bureaus */}
      <section id="voor-bureaus" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Voor Bureaus</h2>
            <p className="text-xl text-gray-600">Groei je bureau zonder acquisitie en accountmanagement</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8">
              <div className="bg-green-600 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-xl mb-4">Nieuwe eindklanten zonder acquisitie</h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Geen tijd verspillen aan cold calling</li>
                <li>• Automatische matchmaking</li>
                <li>• Directe toegang tot vacatures</li>
                <li>• Minder accountmanagement nodig</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-8">
              <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                <PhoneOff className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-xl mb-4">Geen cold calling meer nodig</h3>
              <ul className="text-gray-600 space-y-2">
                <li>• De vacatures komen naar jou toe</li>
                <li>• Meer tijd voor recruitment</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-8">
              <div className="bg-purple-600 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-xl mb-4">Eerlijke concurrentie</h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Kans naast preferred suppliers</li>
                <li>• Transparante voorwaarden</li>
                <li>• Gelijke kansen voor iedereen</li>
                <li>• Kwaliteit bepaalt succes</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-background rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-6">Resultaat: minder kosten, meer deals</h3>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div>
                <ArrowDown className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="font-semibold">Kleiner sales team nodig</p>
              </div>
              <div>
                <ArrowUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="font-semibold">Toegang tot veel meer vacatures</p>
              </div>
              <div>
                <Handshake className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="font-semibold">Directe communicatie met eindklanten</p>
              </div>
            </div>
            <Button 
              onClick={handleGetStarted}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center mx-auto"
            >
              <Briefcase className="mr-2 w-5 h-5" />
              Word Partner Bureau
            </Button>
          </div>
        </div>
      </section>

      {/* Voor ZZP'ers */}
      <section id="voor-zzpers" className="py-20 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Voor ZZP'ers</h2>
            <p className="text-xl text-gray-600">Direct schakelen met eindklanten, hogere tarieven, meer opdrachten</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1 font-bold">1</div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">Direct schakelen met eindklanten</h3>
                  <p className="text-gray-600">Geen dure tussenpartij meer nodig. Onderhandel rechtstreeks.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1 font-bold">2</div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">Meer tarief overhouden</h3>
                  <p className="text-gray-600">Houd meer van je tarief over zonder commissie naar tussenpersonen.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1 font-bold">3</div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">Geen acquisitie nodig</h3>
                  <p className="text-gray-600">De opdrachten staan voor je klaar. Focus op wat je goed kunt.</p>
                </div>
              </div>
            </div>
            
            <Card className="shadow-xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6">Resultaat voor ZZP'ers</h3>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center">
                    <ArrowUp className="w-5 h-5 text-green-500 mr-3" />
                    <span className="font-semibold">Hogere tarieven</span>
                  </div>
                  <div className="flex items-center">
                    <ArrowUp className="w-5 h-5 text-green-500 mr-3" />
                    <span className="font-semibold">Meer opdrachten</span>
                  </div>
                  <div className="flex items-center">
                    <ArrowDown className="w-5 h-5 text-blue-500 mr-3" />
                    <span className="font-semibold">Minder moeite</span>
                  </div>
                </div>
                <Button 
                  onClick={handleGetStarted}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center"
                >
                  <Users className="mr-2 w-5 h-5" />
                  Word ZZP Partner
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Voor Freelance Recruiters */}
      <section id="voor-recruiters" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Voor Freelance Recruiters</h2>
            <p className="text-xl text-gray-600">Jouw netwerk is jouw verdienmodel - maximale vrijheid en toegang</p>
          </div>
          
          <div className="grid lg:grid-cols-4 gap-6 mb-12">
            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Kandidaten aanbieden waar je wilt</h3>
              <p className="text-gray-600 text-sm">Geen beperking tot één bureau. Bied kandidaten aan bij alle relevante vacatures.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Volledige vrijheid</h3>
              <p className="text-gray-600 text-sm">Onderhandel direct met eindklanten.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Toegang tot honderden bedrijven</h3>
              <p className="text-gray-600 text-sm">Krijg toegang tot vacatures die je anders nooit zou bereiken.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Network className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Jouw netwerk = jouw kracht</h3>
              <p className="text-gray-600 text-sm">Monetiseer je netwerk optimaal door de juiste matches.</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-center mb-8">Hoe het werkt voor recruiters</h3>
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">1</div>
                <h4 className="font-semibold mb-2">Browse vacatures</h4>
                <p className="text-gray-600">Bekijk honderden openstaande vacatures</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">2</div>
                <h4 className="font-semibold mb-2">Match je kandidaten</h4>
                <p className="text-gray-600">Koppel kandidaten aan relevante vacatures</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">3</div>
                <h4 className="font-semibold mb-2">Verdien bij placement</h4>
                <p className="text-gray-600">Ontvang je fee bij succesvolle plaatsing</p>
              </div>
            </div>
            <div className="text-center">
              <Button 
                onClick={handleGetStarted}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center mx-auto"
              >
                <Handshake className="mr-2 w-5 h-5" />
                Word Freelance Partner
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Platform Features</h2>
            <p className="text-xl text-gray-600">Ontdek alle krachtige functies die TalentMarkt tot dé recruitment platform maken</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-xl mb-4">Smart Matching</h3>
                <p className="text-gray-600 mb-4">AI-algoritme matcht automatisch de juiste recruiters met relevante vacatures.</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• AI-powered matching</li>
                  <li>• Specialisatie-gebaseerd</li>
                  <li>• Real-time notificaties</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <div className="bg-gradient-to-r from-green-500 to-teal-600 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-xl mb-4">Directe Communicatie</h3>
                <p className="text-gray-600 mb-4">Chat direct met bedrijven en kandidaten via ons messaging systeem.</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Real-time chat</li>
                  <li>• File sharing</li>
                  <li>• Video calls integratie</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <div className="bg-gradient-to-r from-orange-500 to-red-600 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-xl mb-4">Analytics Dashboard</h3>
                <p className="text-gray-600 mb-4">Krijg inzicht in je performance met gedetailleerde analytics.</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Performance metrics</li>
                  <li>• Earnings tracking</li>
                  <li>• Market insights</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Prijzen */}
      <section id="prijzen" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Transparante Prijzen</h2>
          </div>
          
          <div className="grid lg:grid-cols-4 gap-6">
            <Card className="border-2 hover:border-blue-600 transition">
              <CardContent className="p-8">
                <h3 className="font-bold text-xl mb-4">Bedrijven</h3>
                <div className="mb-6">
                  <div className="text-sm text-gray-600 mb-2">€49/maand - 2 vacatures</div>
                  <div className="text-sm text-gray-600 mb-2">€99/maand - 10 vacatures</div>
                  <div className="text-sm text-gray-600 mb-2">€199/maand - onbeperkt</div>
                </div>
                <ul className="text-sm text-gray-600 space-y-2 mb-8">
                  <li>✓ Toegang tot alle recruiters</li>
                  <li>✓ Direct contact met kandidaten</li>
                  <li>✓ Analytics dashboard</li>
                </ul>
                <Button 
                  onClick={handleGetStarted}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full font-semibold"
                >
                  Start Gratis
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-2 hover:border-green-600 transition">
              <CardContent className="p-8">
                <h3 className="font-bold text-xl mb-4">Bureaus</h3>
                <div className="mb-6">
                  <div className="text-2xl font-bold text-green-600">Gratis</div>
                </div>
                <ul className="text-sm text-gray-600 space-y-2 mb-8">
                  <li>✓ Toegang tot alle vacatures</li>
                  <li>✓ Direct bieden op opdrachten</li>
                  <li>✓ Performance analytics</li>
                  <li>✓ Geen maandelijkse kosten</li>
                </ul>
                <Button 
                  onClick={handleGetStarted}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-full font-semibold"
                >
                  Word Partner
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-red-50 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-orange-500 text-white">Populair</Badge>
              </div>
              <CardContent className="p-8">
                <h3 className="font-bold text-xl mb-4">ZZP'ers</h3>
                <div className="mb-6">
                  <div className="text-2xl font-bold text-orange-600">Gratis</div>
                </div>
                <ul className="text-sm text-gray-600 space-y-2 mb-8">
                  <li>✓ Direct onderhandelen</li>
                  <li>✓ Geen tussenpersonen</li>
                  <li>✓ Maximale verdienste behouden</li>
                </ul>
                <Button 
                  onClick={handleGetStarted}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-full font-semibold"
                >
                  Word ZZP Partner
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-2 hover:border-purple-600 transition">
              <CardContent className="p-8">
                <h3 className="font-bold text-xl mb-4">Freelance Recruiters</h3>
                <div className="mb-6">
                  <div className="text-sm text-gray-600">Fee bij placement</div>
                </div>
                <ul className="text-sm text-gray-600 space-y-2 mb-8">
                  <li>✓ Kandidaten overal aanbieden</li>
                  <li>✓ Netwerk monetiseren</li>
                  <li>✓ Onbeperkte earning potential</li>
                </ul>
                <Button 
                  onClick={handleGetStarted}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-full font-semibold"
                >
                  Word Recruiter
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="text-2xl font-bold mb-4">TalentMarkt</div>
              <p className="text-gray-400 mb-4">Dé marktplaats voor talent</p>
              <div className="flex space-x-4">
                <button className="text-gray-400 hover:text-white">
                  <Globe className="w-5 h-5" />
                </button>
                <button className="text-gray-400 hover:text-white">
                  <MessageCircle className="w-5 h-5" />
                </button>
                <button className="text-gray-400 hover:text-white">
                  <Mail className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Voor Bedrijven</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white">Vacatures plaatsen</button></li>
                <li><button className="hover:text-white">Prijzen</button></li>
                <li><button className="hover:text-white">Support</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Voor Partners</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white">Bureaus</button></li>
                <li><button className="hover:text-white">ZZP'ers</button></li>
                <li><button className="hover:text-white">Recruiters</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  +31 20 123 4567
                </li>
                <li className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  info@talentmarkt.nl
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2024 TalentMarkt. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
