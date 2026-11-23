import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UpcomingMasterclassBanner from '../UpcomingMasterclassBanner';

describe('UpcomingMasterclassBanner Component', () => {
  test('renders "No recent masterclass anouncements for now." when no masterclass data provided', () => {
    render(<UpcomingMasterclassBanner masterclass={null} />);
    expect(screen.getByText('No recent masterclass anouncements for now.')).toBeInTheDocument();
  });

  test('renders session over notice with exact wording when masterclass is completed/ended', () => {
    const endedMasterclass = {
      productId: 'masterclass',
      title: 'Strivers Placement Masterclass',
      sessionStatus: 'ended',
      timingSlots: [{ endTime: '01:00 PM' }],
    };

    const handleNotesMock = jest.fn();
    render(
      <UpcomingMasterclassBanner
        masterclass={endedMasterclass}
        onNavigateToNotes={handleNotesMock}
      />
    );

    expect(
      screen.getByText(
        /The Session was already over at 01:00 PM you may Download Notes and Shared Resources below\. T&C Applied\./i
      )
    ).toBeInTheDocument();

    const notesBtn = screen.getByRole('button', { name: /Download Notes & Resources/i });
    expect(notesBtn).toBeInTheDocument();
    fireEvent.click(notesBtn);
    expect(handleNotesMock).toHaveBeenCalledTimes(1);
  });

  test('renders session over notice when session time is in the past', () => {
    const pastMasterclass = {
      productId: 'masterclass',
      title: 'Strivers Placement Masterclass',
      sessionStatus: 'upcoming',
      timingSlots: [
        {
          date: 'Sunday, 15 Nov 2020',
          startTime: '11:00 AM',
          endTime: '01:00 PM',
          active: true,
        },
      ],
    };

    render(<UpcomingMasterclassBanner masterclass={pastMasterclass} />);

    expect(
      screen.getByText(
        /The Session was already over at 01:00 PM you may Download Notes and Shared Resources below\. T&C Applied\./i
      )
    ).toBeInTheDocument();
  });

  test('renders live countdown when session is in the future', () => {
    // Session set 5 days in the future
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const dateStr = futureDate.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const upcomingMasterclass = {
      productId: 'masterclass',
      title: 'Strivers Placement Masterclass',
      description: 'Live interactive weekend workshop with unicorn mentors.',
      sessionStatus: 'upcoming',
      timingSlots: [
        {
          date: dateStr,
          startTime: '11:00 AM',
          endTime: '01:00 PM',
          active: true,
        },
      ],
      mentors: [
        { name: 'Aditya Sahu', role: 'Unicorn Mentor' },
      ],
    };

    render(
      <UpcomingMasterclassBanner
        masterclass={upcomingMasterclass}
        isEnrolled={true}
      />
    );

    expect(screen.getByText('Strivers Placement Masterclass')).toBeInTheDocument();
    expect(screen.getByText(/YOUR ENROLLED BATCH/i)).toBeInTheDocument();
    expect(screen.getByText(/Seconds/i)).toBeInTheDocument();
    expect(screen.getByText(/Minutes/i)).toBeInTheDocument();
    expect(screen.getByText('Aditya Sahu')).toBeInTheDocument();
  });

  test('renders Live status and Join button when session is live', () => {
    const liveMasterclass = {
      productId: 'masterclass',
      title: 'Strivers Placement Masterclass',
      sessionStatus: 'live',
      activeMeetingLink: 'https://meet.google.com/test-live-session',
      mentors: [{ name: 'Aishwarya Bhatia', role: 'Operations Lead' }],
    };

    render(
      <UpcomingMasterclassBanner
        masterclass={liveMasterclass}
        isEnrolled={true}
      />
    );

    expect(screen.getByText(/LIVE CLASS RUNNING NOW/i)).toBeInTheDocument();
    const joinBtn = screen.getByRole('link', { name: /Join Live Mentorship Room/i });
    expect(joinBtn).toHaveAttribute('href', 'https://meet.google.com/test-live-session');
  });
});
