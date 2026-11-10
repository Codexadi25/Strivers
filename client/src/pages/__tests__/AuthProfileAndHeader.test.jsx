import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '../../components/common/Header';
import PracticeDashboard from '../PracticeDashboard';
import Login from '../Login';
import api from '../../utils/api';

jest.mock('../../utils/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

window.scrollTo = jest.fn();

describe('Auth Session, Sign Out, Profile Loading & Notes Access', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    api.get.mockResolvedValue({ data: {} });
    api.post.mockResolvedValue({ data: { success: true } });
    api.put.mockResolvedValue({ data: { success: true } });
  });

  test('Header Sign Out clears local auth session, hits /auth/logout, and navigates to /login', async () => {
    localStorage.setItem('auth_token', 'jwt_valid_token');
    localStorage.setItem(
      'auth_user',
      JSON.stringify({ uid: 'u1', name: 'Aditya Sahu', email: 'artisahu6880@gmail.com', role: 'user' })
    );

    api.get.mockImplementation((url) => {
      if (url === '/auth/me') {
        return Promise.resolve({
          data: {
            success: true,
            user: { uid: 'u1', name: 'Aditya Sahu', email: 'artisahu6880@gmail.com', role: 'user' },
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText(/Aditya/i).length).toBeGreaterThan(0);
    });

    // Click Sign Out button in Header (present when authenticated)
    const signOutButtons = screen.getAllByRole('button', { name: /Sign Out/i });
    fireEvent.click(signOutButtons[0]);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/logout');
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('auth_user')).toBeNull();
      expect(mockNavigate).toHaveBeenCalledWith('/login?logged_out=1');
    });
  });

  test('PracticeDashboard loads signed-in user profile and unlocks Downloadable Notes via auth_token', async () => {
    localStorage.setItem('auth_token', 'jwt_student_token');
    localStorage.setItem(
      'auth_user',
      JSON.stringify({ uid: 'usr_99', name: 'Aditya Sahu', email: 'artisahu6880@gmail.com', role: 'admin' })
    );

    api.get.mockImplementation((url) => {
      if (url === '/auth/me') {
        return Promise.resolve({
          data: {
            success: true,
            user: {
              uid: 'usr_99',
              name: 'Aditya Sahu',
              email: 'artisahu6880@gmail.com',
              role: 'admin',
              enrolledCourses: [],
              enrolledPracticeSheets: [],
              maxPracticeSheetsAllowed: 5,
            },
          },
        });
      }
      if (url === '/profile/me') {
        return Promise.resolve({
          data: {
            success: true,
            profile: {
              userId: 'usr_99',
              name: 'Aditya Sahu',
              email: 'artisahu6880@gmail.com',
              targetCompanies: ['Google', 'Atlassian'],
              solvedProblems: ['dsa-1-1'],
              starredProblems: [],
              streak: {
                currentStreak: 3,
                bestStreak: 7,
                totalActiveDays: 12,
                weeklyMinutes: 180,
                activeDates: [],
                dailySubmissions: {},
                weeklyDistribution: [
                  { day: 'S', dayIndex: 0, minutes: 30, time: '0h 30m' },
                  { day: 'M', dayIndex: 1, minutes: 30, time: '0h 30m' },
                  { day: 'T', dayIndex: 2, minutes: 30, time: '0h 30m' },
                  { day: 'W', dayIndex: 3, minutes: 30, time: '0h 30m' },
                  { day: 'T', dayIndex: 4, minutes: 30, time: '0h 30m' },
                  { day: 'F', dayIndex: 5, minutes: 30, time: '0h 30m' },
                  { day: 'S', dayIndex: 6, minutes: 0, time: '0h 0m' },
                ],
              },
            },
          },
        });
      }
      if (url === '/notes') {
        return Promise.resolve({
          data: {
            success: true,
            notes: [
              {
                noteId: 'note_sys_1',
                title: 'Distributed Systems Design Guide',
                subtitle: 'Free Backend Notes',
                category: 'Backend',
                isFree: true,
              },
            ],
          },
        });
      }
      if (url === '/practice/sheets') {
        return Promise.resolve({ data: { success: true, sheets: [] } });
      }
      if (url === '/courses') {
        return Promise.resolve({ data: { success: true, courses: [] } });
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <MemoryRouter>
        <PracticeDashboard />
      </MemoryRouter>
    );

    // Wait for authenticated user data
    await waitFor(() => {
      expect(screen.getAllByText(/Aditya Sahu/i).length).toBeGreaterThan(0);
    });

    // Switch to Profile & Stats tab and confirm real profile details (never static 'Verified User' / 'user@strivers.in')
    fireEvent.click(screen.getByRole('button', { name: /Profile & Stats/i }));
    await waitFor(() => {
      expect(screen.getByText('artisahu6880@gmail.com')).toBeInTheDocument();
      expect(screen.getByText('Google, Atlassian')).toBeInTheDocument();
      expect(screen.queryByText('Verified User')).not.toBeInTheDocument();
      expect(screen.queryByText('user@strivers.in')).not.toBeInTheDocument();
    });

    // Switch to Downloadable Notes tab and confirm Notes Vault is UNLOCKED
    fireEvent.click(screen.getByRole('button', { name: /Downloadable Notes/i }));
    await waitFor(() => {
      expect(screen.queryByText(/Sign In Required to Access Downloadable Notes/i)).not.toBeInTheDocument();
      expect(screen.getByText('Distributed Systems Design Guide')).toBeInTheDocument();
    });
  });

  test('PracticeDashboard blocks sheets, stats & notes behind Sign In Required gate when user is signed out', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/auth/me' || url === '/profile/me' || url === '/notes') {
        return Promise.reject({ response: { status: 401 }, message: 'Unauthorized' });
      }
      if (url === '/practice/sheets') {
        return Promise.resolve({ data: { success: true, sheets: [] } });
      }
      if (url === '/courses') {
        return Promise.resolve({ data: { success: true, courses: [] } });
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <MemoryRouter>
        <PracticeDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Sign In Required/i)).toBeInTheDocument();
      expect(screen.getByTestId('practice-signin-btn')).toBeInTheDocument();
    });

    // Unauthenticated users must NOT see student profile stats, sheets, or notes
    expect(screen.queryByText(/All Submissions Heatmap/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Downloadable Notes & Engineering Vault/i)).not.toBeInTheDocument();
  });

  test('Login handles invalid credentials and navigates to /courses on success', async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { error: 'Invalid credentials provided.' } },
    });

    const { container } = render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = container.querySelector('input[type="email"]');
    const passInput = container.querySelector('input[type="password"]');
    fireEvent.change(emailInput, { target: { value: 'student@example.com' } });
    fireEvent.change(passInput, { target: { value: 'wrongpass' } });

    const submitBtn = screen.getByRole('button', { name: /Sign In|Login/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials provided/i)).toBeInTheDocument();
    });

    api.post.mockResolvedValueOnce({
      data: {
        success: true,
        token: 'jwt_student_login',
        user: { uid: 'u5', name: 'Test User', email: 'student@example.com', role: 'user' },
      },
    });

    fireEvent.change(passInput, { target: { value: 'CorrectPass1!' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(localStorage.getItem('auth_token')).toBe('jwt_student_login');
      expect(mockNavigate).toHaveBeenCalledWith('/courses');
    });
  });
});
