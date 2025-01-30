import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UsuariosComponent } from './pages/admin/usuarios/usuarios.component';
import { ColasComponent } from './pages/admin/colas/colas.component';
import { AgentesComponent } from './pages/admin/agentes/agentes.component';
import { TeamsComponent } from './pages/admin/teams/teams.component';
import { ConsolaComponent } from './pages/callcenter/consola/consola.component';
import { ReporteHistoricoComponent } from './pages/utilidades/reporte-historico/reporte-historico.component';
import { ReporteMonitoreosComponent } from './pages/utilidades/reporte-monitoreos/reporte-monitoreos.component';
import { PreviewComponent } from './pages/utilidades/preview/preview.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      // Redirige a Dashboard
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },

      {
        path: 'admin',
        children: [
          { path: 'usuarios', component: UsuariosComponent },
          { path: 'colas', component: ColasComponent },
          { path: 'agentes', component: AgentesComponent },
          { path: 'teams', component: TeamsComponent },
          // Si entras a `/admin`, te lleva a `/admin/usuarios`
          { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
        ],
      },
      {
        path: 'callcenter',
        children: [
          {path:'consola', component: ConsolaComponent}
        ]
      },
      {
        path: 'utilidades',
        children: [
          {path: 'reportehistorico', component: ReporteHistoricoComponent},
          {path: 'reportemonitoreos', component: ReporteMonitoreosComponent},
          {path: 'preview', component: PreviewComponent}
        ]
      }
    ],
  },
  // Si pones una URL incorrecta, te lleva a `/dashboard`
  { path: '**', redirectTo: '' },
];
