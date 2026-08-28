import { Routes } from '@angular/router';
import { APP_ROLES } from './models/auth.model';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/payment-hub/payment-hub.component').then(
        (m) => m.PaymentHubComponent,
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/record-list-page/record-list-page.component').then(
            (m) => m.RecordListPageComponent,
          ),
      },
      {
        path: 'new',
        canActivate: [roleGuard([APP_ROLES.MAKER])],
        loadComponent: () =>
          import('./components/record-form-page/record-form-page.component').then(
            (m) => m.RecordFormPageComponent,
          ),
      },
      {
        path: 'edit/:id',
        canActivate: [roleGuard([APP_ROLES.MAKER])],
        loadComponent: () =>
          import('./components/record-form-page/record-form-page.component').then(
            (m) => m.RecordFormPageComponent,
          ),
      },
    ],
  },
];
