import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UsuariosComponent } from './pages/admin/usuarios/usuarios.component';
import { ColasComponent } from './pages/admin/colas/colas.component';
import { AgentesComponent } from './pages/admin/agentes/agentes.component';
import { TeamsComponent } from './pages/admin/teams/teams.component';
import { ConsolaComponent } from './pages/callcenter/consola/consola.component';
import { CallDetalleComponent } from './pages/utilidades/reportes-historicos/call-detalle/call-detalle.component';
import { ResumenPorAgenteComponent } from './pages/utilidades/reportes-historicos/resumen-por-agente/resumen-por-agente.component';
import { ResumenPorColaComponent } from './pages/utilidades/reportes-historicos/resumen-por-cola/resumen-por-cola.component';
import { ConexionAgentesComponent } from './pages/utilidades/reportes-historicos/conexion-agentes/conexion-agentes.component';
import { MonitoreoAgentesComponent } from './pages/utilidades/reportes-monitoreo/monitoreo-agentes/monitoreo-agentes.component';
import { MonitoreoPorColaComponent } from './pages/utilidades/reportes-monitoreo/monitoreo-por-cola/monitoreo-por-cola.component';
import { ListarCarterasComponent } from './pages/utilidades/preview/listar-carteras/listar-carteras.component';
import { CrearCarteraComponent } from './pages/utilidades/preview/crear-cartera/crear-cartera.component';


export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      // Redirige a Dashboard
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },

      //SECCION ADMIN
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
      //SECCION CALLCENTER
      {
        path: 'callcenter',
        children: [
          {path:'consola', component: ConsolaComponent}
        ]
      },

      //SECCION UTILIDADES
      {
        path: 'utilidades',
        children: [
          //REPORTES HISTORICOS
          { path: 'reportes-historicos/call-detalle', component: CallDetalleComponent },
          { path: 'reportes-historicos/resumen-por-agente', component: ResumenPorAgenteComponent },
          { path: 'reportes-historicos/resumen-por-cola', component: ResumenPorColaComponent },
          { path: 'reportes-historicos/conexion-agentes', component: ConexionAgentesComponent },

           // REPORTES MONITOREO
          { path: 'reportes-monitoreo/monitoreo-agentes', component: MonitoreoAgentesComponent },
          { path: 'reportes-monitoreo/monitoreo-por-cola', component: MonitoreoPorColaComponent },

          //PREVIEW
          { path: 'preview/listar-carteras', component: ListarCarterasComponent },
          { path: 'preview/crear-cartera', component: CrearCarteraComponent }
        ],

      },

    ],
  },
  // Si pones una URL incorrecta, te lleva a `/dashboard`
  { path: '**', redirectTo: '' },
];
