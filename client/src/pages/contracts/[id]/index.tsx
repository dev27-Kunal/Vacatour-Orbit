/**
 * Contract Detail Page
 * View and manage a specific contract
 */

import React, { useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { PageWrapper } from '@/components/page-wrapper';
import { ContractViewer } from '@/components/contracts/ContractViewer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

interface ContractDetailPageProps {
  contractId: string;
}

export default function ContractDetailPage({ contractId }: ContractDetailPageProps) {
  const [, setLocation] = useLocation();
  const { t, i18n } = useTranslation();

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

  return (
    <PageWrapper>
      <Head>
        <title>{`${t('contracts.detail.title')} | TalentFlow`}</title>
        <meta name="description" content={t('contracts.detail.metaDescription')} />
      </Head>

      <div className="container mx-auto py-6 space-y-6">
        {/* Back Button */}
        <div>
          <Button
            variant="ghost"
            onClick={() => setLocation('/contracts')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('contracts.newPlaceholder.goToOverview')}
          </Button>
        </div>

        {/* Contract Viewer */}
        <ContractViewer contractId={contractId} />
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

  // TODO: Check if user has access to this contract
  // For now, allow all authenticated users who can view contracts
  const userType = session.user?.userType;
  if (!['BEDRIJF', 'BUREAU', 'TALENT', 'ADMIN'].includes(userType)) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
      contractId,
    },
  };
};
