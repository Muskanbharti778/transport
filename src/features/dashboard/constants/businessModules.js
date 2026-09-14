import {routes} from '../../../navigation/routeNames';

// Mirrors PRD.md §6 Core Modules. Add `route` once a module's list screen
// exists — that's the only change needed to make a tile tappable.
export const businessModules = [
  {key: 'parties', label: 'Parties', icon: 'account-group-outline', route: routes.partiesList},
  {key: 'trucks', label: 'Trucks', icon: 'truck-outline', route: routes.trucksList},
  {key: 'drivers', label: 'Drivers', icon: 'account-tie-outline', route: routes.driversList},
  {key: 'suppliers', label: 'Suppliers', icon: 'domain', route: routes.suppliersList},
  {key: 'expenses',label: 'Expenses',icon: 'receipt',route: routes.expenses,},
  {key: 'payments', label: 'Payments', icon: 'cash-multiple', route: routes.payments},
  {key: 'khata', label: 'Khata', icon: 'book-open-page-variant-outline', route:routes.khata},
  {key: 'documents', label: 'Documents', icon: 'file-document-outline', route: routes.documents},
  {key: 'reports', label: 'Reports', icon: 'chart-bar', route: routes.reports,},
];