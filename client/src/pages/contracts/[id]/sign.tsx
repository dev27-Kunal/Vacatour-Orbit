/**
 * Contract Signature Page
 * Sign a contract digitally
 */

import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { PageWrapper } from '@/components/page-wrapper';
import { SignatureInterface } from '@/components/contracts/SignatureInterface';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { apiGet } from '@/lib/api-client';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

interface ContractSignPageProps {
  contractId: string;
}

interface ContractData {
  id: string;
  contract_number: string;
  contract_html?: string;
  status: string;
}

export default function ContractSignPage({ contractId }: ContractSignPageProps) {
  const [, setLocation] = useLocation();
  const { t, i18n } = useTranslation();
  const [contract, setContract] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [signed, setSigned] = useState(false);

  // Align client language with cookie if present (when coming from SPA toggle)
  useEffect(() => {
    try {
      const match =
        typeof document !== 'undefined' && document.cookie.match(/(?:^|;\s*)i18next=([^;]+)/);
      const cookieLang = match ? decodeURIComponent(match[1]) : null;
      if (cookieLang && cookieLang !== i18n.language) {
        i18n.changeLanguage(cookieLang);
      }
    } catch {}
  }, [i18n]);

  useEffect(() => {
    fetchContract();
  }, [contractId]);

  const fetchContract = async () => {
    try {
      setLoading(true);
      const response = await apiGet<ContractData>(`/api/v2/contracts/${contractId}`);

      if (response.success && response.data) {
        setContract(response.data);
        // Check if already signed or not in signable status
        if (!['PENDING_SIGNATURE', 'PARTIALLY_SIGNED'].includes(response.data.status)) {
          setSigned(true);
        }
      }
    } catch (error) {
      console.error('Error fetching contract:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignComplete = () => {
    setSigned(true);
    setTimeout(() => {
      setLocation(`/contracts/${contractId}`);
    }, 3000);
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageWrapper>
    );
  }

  if (signed) {
    return (
      <PageWrapper>
        <Head>
          <title>{`${t('contracts.sign.successTitle')} | TalentFlow`}</title>
        </Head>
        <div className="container mx-auto py-6">
          <div className="max-w-2xl mx-auto">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertTitle className="text-green-800">
                {t('contracts.sign.successTitle')}
              </AlertTitle>
              <AlertDescription className="text-green-700">
                {contract?.status === 'FULLY_SIGNED' ? (
                  <>
                    {t('contracts.sign.successFully')}
                  </>
                ) : contract?.status === 'ACTIVE' ? (
                  <>{t('contracts.sign.alreadyActive')}</>
                ) : (
                  <>
                    {t('contracts.sign.signatureAdded')}
                  </>
                )}
              </AlertDescription>
            </Alert>
            <div className="mt-6 text-center">
              <Button onClick={() => setLocation(`/contracts/${contractId}`)}>
                {t('contracts.sign.goToContract')}
              </Button>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!contract) {
    return (
      <PageWrapper>
        <div className="container mx-auto py-6">
          <Alert variant="destructive">
            <AlertTitle>{t('contracts.sign.notFoundTitle')}</AlertTitle>
            <AlertDescription>
              {t('contracts.sign.notFoundDescription')}
            </AlertDescription>
          </Alert>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Head>
        <title>{`${t('contracts.sign.title')} | TalentFlow`}</title>
        <meta name="description" content={t('contracts.sign.metaDescription')} />
      </Head>

      <div className="container mx-auto py-6 space-y-6">
        {/* Back Button */}
        <div>
          <Button
            variant="ghost"
            onClick={() => setLocation(`/contracts/${contractId}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('contracts.sign.backToContract')}
          </Button>
        </div>

        {/* Signature Interface */}
        <SignatureInterface
          contractId={contractId}
          contractNumber={contract.contract_number}
          contractHtml={contract.contract_html}
          onSignComplete={handleSignComplete}
        />
      </div>
    </PageWrapper>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  const contractId = context.params?.id as string;

  if (!contractId) {
    return {
      redirect: {
        destination: '/contracts',
        permanent: false,
      },
    };
  }

  // All authenticated users can sign contracts they're party to
  // The API will handle the actual permission check

  return {
    props: {
      session,
      contractId,
    },
  };
};
