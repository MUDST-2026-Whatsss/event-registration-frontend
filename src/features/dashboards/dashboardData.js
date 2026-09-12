// Dashboard feature mock data — swap for API responses when the backend is wired up.

export const eventStatuses = [
  {
    label: 'Published',
    count: 842,
    percent: 69.9,
    color: '#5878f2',
  },
  {
    label: 'Pending Approval',
    count: 156,
    percent: 13.0,
    color: '#36b9b5',
  },
  {
    label: 'Draft',
    count: 98,
    percent: 8.1,
    color: '#f5a623',
  },
  {
    label: 'Rejected',
    count: 67,
    percent: 5.6,
    color: '#ef5350',
  },
  {
    label: 'Completed',
    count: 41,
    percent: 3.4,
    color: '#9aa5b5',
  },
]

export const recentApprovals = [
  {
    id: 1,
    name: 'Summer Music Festival 2026',
    submittedBy: 'Dana Whitfield',
    time: '2 hours ago',
    status: 'Pending',
    image:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=180&q=80',
  },
  {
    id: 2,
    name: 'AI & Future of Work Summit',
    submittedBy: 'Priya Nair',
    time: '5 hours ago',
    status: 'Pending',
    image:
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=180&q=80',
  },
  {
    id: 3,
    name: 'Indie Game Jam — 48hr Challenge',
    submittedBy: 'Liam O’Connor',
    time: 'Yesterday',
    status: 'Pending',
    image:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=180&q=80',
  },
  {
    id: 4,
    name: 'Global Food & Wine Expo 2026',
    submittedBy: 'Elena Rossi',
    time: '2 days ago',
    status: 'Approved',
    image:
      'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=180&q=80',
  },
  {
    id: 5,
    name: 'Startup Pitch Night',
    submittedBy: 'Mei Lin',
    time: '2 days ago',
    status: 'Rejected',
    image:
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=180&q=80',
  },
]

export const dashboardChangeRequests = [
  {
    label: 'Total Requests',
    value: 28,
    note: '↑ 6 this week',
    type: 'success',
  },
  {
    label: 'Pending Review',
    value: 12,
    note: 'Needs review',
    type: 'warning',
  },
  {
    label: 'Approved',
    value: 10,
    note: 'This week',
    type: 'success',
  },
  {
    label: 'Rejected',
    value: 6,
    note: 'This week',
    type: 'danger',
  },
]
