import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import type { SubscriptionPlan, Subscription, CancellationRequest } from "@/types/subscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertTriangle, 
  Pause,
  ArrowDown,
  DollarSign,
  Calendar,
  Shield,
  MessageCircle,
  Download,
  Loader2,
  CheckCircle,
  XCircle
} from "lucide-react";
import { addMonths } from "date-fns";
import { I18nFormatters } from "@/lib/i18n-formatters";
import { apiPost } from "@/lib/api-client";

interface CancellationFlowProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: SubscriptionPlan;
  subscription: Subscription | null;
}

interface CancellationReason {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  showAlternative?: boolean;
  alternativeText?: string;
  alternativeAction?: string;
}

// Move reasons to be created with translations
const getCancellationReasons = (t: any): CancellationReason[] => [
  {
    id: 'tooExpensive',
    label: t('subscription.cancellation.reasons.tooExpensive'),
    icon: DollarSign,
    description: t('subscription.cancellation.reasonDescriptions.tooExpensive'),
    showAlternative: true,
    alternativeText: t('subscription.cancellation.alternatives.downgrade'),
    alternativeAction: 'downgrade'
  },
  {
    id: 'notEnoughFeatures',
    label: t('subscription.cancellation.reasons.notEnoughFeatures'),
    icon: Pause,
    description: t('subscription.cancellation.reasonDescriptions.notEnoughFeatures'),
    showAlternative: true,
    alternativeText: t('subscription.cancellation.alternatives.pause'),
    alternativeAction: 'pause'
  },
  {
    id: 'foundAlternative',
    label: t('subscription.cancellation.reasons.foundAlternative'),
    icon: ArrowDown,
    description: t('subscription.cancellation.reasonDescriptions.foundAlternative'),
    showAlternative: false
  },
  {
    id: 'technicalIssues',
    label: t('subscription.cancellation.reasons.technicalIssues'),
    icon: Shield,
    description: t('subscription.cancellation.reasonDescriptions.technicalIssues'),
    showAlternative: true,
    alternativeText: t('subscription.cancellation.alternatives.support'),
    alternativeAction: 'support'
  },
  {
    id: 'noLongerNeeded',
    label: t('subscription.cancellation.reasons.noLongerNeeded'),
    icon: MessageCircle,
    description: t('subscription.cancellation.reasonDescriptions.noLongerNeeded'),
    showAlternative: true,
    alternativeText: t('subscription.cancellation.alternatives.feedback'),
    alternativeAction: 'feedback'
  },
  {
    id: 'other',
    label: t('subscription.cancellation.reasons.other'),
    icon: MessageCircle,
    description: t('subscription.cancellation.reasonDescriptions.other'),
    showAlternative: false
  }
];

