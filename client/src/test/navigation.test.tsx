import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Router } from 'wouter';
import { Navigation } from '../components/navigation';
import { useAuth } from '../hooks/use-auth';
import { useLanguage } from '../hooks/useLanguage';

// Mock dependencies
vi.mock('../hooks/use-auth');
vi.mock('../hooks/useLanguage');
vi.mock('wouter', async () => {
  const actual = await vi.importActual('wouter');
  return {
    ...actual,
    useLocation: vi.fn(() => ['/dashboard', vi.fn()]),
    Link: ({ children, href, ...props }: any) => (
      <a href={href} {...props}>{children}</a>
    )
  };
});

const mockUseAuth = vi.mocked(useAuth);
const mockUseLanguage = vi.mocked(useLanguage);

// Test users
const testUsers = {
  zzp: {
    id: 'zzp-123',
    name: 'Test ZZP',
    email: 'zzp@test.com',
    userType: 'ZZP' as const,
    isAdmin: false,
    isVerified: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    password: 'hashed_password',
    averageRating: 4.5,
    totalRatings: 10
  },
  bedrijf: {
    id: 'bedrijf-456',
    name: 'Test Company',
    email: 'company@test.com',
    userType: 'BEDRIJF' as const,
    isAdmin: false,
    companyName: 'Test Company BV',
    isVerified: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    password: 'hashed_password',
    notificationEmail: false
  },
  admin: {
    id: 'admin-789',
    name: 'Rick Admin',
    email: 'rick@primadeta.nl',
    userType: 'BEDRIJF' as const,
    isAdmin: true,
    companyName: 'Primadeta',
    isVerified: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    password: 'hashed_password',
    notificationEmail: false
  }
};

