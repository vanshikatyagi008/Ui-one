
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { CustomerDashboard } from './customer/dashboard/customer-dashboard/customer-dashboard';
import { Retailerdashboard } from './retailer/dashboard/retailerdashboard/retailerdashboard';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { Home } from './pages/home/home/home';


export const routes: Routes = [
{path:'', component:CustomerDashboard, pathMatch:'full'},
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  

  {
    path: 'retailer',
    component: Retailerdashboard,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'Retailer' }
  },

  { path: '**', redirectTo: 'home', pathMatch: 'full' }
];
