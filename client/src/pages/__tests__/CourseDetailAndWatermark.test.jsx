import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Courses from '../Courses';
import CourseDetail from '../CourseDetail';
import Footer from '../../components/common/Footer';
import { ProtectedDocumentModal } from '../../components/secureViewer/ProtectedDocumentModal';
import api from '../../utils/api';

jest.mock('../../utils/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

window.scrollTo = jest.fn();

const MOCK_DETAIL_COURSE = {
  productId: 'course_fullstack',
  title: 'Full-Stack Software Engineering',
  category: 'course',
  description: 'Build production web applications from database modeling to React UI.',
  imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
  duration: '12 Weeks',
  level: 'Intermediate',
  price: 499,
  originalPrice: 2999,
  badge: 'COHORT',
  sessionDate: 'Instant Self-Paced Access',
  whatYouWillLearn: [
    'Design scalable APIs with clean service boundaries',
    'Build responsive Material UI interfaces',
  ],
  curriculum: [
    {
      moduleTitle: 'Module 1: React & State Architecture',
      duration: 'Weeks 1-4',
      lessons: ['Component design patterns', 'Responsive Material layouts'],
    },
    {
      moduleTitle: 'Module 2: Backend APIs & Security',
      duration: 'Weeks 5-8',
      lessons: ['REST API controllers', 'Token authentication & guards'],
    },
  ],
  features: ['Project reviews', 'Lifetime course access'],
  mentors: [{ name: 'Rahul Verma', role: 'Engineering Lead @ Porter', company: 'Porter' }],
  isActive: true,
};

describe('CourseDetail Curriculum UX, Default Irremovable Student Watermark & Zero Stack Disclosures', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    api.get.mockImplementation((url) => {
      if (url === '/courses') {
        return Promise.resolve({
          data: { courses: [MOCK_DETAIL_COURSE] },
        });
      }
      if (url.startsWith('/courses/course_fullstack')) {
        return Promise.resolve({
          data: { success: true, course: MOCK_DETAIL_COURSE },
        });
      }
      return Promise.resolve({ data: { user: null } });
    });
  });

  test('clicking a course card on /courses opens CourseDetail with syllabus, photo & 2 enrollment buttons', async () => {
    render(
      <MemoryRouter initialEntries={['/courses']}>
        <Routes>
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
        </Routes>
      </MemoryRouter>
    );

    const card = await screen.findByTestId('course-card-course_fullstack');
    fireEvent.click(card);

    // Course Detail renders description, outcomes, curriculum Accordion & BOTH enrollment buttons
    await waitFor(() => {
      expect(screen.getByText('What You Will Learn')).toBeInTheDocument();
      expect(screen.getByText('Course Curriculum & Structure')).toBeInTheDocument();
      expect(screen.getByTestId('enroll-heading-btn')).toBeInTheDocument();
      expect(screen.getByTestId('enroll-bottom-btn')).toBeInTheDocument();
      expect(screen.getByAltText('Full-Stack Software Engineering')).toHaveAttribute(
        'src',
        MOCK_DETAIL_COURSE.imageUrl
      );
    });

    // Expand second curriculum module to inspect lessons
    fireEvent.click(screen.getByText('Module 2: Backend APIs & Security'));
    expect(screen.getByText('Token authentication & guards')).toBeInTheDocument();
  });

  test('ProtectedDocumentModal shows default Student Watermark that cannot be permanently removed or hidden', async () => {
    const sampleMaterial = {
      title: 'ATS Resume Playbook',
      fileType: 'notes',
      description: 'Structured guide',
      fileData: btoa('# Single Column Resume\n- Quantify impact with clear numbers.'),
    };

    render(
      <ProtectedDocumentModal
        material={sampleMaterial}
        userEmail="student@example.com"
        onClose={jest.fn()}
      />
    );

    // Default watermark is visible immediately
    const wm = screen.getByTestId('student-watermark-overlay');
    expect(wm).toBeInTheDocument();
    expect(wm).toHaveAttribute('aria-label', 'Student Watermark: student@example.com');
    expect(screen.getByText(/Student: student@example.com/i)).toBeInTheDocument();

    // Attempt to hide, clear, or remove watermark node via DOM manipulation
    wm.style.display = 'none';
    wm.innerHTML = '';
    wm.remove();

    // MutationObserver must automatically re-attach & restore the watermark
    await waitFor(() => {
      const restored = screen.getByTestId('student-watermark-overlay');
      expect(restored).toBeInTheDocument();
      expect(restored.style.display).not.toBe('none');
      expect(screen.getByText(/Student: student@example.com/i)).toBeInTheDocument();
    });
  });

  test('Footer and CourseDetail disclose zero internal stack/DRM/Razorpay/MongoDB copy', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/courses/course_fullstack']}>
        <Routes>
          <Route path="/courses/:id" element={<CourseDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('What You Will Learn')).toBeInTheDocument();
    });

    const bodyText = container.textContent || '';
    expect(bodyText).not.toMatch(/DRM Protected/i);
    expect(bodyText).not.toMatch(/Razorpay Verified Gateway/i);
    expect(bodyText).not.toMatch(/256-Bit SSL Encrypted/i);
    expect(bodyText).not.toMatch(/Stored in MongoDB/i);
    expect(bodyText).not.toMatch(/Encrypted in MongoDB/i);

    const footerRender = render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    const footerText = footerRender.container.textContent || '';
    expect(footerText).not.toMatch(/DRM Protected/i);
    expect(footerText).not.toMatch(/Razorpay/i);
    expect(footerText).not.toMatch(/256-Bit SSL/i);
  });
});

