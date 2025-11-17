import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Mail, Phone, MapPin, Euro, Calendar, Download, ExternalLink, Star } from "lucide-react";
import type { User as UserType } from "@shared/types";
import type { ZzpProfile } from "@shared/schema";
import { PageWrapper } from "@/components/page-wrapper";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

type ZzpProfileWithUser = {
  profile: ZzpProfile;
  user: Pick<UserType, 'name' | 'email'>;
};

export default function PublicZzpProfile() {
  const { userId } = useParams();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const { data: profileData, isLoading } = useQuery<ZzpProfileWithUser>({
    queryKey: [`/api/public/zzp-profile/${userId}`],
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
        </div>
      </PageWrapper>
    );
  }

  if (!profileData) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">{t('publicZzpProfile.notFoundTitle', { defaultValue: 'Profile not found' })}</h1>
          <p className="text-muted-foreground 400 mb-6">{t('publicZzpProfile.notFoundDesc', { defaultValue: 'The freelancer profile you requested does not exist or is not public.' })}</p>
          <Button onClick={() => setLocation("/manage-applications")} data-testid="button-back">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('publicZzpProfile.backToApplications', { defaultValue: 'Back to applications' })}
          </Button>
        </div>
        </div>
      </PageWrapper>
    );
  }

  const { profile, user } = profileData;

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => setLocation("/manage-applications")}
          className="mb-4"
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('publicZzpProfile.backToApplications', { defaultValue: 'Back to applications' })}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="feature-card bg-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <User className="h-6 w-6" />
                    {user.name}
                  </CardTitle>
                  <p className="text-lg text-muted-foreground 400 mt-1">
                    {profile.jobTitle}
                  </p>
                  {profile.specialization && (
                    <Badge variant="outline" className="mt-2">
                      {profile.specialization}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-gray-500" />
                  <span>{user.email}</span>
                </div>
                {profile.hourlyRate && (
                  <div className="flex items-center">
                    <Euro className="mr-2 h-4 w-4 text-gray-500" />
                    <span>€{profile.hourlyRate} {t('publicZzpProfile.perHour', { defaultValue: 'per hour' })}</span>
                  </div>
                )}
                {profile.availability && (
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                    <span>{profile.availability}</span>
                  </div>
                )}
                {profile.experienceYears && (
                  <div className="flex items-center">
                    <Star className="mr-2 h-4 w-4 text-gray-500" />
                    <span>{t('publicZzpProfile.experienceYears', { count: profile.experienceYears, defaultValue: '{{count}} years experience' })}</span>
                  </div>
                )}
              </div>

              {profile.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('publicZzpProfile.aboutMe', { defaultValue: 'About me' })}</h3>
                  <p className="text-gray-700 300 whitespace-pre-wrap">
                    {profile.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <Card className="feature-card bg-card">
              <CardHeader>
                <CardTitle>{t('publicZzpProfile.skills', { defaultValue: 'Skills' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {profile.education && (
            <Card className="feature-card bg-card">
              <CardHeader>
                <CardTitle>{t('publicZzpProfile.education', { defaultValue: 'Education' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 300">
                  {profile.education}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* CV Download */}
          {profile.cvUrl && (
            <Card className="feature-card bg-card">
              <CardHeader>
                <CardTitle className="text-lg">{t('publicZzpProfile.documents', { defaultValue: 'Documents' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  onClick={() => {
                    // Extract file ID from CV URL and use public endpoint
                    if (profile.cvUrl) {
                      const fileId = profile.cvUrl.split('/').pop();
                      const publicCvUrl = `${window.location.origin}/api/public/cv/${fileId}`;
                      window.open(publicCvUrl, '_blank');
                    }
                  }}
                  data-testid="button-download-cv"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {t('publicZzpProfile.downloadCv', { defaultValue: 'Download CV' })}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Portfolio */}
          {profile.portfolioUrls && profile.portfolioUrls.length > 0 && (
            <Card className="feature-card bg-card">
              <CardHeader>
                <CardTitle className="text-lg">{t('publicZzpProfile.portfolio', { defaultValue: 'Portfolio & Certificates' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profile.portfolioUrls.map((url, index) => (
                    <Button 
                      key={index}
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.open(url, '_blank')}
                      data-testid={`button-portfolio-${index}`}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      {t('publicZzpProfile.document', { defaultValue: 'Document {{index}}', index: index + 1 })}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Business Info */}
          {profile.kvkNumber && (
            <Card className="feature-card bg-card">
              <CardHeader>
                <CardTitle className="text-lg">{t('publicZzpProfile.businessInfo', { defaultValue: 'Business Info' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <div className="mb-2">
                    <span className="font-medium">{t('publicZzpProfile.kvk', { defaultValue: 'KVK Number:' })}</span> {profile.kvkNumber}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact */}
          <Card className="feature-card bg-card">
            <CardHeader>
              <CardTitle className="text-lg">{t('publicZzpProfile.contact', { defaultValue: 'Contact' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                onClick={() => window.open(`mailto:${user.email}`, '_blank')}
                data-testid="button-contact-email"
              >
                <Mail className="mr-2 h-4 w-4" />
                {t('publicZzpProfile.sendEmail', { defaultValue: 'Send email' })}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </PageWrapper>
  );
}
