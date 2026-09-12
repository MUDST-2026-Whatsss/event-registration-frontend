// Change-request feature mock data — swap for API responses when the backend is wired up.

export const changeRequests = [
  {
    id: 1,
    eventName: 'TechCrunch Disrupt 2026',
    submittedBy: 'Elena Rossi',
    role: 'Event Admin',
    submitted: '4 hours ago',
    changeType: '2 fields changed',
    changeTypeClass: 'blue',
    icon: 'calendar',

    avatar:
      'https://i.pravatar.cc/100?img=47',

    changes: [
      {
        field: 'Event Date',
        oldValue: 'Nov 10, 2026',
        newValue: 'Nov 12, 2026',
      },
      {
        field: 'Venue',
        oldValue: 'Pier 48',
        newValue: 'Moscone Center',
      },
    ],

    status: 'Pending',
  },

  {
    id: 2,
    eventName: 'Global Food & Wine Expo',
    submittedBy: 'Tom Hayes',
    role: 'Event Admin',
    submitted: 'Yesterday',
    changeType: 'Capacity update',
    changeTypeClass: 'teal',
    icon: 'calendar',

    avatar:
      'https://i.pravatar.cc/100?img=12',

    changes: [
      {
        field: 'Event Capacity',
        oldValue: '4,000 attendees',
        newValue: '5,000 attendees',
      },
    ],

    status: 'Pending',
  },
]
