/**
 * Signature Interface Component
 * Digital signature interface for signing contracts
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileSignature,
  CheckCircle,
  AlertCircle,
  Shield,
  Pen,
  MousePointer,
  Type,
  Upload,
  Download,
  RefreshCw,
  User,
  Calendar,
  Clock,
  Fingerprint,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
import { formatters as i18nFormatters } from '@/lib/i18n-formatters';
import { apiPost, ApiError } from '@/lib/api-client';

interface SignatureInterfaceProps {
  contractId: string;
  contractNumber: string;
  contractHtml?: string;
  onSignComplete?: () => void;
}

type SignatureMethod = 'draw' | 'type' | 'upload';

export function SignatureInterface({
  contractId,
  contractNumber,
  contractHtml,
  onSignComplete,
}: SignatureInterfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [signatureMethod, setSignatureMethod] = useState<SignatureMethod>('type');
  const [typedSignature, setTypedSignature] = useState('');
  const [uploadedSignature, setUploadedSignature] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (signatureMethod === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
      }
    }
  }, [signatureMethod]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        setIsDrawing(true);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) {return;}
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const rect = canvas.getBoundingClientRect();
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
      setHasDrawn(true);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedSignature(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const prepareSignature = () => {
    let data: string | null = null;

    if (signatureMethod === 'draw' && canvasRef.current && hasDrawn) {
      data = canvasRef.current.toDataURL();
    } else if (signatureMethod === 'type' && typedSignature) {
      data = typedSignature;
    } else if (signatureMethod === 'upload' && uploadedSignature) {
      data = uploadedSignature;
    }

    if (data) {
      setSignatureData(data);
      setConfirmDialogOpen(true);
    } else {
      toast({
        title: t('common.error', { defaultValue: 'Error' }),
        description: t('contracts.sign.addSignatureFirst', { defaultValue: 'Please add your signature first' }),
        variant: 'destructive',
      });
    }
  };

  const handleSign = async () => {
    try {
      setSigning(true);

      await apiPost(`/api/v2/contracts/${contractId}/sign`, {
        signatureType:
          signatureMethod === 'draw'
            ? 'ELECTRONIC'
            : signatureMethod === 'type'
            ? 'CLICK_TO_SIGN'
            : 'DIGITAL',
        signatureData: {
          method: signatureMethod,
          data: signatureData,
          timestamp: new Date().toISOString(),
          agreed: agreed,
        },
      });

      toast({
        title: t('common.success', { defaultValue: 'Success!' }),
        description: t('contracts.sign.completed', { defaultValue: 'Contract signed successfully' }),
      });
      setConfirmDialogOpen(false);
      if (onSignComplete) {
        onSignComplete();
      }
    } catch (error) {
      console.error('Error signing contract:', error);
      const errorMessage = error instanceof ApiError ? error.message : t('contracts.sign.error', { defaultValue: 'Could not sign contract' });
      toast({
        title: t('common.error', { defaultValue: 'Error' }),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSigning(false);
    }
  };

  const canSign = () => {
    if (!agreed) {return false;}
    if (signatureMethod === 'draw') {return hasDrawn;}
    if (signatureMethod === 'type') {return typedSignature.length > 0;}
    if (signatureMethod === 'upload') {return !!uploadedSignature;}
    return false;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Contract Document */}
      <Card>
        <CardHeader>
          <CardTitle>{t('contracts.viewer.documentTitle', { defaultValue: 'Contract Document' })}</CardTitle>
          <CardDescription>
            {t('contracts.sign.readBefore', { defaultValue: 'Please read the contract carefully before signing' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full rounded-md border p-4">
            {contractHtml ? (
              <div
                dangerouslySetInnerHTML={{ __html: contractHtml }}
                className="prose prose-sm max-w-none"
              />
            ) : (
              <div className="text-center text-muted-foreground py-8">
                {t('contracts.sign.loadingContent', { defaultValue: 'Loading contract content...' })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Signature Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            {t('contracts.sign.digitalSignature', { defaultValue: 'Digital Signature' })}
          </CardTitle>
          <CardDescription>
            {t('contracts.sign.chooseMethod', { defaultValue: 'Choose how you want to sign this contract' })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Signature Method Selection */}
          <div>
            <Label>{t('contracts.sign.methodLabel', { defaultValue: 'Signature method' })}</Label>
            <RadioGroup
              value={signatureMethod}
              onValueChange={(value) => setSignatureMethod(value as SignatureMethod)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="type" id="type" />
                <Label htmlFor="type" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{t('contracts.sign.typeName', { defaultValue: 'Type your name' })}</div>
                      <div className="text-sm text-muted-foreground">{t('contracts.sign.simpleEsign', { defaultValue: 'Simple electronic signature' })}</div>
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="draw" id="draw" />
                <Label htmlFor="draw" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Pen className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{t('contracts.sign.drawSignature', { defaultValue: 'Draw signature' })}</div>
                      <div className="text-sm text-muted-foreground">{t('contracts.sign.useMouse', { defaultValue: 'Use mouse or touchscreen' })}</div>
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="upload" id="upload" />
                <Label htmlFor="upload" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{t('contracts.sign.uploadSignature', { defaultValue: 'Upload signature' })}</div>
                      <div className="text-sm text-muted-foreground">{t('contracts.sign.uploadImage', { defaultValue: 'Upload an image of your signature' })}</div>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Signature Input Based on Method */}
          <div className="min-h-[200px]">
            {signatureMethod === 'type' && (
              <div>
                <Label>{t('contracts.sign.typeFullName', { defaultValue: 'Type your full name' })}</Label>
                <Input
                  type="text"
                  placeholder={t('contracts.sign.yourFullName', { defaultValue: 'Your full name' })}
                  value={typedSignature}
                  onChange={(e) => setTypedSignature(e.target.value)}
                  className="mt-2 text-lg font-signature"
                  style={{ fontFamily: 'cursive' }}
                />
                {typedSignature && (
                  <div className="mt-4 p-4 border-2 border-dashed rounded-lg bg-gray-50">
                    <div className="text-sm text-muted-foreground mb-2">
                      {t('contracts.sign.yourSignature', { defaultValue: 'Your signature:' })}
                    </div>
                    <div
                      className="text-3xl"
                      style={{ fontFamily: 'cursive' }}
                    >
                      {typedSignature}
                    </div>
                  </div>
                )}
              </div>
            )}

            {signatureMethod === 'draw' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>{t('contracts.sign.drawSignature', { defaultValue: 'Draw signature' })}</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCanvas}
                    disabled={!hasDrawn}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t('contracts.sign.clear', { defaultValue: 'Clear' })}
                  </Button>
                </div>
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  className="w-full border-2 rounded-lg cursor-crosshair bg-white"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
                <div className="text-xs text-muted-foreground mt-2">{t('contracts.sign.useMouse', { defaultValue: 'Use mouse or touchscreen to draw' })}</div>
              </div>
            )}

            {signatureMethod === 'upload' && (
              <div>
                <Label>{t('contracts.sign.uploadSignatureImage', { defaultValue: 'Upload signature image' })}</Label>
                <div className="mt-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </div>
                {uploadedSignature && (
                  <div className="mt-4 p-4 border-2 border-dashed rounded-lg bg-gray-50">
                    <img
                      src={uploadedSignature}
                      alt="Uploaded signature"
                      className="max-h-32"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Agreement Checkbox */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>{t('contracts.sign.legallyBindingTitle', { defaultValue: 'Legally binding agreement' })}</AlertTitle>
            <AlertDescription>
              {t('contracts.sign.legallyBindingDesc', { defaultValue: 'By signing, you agree to the terms of this contract. This electronic signature is legally binding under the eIDAS regulation.' })}
            </AlertDescription>
          </Alert>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="agreement"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(!!checked)}
            />
            <Label htmlFor="agreement" className="text-sm leading-relaxed">{t('contracts.sign.agreement', { defaultValue: 'I have read the contract and agree to all terms. I understand this electronic signature is legally binding.' })}</Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            size="lg"
            onClick={prepareSignature}
            disabled={!canSign()}
          >
            <FileSignature className="h-5 w-5 mr-2" />
            {t('contracts.sign.submit', { defaultValue: 'Sign Contract' })}
          </Button>
        </CardFooter>
      </Card>

      {/* Security Information */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>{t('contracts.sign.ssl', { defaultValue: '256-bit SSL encryption' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Fingerprint className="h-4 w-4" />
              <span>{t('contracts.sign.ipTracking', { defaultValue: 'IP tracking' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{t('contracts.sign.timestampVerification', { defaultValue: 'Timestamp verification' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{t('contracts.sign.identityVerified', { defaultValue: 'Identity verified' })}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('contracts.sign.confirmTitle', { defaultValue: 'Confirm Signature' })}</DialogTitle>
            <DialogDescription>
              {t('contracts.sign.confirmDesc', { defaultValue: 'You are about to sign contract {{number}}. This is a legally binding action.', number: contractNumber })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{t('contracts.sign.confirmWarning', { defaultValue: 'Once signed, this cannot be undone. Ensure you have read and understood all terms.' })}</AlertDescription>
            </Alert>

            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{t('contracts.sign.signer', { defaultValue: 'Signer:' })} {typedSignature || t('contracts.sign.you', { defaultValue: 'You' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{t('contracts.sign.date', { defaultValue: 'Date:' })} {i18nFormatters.for(i18n.language).formatDateTime(new Date(), 'dd MMMM yyyy, HH:mm')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileSignature className="h-4 w-4" />
                  <span>
                    Methode:{' '}
                    {signatureMethod === 'draw'
                      ? t('contracts.sign.method.draw', { defaultValue: 'Drawn signature' })
                      : signatureMethod === 'type'
                      ? t('contracts.sign.method.type', { defaultValue: 'Typed signature' })
                      : t('contracts.sign.method.upload', { defaultValue: 'Uploaded signature' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={signing}
            >
              {t('common.cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button onClick={handleSign} disabled={signing}>
              {signing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {t('contracts.sign.signing', { defaultValue: 'Signing...' })}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t('contracts.sign.finalize', { defaultValue: 'Finalize Signature' })}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
