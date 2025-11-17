import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  UserCheck, 
  Briefcase, 
  Users, 
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Shield,
  Zap,
  Star,
  Globe,
  Target
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const userTypes = [
    {
      id: "BEDRIJF",
      title: t('landing.userTypes.company.title'),
      description: t('landing.userTypes.company.description'),
      icon: Building2,
      color: "bg-blue-500",
      features: t('landing.userTypes.company.features', { returnObjects: true }) as string[],
      cta: t('landing.userTypes.company.cta'),
      badge: t('landing.userTypes.company.badge')
    },
    {
      id: "BUREAU",
      title: t('landing.userTypes.agency.title'),
      description: t('landing.userTypes.agency.description'),
      icon: Users,
      color: "bg-purple-500",
      features: t('landing.userTypes.agency.features', { returnObjects: true }) as string[],
      cta: t('landing.userTypes.agency.cta')
    },
    {
      id: "ZZP",
      title: t('landing.userTypes.freelancer.title'),
      description: t('landing.userTypes.freelancer.description'),
      icon: Briefcase,
      color: "bg-green-500",
      features: t('landing.userTypes.freelancer.features', { returnObjects: true }) as string[],
      cta: t('landing.userTypes.freelancer.cta'),
      badge: t('landing.userTypes.freelancer.badge')
    },
    {
      id: "SOLLICITANT",
      title: t('landing.userTypes.jobseeker.title'),
      description: t('landing.userTypes.jobseeker.description'),
      icon: UserCheck,
      color: "bg-orange-500",
      features: t('landing.userTypes.jobseeker.features', { returnObjects: true }) as string[],
      cta: t('landing.userTypes.jobseeker.cta'),
      badge: t('landing.userTypes.jobseeker.badge')
    }
  ];

  const stats = [
    { number: "10.000+", label: t('landing.stats.activeJobs') },
    { number: "5.000+", label: t('landing.stats.companies') },
    { number: "50.000+", label: t('landing.stats.professionals') },
    { number: "98%", label: t('landing.stats.satisfaction') }
  ];

  const benefits = t('landing.benefits.items', { returnObjects: true }) as Array<{title: string, description: string}>;
  
  const benefitIcons = [Zap, Shield, Globe, Target];

  const handleUserTypeSelect = (userType: string) => {
    // All user types go directly to registration
    sessionStorage.setItem("selectedUserType", userType);
    setLocation("/register");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4" variant="secondary">
              🚀 {t('landing.hero.badge')}
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 text-gradient">
              {t('landing.hero.title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {t('landing.hero.subtitle')}
            </p>
            <div className="flex gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="btn-gradient rounded-full"
                onClick={() => document.getElementById('user-types')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t('landing.hero.cta.primary')} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-full border-primary text-primary hover:bg-primary hover:text-white font-semibold px-8"
                onClick={() => setLocation("/jobs")}
              >
                {t('landing.hero.cta.secondary')}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-gray-900">{stat.number}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Type Selection */}
      <section id="user-types" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('landing.userTypes.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('landing.userTypes.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {userTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card 
                  key={type.id} 
                  className="feature-card card-hover cursor-pointer group rounded-xl"
                  onClick={() => handleUserTypeSelect(type.id)}
                >
                  {type.badge && (
                    <Badge 
                      className="absolute -top-3 right-4 z-10"
                      variant={type.badge === "Gratis" ? "secondary" : "default"}
                    >
                      {type.badge}
                    </Badge>
                  )}
                  <CardHeader>
                    <div className={`w-14 h-14 ${type.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl">{type.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {type.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {type.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                      {type.cta}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('landing.benefits.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('landing.benefits.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => {
              const Icon = benefitIcons[index];
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            {t('landing.cta.title')}
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            {t('landing.cta.subtitle')}
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => document.getElementById('user-types')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('landing.cta.createAccount')}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-transparent text-white border-white hover:bg-white hover:text-gray-900"
              onClick={() => setLocation("/login")}
            >
              {t('landing.cta.login')}
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('landing.testimonials.title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {(t('landing.testimonials.items', { returnObjects: true }) as Array<{name: string, role: string, company: string, content: string}>).map((testimonial, index) => (
              <Card key={index} className="border-gray-200">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                    <div className="text-sm text-gray-500">{testimonial.company}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Vacature ORBIT</h3>
              <p className="text-gray-400 text-sm">
                {t('landing.footer.description')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">{t('landing.footer.forCompanies')}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">{t('landing.footer.links.postJobs')}</a></li>
                <li><a href="#" className="hover:text-white">{t('landing.footer.links.pricing')}</a></li>
                <li><a href="#" className="hover:text-white">{t('landing.footer.links.successStories')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">{t('landing.footer.forCandidates')}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">{t('landing.footer.links.searchJobs')}</a></li>
                <li><a href="#" className="hover:text-white">{t('landing.footer.links.createProfile')}</a></li>
                <li><a href="#" className="hover:text-white">{t('landing.footer.links.careerTips')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">{t('landing.footer.support')}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">{t('landing.footer.links.helpCenter')}</a></li>
                <li><a href="#" className="hover:text-white">{t('landing.footer.links.contact')}</a></li>
                <li><a href="#" className="hover:text-white">{t('landing.footer.links.privacy')}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Vacature ORBIT. {t('landing.footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}