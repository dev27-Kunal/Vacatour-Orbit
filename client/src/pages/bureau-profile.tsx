/**
 * Bureau Profile Page
 *
 * Allows bureau users to configure their profile including:
 * - Service type (W&S or Uitzenden/Detacheren)
 * - Certifications (NEN, WAADI)
 * - Work preferences (VAST, INTERIM, UITZENDEN)
 * - Company information and contact details
 *
 * @module client/pages/bureau-profile
 */

import { useState, useEffect } from 'react';
import { useApp } from '@/providers/AppProvider';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { bureauProfileApi, bureauProfileSchema, type BureauProfile, type BureauProfileFormData } from '@/lib/api/bureau-profile';
import { PageWrapper } from '@/components/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  Award,
  Briefcase,
  Save,
  AlertCircle,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function BureauProfilePage() {
  const { user } = useApp();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<BureauProfileFormData>({
    serviceType: 'W&S',
    certifications: {
      nen: false,
      waadi: false,
    },
    workPreferences: {
      vast: false,
      interim: false,
      uitzenden: false,
    },
    companyName: '',
    kvkNumber: '',
    notificationEmail: '',
    phone: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Nederland',
    },
  });

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Redirect non-bureau users
  useEffect(() => {
    if (user && user.userType !== 'BUREAU') {
      toast({
        title: 'Toegang geweigerd',
        description: 'Deze pagina is alleen beschikbaar voor bureaus',
        variant: 'destructive',
      });
      setLocation('/account');
    }
  }, [user, setLocation, toast]);

  // Load profile data
  useEffect(() => {
    async function loadProfile() {
      if (!user || user.userType !== 'BUREAU') return;

      try {
        setIsLoading(true);
        const response = await bureauProfileApi.getProfile();

        if (response.success && response.data) {
          setFormData(response.data);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        toast({
          title: 'Fout bij laden',
          description: 'Kon profiel niet laden. Probeer het later opnieuw.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [user, toast]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    // Validate form data
    try {
      bureauProfileSchema.parse(formData);
    } catch (error: any) {
      const errors: Record<string, string> = {};
      error.errors?.forEach((err: any) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      setValidationErrors(errors);

      toast({
        title: 'Validatie fout',
        description: 'Controleer de ingevulde gegevens',
        variant: 'destructive',
      });
      return;
    }

    // Save profile
    try {
      setIsSaving(true);
      const response = await bureauProfileApi.updateProfile(formData);

      if (response.success) {
        toast({
          title: 'Profiel opgeslagen',
          description: 'Uw profiel is succesvol bijgewerkt',
        });
      }
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      toast({
        title: 'Fout bij opslaan',
        description: error.message || 'Kon profiel niet opslaan. Probeer het later opnieuw.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle field changes
  const updateField = (field: string, value: any) => {
    setFormData(prev => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      }

      // Nested field update
      const [parent, child] = keys;
      return {
        ...prev,
        [parent]: {
          ...(prev[parent as keyof BureauProfileFormData] as any),
          [child]: value,
        },
      };
    });

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <PageWrapper>
        <div className="min-h-screen">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Skeleton className="h-12 w-64 mb-8" />
            <div className="space-y-6">
              <Skeleton className="h-96" />
              <Skeleton className="h-64" />
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // Don't render for non-bureau users
  if (!user || user.userType !== 'BUREAU') {
    return null;
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Bureau Profiel
            </h1>
            <p className="mt-2 text-muted-foreground">
              Configureer uw bureau profiel en voorkeuren
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Service Type
                </CardTitle>
                <CardDescription>
                  Selecteer het type dienstverlening van uw bureau
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={formData.serviceType}
                  onValueChange={(value) => updateField('serviceType', value)}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <RadioGroupItem value="W&S" id="ws" />
                    <Label htmlFor="ws" className="font-normal cursor-pointer">
                      Werving & Selectie (W&S)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="UITZENDEN_DETACHEREN" id="uitzenden" />
                    <Label htmlFor="uitzenden" className="font-normal cursor-pointer">
                      Uitzenden/Detacheren
                    </Label>
                  </div>
                </RadioGroup>
                {validationErrors.serviceType && (
                  <p className="text-sm text-destructive mt-2">
                    {validationErrors.serviceType}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Certificeringen
                </CardTitle>
                <CardDescription>
                  Selecteer de certificeringen die uw bureau bezit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="nen"
                      checked={formData.certifications.nen}
                      onCheckedChange={(checked) =>
                        updateField('certifications.nen', checked === true)
                      }
                    />
                    <Label htmlFor="nen" className="font-normal cursor-pointer">
                      NEN Gecertificeerd
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="waadi"
                      checked={formData.certifications.waadi}
                      onCheckedChange={(checked) =>
                        updateField('certifications.waadi', checked === true)
                      }
                    />
                    <Label htmlFor="waadi" className="font-normal cursor-pointer">
                      WAADI Gecertificeerd
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Work Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Werkvoorkeuren
                </CardTitle>
                <CardDescription>
                  Selecteer de type contracten waar uw bureau mee werkt (minimaal één vereist)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="vast"
                      checked={formData.workPreferences.vast}
                      onCheckedChange={(checked) =>
                        updateField('workPreferences.vast', checked === true)
                      }
                    />
                    <Label htmlFor="vast" className="font-normal cursor-pointer">
                      VAST (Permanente contracten)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="interim"
                      checked={formData.workPreferences.interim}
                      onCheckedChange={(checked) =>
                        updateField('workPreferences.interim', checked === true)
                      }
                    />
                    <Label htmlFor="interim" className="font-normal cursor-pointer">
                      INTERIM (Tijdelijke contracten)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="uitzenden-pref"
                      checked={formData.workPreferences.uitzenden}
                      onCheckedChange={(checked) =>
                        updateField('workPreferences.uitzenden', checked === true)
                      }
                    />
                    <Label htmlFor="uitzenden-pref" className="font-normal cursor-pointer">
                      UITZENDEN (Staffing)
                    </Label>
                  </div>
                </div>
                {validationErrors.workPreferences && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {validationErrors.workPreferences}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Bedrijfsinformatie
                </CardTitle>
                <CardDescription>
                  Algemene informatie over uw bureau
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Company Name */}
                <div>
                  <Label htmlFor="companyName">Bedrijfsnaam *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => updateField('companyName', e.target.value)}
                    placeholder="Bijv. ABC Recruitment"
                    className={validationErrors.companyName ? 'border-destructive' : ''}
                  />
                  {validationErrors.companyName && (
                    <p className="text-sm text-destructive mt-1">
                      {validationErrors.companyName}
                    </p>
                  )}
                </div>

                {/* KVK Number */}
                <div>
                  <Label htmlFor="kvkNumber">KVK Nummer *</Label>
                  <Input
                    id="kvkNumber"
                    value={formData.kvkNumber}
                    onChange={(e) => updateField('kvkNumber', e.target.value.replace(/\D/g, ''))}
                    placeholder="12345678"
                    maxLength={8}
                    className={validationErrors.kvkNumber ? 'border-destructive' : ''}
                  />
                  {validationErrors.kvkNumber && (
                    <p className="text-sm text-destructive mt-1">
                      {validationErrors.kvkNumber}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="notificationEmail" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email voor vacature notificaties *
                  </Label>
                  <Input
                    id="notificationEmail"
                    type="email"
                    value={formData.notificationEmail}
                    onChange={(e) => updateField('notificationEmail', e.target.value)}
                    placeholder="contact@bureau.nl"
                    className={validationErrors.notificationEmail ? 'border-destructive' : ''}
                  />
                  {validationErrors.notificationEmail && (
                    <p className="text-sm text-destructive mt-1">
                      {validationErrors.notificationEmail}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefoonnummer *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="06 12345678"
                    className={validationErrors.phone ? 'border-destructive' : ''}
                  />
                  {validationErrors.phone && (
                    <p className="text-sm text-destructive mt-1">
                      {validationErrors.phone}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Office Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Kantooradres
                </CardTitle>
                <CardDescription>
                  Adres van uw hoofdkantoor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Street */}
                <div>
                  <Label htmlFor="street">Straat en huisnummer *</Label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    onChange={(e) => updateField('address.street', e.target.value)}
                    placeholder="Hoofdstraat 123"
                    className={validationErrors['address.street'] ? 'border-destructive' : ''}
                  />
                  {validationErrors['address.street'] && (
                    <p className="text-sm text-destructive mt-1">
                      {validationErrors['address.street']}
                    </p>
                  )}
                </div>

                {/* City & Postal Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postalCode">Postcode *</Label>
                    <Input
                      id="postalCode"
                      value={formData.address.postalCode}
                      onChange={(e) => updateField('address.postalCode', e.target.value)}
                      placeholder="1234 AB"
                      className={validationErrors['address.postalCode'] ? 'border-destructive' : ''}
                    />
                    {validationErrors['address.postalCode'] && (
                      <p className="text-sm text-destructive mt-1">
                        {validationErrors['address.postalCode']}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="city">Plaats *</Label>
                    <Input
                      id="city"
                      value={formData.address.city}
                      onChange={(e) => updateField('address.city', e.target.value)}
                      placeholder="Amsterdam"
                      className={validationErrors['address.city'] ? 'border-destructive' : ''}
                    />
                    {validationErrors['address.city'] && (
                      <p className="text-sm text-destructive mt-1">
                        {validationErrors['address.city']}
                      </p>
                    )}
                  </div>
                </div>

                {/* Country */}
                <div>
                  <Label htmlFor="country">Land *</Label>
                  <Input
                    id="country"
                    value={formData.address.country}
                    onChange={(e) => updateField('address.country', e.target.value)}
                    placeholder="Nederland"
                    className={validationErrors['address.country'] ? 'border-destructive' : ''}
                  />
                  {validationErrors['address.country'] && (
                    <p className="text-sm text-destructive mt-1">
                      {validationErrors['address.country']}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation('/account')}
                disabled={isSaving}
              >
                Annuleren
              </Button>
              <Button type="submit" disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Opslaan...' : 'Profiel Opslaan'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}
