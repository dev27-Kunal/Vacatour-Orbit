import { TFunction } from 'i18next';

export function getUserTypeLabel(userType: string, t: TFunction): string {
  switch (userType) {
    case 'BEDRIJF':
      return t('userTypes.BEDRIJF');
    case 'ZZP':
      return t('userTypes.ZZP');
    case 'BUREAU':
      return t('userTypes.BUREAU');
    default:
      return userType;
  }
}

export function getEmploymentTypeLabel(employmentType: string, t: TFunction): string {
  switch (employmentType) {
    case 'VAST':
      return t('employmentTypes.VAST');
    case 'INTERIM':
      return t('employmentTypes.INTERIM');
    case 'UITZENDEN':
      return t('employmentTypes.UITZENDEN');
    default:
      return employmentType;
  }
}

export function getJobStatusLabel(status: string, t: TFunction): string {
  switch (status) {
    case 'OPEN':
      return t('jobStatus.OPEN');
    case 'CLOSED':
      return t('jobStatus.CLOSED');
    case 'DRAFT':
      return t('jobStatus.DRAFT');
    default:
      return status;
  }
}

export function getApplicationStatusLabel(status: string, t: TFunction): string {
  switch (status) {
    case 'PENDING':
      return t('applicationStatus.PENDING');
    case 'ACCEPTED':
      return t('applicationStatus.ACCEPTED');
    case 'REJECTED':
      return t('applicationStatus.REJECTED');
    case 'INTERVIEW':
      return t('applicationStatus.INTERVIEW');
    case 'WITHDRAWN':
      return t('applicationStatus.WITHDRAWN');
    default:
      return status;
  }
}