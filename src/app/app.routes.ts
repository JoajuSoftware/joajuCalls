import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UsuariosComponent } from './pages/admin/usuarios/usuarios.component';
import { ColasComponent } from './pages/admin/colas/colas.component';
import { AgentesComponent } from './pages/admin/agentes/agentes.component';
import { TeamsComponent } from './pages/admin/teams/teams.component';
import { CallDetalleComponent } from './pages/utilidades/reportes-historicos/call-detalle/call-detalle.component';
import { ResumenPorAgenteComponent } from './pages/utilidades/reportes-historicos/resumen-por-agente/resumen-por-agente.component';
import { ResumenPorColaComponent } from './pages/utilidades/reportes-historicos/resumen-por-cola/resumen-por-cola.component';
import { ConexionAgentesComponent } from './pages/utilidades/reportes-historicos/conexion-agentes/conexion-agentes.component';
import { MonitoreoAgentesComponent } from './pages/utilidades/reportes-monitoreo/monitoreo-agentes/monitoreo-agentes.component';
import { MonitoreoPorColaComponent } from './pages/utilidades/reportes-monitoreo/monitoreo-por-cola/monitoreo-por-cola.component';
import { ListarCarterasComponent } from './pages/utilidades/preview/listar-carteras/listar-carteras.component';
import { CrearCarteraComponent } from './pages/utilidades/preview/crear-cartera/crear-cartera.component';

import { LoginComponent } from './auth/login/login.component';
import { authGuard } from './guards/auth.guard';
import { AgentDashboardComponent } from './pages/callcenter/agent-interface/agent-dashboard/agent-dashboard.component';
import { LoginAgentComponent } from './pages/callcenter/login-agent/login-agent.component';
import { loginAgentGuard } from './guards/loginAgent.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [roleGuard],
        data: { requiredRole: ['admin', 'supervisor'] }
      },

      // SECCIÓN ADMIN
      {
        path: 'admin',
        children: [
          { path: 'usuarios', component: UsuariosComponent },
          { path: 'colas', component: ColasComponent },
          { path: 'agentes', component: AgentesComponent },
          { path: 'teams', component: TeamsComponent },
          { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
        ],
        canActivate: [roleGuard],
        data: { requiredRole: ['admin', 'supervisor'] }
      },

      // SECCIÓN CALLCENTER
      {
        path: 'loginAgent',
        component: LoginAgentComponent
      },
      {
        path: 'callcenter',
        canActivate: [loginAgentGuard],
        children: [
          { path: 'dashboard', component: AgentDashboardComponent },
        ],
      },

      // SECCIÓN UTILIDADES
      {
        path: 'utilidades',
        children: [
          // REPORTES HISTÓRICOS
          { path: 'reportes-historicos/call-detalle', component: CallDetalleComponent },
          { path: 'reportes-historicos/resumen-por-agente', component: ResumenPorAgenteComponent },
          { path: 'reportes-historicos/resumen-por-cola', component: ResumenPorColaComponent },
          { path: 'reportes-historicos/conexion-agentes', component: ConexionAgentesComponent },

          // REPORTES MONITOREO
          { path: 'reportes-monitoreo/monitoreo-agentes', component: MonitoreoAgentesComponent },
          { path: 'reportes-monitoreo/monitoreo-por-cola', component: MonitoreoPorColaComponent },

          // PREVIEW
          { path: 'preview/listar-carteras', component: ListarCarterasComponent },
          { path: 'preview/crear-cartera', component: CrearCarteraComponent }
        ],
        canActivate: [roleGuard],
        data: { requiredRole: ['admin', 'supervisor'] }
      },
    ],
  },
  // Redirección si la URL no existe
  { path: '**', redirectTo: 'login' }
];
