import { Routes } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';

import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './Interceptors/auth.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginGuard } from './Interceptors/login.guard';
import { FilesComponent } from './components/files/files.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ProfileComponent } from './components/profile/profile.component';
import { RegisterComponent } from './components/register/register.component';
import { ActivsuccesComponent } from './components/activsucces/activsucces.component';
import { CheckEmailComponent } from './components/check-email/check-email.component';


export const routes: Routes = [
  
  {
    path: 'login',
    component: LoginComponent,
    //canActivate: [LoginGuard]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'file-manager',
    component: FilesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'chat',
    component: ChatComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AuthGuard]
  },
  {
    path:'register',
    component : RegisterComponent
  },
  {
    path:'activation-success',
    component: ActivsuccesComponent
  },
  {
    path:'check-email',
    component: CheckEmailComponent
  }
];
