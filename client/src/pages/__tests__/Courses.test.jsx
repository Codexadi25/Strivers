import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Courses from '../Courses';
import api from '../../utils/api';

// Mock API calls
jest.mock('../../utils/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

window.scrollTo = jest.fn();

const MOCK_COURSES = [
  {
    productId: 'masterclass',
    title: 'Strivers Placement Masterclass',
    category: 'masterclass',
    description: 'Live interactive weekend workshop with unicorn mentors. ATS resume blueprints, portfolio hosting, cold emails, and interview unit economics.',
    price: 74,
    originalPrice: 399,
    badge: 'Live Session Every Sunday',
    sessionDate: 'Sunday, 15 Nov, 11:00 AM IST',
    isMasterclass: true,
    features: [
      'Live online session every Sunday with working mentors',
      'ATS-friendly resume structure & quantitative bullet formulas',
      'Live portfolio hosting blueprint with personal domain',
    ],
    mentors: [
      { name: 'Alex Morgan', role: 'Ex-Google · SDE-2 @ Blinkit', company: 'Blinkit' },
      { name: 'Priya Sharma', role: 'Staff Engineer @ Zomato', company: 'Zomato' },
    ],
    isActive: true,
  },
  {
    productId: 'channel',
    title: 'Paid Job Channel',
    category: 'channel',
    description: 'Curated vacancy feed with direct HR interview meeting links, targeted company case study guides, and mentor shortlisting reviews.',
    price: 174,
    originalPrice: 1999,
    badge: 'Direct Vacancy Feed',
    sessionDate: 'Active Vacancy Feed Updated Daily',
    isMasterclass: false,
    features: [
      'Curated job vacancies with direct HR interview meeting links',
      'Enrol per upcoming vacancy with tailored prep packs',
    ],
    mentors: [
      { name: 'Alex Morgan', role: 'Blinkit', company: 'Blinkit' },
    ],
    isActive: true,
  },
  {
    productId: 'course_fullstack',
    title: 'Full-Stack Software Engineering',
    category: 'course',
    description: 'Comprehensive modular program covering MERN stack, database design, system architecture, scalable APIs, and production deployments.',
    price: 499,
    originalPrice: 2999,
    badge: 'Self-Paced Track',
    sessionDate: 'Instant Self-Paced Access',
    isMasterclass: false,
    features: [
      '200+ modular self-paced video lessons & source repositories',
      'Full-stack architecture: React, Node, Express, MongoDB, Docker',
    ],
    mentors: [
      { name: 'Alex Morgan', role: 'Blinkit', company: 'Blinkit' },
      { name: 'Rahul Verma', role: 'Porter', company: 'Porter' },
    ],
    isActive: true,
  },
];

describe('Strivers Client - Courses (/courses) Page Dynamic Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url === '/courses') {
        return Promise.resolve({
          data: {
            courses: MOCK_COURSES,
            catalogMeta: {
              hero: {
                badge: 'DYNAMIC TEST BADGE',
                title: 'Dynamic Backend Catalog Headline',
                subtitle: '100% database driven courses',
                stats: [{ label: 'Live Cohorts', value: '99+', icon: 'star' }],
              },
              faqs: [
                {
                  q: 'Are course prices synced live from backend?',
                  a: 'Yes, every price and schedule comes from the server store.',
                },
              ],
            },
          },
        });
      }
      if (url === '/auth/me') {
        return Promise.resolve({ data: { user: null } });
      }
      return Promise.resolve({ data: {} });
    });
  });

  test('renders page hero header and course cards with dynamic pricing', async () => {
    render(
      <MemoryRouter>
        <Courses />
      </MemoryRouter>
    );

    // Hero title
    expect(screen.getByText(/Level Up Your Career with Unicorn Mentors/i)).toBeInTheDocument();

    // Verify course titles and prices render
    await waitFor(() => {
      expect(screen.getAllByText(/Strivers Placement Masterclass/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Paid Job Channel/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Full-Stack/i).length).toBeGreaterThan(0);
      expect(screen.getByText('₹74')).toBeInTheDocument();
      expect(screen.getByText('₹174')).toBeInTheDocument();
      expect(screen.getByText('₹499')).toBeInTheDocument();
    });
  });

  test('filters courses by category tabs dynamically', async () => {
    render(
      <MemoryRouter>
        <Courses />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText(/Paid Job Channel/i).length).toBeGreaterThan(0);
    });

    // Click on "Job Placement Channels" tab
    const jobTab = screen.getByText('Job Placement Channels');
    fireEvent.click(jobTab);

    // Paid Job Channel should be visible
    expect(screen.getAllByText(/Paid Job Channel/i).length).toBeGreaterThan(0);

    // Click "All Programs" to restore full view
    const allTab = screen.getByText('All Programs');
    fireEvent.click(allTab);
    expect(screen.getAllByText(/Strivers Placement Masterclass/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Full-Stack/i).length).toBeGreaterThan(0);
  });

  test('renders mentors and features lists for each course', async () => {
    render(
      <MemoryRouter>
        <Courses />
      </MemoryRouter>
    );

    await waitFor(() => {
      const alexMentors = screen.getAllByText(/Alex Morgan/i);
      expect(alexMentors.length).toBeGreaterThan(0);
      expect(screen.getByText(/Live online session every Sunday with working mentors/i)).toBeInTheDocument();
    });
  });

  test('displays action buttons for enrollment', async () => {
    render(
      <MemoryRouter>
        <Courses />
      </MemoryRouter>
    );

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  test('handles offline/fallback gracefully when API returns error', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/courses') {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <MemoryRouter>
        <Courses />
      </MemoryRouter>
    );

    await waitFor(() => {
      const titles = screen.getAllByText(/Masterclass|Job Channel|Engineering/i);
      expect(titles.length).toBeGreaterThan(0);
    });
  });

  test('renders dynamic catalogMeta hero, stats and FAQs from backend response', async () => {
    render(
      <MemoryRouter>
        <Courses />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Dynamic Backend Catalog Headline')).toBeInTheDocument();
      expect(screen.getByText('Live Cohorts')).toBeInTheDocument();
      expect(screen.getByText('Are course prices synced live from backend?')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Are course prices synced live from backend?'));
    expect(screen.getByText(/every price and schedule comes from the server store/i)).toBeInTheDocument();
  });
});
