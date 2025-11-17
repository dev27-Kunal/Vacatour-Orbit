import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCanPostJobs } from "@/hooks/use-subscription";
import type { ReactNode } from "react";

interface SubscriptionProtectedButtonProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  onClick?: () => void;
  targetPath?: string; // Path to navigate to if subscription is active
  requiresSubscription?: boolean; // Override automatic detection
  "data-testid"?: string;
}

/**
 * Button component that checks subscription status before allowing action
 * Automatically handles BEDRIJF/BUREAU subscription requirements
 */
export function SubscriptionProtectedButton({
  children,
  className,
  variant = "default",
  size = "default",
  disabled = false,
  onClick,
  targetPath = "/jobs/new",
  requiresSubscription,
  "data-testid": testId,
}: SubscriptionProtectedButtonProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { canPost, reason, isLoading: isCheckingSubscription } = useCanPostJobs();

  const handleClick = () => {
    // If custom onClick is provided, execute it
    if (onClick) {
      onClick();
      return;
    }

    // Check if user can post jobs
    if (isCheckingSubscription) {
      toast({
        title: "Even geduld...",
        description: "Abonnementsstatus wordt gecontroleerd.",
      });
      return;
    }

    if (!canPost) {
      switch (reason) {
        case 'NOT_AUTHENTICATED':
          toast({
            title: "Inloggen vereist",
            description: "Je moet ingelogd zijn om deze actie uit te voeren.",
            variant: "destructive",
          });
          navigate("/login");
          return;

        case 'USER_TYPE_NOT_ALLOWED':
          toast({
            title: "Geen toegang",
            description: "Deze functie is niet beschikbaar voor jouw accounttype.",
            variant: "destructive",
          });
          return;

        case 'SUBSCRIPTION_REQUIRED':
          toast({
            title: "Abonnement vereist",
            description: "Voor het plaatsen van vacatures is een actief abonnement vereist.",
            variant: "destructive",
            action: (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate("/subscribe")}
              >
                <Crown className="h-4 w-4 mr-2" />
                Activeer
              </Button>
            ),
          });
          return;

        default:
          toast({
            title: "Toegang geweigerd",
            description: "Je hebt geen toestemming voor deze actie.",
            variant: "destructive",
          });
          return;
      }
    }

    // If all checks pass, navigate to target path
    navigate(targetPath);
  };

  return (
    <Button
      className={className}
      variant={variant}
      size={size}
      disabled={disabled || isCheckingSubscription}
      onClick={handleClick}
      data-testid={testId}
    >
      {isCheckingSubscription ? (
        <>
          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
          Controleren...
        </>
      ) : (
        children
      )}
    </Button>
  );
}