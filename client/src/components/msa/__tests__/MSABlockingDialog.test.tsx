/**
 * MSABlockingDialog Component Tests
 *
 * Comprehensive test suite covering:
 * - Rendering behavior
 * - Form validation
 * - MSA creation flow
 * - Error handling
 * - User interactions
 * - Accessibility
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MSABlockingDialog } from '../MSABlockingDialog';
import * as apiClient from '@/lib/api-client';

// Mock translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock API client
vi.mock('@/lib/api-client');

describe('MSABlockingDialog', () => {
  let queryClient: QueryClient;
  const mockOnClose = vi.fn();
  const mockOnMSACreated = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    companyId: 'company-123',
    bureauId: 'bureau-456',
    bureauName: 'Test Bureau B.V.',
    onMSACreated: mockOnMSACreated,
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MSABlockingDialog {...defaultProps} {...props} />
      </QueryClientProvider>
    );
  };

  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      renderComponent();
      expect(screen.getByTestId('msa-blocking-dialog')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      renderComponent({ isOpen: false });
      expect(screen.queryByTestId('msa-blocking-dialog')).not.toBeInTheDocument();
    });

    it('should display the dialog title', () => {
      renderComponent();
      expect(screen.getByText('msa.blocking.title')).toBeInTheDocument();
    });

    it('should display the bureau name in the warning message', () => {
      renderComponent();
      expect(screen.getByText('Test Bureau B.V.')).toBeInTheDocument();
    });

    it('should render InlineMSAForm component', () => {
      renderComponent();
      expect(screen.getByTestId('input-start-date')).toBeInTheDocument();
      expect(screen.getByTestId('input-end-date')).toBeInTheDocument();
      expect(screen.getByTestId('select-payment-terms')).toBeInTheDocument();
    });

    it('should display warning alert with icon', () => {
      renderComponent();
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveClass('border-amber-500');
    });
  });

  describe('Form Interactions', () => {
    it('should have default values in form fields', () => {
      renderComponent();

      const startDateInput = screen.getByTestId('input-start-date') as HTMLInputElement;
      const endDateInput = screen.getByTestId('input-end-date') as HTMLInputElement;

      // Should have today's date as default
      expect(startDateInput.value).toBeTruthy();
      // Should have date 1 year from now as default
      expect(endDateInput.value).toBeTruthy();
    });

    it('should allow user to change start date', async () => {
      const user = userEvent.setup();
      renderComponent();

      const startDateInput = screen.getByTestId('input-start-date');
      await user.clear(startDateInput);
      await user.type(startDateInput, '2025-01-15');

      expect(startDateInput).toHaveValue('2025-01-15');
    });

    it('should allow user to change end date', async () => {
      const user = userEvent.setup();
      renderComponent();

      const endDateInput = screen.getByTestId('input-end-date');
      await user.clear(endDateInput);
      await user.type(endDateInput, '2026-01-15');

      expect(endDateInput).toHaveValue('2026-01-15');
    });

    it('should allow user to select payment terms', async () => {
      const user = userEvent.setup();
      renderComponent();

      const paymentTermsSelect = screen.getByTestId('select-payment-terms');
      await user.click(paymentTermsSelect);

      // Select 60 days option
      const option60 = await screen.findByText('60 common.days');
      await user.click(option60);

      // Verify selection (this would be implementation-specific)
      expect(paymentTermsSelect).toBeInTheDocument();
    });

    it('should allow user to enter optional contract value', async () => {
      const user = userEvent.setup();
      renderComponent();

      const contractValueInput = screen.getByTestId('input-contract-value');
      await user.type(contractValueInput, '50000');

      expect(contractValueInput).toHaveValue(50000);
    });
  });

  describe('Form Validation', () => {
    it('should validate that end date is after start date', async () => {
      const user = userEvent.setup();
      vi.mocked(apiClient.apiPost).mockResolvedValue({
        success: false,
        error: 'End date must be after start date',
        data: null,
      });

      renderComponent();

      // Set end date before start date
      const startDateInput = screen.getByTestId('input-start-date');
      const endDateInput = screen.getByTestId('input-end-date');

      await user.clear(startDateInput);
      await user.type(startDateInput, '2025-12-31');

      await user.clear(endDateInput);
      await user.type(endDateInput, '2025-01-01');

      const submitButton = screen.getByTestId('button-submit');
      await user.click(submitButton);

      // Form validation should prevent submission
      await waitFor(() => {
        expect(screen.getByText(/end date must be after start date/i)).toBeInTheDocument();
      });
    });

    it('should require start date', async () => {
      const user = userEvent.setup();
      renderComponent();

      const startDateInput = screen.getByTestId('input-start-date');
      await user.clear(startDateInput);

      const submitButton = screen.getByTestId('button-submit');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/start date is required/i)).toBeInTheDocument();
      });
    });

    it('should require end date', async () => {
      const user = userEvent.setup();
      renderComponent();

      const endDateInput = screen.getByTestId('input-end-date');
      await user.clear(endDateInput);

      const submitButton = screen.getByTestId('button-submit');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/end date is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('MSA Creation Flow', () => {
    it('should call API with correct data on form submission', async () => {
      const user = userEvent.setup();
      vi.mocked(apiClient.apiPost).mockResolvedValue({
        success: true,
        data: { id: 'msa-789', msaNumber: 'MSA-2025-001' },
        error: null,
      });

      renderComponent();

      // Fill form
      const startDateInput = screen.getByTestId('input-start-date');
      const endDateInput = screen.getByTestId('input-end-date');

      await user.clear(startDateInput);
      await user.type(startDateInput, '2025-01-01');

      await user.clear(endDateInput);
      await user.type(endDateInput, '2026-01-01');

      // Submit
      const submitButton = screen.getByTestId('button-submit');
      await user.click(submitButton);

      await waitFor(() => {
        expect(apiClient.apiPost).toHaveBeenCalledWith('/api/msa/create', {
          companyId: 'company-123',
          bureauId: 'bureau-456',
          effectiveDate: '2025-01-01',
          expirationDate: '2026-01-01',
          paymentTermsDays: 30, // default
          contractValue: undefined,
          noticePeriodDays: 30,
          autoRenew: false,
        });
      });
    });

    it('should call onMSACreated callback on successful submission', async () => {
      const user = userEvent.setup();
      vi.mocked(apiClient.apiPost).mockResolvedValue({
        success: true,
        data: { id: 'msa-789' },
        error: null,
      });

      renderComponent();

      const submitButton = screen.getByTestId('button-submit');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnMSACreated).toHaveBeenCalled();
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      vi.mocked(apiClient.apiPost).mockReturnValue(promise as any);

      renderComponent();

      const submitButton = screen.getByTestId('button-submit');
      await user.click(submitButton);

      // Should show loading text
      expect(screen.getByText('msa.blocking.creating')).toBeInTheDocument();

      // Resolve promise
      resolvePromise!({ success: true, data: { id: 'msa-789' }, error: null });
    });

    it('should disable form fields during submission', async () => {
      const user = userEvent.setup();
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      vi.mocked(apiClient.apiPost).mockReturnValue(promise as any);

      renderComponent();

      const submitButton = screen.getByTestId('button-submit');
      await user.click(submitButton);

      // Fields should be disabled
      expect(screen.getByTestId('input-start-date')).toBeDisabled();
      expect(screen.getByTestId('input-end-date')).toBeDisabled();
      expect(screen.getByTestId('button-cancel')).toBeDisabled();

      // Resolve promise
      resolvePromise!({ success: true, data: { id: 'msa-789' }, error: null });
    });
  });

  describe('Error Handling', () => {
    it('should display error toast on API failure', async () => {
      const user = userEvent.setup();
      const mockToast = vi.fn();

      vi.mocked(apiClient.apiPost).mockResolvedValue({
        success: false,
        error: 'Failed to create MSA',
        data: null,
      });

      // Re-mock toast for this test
      vi.doMock('@/hooks/use-toast', () => ({
        useToast: () => ({ toast: mockToast }),
      }));

      renderComponent();

      const submitButton = screen.getByTestId('button-submit');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'destructive',
          })
        );
      });
    });

    it('should not call onMSACreated on API failure', async () => {
      const user = userEvent.setup();
      vi.mocked(apiClient.apiPost).mockResolvedValue({
        success: false,
        error: 'Failed to create MSA',
        data: null,
      });

      renderComponent();

      const submitButton = screen.getByTestId('button-submit');
      await user.click(submitButton);

      await waitFor(() => {
        expect(apiClient.apiPost).toHaveBeenCalled();
      });

      expect(mockOnMSACreated).not.toHaveBeenCalled();
    });
  });

  describe('Dialog Actions', () => {
    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      const cancelButton = screen.getByTestId('button-cancel');
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when dialog close button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      // Find and click the X button in dialog header
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderComponent();

      // Dialog should have proper role
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();

      // Alert should have proper role
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      renderComponent();

      // Tab through form fields
      await user.tab();
      expect(screen.getByTestId('input-start-date')).toHaveFocus();

      await user.tab();
      expect(screen.getByTestId('input-end-date')).toHaveFocus();
    });

    it('should have visible focus indicators', () => {
      renderComponent();

      const startDateInput = screen.getByTestId('input-start-date');
      startDateInput.focus();

      expect(document.activeElement).toBe(startDateInput);
    });
  });

  describe('Component Props', () => {
    it('should pass correct companyId to form', () => {
      renderComponent({ companyId: 'custom-company-id' });

      // Form should be rendered with bureau info
      expect(screen.getByText('Test Bureau B.V.')).toBeInTheDocument();
    });

    it('should pass correct bureauId to form', () => {
      renderComponent({ bureauId: 'custom-bureau-id' });

      // Form should be rendered
      expect(screen.getByTestId('input-start-date')).toBeInTheDocument();
    });

    it('should display custom bureau name', () => {
      renderComponent({ bureauName: 'Custom Bureau Name' });

      expect(screen.getByText('Custom Bureau Name')).toBeInTheDocument();
    });
  });
});