export function CancellationFlow({ isOpen, onClose, currentPlan, subscription }: CancellationFlowProps) {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState<'reason' | 'alternatives' | 'confirmation' | 'completed'>('reason');
  
  // Create formatters and reasons with current locale
  const formatters = new I18nFormatters(i18n.language);
  const CANCELLATION_REASONS = getCancellationReasons(t);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [feedback, setFeedback] = useState('');
  const [dataRetention, setDataRetention] = useState(true);
  const [surveyOptIn, setSurveyOptIn] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Cancel subscription mutation
  const cancelMutation = useMutation({
    mutationFn: async (data: {
      reason: string;
      feedback?: string;
      dataRetention: boolean;
      surveyOptIn: boolean;
    }) => {
      const response = await apiPost("/api/subscription/cancel", data);

      if (!response.success) {
        throw new Error(response.error || "Failed to cancel subscription");
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
      setStep('completed');
      
      toast({
        title: "Abonnement opgezegd",
        description: "Je abonnement wordt aan het einde van de huidige periode beëindigd.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fout",
        description: error.message || "Er is een fout opgetreden bij het opzeggen van je abonnement.",
        variant: "destructive",
      });
    },
  });

  // Pause subscription mutation
  const pauseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiPost("/api/subscription/pause");
      if (!response.success) {throw new Error("Failed to pause subscription");}
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
      onClose();
      
      toast({
        title: "Abonnement gepauzeerd",
        description: "Je abonnement is gepauzeerd voor 3 maanden.",
      });
    },
  });

  const selectedReasonData = CANCELLATION_REASONS.find(r => r.id === selectedReason);
  const endOfPeriod = subscription?.currentPeriodEnd ? 
    format(new Date(subscription.currentPeriodEnd), 'dd MMMM yyyy', { locale: nl }) : 
    'onbekend';

  const handleReasonSelect = (reasonId: string) => {
    setSelectedReason(reasonId);
    const reason = CANCELLATION_REASONS.find(r => r.id === reasonId);
    
    if (reason?.showAlternative) {
      setStep('alternatives');
    } else {
      setStep('confirmation');
    }
  };

  const handleAlternativeAction = (action: string) => {
    switch (action) {
      case 'pause':
        pauseMutation.mutate();
        break;
      case 'downgrade':
        onClose();
        // Navigate to plans section or trigger plan change
        toast({
          title: "Redirect naar plannen",
          description: "Je wordt doorgeleid naar de plan selectie.",
        });
        break;
      case 'support':
        window.open('/contact', '_blank');
        break;
      case 'feedback':
        setStep('confirmation');
        break;
      default:
        setStep('confirmation');
    }
  };

  const handleCancel = () => {
    if (confirmationText.toLowerCase() !== 'opzeggen') {
      toast({
        title: "Bevestiging vereist",
        description: "Type 'opzeggen' om je abonnement op te zeggen.",
        variant: "destructive",
      });
      return;
    }

    cancelMutation.mutate({
      reason: selectedReason,
      feedback: feedback || undefined,
      dataRetention,
      surveyOptIn,
    });
  };

  const handleClose = () => {
    setStep('reason');
    setSelectedReason('');
    setFeedback('');
    setDataRetention(true);
    setSurveyOptIn(false);
    setConfirmationText('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === 'reason' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Abonnement Opzeggen
              </DialogTitle>
              <DialogDescription>
                We zijn benieuwd waarom je je abonnement wilt opzeggen. Je feedback helpt ons om onze service te verbeteren.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Huidige abonnement details</h4>
                <div className="text-sm text-blue-800">
                  <p><strong>Plan:</strong> {currentPlan?.name}</p>
                  <p><strong>Prijs:</strong> €{((currentPlan?.price || 0) / 100).toFixed(2)}/maand</p>
                  <p><strong>Status:</strong> {subscription?.status || 'Actief'}</p>
                  {subscription?.currentPeriodEnd && (
                    <p><strong>Vernieuwt op:</strong> {endOfPeriod}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Wat is de hoofdreden voor opzegging?</Label>
                <RadioGroup value={selectedReason} onValueChange={handleReasonSelect}>
                  {CANCELLATION_REASONS.map((reason) => {
                    const Icon = reason.icon;
                    return (
                      <div key={reason.id} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-background cursor-pointer">
                        <RadioGroupItem value={reason.id} id={reason.id} className="mt-1" />
                        <div className="flex-1">
                          <Label 
                            htmlFor={reason.id} 
                            className="flex items-center gap-2 font-medium cursor-pointer"
                          >
                            <Icon className="h-4 w-4" />
                            {reason.label}
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">{reason.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>
            </div>
          </>
        )}

        {step === 'alternatives' && selectedReasonData && (
          <>
            <DialogHeader>
              <DialogTitle>Wacht even! We hebben alternatieven</DialogTitle>
              <DialogDescription>
                Voordat je opzegt, kijk eens naar deze alternatieven die mogelijk beter bij je passen.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <selectedReasonData.icon className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Je gekozen reden:</h4>
                    <p className="text-yellow-800 text-sm">{selectedReasonData.label} - {selectedReasonData.description}</p>
                  </div>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Aanbevolen Alternatief</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-700">{selectedReasonData.alternativeText}</p>
                    
                    {selectedReason === 'too-expensive' && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h5 className="font-medium text-green-900 mb-2">Downgrade naar Starter</h5>
                        <p className="text-green-800 text-sm mb-3">
                          Slechts €29/maand - perfect voor kleinere bedrijven
                        </p>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Tot 10 vacatures per maand</li>
                          <li>• Basis applicant beheer</li>
                          <li>• Email support</li>
                        </ul>
                      </div>
                    )}

                    {selectedReason === 'not-using' && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-medium text-blue-900 mb-2">Pauzeer je Abonnement</h5>
                        <p className="text-blue-800 text-sm mb-3">
                          Pauzeer voor maximaal 3 maanden - geen kosten, behoud je data
                        </p>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Geen kosten tijdens pauze</li>
                          <li>• All je data blijft bewaard</li>
                          <li>• Hervat wanneer je wilt</li>
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button 
                        onClick={() => handleAlternativeAction(selectedReasonData.alternativeAction!)}
                        disabled={pauseMutation.isPending}
                        className="flex-1"
                      >
                        {pauseMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Probeer Dit Alternatief
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setStep('confirmation')}
                        className="flex-1"
                      >
                        Toch Opzeggen
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {step === 'confirmation' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Bevestig Opzegging
              </DialogTitle>
              <DialogDescription>
                Laatste stap: bevestig je opzegging en vertel ons hoe we het beter kunnen maken.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* What happens */}
              <div className="bg-background p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Wat gebeurt er na opzegging?</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Je hebt toegang tot alle functies tot <strong>{endOfPeriod}</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Je data blijft 90 dagen bewaard voor eventuele heractivatie</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <span>Automatische verlengingen stoppen per direct</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Je kunt altijd opnieuw abonneren zonder setup kosten</span>
                  </li>
                </ul>
              </div>

              {/* Feedback */}
              <div className="space-y-3">
                <Label htmlFor="feedback">Help ons beter te worden (optioneel)</Label>
                <Textarea
                  id="feedback"
                  placeholder="Vertel ons wat we beter kunnen doen, welke functies je mist, of andere feedback..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Data retention */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="data-retention"
                    checked={dataRetention}
                    onCheckedChange={(checked) => setDataRetention(checked === true)}
                  />
                  <Label htmlFor="data-retention" className="text-sm">
                    Bewaar mijn data 90 dagen voor eventuele heractivatie
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="survey-opt-in"
                    checked={surveyOptIn}
                    onCheckedChange={(checked) => setSurveyOptIn(checked === true)}
                  />
                  <Label htmlFor="survey-opt-in" className="text-sm">
                    Ik wil deelnemen aan een korte enquête over mijn ervaring
                  </Label>
                </div>
              </div>

              {/* Final confirmation */}
              <div className="border-2 border-red-200 bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium text-red-900 mb-3">Definitieve bevestiging vereist</h4>
                <p className="text-red-800 text-sm mb-3">
                  Type <strong>"opzeggen"</strong> in het veld hieronder om te bevestigen dat je je abonnement wilt opzeggen.
                </p>
                <input
                  type="text"
                  placeholder="Type 'opzeggen' hier..."
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  className="w-full p-2 border border-red-300 rounded focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setStep('reason')}
                  className="flex-1"
                >
                  Terug
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending || confirmationText.toLowerCase() !== 'opzeggen'}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {cancelMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Opzeggen...
                    </>
                  ) : (
                    'Definitief Opzeggen'
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'completed' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Abonnement Opgezegd
              </DialogTitle>
              <DialogDescription>
                Je abonnement is succesvol opgezegd. We zijn verdrietig je te zien gaan!
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Bevestiging</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>✓ Je abonnement eindigt op {endOfPeriod}</li>
                  <li>✓ Je blijft toegang houden tot alle functies tot die datum</li>
                  <li>✓ Er vinden geen verdere automatische betalingen plaats</li>
                  {dataRetention && (
                    <li>✓ Je data wordt 90 dagen bewaard voor heractivatie</li>
                  )}
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Bedankt voor je vertrouwen</h4>
                <p className="text-blue-800 text-sm">
                  We waarderen de tijd dat je bij ons bent geweest. Mocht je in de toekomst 
                  weer behoefte hebben aan onze diensten, dan ben je altijd welkom terug.
                </p>
              </div>

              <div className="space-y-3">
                <Button onClick={handleClose} className="w-full">
                  Sluiten
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.open('https://vacature-orbit.nl/export-data', '_blank')}
                  className="w-full flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Mijn Data
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}