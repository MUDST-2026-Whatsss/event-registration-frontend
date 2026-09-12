export const superAdminGovernanceRoutes = [
  {
    path: 'change-requests',
    name: 'sa-change-requests',
    component: () => import('./change-requests/SuperAdminChangeRequestsPage.vue'),
    meta: { heading: 'Change Requests' },
  },
  {
    path: 'event-approvals',
    name: 'sa-event-approvals',
    component: () => import('./approvals/SuperAdminApprovalsPage.vue'),
    meta: { heading: 'Event Approvals' },
  },
  {
    path: 'audit-logs',
    name: 'sa-audit-logs',
    component: () => import('./audit/SuperAdminAuditLogsPage.vue'),
    meta: { heading: 'Audit Logs' },
  },
]