describe('Navigation Component - Complete Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default language mock - useLanguage returns just the current language string
    mockUseLanguage.mockReturnValue('nl');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Unauthenticated User Navigation', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        login: vi.fn(),
        logout: vi.fn(),
        isLoading: false,
        error: null
      } as any);
    });

    it('should render public navigation menu for unauthenticated users', () => {
      render(
        <Router>
          <Navigation />
        </Router>
      );

      // Should show login/register links
      expect(screen.getByText('nav.login')).toBeInTheDocument();
      expect(screen.getByText('nav.register')).toBeInTheDocument();
      
      // Should show public pages
      expect(screen.getByText('nav.jobs')).toBeInTheDocument();
      
      // Should not show authenticated user menu
      expect(screen.queryByText('nav.dashboard')).not.toBeInTheDocument();
      expect(screen.queryByText('nav.profile')).not.toBeInTheDocument();
    });

    it('should render language selector for unauthenticated users', () => {
      render(
        <Router>
          <Navigation />
        </Router>
      );

      const languageSelector = screen.getByRole('combobox');
      expect(languageSelector).toBeInTheDocument();
    });

    it('should handle language switching', async () => {
      mockUseLanguage.mockReturnValue('nl');

      render(
        <Router>
          <Navigation />
        </Router>
      );

      const languageSelector = screen.getByRole('combobox');
      fireEvent.change(languageSelector, { target: { value: 'en' } });

      // Language switching is handled by the component internally via i18n
      // We can verify the language selector changed its value
      expect(languageSelector).toHaveValue('en');
    });

    it('should navigate to login page when login button is clicked', () => {
      render(
        <Router>
          <Navigation />
        </Router>
      );

      const loginLink = screen.getByText('nav.login');
      expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
    });

    it('should navigate to register page when register button is clicked', () => {
      render(
        <Router>
          <Navigation />
        </Router>
      );

      const registerLink = screen.getByText('nav.register');
      expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
    });
  });

  describe('Authenticated ZZP User Navigation', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: testUsers.zzp,
        login: vi.fn(),
        logout: vi.fn(),
        isLoading: false,
        error: null
      } as any);
    });

    it('should render ZZP-specific navigation menu', () => {
      render(
        <Router>
          <Navigation />
        </Router>
      );

      // Should show ZZP-specific menu items
      expect(screen.getByText('nav.jobs')).toBeInTheDocument();
      expect(screen.getByText('nav.my-applications')).toBeInTheDocument();
      expect(screen.getByText('nav.profile')).toBeInTheDocument();
      expect(screen.getByText('nav.messages')).toBeInTheDocument();

      // Should not show BEDRIJF-specific items
      expect(screen.queryByText('nav.my-jobs')).not.toBeInTheDocument();
      expect(screen.queryByText('nav.post-job')).not.toBeInTheDocument();
      
      // Should not show admin items
      expect(screen.queryByText('nav.analytics')).not.toBeInTheDocument();
      expect(screen.queryByText('nav.admin')).not.toBeInTheDocument();
    });

    it('should display user name in navigation', () => {
      render(
        <Router>
          <Navigation />
        </Router>
      );

      expect(screen.getByText(testUsers.zzp.name)).toBeInTheDocument();
    });

    it('should show logout functionality in user menu', async () => {
      const mockLogout = vi.fn();
      mockUseAuth.mockReturnValue({
        user: testUsers.zzp,
        login: vi.fn(),
        logout: mockLogout,
        isLoading: false,
        error: null
      } as any);

      render(
        <Router>
          <Navigation />
        </Router>
      );

      // Click on user menu to open dropdown
      const userMenuButton = screen.getByText(testUsers.zzp.name);
      fireEvent.click(userMenuButton);

      // Wait for dropdown to appear
      await waitFor(() => {
        expect(screen.getByText('nav.logout')).toBeInTheDocument();
      });

      // Click logout
      const logoutButton = screen.getByText('nav.logout');
      fireEvent.click(logoutButton);

      expect(mockLogout).toHaveBeenCalled();
    });

    it('should highlight current page in navigation', () => {
      const { useLocation } = require('wouter');
      vi.mocked(useLocation).mockReturnValue(['/my-applications', vi.fn()]);

      render(
        <Router>
          <Navigation />
        </Router>
      );

      const myApplicationsLink = screen.getByText('nav.my-applications');
      expect(myApplicationsLink.closest('a')).toHaveClass('active', { exact: false });
    });
  });

  describe('Authenticated BEDRIJF User Navigation', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: testUsers.bedrijf,
        login: vi.fn(),
        logout: vi.fn(),
        isLoading: false,
        error: null
      } as any);
    });

    it('should render BEDRIJF-specific navigation menu', () => {
      render(
        <Router>
          <Navigation />
        </Router>
      );

      // Should show BEDRIJF-specific menu items
      expect(screen.getByText('nav.dashboard')).toBeInTheDocument();
      expect(screen.getByText('nav.my-jobs')).toBeInTheDocument();
      expect(screen.getByText('nav.post-job')).toBeInTheDocument();
      expect(screen.getByText('nav.applications')).toBeInTheDocument();
      expect(screen.getByText('nav.messages')).toBeInTheDocument();

      // Should not show ZZP-specific items
      expect(screen.queryByText('nav.my-applications')).not.toBeInTheDocument();
      
      // Should not show admin items
      expect(screen.queryByText('nav.analytics')).not.toBeInTheDocument();
      expect(screen.queryByText('nav.admin')).not.toBeInTheDocument();
    });

    it('should display company name when available', () => {
      render(
        <Router>
          <Navigation />
        </Router>
      );

      // Should show either company name or user name
      const displayedName = testUsers.bedrijf.companyName || testUsers.bedrijf.name;
      expect(screen.getByText(displayedName)).toBeInTheDocument();
    });

    it('should provide quick access to post new job', () => {
      render(
        <Router>
          <Navigation />
        </Router>
      );

      const postJobLink = screen.getByText('nav.post-job');
      expect(postJobLink.closest('a')).toHaveAttribute('href', '/jobs/new');
    });

    it('should show applications management link', () => {
      render(
        <Router>
          <Navigation />
        </Router>
      );

      const applicationsLink = screen.getByText('nav.applications');
      expect(applicationsLink.closest('a')).toHaveAttribute('href', '/manage-applications');
    });
  });

  describe('Admin User Navigation', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: testUsers.admin,
        login: vi.fn(),
        logout: vi.fn(),
        isLoading: false,
        error: null
      } as any);
    });

    it('should render admin-specific navigation menu', () => {
      render(
        <Router>
          <Navigation />
        </Router>
      );

      // Should show admin-specific menu items
      expect(screen.getByText('nav.admin')).toBeInTheDocument();
      expect(screen.getByText('nav.analytics')).toBeInTheDocument();
      expect(screen.getByText('nav.users')).toBeInTheDocument();
      
      // Should also show regular BEDRIJF items
      expect(screen.getByText('nav.dashboard')).toBeInTheDocument();
      expect(screen.getByText('nav.my-jobs')).toBeInTheDocument();
    });

    it('should show admin badge or indicator', () => {
      render(
        <Router>
          <Navigation />
        </Router>
      );

      // Should indicate admin status
      expect(screen.getByText('nav.admin-badge')).toBeInTheDocument();
    });

    it('should provide access to analytics dashboard', () => {
      render(
        <Router>
          <Navigation />
        </Router>
      );

      const analyticsLink = screen.getByText('nav.analytics');
      expect(analyticsLink.closest('a')).toHaveAttribute('href', '/analytics');
    });

    it('should provide access to user management', () => {
      render(
        <Router>
          <Navigation />
        </Router>
      );

      const usersLink = screen.getByText('nav.users');
      expect(usersLink.closest('a')).toHaveAttribute('href', '/admin/users');
    });

    it('should verify rick@primadeta.nl admin access', () => {
      render(
        <Router>
          <Navigation />
        </Router>
      );

      expect(screen.getByText(testUsers.admin.name)).toBeInTheDocument();
      expect(screen.getByText('nav.admin')).toBeInTheDocument();
    });
  });

  describe('Responsive Navigation Behavior', () => {
    it('should show mobile menu toggle on small screens', () => {
      // Mock window.innerWidth for mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640,
      });

      mockUseAuth.mockReturnValue({
        user: testUsers.zzp,
        login: vi.fn(),
        logout: vi.fn(),
        isLoading: false,
        error: null
      } as any);

      render(
        <Router>
          <Navigation />
        </Router>
      );

      const mobileMenuToggle = screen.getByRole('button', { name: /menu/i });
      expect(mobileMenuToggle).toBeInTheDocument();
    });

    it('should toggle mobile menu visibility', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640,
      });

      mockUseAuth.mockReturnValue({
        user: testUsers.zzp,
        login: vi.fn(),
        logout: vi.fn(),
        isLoading: false,
        error: null
      } as any);

      render(
        <Router>
          <Navigation />
        </Router>
      );

      const mobileMenuToggle = screen.getByRole('button', { name: /menu/i });

      // Initially closed
      expect(screen.queryByText('nav.my-applications')).not.toBeVisible();
      
      // Click to open
      fireEvent.click(mobileMenuToggle);
      
      await waitFor(() => {
        expect(screen.getByText('nav.my-applications')).toBeVisible();
      });
      
      // Click to close
      fireEvent.click(mobileMenuToggle);
      
      await waitFor(() => {
        expect(screen.queryByText('nav.my-applications')).not.toBeVisible();
      });
    });
  });

  describe('Loading and Error States', () => {
    it('should handle loading state during authentication', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        login: vi.fn(),
        logout: vi.fn(),
        isLoading: true,
        error: null
      } as any);

      render(
        <Router>
          <Navigation />
        </Router>
      );

      // Should show loading indicator or skeleton
      expect(screen.getByTestId('navigation-loading')).toBeInTheDocument();
    });

    it('should handle authentication errors gracefully', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        login: vi.fn(),
        logout: vi.fn(),
        isLoading: false,
        error: 'Authentication failed'
      } as any);

      render(
        <Router>
          <Navigation />
        </Router>
      );

      // Should still render basic navigation despite error
      expect(screen.getByText('nav.login')).toBeInTheDocument();
      expect(screen.getByText('nav.register')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for navigation elements', () => {
      mockUseAuth.mockReturnValue({
        user: testUsers.zzp,
        login: vi.fn(),
        logout: vi.fn(),
        isLoading: false,
        error: null
      } as any);

      render(
        <Router>
          <Navigation />
        </Router>
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Main navigation');
    });

    it('should support keyboard navigation', async () => {
      mockUseAuth.mockReturnValue({
        user: testUsers.zzp,
        login: vi.fn(),
        logout: vi.fn(),
        isLoading: false,
        error: null
      } as any);

      render(
        <Router>
          <Navigation />
        </Router>
      );

      const userMenuButton = screen.getByText(testUsers.zzp.name);
      
      // Tab to user menu button
      userMenuButton.focus();
      expect(document.activeElement).toBe(userMenuButton);
      
      // Press Enter to open menu
      fireEvent.keyDown(userMenuButton, { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText('nav.logout')).toBeInTheDocument();
      });
    });

    it('should have proper semantic HTML structure', () => {
      mockUseAuth.mockReturnValue({
        user: testUsers.bedrijf,
        login: vi.fn(),
        logout: vi.fn(),
        isLoading: false,
        error: null
      } as any);

      render(
        <Router>
          <Navigation />
        </Router>
      );

      // Should have proper nav element
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      
      // Should have proper list structure for menu items
      const menuList = screen.getByRole('list');
      expect(menuList).toBeInTheDocument();
      
      const menuItems = screen.getAllByRole('listitem');
      expect(menuItems.length).toBeGreaterThan(0);
    });
  });

  describe('Theme Integration', () => {
    it('should support dark mode toggle', () => {
      mockUseAuth.mockReturnValue({
        user: testUsers.zzp,
        login: vi.fn(),
        logout: vi.fn(),
        isLoading: false,
        error: null
      } as any);

      render(
        <Router>
          <Navigation />
        </Router>
      );

      const themeToggle = screen.getByRole('button', { name: /theme/i });
      expect(themeToggle).toBeInTheDocument();
      
      fireEvent.click(themeToggle);
      // Theme change should be handled by theme provider
    });
  });

  describe('Security Considerations', () => {
    it('should not expose sensitive user data in navigation', () => {
      mockUseAuth.mockReturnValue({
        user: { ...testUsers.admin, password: 'secret-password', token: 'secret-token' } as any,
        login: vi.fn(),
        logout: vi.fn(),
        isLoading: false,
        error: null
      } as any);

      const { container } = render(
        <Router>
          <Navigation />
        </Router>
      );

      // Should not render sensitive data
      expect(container.textContent).not.toContain('secret-password');
      expect(container.textContent).not.toContain('secret-token');
    });

    it('should handle XSS attempts in user name', () => {
      const maliciousUser = {
        ...testUsers.zzp,
        name: '<script>alert("xss")</script>'
      };

      mockUseAuth.mockReturnValue({
        user: maliciousUser,
        login: vi.fn(),
        logout: vi.fn(),
        isLoading: false,
        error: null
      } as any);

      const { container } = render(
        <Router>
          <Navigation />
        </Router>
      );

      // Should render text content, not execute script
      expect(container.querySelector('script')).toBeNull();
      expect(container.textContent).toContain('<script>alert("xss")</script>');
    });
  });
});