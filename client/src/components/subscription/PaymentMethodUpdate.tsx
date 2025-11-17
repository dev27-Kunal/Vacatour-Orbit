import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PaymentMethod } from "@/types/subscription";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  Plus
} from "lucide-react";
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement
} from '@stripe/react-stripe-js';
import { apiGet, apiPost, apiDelete } from '@/lib/api-client';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentMethodUpdateProps {
  isOpen: boolean;
  onClose: () => void;
  currentPaymentMethod?: {
    id: string;
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    isDefault: boolean;
  } | null;
}


const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#374151',
      '::placeholder': {
        color: '#9CA3AF',
      },
    },
    invalid: {
      color: '#EF4444',
    },
  },
};

function PaymentMethodForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment method
      const { error: createError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardholderName,
        },
      });

      if (createError) {
        throw new Error(createError.message);
      }

      if (!paymentMethod) {
        throw new Error('No payment method created');
      }

      // Save payment method to backend
      const response = await apiPost('/api/subscription/payment-method', {
        paymentMethodId: paymentMethod.id,
        setAsDefault: true,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to save payment method');
      }

      toast({
        title: "Betaalmethode toegevoegd",
        description: "Je nieuwe betaalmethode is succesvol toegevoegd.",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message || "Er is een fout opgetreden bij het toevoegen van je betaalmethode.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="cardholder-name" className="block text-sm font-medium text-gray-700 mb-2">
            Naam op kaart
          </label>
          <input
            id="cardholder-name"
            type="text"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            placeholder="Voornaam Achternaam"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kaartgegevens
          </label>
          <div className="p-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 text-sm">Veilig en beveiligd</h4>
            <p className="text-blue-800 text-sm mt-1">
              Je kaartgegevens worden veilig verwerkt door Stripe en worden nooit op onze servers opgeslagen.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          Annuleren
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Verwerken...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Betaalmethode toevoegen
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export function PaymentMethodUpdate({ isOpen, onClose, currentPaymentMethod }: PaymentMethodUpdateProps) {
  const [view, setView] = useState<'list' | 'add'>('list');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load payment methods
  useEffect(() => {
    if (isOpen) {
      loadPaymentMethods();
    }
  }, [isOpen]);

  const loadPaymentMethods = async () => {
    setLoadingMethods(true);
    try {
      const response = await apiGet<PaymentMethod[]>('/api/subscription/payment-methods');
      if (response.data) {
        setPaymentMethods(response.data);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setLoadingMethods(false);
    }
  };

  // Delete payment method
  const deletePaymentMethod = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      const response = await apiDelete(`/api/subscription/payment-method/${paymentMethodId}`);

      if (!response.success) {
        throw new Error(response.error || 'Failed to delete payment method');
      }

      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Betaalmethode verwijderd",
        description: "De betaalmethode is succesvol verwijderd.",
      });
      loadPaymentMethods();
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/payment-method"] });
    },
    onError: (error: any) => {
      toast({
        title: "Fout",
        description: error.message || "Kan betaalmethode niet verwijderen.",
        variant: "destructive",
      });
    },
  });

  // Set default payment method
  const setDefaultPaymentMethod = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      const response = await apiPost('/api/subscription/payment-method/default', { paymentMethodId });

      if (!response.success) {
        throw new Error(response.error || 'Failed to set default payment method');
      }

      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Standaard betaalmethode ingesteld",
        description: "De geselecteerde kaart is nu je standaard betaalmethode.",
      });
      loadPaymentMethods();
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/payment-method"] });
    },
    onError: (error: any) => {
      toast({
        title: "Fout",
        description: error.message || "Kan standaard betaalmethode niet instellen.",
        variant: "destructive",
      });
    },
  });

  const handleSuccess = () => {
    setView('list');
    loadPaymentMethods();
    queryClient.invalidateQueries({ queryKey: ["/api/subscription/payment-method"] });
  };

  const handleClose = () => {
    setView('list');
    onClose();
  };

  const getBrandIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      default:
        return '💳';
    }
  };

  return (
    <Elements stripe={stripePromise}>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {view === 'list' ? 'Betaalmethodes Beheren' : 'Nieuwe Betaalmethode Toevoegen'}
            </DialogTitle>
            <DialogDescription>
              {view === 'list' 
                ? 'Beheer je opgeslagen betaalmethodes en stel een standaard in.'
                : 'Voeg een nieuwe credit- of debitkaart toe aan je account.'
              }
            </DialogDescription>
          </DialogHeader>

          {view === 'list' && (
            <div className="space-y-4">
              {loadingMethods ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Betaalmethodes laden...</span>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {paymentMethods.length > 0 ? (
                      paymentMethods.map((method) => (
                        <Card key={method.id} className={method.isDefault ? 'ring-2 ring-blue-500' : ''}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="text-2xl">{getBrandIcon(method.brand)}</div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                      {method.brand.toUpperCase()} ****{method.last4}
                                    </span>
                                    {method.isDefault && (
                                      <Badge className="text-xs">Standaard</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    Verloopt {method.expMonth.toString().padStart(2, '0')}/{method.expYear}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {!method.isDefault && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDefaultPaymentMethod.mutate(method.id)}
                                    disabled={setDefaultPaymentMethod.isPending}
                                  >
                                    Standaard
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deletePaymentMethod.mutate(method.id)}
                                  disabled={deletePaymentMethod.isPending || method.isDefault}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Geen betaalmethodes gevonden
                        </h3>
                        <p className="text-gray-600">
                          Voeg een betaalmethode toe om je abonnement te kunnen beheren.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={handleClose}
                      className="flex-1"
                    >
                      Sluiten
                    </Button>
                    <Button
                      onClick={() => setView('add')}
                      className="flex-1 flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Nieuwe Kaart
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {view === 'add' && (
            <PaymentMethodForm 
              onSuccess={handleSuccess} 
              onCancel={() => setView('list')} 
            />
          )}
        </DialogContent>
      </Dialog>
    </Elements>
  );
}