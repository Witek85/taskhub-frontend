import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/access',
    loadComponent: () =>
      import('./features/auth/access/access.component').then((m) => m.AccessComponent),
  },
  {
    path: 'preferences',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/preferences/preferences.component').then((m) => m.PreferencesComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/component/app.layout').then((m) => m.AppLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'tasks',
      },
      {
        path: 'tasks',
        loadComponent: () =>
          import('./features/tasks/pages/task-list-page/task-list-page.component').then(
            (m) => m.TaskListPageComponent,
          ),
      },
      {
        path: 'tasks/add',
        loadComponent: () =>
          import('./features/tasks/pages/task-form-page/task-form-page.component').then(
            (m) => m.TaskFormPageComponent,
          ),
        data: {
          mode: 'add',
        },
      },
      {
        path: 'tasks/:id/edit',
        loadComponent: () =>
          import('./features/tasks/pages/task-form-page/task-form-page.component').then(
            (m) => m.TaskFormPageComponent,
          ),
        data: {
          mode: 'edit',
        },
      },
      {
        path: 'tasks/:id',
        loadComponent: () =>
          import('./features/tasks/pages/task-details-page/task-details-page.component').then(
            (m) => m.TaskDetailsPageComponent,
          ),
      },
    ],
  },
];
