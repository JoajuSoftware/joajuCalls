import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
// import { DashboardComponent } from './dashboard/dashboard.component';
// import { authGuard } from './guards/auth.guard';
// import { HomeComponent } from './home/home.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: "login",
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent
    },
    // {
    //     path: '',
    //     component: DashboardComponent,
    //     canActivate: [authGuard],
    //     children: [
    //         { path: '', component: HomeComponent },
    //     ]
    // }
];
