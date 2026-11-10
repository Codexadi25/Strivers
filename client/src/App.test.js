import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

window.scrollTo = jest.fn();

describe('Strivers Client - App Core Routing & Integration', () => {
  test('renders landing page with Strivers hero content on root path "/"', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    const heroElements = screen.getAllByText(/Strivers|Placement|Masterclass/i);
    expect(heroElements.length).toBeGreaterThan(0);
    expect(screen.queryByText(/A resume that gets shortlisted/i)).not.toBeInTheDocument();
  });

  test('renders Courses page when navigated to "/courses"', () => {
    render(
      <MemoryRouter initialEntries={['/courses']}>
        <App />
      </MemoryRouter>
    );

    const courseHeadings = screen.getAllByText(/Strivers Placement Masterclass|Paid Job Channel|Full-Stack/i);
    expect(courseHeadings.length).toBeGreaterThan(0);
  });

  test('renders CourseAccess classroom route on "/courses/masterclass/access"', () => {
    render(
      <MemoryRouter initialEntries={['/courses/masterclass/access']}>
        <App />
      </MemoryRouter>
    );

    const accessElements = screen.getAllByText(/Loading|Access|Course|Classroom|Enroll/i);
    expect(accessElements.length).toBeGreaterThan(0);
  });

  test('does not mount removed "/products" route (falls back to landing)', () => {
    render(
      <MemoryRouter initialEntries={['/products']}>
        <App />
      </MemoryRouter>
    );

    // Since /products route is removed and * redirects to /, Hero CTA should render instead of a standalone Products page
    const landingCta = screen.getAllByText(/Placement|Masterclass/i);
    expect(landingCta.length).toBeGreaterThan(0);
  });
});
