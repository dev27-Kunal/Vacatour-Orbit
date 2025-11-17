/**
 * New Contract Page
 * Create a new contract using the wizard
 */

import React, { useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { PageWrapper } from '@/components/page-wrapper';
import { ContractWizard } from '@/components/contracts/ContractWizard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

interface NewContractPageProps {
  applicationId?: string;
  jobId?: string;
  candidateId?: string;
  bureauId?: string;
}

export default function NewContractPage({
  applicationId,
  jobId,
  candidateId,
  bureauId,
}: NewContractPageProps) {
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
        <title>{`${t('contracts.newTitle')} | TalentFlow`}</title>
        <meta name="description" content={t('contracts.overview.newContractDescription')} />
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

        {/* Contract Wizard */}
        <ContractWizard
          applicationId={applicationId}
          jobId={jobId}
          candidateId={candidateId}
          bureauId={bureauId}
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

  // Only companies and admins can create contracts
  const userType = session.user?.userType;
  if (!['BEDRIJF', 'ADMIN'].includes(userType)) {
    return {
      redirect: {
        destination: '/contracts',
        permanent: false,
      },
    };
  }

  // Get optional query parameters for pre-filling
  const { applicationId, jobId, candidateId, bureauId } = context.query;

  return {
    props: {
      session,
      applicationId: applicationId || null,
      jobId: jobId || null,
      candidateId: candidateId || null,
      bureauId: bureauId || null,
    },
  };
};
