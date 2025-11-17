/**
 * MSA Approval Modal Tests
 *
 * Test suite for MSAApprovalModal component covering:
 * - Rendering MSA details correctly
 * - Approval workflow
 * - Rejection workflow with reason
 * - Loading states
 * - Error handling
 * - Responsive behavior
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MSAApprovalModal } from '../MSAApprovalModal';
import { MSADocument } from '@/types/msa';
import * as apiClient from '@/lib/api-client';

// Mock dependencies
vi.mock('@/lib/api-client');
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Test data
const mockMSA: MSADocument = {
  id: 'msa-123',
  tenantId: 'tenant-1',
  companyId: 'company-1',
  bureauId: 'bureau-1',
  msaNumber: 'MSA-2025-001',
  name: 'Software Development Services Agreement',
  paymentTermsDays: 30,
  noticePeriodDays: 60,
  liabilityCap: 100000,
  msaDocumentUrl: 'https://example.com/msa.pdf',
  status: 'pending_approval',
  effectiveDate: '2025-01-01T00:00:00Z',
  expirationDate: '2026-01-01T00:00:00Z',
  autoRenew: true,
  renewalPeriodMonths: 12,
  companyName: 'Tech Corp BV',
  bureauName: 'Recruitment Solutions Ltd',
  createdBy: 'user-1',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const mockMSAWithApprovals: MSADocument = {
  ...mockMSA,
  companyApprovedAt: '2025-01-02T10:00:00Z',
  companyApprovedBy: 'user-2',
  bureauApprovedAt: '2025-01-02T11:00:00Z',
  bureauApprovedBy: 'user-3',
};

describe('MSAApprovalModal', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderModal = (props: Partial<React.ComponentProps<typeof MSAApprovalModal>> = {}) => {
    const defaultProps = {
      msa: mockMSA,
      isOpen: true,
      onClose: vi.fn(),
      userType: 'BEDRIJF' as const,
      ...props,
    };

    return {
      ...render(
        <QueryClientProvider client={queryClient}>
          <MSAApprovalModal {...defaultProps} />
        </QueryClientProvider>
      ),
      props: defaultProps,
    };
  };

  describe('Rendering', () => {
    it('renders MSA details correctly', () => {
      renderModal();

      expect(screen.getByText('Master Service Agreement')).toBeInTheDocument();
      expect(screen.getByText('MSA-2025-001')).toBeInTheDocument();
      expect(screen.getByText('Software Development Services Agreement')).toBeInTheDocument();
      expect(screen.getByText('Tech Corp BV')).toBeInTheDocument();
      expect(screen.getByText('Recruitment Solutions Ltd')).toBeInTheDocument();
    });

    it('displays financial terms', () => {
      renderModal();

      expect(screen.getByText('30 days')).toBeInTheDocument(); // Payment terms
      expect(screen.getByText('60 days')).toBeInTheDocument(); // Notice period
      expect(screen.getByText('€100,000.00')).toBeInTheDocument(); // Liability cap
    });

    it('displays agreement period dates', () => {
      renderModal();

      expect(screen.getByText('01 Jan 2025')).toBeInTheDocument(); // Effective date
      expect(screen.getByText('01 Jan 2026')).toBeInTheDocument(); // Expiration date
      expect(screen.getByText('Yes (12 months)')).toBeInTheDocument(); // Auto-renewal
    });

    it('shows pending approval badges when not approved', () => {
      renderModal();

      const badges = screen.getAllByText('Pending');
      expect(badges).toHaveLength(2); // Company and Bureau
    });

    it('shows approved badges when approved', () => {
      renderModal({ msa: mockMSAWithApprovals });

      const badges = screen.getAllByText('Approved');
      expect(badges).toHaveLength(2); // Company and Bureau
    });

    it('does not render when msa is null', () => {
      const { container } = renderModal({ msa: null });
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('Approval Workflow', () => {
    it('shows approve button for company user when not approved', () => {
      renderModal({ userType: 'BEDRIJF' });

      expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
    });

    it('shows approve button for bureau user when not approved', () => {
      renderModal({ userType: 'BUREAU' });

      expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
    });

    it('does not show approve button when already approved by company', () => {
      renderModal({
        userType: 'BEDRIJF',
        msa: { ...mockMSA, companyApprovedAt: '2025-01-02T10:00:00Z' },
      });

      expect(screen.queryByRole('button', { name: /approve/i })).not.toBeInTheDocument();
    });

    it('shows confirmation when approve is clicked', async () => {
      const user = userEvent.setup();
      renderModal();

      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      expect(
        screen.getByText('Are you sure you want to approve this MSA?')
      ).toBeInTheDocument();
    });

    it('calls approve API when confirmed', async () => {
      const user = userEvent.setup();
      const mockApiPost = vi.spyOn(apiClient, 'apiPost').mockResolvedValue({
        success: true,
        data: mockMSAWithApprovals,
      });

      const { props } = renderModal();

      // Click approve
      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      // Confirm approval
      const confirmButton = screen.getByRole('button', { name: /confirm approval/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalledWith('/api/msa/approve/msa-123', {});
        expect(props.onClose).toHaveBeenCalled();
      });
    });

    it('allows canceling approval confirmation', async () => {
      const user = userEvent.setup();
      renderModal();

      // Click approve
      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      // Cancel confirmation
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Should return to default state
      expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
      expect(
        screen.queryByText('Are you sure you want to approve this MSA?')
      ).not.toBeInTheDocument();
    });
  });

  describe('Rejection Workflow', () => {
    it('shows rejection form when reject is clicked', async () => {
      const user = userEvent.setup();
      renderModal();

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      expect(screen.getByText('Reject MSA')).toBeInTheDocument();
      expect(screen.getByLabelText(/reason for rejection/i)).toBeInTheDocument();
    });

    it('requires rejection reason', async () => {
      const user = userEvent.setup();
      renderModal();

      // Click reject
      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      // Try to confirm without reason
      const confirmButton = screen.getByRole('button', { name: /confirm rejection/i });
      expect(confirmButton).toBeDisabled();
    });

    it('calls reject API with reason when confirmed', async () => {
      const user = userEvent.setup();
      const mockApiPost = vi.spyOn(apiClient, 'apiPost').mockResolvedValue({
        success: true,
        data: { ...mockMSA, status: 'terminated' },
      });

      const { props } = renderModal();

      // Click reject
      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      // Enter reason
      const reasonTextarea = screen.getByLabelText(/reason for rejection/i);
      await user.type(reasonTextarea, 'Terms are not acceptable');

      // Confirm rejection
      const confirmButton = screen.getByRole('button', { name: /confirm rejection/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalledWith('/api/msa/reject/msa-123', {
          reason: 'Terms are not acceptable',
        });
        expect(props.onClose).toHaveBeenCalled();
      });
    });

    it('allows canceling rejection', async () => {
      const user = userEvent.setup();
      renderModal();

      // Click reject
      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      // Cancel rejection
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Should return to default state
      expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
      expect(screen.queryByText('Reject MSA')).not.toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('shows loading state during approval', async () => {
      const user = userEvent.setup();
      vi.spyOn(apiClient, 'apiPost').mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      renderModal();

      // Click approve
      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      // Confirm approval
      const confirmButton = screen.getByRole('button', { name: /confirm approval/i });
      await user.click(confirmButton);

      // Check for loading state
      await waitFor(() => {
        expect(screen.getByText('Approving...')).toBeInTheDocument();
      });
    });

    it('shows loading state during rejection', async () => {
      const user = userEvent.setup();
      vi.spyOn(apiClient, 'apiPost').mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      renderModal();

      // Click reject
      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      // Enter reason
      const reasonTextarea = screen.getByLabelText(/reason for rejection/i);
      await user.type(reasonTextarea, 'Terms not acceptable');

      // Confirm rejection
      const confirmButton = screen.getByRole('button', { name: /confirm rejection/i });
      await user.click(confirmButton);

      // Check for loading state
      await waitFor(() => {
        expect(screen.getByText('Rejecting...')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles approval API errors', async () => {
      const user = userEvent.setup();
      const mockApiPost = vi
        .spyOn(apiClient, 'apiPost')
        .mockRejectedValue(new Error('Network error'));

      const { props } = renderModal();

      // Click approve and confirm
      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      const confirmButton = screen.getByRole('button', { name: /confirm approval/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalled();
        // Modal should stay open on error
        expect(props.onClose).not.toHaveBeenCalled();
      });
    });

    it('handles rejection API errors', async () => {
      const user = userEvent.setup();
      const mockApiPost = vi
        .spyOn(apiClient, 'apiPost')
        .mockRejectedValue(new Error('Network error'));

      const { props } = renderModal();

      // Click reject
      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      // Enter reason and confirm
      const reasonTextarea = screen.getByLabelText(/reason for rejection/i);
      await user.type(reasonTextarea, 'Terms not acceptable');

      const confirmButton = screen.getByRole('button', { name: /confirm rejection/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalled();
        // Modal should stay open on error
        expect(props.onClose).not.toHaveBeenCalled();
      });
    });
  });

  describe('Close Behavior', () => {
    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const { props } = renderModal();

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(props.onClose).toHaveBeenCalled();
    });

    it('resets form state when closed', async () => {
      const user = userEvent.setup();
      const { props } = renderModal();

      // Start rejection
      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      const reasonTextarea = screen.getByLabelText(/reason for rejection/i);
      await user.type(reasonTextarea, 'Some reason');

      // Close modal
      const closeButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(closeButton);

      expect(props.onClose).toHaveBeenCalled();
    });

    it('calls onSuccess callback after successful approval', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      vi.spyOn(apiClient, 'apiPost').mockResolvedValue({
        success: true,
        data: mockMSAWithApprovals,
      });

      renderModal({ onSuccess });

      // Approve MSA
      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      const confirmButton = screen.getByRole('button', { name: /confirm approval/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });
  });
});
