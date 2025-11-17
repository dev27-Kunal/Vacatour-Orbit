import { useState, useEffect } from "react";
import { useApp } from "@/providers/AppProvider";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ObjectUploader } from "@/components/ObjectUploader";
import { CheckCircle2, XCircle, Clock, AlertCircle, FileText, Upload } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PageWrapper } from "@/components/page-wrapper";

interface VerificationStatus {
  id?: string;
  status: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  kvkNumber?: string;
  companyName?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function CompanyVerification() {
  const { user } = useApp();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  
  const [kvkNumber, setKvkNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);

  // Redirect if not a company user
  useEffect(() => {
    if (!user) {
      setLocation("/login");
    } else if (user.userType !== 'BEDRIJF') {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  // Fetch verification status
  const { data: verificationStatus, isLoading } = useQuery<VerificationStatus>({
    queryKey: ['/api/verification/status'],
    enabled: !!user && user.userType === 'BEDRIJF',
  });

  // Submit verification mutation
  const submitVerification = useMutation({
    mutationFn: async (data: { kvkNumber: string; companyName: string }) => {
      return apiRequest('/api/verification/submit', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: t('verification.verificationSubmitted'),
        description: t('verification.verificationSubmittedDescription'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/verification/status'] });
    },
    onError: (error: any) => {
      toast({
        title: t('verification.error'),
        description: error.message || t('verification.verificationError'),
        variant: "destructive",
      });
    },
  });

  // Add document to verification
  const addDocument = useMutation({
    mutationFn: async ({ verificationId, attachmentId }: { verificationId: string; attachmentId: string }) => {
      return apiRequest(`/api/verification/${verificationId}/documents`, {
        method: 'POST',
        body: JSON.stringify({ attachmentId }),
      });
    },
    onSuccess: () => {
      toast({
        title: t('verification.documentAdded'),
        description: t('verification.documentAddedDescription'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('verification.error'),
        description: error.message || t('verification.documentError'),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kvkNumber || !companyName) {
      toast({
        title: t('verification.missingInfo'),
        description: t('verification.fillRequiredFields'),
        variant: "destructive",
      });
      return;
    }
    submitVerification.mutate({ kvkNumber, companyName });
  };

  const handleGetUploadParameters = async () => {
    const response = await apiRequest('/api/attachments/upload-url', {
      method: 'POST',
    });
    return {
      method: 'PUT' as const,
      url: response.uploadURL,
    };
  };

  const handleUploadComplete = async (result: any) => {
    for (const file of result.successful) {
      // Create attachment record
      const attachment = await apiRequest('/api/attachments', {
        method: 'POST',
        body: JSON.stringify({
          fileUrl: file.uploadURL,
          filename: file.name,
          filesize: file.size,
          mimetype: file.type,
        }),
      });

      // If verification exists, add document to it
      if (verificationStatus?.id) {
        await addDocument.mutateAsync({
          verificationId: verificationStatus.id,
          attachmentId: attachment.id,
        });
      }

      setUploadedDocuments(prev => [...prev, file.name]);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800">{t('verification.approved')}</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">{t('verification.rejected')}</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">{t('verification.inReview')}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{t('verification.notSubmitted')}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <PageWrapper>
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">{t('verification.title')}</h1>

      {/* Status Card */}
      <Card className="mb-6 feature-card bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t('verification.status')}
            {getStatusIcon(verificationStatus?.status || 'NOT_SUBMITTED')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            {getStatusBadge(verificationStatus?.status || 'NOT_SUBMITTED')}
            {verificationStatus?.createdAt && (
              <span className="text-sm text-gray-500">
                {t('verification.submittedOn')} {new Date(verificationStatus.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>
          
          {verificationStatus?.notes && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{t('verification.noteFromTeam')}</strong> {verificationStatus.notes}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Verification Form - Only show if not submitted or rejected */}
      {(!verificationStatus?.status || verificationStatus.status === 'NOT_SUBMITTED' || verificationStatus.status === 'REJECTED') && (
        <Card className="feature-card bg-card">
          <CardHeader>
            <CardTitle>{t('verification.requestVerification')}</CardTitle>
            <CardDescription>
              {t('verification.verificationDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="kvkNumber">{t('verification.kvkNumber')}</Label>
                <Input
                  id="kvkNumber"
                  type="text"
                  value={kvkNumber}
                  onChange={(e) => setKvkNumber(e.target.value)}
                  placeholder={t('verification.kvkNumberPlaceholder')}
                  maxLength={8}
                  required
                  data-testid="input-kvk-number"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {t('verification.kvkNumberHint')}
                </p>
              </div>

              <div>
                <Label htmlFor="companyName">{t('verification.companyNameKvk')}</Label>
                <Input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={t('verification.companyNamePlaceholder')}
                  required
                  data-testid="input-company-name"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {t('verification.companyNameHint')}
                </p>
              </div>

              <div>
                <Label>{t('verification.supportingDocuments')}</Label>
                <div className="mt-2">
                  <ObjectUploader
                    maxNumberOfFiles={5}
                    maxFileSize={10485760}
                    allowedFileTypes={['.pdf', '.jpg', '.jpeg', '.png']}
                    onGetUploadParameters={handleGetUploadParameters}
                    onComplete={handleUploadComplete}
                    buttonClassName="w-full"
                  >
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      <span>{t('verification.uploadDocuments')}</span>
                    </div>
                  </ObjectUploader>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {t('verification.uploadDocumentsHint')}
                </p>
                
                {uploadedDocuments.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {uploadedDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span>{doc}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={submitVerification.isPending}
                className="w-full"
                data-testid="button-submit-verification"
              >
                {submitVerification.isPending ? t('verification.submitting') : t('verification.submitVerification')}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Pending Verification Message */}
      {verificationStatus?.status === 'PENDING' && (
        <Card className="feature-card bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              {t('verification.verificationInProgress')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              {t('verification.verificationInProgressDescription')}
            </p>
            
            {verificationStatus.kvkNumber && (
              <div className="mt-4 space-y-2">
                <p><strong>{t('verification.kvkNumber')}:</strong> {verificationStatus.kvkNumber}</p>
                <p><strong>{t('verification.companyNameKvk')}:</strong> {verificationStatus.companyName}</p>
              </div>
            )}

            <div className="mt-6">
              <Label>{t('verification.addExtraDocuments')}</Label>
              <div className="mt-2">
                <ObjectUploader
                  maxNumberOfFiles={5}
                  maxFileSize={10485760}
                  allowedFileTypes={['.pdf', '.jpg', '.jpeg', '.png']}
                  onGetUploadParameters={handleGetUploadParameters}
                  onComplete={handleUploadComplete}
                  buttonClassName="w-full"
                >
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    <span>{t('verification.uploadExtraDocuments')}</span>
                  </div>
                </ObjectUploader>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approved Verification Message */}
      {verificationStatus?.status === 'APPROVED' && (
        <Card className="feature-card bg-card border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle2 className="h-5 w-5" />
              {t('verification.verificationApproved')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">
              {t('verification.congratulations')}
            </p>
            <ul className="mt-4 space-y-2 text-green-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                {t('verification.verificationBadge')}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                {t('verification.higherVisibility')}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                {t('verification.moreTrust')}
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
    </PageWrapper>
  );
}