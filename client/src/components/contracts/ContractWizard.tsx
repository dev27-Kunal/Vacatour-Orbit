/**
 * Contract Creation Wizard Component
 * Multi-step form for creating new contracts
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import {
  FileText,
  Users,
  Calendar as CalendarIcon,
  Euro,
  FileSignature,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Building,
  User,
  Briefcase,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiGet, apiPost, ApiError } from '@/lib/api-client';

interface ContractWizardProps {
  applicationId?: string;
  jobId?: string;
  candidateId?: string;
  bureauId?: string;
}

interface MSA {
  id: string;
  msa_number: string;
  company_name: string;
  bureau_name: string;
  status: string;
  effective_date: string;
  expiration_date: string;
}

interface RateCard {
  id: string;
  name: string;
  bureau_name: string;
  is_default: boolean;
  rate_card_lines?: RateCardLine[];
}

interface RateCardLine {
  id: string;
  job_category: string;
  seniority_level: string;
  fee_type: string;
  placement_fee_percentage?: number;
  hourly_markup_percentage?: number;
  fixed_fee_amount?: number;
  hourly_markup_amount?: number;
}

interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  contract_type: string;
  is_default: boolean;
  template_content: string;
  variables: Record<string, any>;
}

const steps = [
  { id: 'type', label: 'Contract Type', icon: FileText },
  { id: 'parties', label: 'Partijen', icon: Users },
  { id: 'terms', label: 'Voorwaarden', icon: FileSignature },
  { id: 'rates', label: 'Tarieven', icon: Euro },
  { id: 'review', label: 'Controleren', icon: CheckCircle },
];

export function ContractWizard({
  applicationId,
  jobId,
  candidateId,
  bureauId,
}: ContractWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [msas, setMSAs] = useState<MSA[]>([]);
  const [rateCards, setRateCards] = useState<RateCard[]>([]);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Contract Type
    contractType: 'VAST' as 'VAST' | 'INTERIM' | 'UITZENDEN',
    templateId: '',
    useTemplate: true,

    // Step 2: Parties
    applicationId: applicationId || '',
    jobId: jobId || '',
    candidateId: candidateId || '',
    bureauId: bureauId || '',
    companyId: '',
    msaId: '',

    // Step 3: Terms
    startDate: new Date(),
    endDate: undefined as Date | undefined,
    probationPeriod: 1,
    noticePeriod: 1,
    vacationDays: 25,
    workingHours: 40,

    // Step 4: Rates
    rateCardId: '',
    salary: 0,
    hourlyRate: 0,
    bureauFeePercentage: 0,
    bureauFeeAmount: 0,

    // Additional
    notes: '',
    requiresApproval: false,
  });

  useEffect(() => {
    // Load initial data
    fetchTemplates();
    fetchMSAs();
    fetchRateCards();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await apiGet(`/api/v2/contracts/templates?type=${formData.contractType}`);
      setTemplates(response.data || []);
      // Set default template if available
      const defaultTemplate = response.data?.find((t: ContractTemplate) => t.is_default);
      if (defaultTemplate) {
        setFormData((prev) => ({ ...prev, templateId: defaultTemplate.id }));
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchMSAs = async () => {
    if (!formData.companyId || !formData.bureauId) {return;}
    try {
      const response = await apiGet(
        `/api/v2/contracts/msa/active?company_id=${formData.companyId}&bureau_id=${formData.bureauId}`
      );
      if (response.data) {
        setMSAs([response.data]);
        setFormData((prev) => ({ ...prev, msaId: response.data.id }));
      }
    } catch (error) {
      console.error('Error fetching MSA:', error);
    }
  };

  const fetchRateCards = async () => {
    if (!formData.bureauId) {return;}
    try {
      const response = await apiGet(
        `/api/v2/contracts/rate-cards?bureau_id=${formData.bureauId}&company_id=${formData.companyId}`
      );
      setRateCards(response.data || []);
      // Set default rate card if available
      const defaultCard = response.data?.find((r: RateCard) => r.is_default);
      if (defaultCard) {
        setFormData((prev) => ({ ...prev, rateCardId: defaultCard.id }));
        calculateFees(defaultCard);
      }
    } catch (error) {
      console.error('Error fetching rate cards:', error);
    }
  };

  const calculateFees = (rateCard: RateCard) => {
    if (!rateCard.rate_card_lines || rateCard.rate_card_lines.length === 0) {return;}

    const line = rateCard.rate_card_lines[0]; // Simplified - should match on category/level

    if (formData.contractType === 'VAST' && line.placement_fee_percentage) {
      const feeAmount = (formData.salary * line.placement_fee_percentage) / 100;
      setFormData((prev) => ({
        ...prev,
        bureauFeePercentage: line.placement_fee_percentage,
        bureauFeeAmount: feeAmount,
      }));
    } else if (line.hourly_markup_percentage) {
      const markup = (formData.hourlyRate * line.hourly_markup_percentage) / 100;
      setFormData((prev) => ({
        ...prev,
        bureauFeePercentage: line.hourly_markup_percentage,
        bureauFeeAmount: markup,
      }));
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const contractData = {
        applicationId: formData.applicationId,
        jobId: formData.jobId,
        candidateId: formData.candidateId,
        bureauId: formData.bureauId,
        companyId: formData.companyId,
        templateId: formData.useTemplate ? formData.templateId : undefined,
        msaId: formData.msaId,
        rateCardId: formData.rateCardId,
        contractType: formData.contractType,
        startDate: format(formData.startDate, 'yyyy-MM-dd'),
        endDate: formData.endDate ? format(formData.endDate, 'yyyy-MM-dd') : undefined,
        salary: formData.contractType === 'VAST' ? formData.salary : undefined,
        hourlyRate: formData.contractType !== 'VAST' ? formData.hourlyRate : undefined,
        notes: formData.notes,
      };

      const response = await apiPost('/api/v2/contracts', contractData);

      toast({
        title: 'Success',
        description: 'Contract succesvol aangemaakt',
      });
      setLocation(`/contracts/${response.data.id}`);
    } catch (error) {
      console.error('Error creating contract:', error);
      const errorMessage = error instanceof ApiError ? error.message : 'Kon contract niet aanmaken';
      toast({
        title: 'Fout',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Contract Type
        return (
          <div className="space-y-6">
            <div>
              <Label>Contract Type</Label>
              <RadioGroup
                value={formData.contractType}
                onValueChange={(value) =>
                  setFormData({ ...formData, contractType: value as any })
                }
                className="mt-2"
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="VAST" id="vast" />
                  <Label htmlFor="vast" className="flex-1 cursor-pointer">
                    <div>
                      <div className="font-medium">Vast Contract</div>
                      <div className="text-sm text-muted-foreground">
                        Onbepaalde tijd, vaste aanstelling
                      </div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="INTERIM" id="interim" />
                  <Label htmlFor="interim" className="flex-1 cursor-pointer">
                    <div>
                      <div className="font-medium">Interim Contract</div>
                      <div className="text-sm text-muted-foreground">
                        Tijdelijk, voor specifieke opdracht
                      </div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="UITZENDEN" id="uitzenden" />
                  <Label htmlFor="uitzenden" className="flex-1 cursor-pointer">
                    <div>
                      <div className="font-medium">Uitzendkracht</div>
                      <div className="text-sm text-muted-foreground">
                        Via uitzendbureau, flexibel
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useTemplate"
                  checked={formData.useTemplate}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, useTemplate: !!checked })
                  }
                />
                <Label htmlFor="useTemplate">Gebruik contract template</Label>
              </div>

              {formData.useTemplate && templates.length > 0 && (
                <Select
                  value={formData.templateId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, templateId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                        {template.is_default && (
                          <Badge variant="secondary" className="ml-2">
                            Standaard
                          </Badge>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        );

      case 1: // Parties
        return (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Selecteer de partijen die betrokken zijn bij dit contract
              </AlertDescription>
            </Alert>

            {msas.length > 0 && (
              <div className="p-4 border rounded-lg bg-green-50">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Actieve MSA gevonden</span>
                </div>
                <div className="mt-2 text-sm text-green-700">
                  MSA: {msas[0].msa_number} - Geldig tot{' '}
                  {format(new Date(msas[0].expiration_date), 'dd MMMM yyyy', {
                    locale: nl,
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Bedrijf</Label>
                <Input
                  placeholder="Selecteer bedrijf"
                  value={formData.companyId}
                  onChange={(e) =>
                    setFormData({ ...formData, companyId: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Bureau</Label>
                <Input
                  placeholder="Selecteer bureau"
                  value={formData.bureauId}
                  onChange={(e) =>
                    setFormData({ ...formData, bureauId: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label>Kandidaat</Label>
              <Input
                placeholder="Selecteer kandidaat"
                value={formData.candidateId}
                onChange={(e) =>
                  setFormData({ ...formData, candidateId: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Vacature</Label>
              <Input
                placeholder="Selecteer vacature"
                value={formData.jobId}
                onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
              />
            </div>
          </div>
        );

      case 2: // Terms
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Startdatum</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.startDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? (
                        format(formData.startDate, 'dd MMMM yyyy', { locale: nl })
                      ) : (
                        <span>Selecteer datum</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) =>
                        date && setFormData({ ...formData, startDate: date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {formData.contractType !== 'VAST' && (
                <div>
                  <Label>Einddatum</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !formData.endDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endDate ? (
                          format(formData.endDate, 'dd MMMM yyyy', { locale: nl })
                        ) : (
                          <span>Selecteer datum</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) =>
                          date && setFormData({ ...formData, endDate: date })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Proeftijd (maanden)</Label>
                <Input
                  type="number"
                  min={0}
                  max={6}
                  value={formData.probationPeriod}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      probationPeriod: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label>Opzegtermijn (maanden)</Label>
                <Input
                  type="number"
                  min={0}
                  max={6}
                  value={formData.noticePeriod}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      noticePeriod: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Vakantiedagen per jaar</Label>
                <Input
                  type="number"
                  min={20}
                  max={40}
                  value={formData.vacationDays}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vacationDays: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label>Werkuren per week</Label>
                <Input
                  type="number"
                  min={8}
                  max={40}
                  value={formData.workingHours}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      workingHours: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>
        );

      case 3: // Rates
        return (
          <div className="space-y-4">
            {rateCards.length > 0 && (
              <div>
                <Label>Tariefkaart</Label>
                <Select
                  value={formData.rateCardId}
                  onValueChange={(value) => {
                    setFormData({ ...formData, rateCardId: value });
                    const card = rateCards.find((r) => r.id === value);
                    if (card) {calculateFees(card);}
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer tariefkaart" />
                  </SelectTrigger>
                  <SelectContent>
                    {rateCards.map((card) => (
                      <SelectItem key={card.id} value={card.id}>
                        {card.name}
                        {card.is_default && (
                          <Badge variant="secondary" className="ml-2">
                            Standaard
                          </Badge>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.contractType === 'VAST' ? (
              <div>
                <Label>Bruto jaarsalaris (€)</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.salary}
                  onChange={(e) =>
                    setFormData({ ...formData, salary: parseFloat(e.target.value) })
                  }
                />
              </div>
            ) : (
              <div>
                <Label>Uurtarief (€)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.hourlyRate}
                  onChange={(e) =>
                    setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) })
                  }
                />
              </div>
            )}

            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="text-sm font-medium mb-2">Bureau Fee Berekening</div>
              <div className="space-y-1 text-sm">
                {formData.contractType === 'VAST' ? (
                  <>
                    <div className="flex justify-between">
                      <span>Salaris:</span>
                      <span>€ {formData.salary.toLocaleString('nl-NL')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fee percentage:</span>
                      <span>{formData.bureauFeePercentage}%</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span>Uurtarief:</span>
                      <span>€ {formData.hourlyRate.toLocaleString('nl-NL')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Markup percentage:</span>
                      <span>{formData.bureauFeePercentage}%</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Bureau fee:</span>
                  <span>€ {formData.bureauFeeAmount.toLocaleString('nl-NL')}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Review
        return (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Controleer de onderstaande gegevens voordat u het contract aanmaakt
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="text-sm text-muted-foreground">Contract Type</div>
                <div className="font-medium">
                  {formData.contractType === 'VAST'
                    ? 'Vast Contract'
                    : formData.contractType === 'INTERIM'
                    ? 'Interim'
                    : 'Uitzendkracht'}
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="text-sm text-muted-foreground">Periode</div>
                <div className="font-medium">
                  {format(formData.startDate, 'dd MMMM yyyy', { locale: nl })}
                  {formData.endDate && (
                    <> - {format(formData.endDate, 'dd MMMM yyyy', { locale: nl })}</>
                  )}
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="text-sm text-muted-foreground">Salaris/Tarief</div>
                <div className="font-medium">
                  {formData.contractType === 'VAST'
                    ? `€ ${formData.salary.toLocaleString('nl-NL')} per jaar`
                    : `€ ${formData.hourlyRate.toLocaleString('nl-NL')} per uur`}
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="text-sm text-muted-foreground">Bureau Fee</div>
                <div className="font-medium">
                  € {formData.bureauFeeAmount.toLocaleString('nl-NL')} (
                  {formData.bureauFeePercentage}%)
                </div>
              </div>
            </div>

            <div>
              <Label>Opmerkingen (optioneel)</Label>
              <Textarea
                placeholder="Voeg eventuele opmerkingen toe..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="requiresApproval"
                checked={formData.requiresApproval}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, requiresApproval: !!checked })
                }
              />
              <Label htmlFor="requiresApproval">
                Dit contract vereist goedkeuring voordat het ondertekend kan worden
              </Label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Nieuw Contract Aanmaken</CardTitle>
        <CardDescription>
          Volg de stappen om een nieuw contract aan te maken
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress */}
        <div className="mb-8">
          <Progress value={(currentStep + 1) * (100 / steps.length)} />
          <div className="flex justify-between mt-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={cn(
                    'flex flex-col items-center gap-1',
                    index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center border-2',
                      index < currentStep
                        ? 'bg-primary border-primary text-white'
                        : index === currentStep
                        ? 'border-primary'
                        : 'border-muted-foreground'
                    )}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-xs font-medium">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">{renderStepContent()}</div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Vorige
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button onClick={handleNext}>
            Volgende
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Aanmaken...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Contract Aanmaken
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}