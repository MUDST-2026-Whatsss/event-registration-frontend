// Event-management mock data. Replace these arrays with API responses when the
// backend is wired up; the views only read from them.

export const consoleEvents = [
  {
    id: 1,
    name: 'Global Tech Innovators Summit 2024',
    venue: 'Convention Center, Hall A',
    date: 'Nov 15, 2024',
    time: '09:00 AM - 05:00 PM',
    registrations: 450,
    capacity: 500,
    status: 'Published',
    category: 'Seminar',
    image:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=160&q=80',

    admins: [
      {
        id: 1,
        name: 'Sarah Jenkins',
        role: 'Event Admin',
        avatar: 'https://i.pravatar.cc/100?img=47',
      },
      {
        id: 2,
        name: 'Elena Rossi',
        role: 'Event Admin',
        avatar: 'https://i.pravatar.cc/100?img=32',
      },
    ],

    participants: [
      {
        id: 1,
        name: 'aunyamanee keawching',
        email: 'aunyama@gmail.com',
        tel: '095-870-4545',
        payment: 'Paid',
      },
      {
        id: 2,
        name: 'borbeer sudlhorr',
        email: 'test@gmail.com',
        tel: '095-453-4355',
        payment: 'Pending',
      },
      {
        id: 3,
        name: 'somsak jaidee',
        email: 'test888@gmail.com',
        tel: '095-453-4355',
        payment: 'Paid',
      },
      {
        id: 4,
        name: 'sompong jaidee',
        email: 'test888@gmail.com',
        tel: '095-453-4355',
        payment: 'Paid',
      },
    ],
  },

  {
    id: 2,
    name: 'Urban Beats Outdoor Festival',
    venue: 'Central Park West',
    date: 'Dec 02, 2024',
    time: '04:00 PM - 11:00 PM',
    registrations: 320,
    capacity: 800,
    status: 'Pending',
    category: 'Music',
    image:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=160&q=80',

    admins: [
      {
        id: 3,
        name: 'Tom Hayes',
        role: 'Event Admin',
        avatar: 'https://i.pravatar.cc/100?img=12',
      },
    ],

    participants: [
      {
        id: 1,
        name: 'john smith',
        email: 'john@gmail.com',
        tel: '095-111-2222',
        payment: 'Paid',
      },
      {
        id: 2,
        name: 'maria lee',
        email: 'maria@gmail.com',
        tel: '095-222-3333',
        payment: 'Pending',
      },
    ],
  },

  {
    id: 3,
    name: 'Advanced UI Design Workshop',
    venue: 'Creative Hub Room 4',
    date: 'Nov 28, 2024',
    time: '10:00 AM - 04:00 PM',
    registrations: 75,
    capacity: 100,
    status: 'Rejected',
    category: 'Workshop',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=160&q=80',

    admins: [
      {
        id: 4,
        name: 'Mei Lin',
        role: 'Event Admin',
        avatar: 'https://i.pravatar.cc/100?img=44',
      },
    ],

    participants: [],
  },

  {
    id: 4,
    name: 'Internal Marketing Strategy Day',
    venue: 'HQ Main Boardroom',
    date: 'TBD',
    time: 'Unset',
    registrations: 0,
    capacity: 0,
    status: 'Draft',
    category: 'Others',
    image: null,

    admins: [
      {
        id: 5,
        name: 'Sarah Jenkins',
        role: 'Event Admin',
        avatar: 'https://i.pravatar.cc/100?img=47',
      },
    ],

    participants: [],
  },

  {
    id: 5,
    name: 'Digital Future Conference 2025',
    venue: 'Innovation Center',
    date: 'Jan 18, 2025',
    time: '09:00 AM - 06:00 PM',
    registrations: 620,
    capacity: 700,
    status: 'Published',
    category: 'Seminar',
    image:
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=160&q=80',

    admins: [
      {
        id: 6,
        name: 'Tom Hayes',
        role: 'Event Admin',
        avatar: 'https://i.pravatar.cc/100?img=12',
      },
    ],

    participants: [],
  },
]

export const availableAdmins = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    role: 'Event Admin',
    avatar: 'https://i.pravatar.cc/100?img=47',
  },
  {
    id: 2,
    name: 'Elena Rossi',
    role: 'Event Admin',
    avatar: 'https://i.pravatar.cc/100?img=32',
  },
  {
    id: 3,
    name: 'Tom Hayes',
    role: 'Event Admin',
    avatar: 'https://i.pravatar.cc/100?img=12',
  },
  {
    id: 4,
    name: 'Mei Lin',
    role: 'Event Admin',
    avatar: 'https://i.pravatar.cc/100?img=44',
  },
]
