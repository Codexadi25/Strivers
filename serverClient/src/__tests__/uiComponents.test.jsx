import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import LoginPage from '../pages/LoginPage';
import PricingPage from '../pages/PricingPage';
import LifelinePage from '../pages/LifelinePage';
import UsersPage from '../pages/UsersPage';
import * as apiModule from '../services/api';

jest.setTimeout(25000);

jest.mock('../services/api', () => ({
  apiCall: jest.fn(),
  getAdminToken: jest.fn(() => ''),
  setAdminSession: jest.fn(),
  clearAdminSession: jest.fn(),
}));

describe('serverClient Material UI Pages - Dynamic & Modular Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('LoginPage rejects bad credentials with error alert and stores session on success', async () => {
    const onLoginSuccess = jest.fn();

    apiModule.apiCall.mockRejectedValueOnce(new Error('Invalid admin passkey'));

    render(<LoginPage onLoginSuccess={onLoginSuccess} />);

    fireEvent.change(screen.getByPlaceholderText(/Enter admin password/i), {
      target: { value: 'wrong_key' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Authenticate & Launch Console/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid admin passkey/i)).toBeInTheDocument();
    });
    expect(onLoginSuccess).not.toHaveBeenCalled();

    apiModule.apiCall.mockResolvedValueOnce({
      success: true,
      token: 'admin_jwt_99',
      user: { email: 'creedracer111@gmail.com', role: 'admin' },
    });

    fireEvent.change(screen.getByPlaceholderText(/Enter admin password/i), {
      target: { value: 'admin123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Authenticate & Launch Console/i }));

    await waitFor(() => {
      expect(apiModule.apiCall).toHaveBeenCalledWith(
        '/auth/login',
        expect.objectContaining({ method: 'POST' })
      );
      expect(apiModule.setAdminSession).toHaveBeenCalledWith('admin_jwt_99', {
        email: 'creedracer111@gmail.com',
        role: 'admin',
      });
      expect(onLoginSuccess).toHaveBeenCalledWith({
        email: 'creedracer111@gmail.com',
        role: 'admin',
      });
    });
  });

  test('PricingPage fetches /courses (not /products), edits price & syncs CatalogMetaDialog', async () => {
    const mockCourses = [
      {
        productId: 'masterclass',
        title: 'Strivers Placement Masterclass',
        description: 'Live session every Sunday',
        price: 74,
        priceInPaise: 7400,
        originalPrice: 399,
        badge: 'LIVE WORKSHOP',
        category: 'masterclass',
        features: ['Resume Review', 'Portfolio Blueprint'],
        isActive: true,
      },
    ];

    apiModule.apiCall.mockImplementation(async (endpoint, opts) => {
      if (endpoint === '/courses' && (!opts || opts.method !== 'POST')) {
        return { success: true, courses: mockCourses };
      }
      if (endpoint === '/courses/masterclass' && opts?.method === 'PUT') {
        return { success: true, course: { ...mockCourses[0], price: 99 } };
      }
      if (endpoint === '/catalog-meta' && (!opts || opts.method !== 'PUT')) {
        return {
          success: true,
          catalogMeta: {
            hero: { badge: 'LIVE', title: 'Current Title', subtitle: 'Sub' },
            faqs: [],
            companies: ['Zomato', 'Blinkit'],
          },
        };
      }
      if (endpoint === '/catalog-meta' && opts?.method === 'PUT') {
        return { success: true };
      }
      return { success: true };
    });

    render(<PricingPage />);

    await waitFor(() => {
      expect(screen.getByText('Strivers Placement Masterclass')).toBeInTheDocument();
      expect(screen.getByText('7400 paise')).toBeInTheDocument();
      expect(screen.getByText('81% OFF')).toBeInTheDocument();
    });

    // Verify zero calls to deprecated /products
    expect(apiModule.apiCall).toHaveBeenCalledWith('/courses');
    expect(apiModule.apiCall).not.toHaveBeenCalledWith('/products');

    // Open Edit Dialog, update price, cover photo URL, add curriculum module & save
    fireEvent.click(screen.getByRole('button', { name: /Change Price & Details/i }));
    const priceInput = screen.getByLabelText(/Price \(₹ INR\)/i);
    fireEvent.change(priceInput, { target: { value: '99' } });
    const photoUrlInput = screen.getByLabelText(/Course Cover Photo URL/i);
    fireEvent.change(photoUrlInput, { target: { value: 'https://cdn.example.com/course-cover.png' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Module/i }));
    fireEvent.click(screen.getByRole('button', { name: /Save & Sync Live/i }));

    await waitFor(() => {
      expect(apiModule.apiCall).toHaveBeenCalledWith(
        '/courses/masterclass',
        expect.objectContaining({
          method: 'PUT',
          body: expect.stringContaining('"imageUrl":"https://cdn.example.com/course-cover.png"'),
        })
      );
      expect(apiModule.apiCall).toHaveBeenCalledWith(
        '/courses/masterclass',
        expect.objectContaining({
          method: 'PUT',
          body: expect.stringContaining('"curriculum":[{'),
        })
      );
    });
  });

  test('LifelinePage searches live DB records, masks/unmasks PII, opens Bill dialog, paginates & handles unmatched lookup', async () => {
    const page1Payload = {
      success: true,
      matched: true,
      data: {
        customerId: '#312795448',
        name: 'Aditya Sahu',
        email: 'artisahu6880@gmail.com',
        phone: '+91 9876545543',
        totalLifetimeVolume: '285.00',
        ordersCount: 4,
        hasActiveSubscription: true,
        enrolledCourses: [{ courseId: 'masterclass', title: 'Strivers Placement Masterclass', status: 'Active' }],
        activeBatch: {
          title: 'Strivers Placement Masterclass',
          description: 'Weekend Prep',
          meetingLink: 'https://meet.google.com/live-room',
          sessionDate: 'Sunday 11 AM IST',
          mentors: [{ name: 'Alex Morgan', company: 'Blinkit' }],
        },
        orders: [
          { orderId: 'ord_1', date: 'Nov 10 2026', status: 'CAPTURED', amount: 74, currency: '₹', txnId: 'pay_1', refId: 'rcpt_1' },
          { orderId: 'ord_2', date: 'Nov 08 2026', status: 'CAPTURED', amount: 174, currency: '₹', txnId: 'pay_2', refId: 'rcpt_2' },
          { orderId: 'ord_3', date: 'Nov 01 2026', status: 'CAPTURED', amount: 37, currency: '₹', txnId: 'pay_3', refId: 'rcpt_3' },
        ],
        pagination: { page: 1, limit: 3, totalOrders: 4, hasMoreOrders: true, nextPage: 2 },
      },
    };

    const page2Payload = {
      ...page1Payload,
      data: {
        ...page1Payload.data,
        orders: [
          { orderId: 'ord_4', date: 'Oct 20 2026', status: 'REFUNDED', amount: 99, currency: '₹', txnId: 'pay_4', refId: 'rcpt_4' },
        ],
        pagination: { page: 2, limit: 3, totalOrders: 4, hasMoreOrders: false, nextPage: null },
      },
    };

    apiModule.apiCall.mockImplementation(async (url) => {
      if (url === '/telemetry') return { success: true };
      if (url === '/orders?q=') return { success: true, orders: [{ orderId: 'ord_1', customerEmail: 'artisahu6880@gmail.com' }] };
      if (url === '/masterclasses') {
        return {
          success: true,
          masterclasses: [
            { productId: 'masterclass', title: 'Strivers Placement Masterclass', materials: [{ materialId: 'm1', title: 'Dynamic DB Notes PDF' }] },
          ],
        };
      }
      if (url === '/practice') {
        return { success: true, sheets: [{ sheetId: 'dsa', title: 'DSA 190 Sheet', category: 'Engineering', totalProblems: 190 }] };
      }
      if (url.startsWith('/lifeline') && url.includes('value=unknown%40none.com')) {
        return { success: true, matched: false, data: null };
      }
      if (url.startsWith('/lifeline') && url.includes('page=2')) {
        return page2Payload;
      }
      if (url.startsWith('/lifeline')) {
        return page1Payload;
      }
      return { success: true };
    });

    render(<LifelinePage />);

    await waitFor(() => {
      expect(screen.getByText('Email: artisahu6880@gmail.com')).toBeInTheDocument();
    });

    // Trigger lookup by clicking live suggestion chip
    fireEvent.click(screen.getByText('Email: artisahu6880@gmail.com'));

    await waitFor(() => {
      expect(screen.getByText('Aditya Sahu')).toBeInTheDocument();
      expect(screen.getByText('+91 XXXXXXXX5543')).toBeInTheDocument();
      expect(screen.getByText('Dynamic DB Notes PDF')).toBeInTheDocument();
      expect(screen.getByText('DSA 190 Sheet')).toBeInTheDocument();
    });

    // Unmask phone toggle
    fireEvent.click(screen.getByRole('button', { name: /Toggle phone visibility/i }));
    expect(screen.getByText('+91 9876545543')).toBeInTheDocument();

    // Open Order & Bill Dialog
    const billButtons = screen.getAllByRole('button', { name: /View Order & Bill/i });
    fireEvent.click(billButtons[0]);
    expect(await screen.findByText('Order & Invoice Details')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Paginate next orders
    fireEvent.click(screen.getByRole('button', { name: /Load Next 3 Orders/i }));
    await waitFor(() => {
      expect(screen.getByText('Order #ord_4')).toBeInTheDocument();
    });

    // Unmatched query should show DB not found message (never Connection notice: Failed to fetch)
    const input = screen.getByLabelText(/Search Student \/ Payment Record/i);
    fireEvent.change(input, { target: { value: 'unknown@none.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Investigate/i }));

    await waitFor(() => {
      expect(screen.getByText(/No customer or order record matched/i)).toBeInTheDocument();
      expect(screen.queryByText(/Connection notice: Failed to fetch/i)).not.toBeInTheDocument();
    });
  });

  test('UsersPage renders live users and updates role via PUT /users/:id', async () => {
    apiModule.apiCall.mockImplementation(async (url, opts) => {
      if (url === '/users' && !opts) {
        return {
          success: true,
          users: [
            {
              userId: 'u_std_1',
              name: 'Kamaldeep',
              email: 'kamaldeep@gmail.com',
              role: 'user',
              hasActiveSubscription: false,
              enrolledCourses: [],
            },
          ],
        };
      }
      if (url.startsWith('/users/') && (opts?.method === 'PUT' || opts?.method === 'DELETE')) {
        return { success: true };
      }
      return { success: true };
    });

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText('kamaldeep@gmail.com')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Make Admin' }));

    await waitFor(() => {
      expect(apiModule.apiCall).toHaveBeenCalledWith(
        '/users/u_std_1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ role: 'admin' }),
        })
      );
    });

    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
    await waitFor(() => {
      expect(apiModule.apiCall).toHaveBeenCalledWith(
        '/users/u_std_1',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  test('App validates session via /auth/me and Logout returns console to LoginPage', async () => {
    apiModule.getAdminToken.mockReturnValue('admin_jwt_1');

    apiModule.apiCall.mockImplementation(async (url) => {
      if (url === '/auth/me') {
        return { success: true, user: { email: 'creedracer111@gmail.com', role: 'admin' } };
      }
      if (url === '/auth/logout') {
        return { success: true };
      }
      if (url === '/courses') {
        return { success: true, courses: [] };
      }
      if (url === '/telemetry') {
        return { success: true, telemetry: { gateway: { mode: 'Live' }, metrics: {} } };
      }
      return { success: true };
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Course Pricing & Plans Engine/i)).toBeInTheDocument();
    });

    const logoutBtns = screen.getAllByRole('button', { name: /Logout/i });
    fireEvent.click(logoutBtns[0]);

    await waitFor(() => {
      expect(apiModule.apiCall).toHaveBeenCalledWith('/auth/logout', { method: 'POST' });
      expect(apiModule.clearAdminSession).toHaveBeenCalled();
      expect(screen.getByText(/Administrator Sign In/i)).toBeInTheDocument();
    });
  });
});

