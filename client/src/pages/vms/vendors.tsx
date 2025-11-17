/**
 * VMS Vendors Page
 *
 * Displays a list of all registered recruitment bureaus (vendors)
 * Accessible to company users to view available recruitment partners
 */

import React, { useEffect, useState } from 'react';
import { useApp } from '@/providers/AppProvider';
import { useToast } from '@/hooks/use-toast';
import { PageWrapper } from '@/components/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Building2,
  Search,
  Mail,
  AlertCircle,
  Loader2,
  Users,
  FileText,
  Download,
  Calendar,
  CheckCircle2,
  UserPlus,
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { VendorOnboardingDialog } from '@/components/vms/VendorOnboardingDialog';

interface MSA {
  id: string;
  msaNumber: string;
  status: string;
  effectiveDate: string;
  expirationDate: string;
  paymentTermsDays: number;
  noticePeriodDays: number;
  autoRenew: boolean;
  signedDocumentUrl?: string;
}

interface Bureau {
  id: string;
  name: string;
  companyName: string;
  email: string;
  msa: MSA;
}

function VMSVendors() {
  const { user } = useApp();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const [bureaus, setBureaus] = useState<Bureau[]>([]);
  const [filteredBureaus, setFilteredBureaus] = useState<Bureau[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  useEffect(() => {
    // Only company users can access this page
    if (user && user.userType !== 'BEDRIJF') {
      toast({
        title: 'Toegang geweigerd',
        description: 'Deze pagina is alleen toegankelijk voor bedrijven',
        variant: 'destructive',
      });
      setLocation('/dashboard');
    }
  }, [user]);

  useEffect(() => {
    if (user && user.userType === 'BEDRIJF') {
      fetchBureaus();
    }
  }, [user]);

  useEffect(() => {
    // Filter bureaus based on search term
    if (searchTerm) {
      const filtered = bureaus.filter(bureau =>
        bureau.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bureau.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bureau.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBureaus(filtered);
    } else {
      setFilteredBureaus(bureaus);
    }
  }, [searchTerm, bureaus]);

  const fetchBureaus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/vms/my-vendors', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vendors');
      }

      const data = await response.json();
      if (data.success) {
        setBureaus(data.data);
        setFilteredBureaus(data.data);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast({
        title: 'Fout bij ophalen',
        description: 'Kon de lijst met leveranciers niet ophalen',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Log in om deze pagina te bekijken</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="container mx-auto py-6 space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/vms/company-dashboard">VMS</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Leveranciers</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Building2 className="w-8 h-8 text-primary" />
              Mijn Leveranciers
            </h1>
            <p className="text-muted-foreground mt-2">
              Overzicht van alle recruitment bureaus waarmee u een actieve MSA (Master Service Agreement) heeft
            </p>
          </div>
          <Button
            onClick={() => setIsOnboardingOpen(true)}
            className="flex items-center gap-2"
            data-testid="button-onboard-vendor"
          >
            <UserPlus className="w-4 h-4" />
            Nieuwe Leverancier Onboarden
          </Button>
        </div>

        {/* Stats Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <CardTitle>Totaal Leveranciers</CardTitle>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {bureaus.length}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Leveranciers Lijst</CardTitle>
            <CardDescription>
              Zoek en filter door alle beschikbare recruitment bureaus
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Zoek op naam, bedrijfsnaam of email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Bureaus Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2">Laden...</span>
              </div>
            ) : filteredBureaus.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm
                    ? 'Geen leveranciers gevonden met deze zoekcriteria'
                    : 'U heeft nog geen actieve MSA met recruitment bureaus'}
                </p>
                {!searchTerm && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Bureaus worden automatisch zichtbaar wanneer u een MSA ondertekent
                  </p>
                )}
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bedrijfsnaam</TableHead>
                      <TableHead>Contactpersoon</TableHead>
                      <TableHead>MSA Nummer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Vervaldatum</TableHead>
                      <TableHead className="text-right">Acties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBureaus.map((bureau) => {
                      const expirationDate = new Date(bureau.msa.expirationDate);
                      const isExpiringSoon = (expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24) < 30;

                      return (
                        <TableRow key={bureau.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <div>{bureau.companyName || 'Niet opgegeven'}</div>
                                <div className="text-xs text-muted-foreground">
                                  <a
                                    href={`mailto:${bureau.email}`}
                                    className="flex items-center gap-1 hover:underline"
                                  >
                                    <Mail className="w-3 h-3" />
                                    {bureau.email}
                                  </a>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{bureau.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 font-mono text-sm">
                              <FileText className="w-3 h-3 text-muted-foreground" />
                              {bureau.msa.msaNumber}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              {bureau.msa.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              {expirationDate.toLocaleDateString('nl-NL')}
                              {isExpiringSoon && (
                                <Badge variant="outline" className="ml-2 text-orange-600 border-orange-600">
                                  Verloopt binnenkort
                                </Badge>
                              )}
                            </div>
                            {bureau.msa.autoRenew && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Auto-verlenging actief
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {bureau.msa.signedDocumentUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(bureau.msa.signedDocumentUrl, '_blank')}
                                >
                                  <Download className="w-3 h-3 mr-1" />
                                  Contract
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setLocation(`/vms/vendor/${bureau.id}`)}
                              >
                                Details
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Results Count */}
            {!isLoading && filteredBureaus.length > 0 && (
              <div className="text-sm text-muted-foreground text-center">
                {filteredBureaus.length === bureaus.length ? (
                  `${bureaus.length} leverancier${bureaus.length !== 1 ? 's' : ''} in totaal`
                ) : (
                  `${filteredBureaus.length} van ${bureaus.length} leverancier${bureaus.length !== 1 ? 's' : ''}`
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vendor Onboarding Dialog */}
      <VendorOnboardingDialog
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSuccess={() => {
          setIsOnboardingOpen(false);
          fetchBureaus(); // Refresh the list
        }}
      />
    </PageWrapper>
  );
}

export default VMSVendors;
