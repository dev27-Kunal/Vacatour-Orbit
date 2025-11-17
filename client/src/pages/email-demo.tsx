import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, AlertCircle, CheckCircle, Settings } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageWrapper } from "@/components/page-wrapper";
import { apiPost } from "@/lib/api-client";
import { useTranslation } from "react-i18next";

export default function EmailDemo() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [sendGridKey, setSendGridKey] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [testMessage, setTestMessage] = useState(t('emailDemo.defaults.testMessage'));
  const [isLoading, setIsLoading] = useState(false);
  const [keyConfigured, setKeyConfigured] = useState(false);

  const handleConfigureKey = async () => {
    if (!sendGridKey.trim()) {
      toast({ title: t('common.error'), description: t('emailDemo.errors.invalidKey'), variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiPost("/api/email/configure", { apiKey: sendGridKey });

      if (response.success) {
        setKeyConfigured(true);
        toast({ title: t('success.saved'), description: t('emailDemo.messages.keyConfigured') });
      } else {
        throw new Error(response.error || "Failed to configure API key");
      }
    } catch (error) {
      toast({ title: t('common.error'), description: t('emailDemo.errors.configureFailed'), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail.trim()) {
      toast({ title: t('common.error'), description: t('emailDemo.errors.invalidEmail'), variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiPost("/api/email/test", {
        to: testEmail,
        message: testMessage
      });

      if (response.success) {
        toast({ title: t('emailDemo.messages.testSent'), description: t('emailDemo.messages.testSentTo', { email: testEmail }) });
      } else {
        throw new Error(response.error || "Failed to send email");
      }
    } catch (error) {
      toast({ title: t('common.error'), description: t('emailDemo.errors.sendFailed'), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Mail className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">{t('emailDemo.title')}</h1>
          <p className="text-gray-600">{t('emailDemo.subtitle')}</p>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>{t('emailDemo.setup.title')}</strong> {t('emailDemo.setup.description')} 
          Ga naar <a href="https://sendgrid.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">SendGrid</a>, 
          {t('emailDemo.setup.cta')}
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {/* API Key Configuration */}
        <Card className="feature-card bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t('emailDemo.configure.title')}
            </CardTitle>
            <CardDescription>
              {t('emailDemo.configure.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sendgrid-key">{t('emailDemo.labels.sendgridApiKey')}</Label>
              <Input
                id="sendgrid-key"
                type="password"
                placeholder="SG.xxxxxxxxxxxxxxxxxxxxx"
                value={sendGridKey}
                onChange={(e) => setSendGridKey(e.target.value)}
                data-testid="input-sendgrid-key"
              />
            </div>
            
            <Button 
              onClick={handleConfigureKey}
              disabled={isLoading || !sendGridKey.trim()}
              className="w-full"
              data-testid="button-configure-key"
            >
              {keyConfigured ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {t('emailDemo.buttons.configured')}
                </>
              ) : (
                <>
                  <Settings className="mr-2 h-4 w-4" />
                  {t('emailDemo.buttons.configureKey')}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Test Email */}
        <Card className="feature-card bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              {t('emailDemo.test.title')}
            </CardTitle>
            <CardDescription>
              {t('emailDemo.test.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-email">{t('emailDemo.labels.testEmail')}</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="jouw-email@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                data-testid="input-test-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-message">{t('emailDemo.labels.message')}</Label>
              <Textarea
                id="test-message"
                placeholder="Test bericht..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                rows={3}
                data-testid="textarea-test-message"
              />
            </div>
            
            <Button 
              onClick={handleSendTestEmail}
              disabled={isLoading || !testEmail.trim()}
              className="w-full"
              data-testid="button-send-test"
            >
              <Send className="mr-2 h-4 w-4" />
              {isLoading ? t('common.loading') : t('emailDemo.buttons.sendTest')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* How Email Works */}
      <Card className="feature-card bg-card">
        <CardHeader>
          <CardTitle>{t('emailDemo.howItWorks.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <Mail className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold">{t('emailDemo.howItWorks.items.newMessages.title')}</h3>
              <p className="text-sm text-gray-600">{t('emailDemo.howItWorks.items.newMessages.desc')}</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold">{t('emailDemo.howItWorks.items.newApplications.title')}</h3>
              <p className="text-sm text-gray-600">{t('emailDemo.howItWorks.items.newApplications.desc')}</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <h3 className="font-semibold">{t('emailDemo.howItWorks.items.statusUpdates.title')}</h3>
              <p className="text-sm text-gray-600">{t('emailDemo.howItWorks.items.statusUpdates.desc')}</p>
            </div>
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>{t('emailDemo.privacy.title')}</strong> {t('emailDemo.privacy.description')}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
