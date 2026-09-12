// User-management mock data — swap for API responses when the backend is wired up.

export const consoleAdminUsers = [
  {
    id: 'ADM-0042',
    avatar: 'https://i.pravatar.cc/72?img=47',
    name: 'Sarah Jenkins',
    role: 'Admin',
    permissions: ['Events: All', 'Reg: Full'],
    status: 'Active',
  },
  {
    id: 'ADM-0056',
    avatar: 'https://i.pravatar.cc/72?img=68',
    name: "Liam O'Connor",
    role: 'User',
    permissions: [],
    status: 'Disabled',
  },
]

export const governanceLog = [
  {
    id: 1,
    icon: 'circle-check',
    tone: 'green',
    text: 'Marcus Webb (Super Admin) approved event "Summer Music Festival"',
    meta: 'Today, 2:42 PM · Action ID: #AUD-99218',
  },
  {
    id: 2,
    icon: 'shield',
    tone: 'amber',
    text: 'System updated role permissions for Admin',
    meta: 'Today, 11:05 AM · Action ID: #AUD-99215',
  },
]
