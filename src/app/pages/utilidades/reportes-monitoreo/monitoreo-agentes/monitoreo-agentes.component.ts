import { Component, OnInit, inject, signal } from '@angular/core';

import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

import { AgentesService } from '../../../admin/agentes/service/agentes.service';
import { AgentResponse } from '../../../admin/agentes/interface/agentes.interface';

@Component({
  selector: 'app-monitoreo-agentes',
  imports: [TableModule, TagModule, ButtonModule],
  templateUrl: './monitoreo-agentes.component.html',
  styleUrl: './monitoreo-agentes.component.scss'
})
export class MonitoreoAgentesComponent implements OnInit {

  private agentService: AgentesService = inject(AgentesService);

  agents = signal<AgentResponse[]>([]);
  headers = signal<string[]>([]);

  ngOnInit(): void {

    this.getAgents();
    this.headers.set(['ID', 'Nombre', 'Agente', 'Extensión', 'Team', 'Estado']);


  }

  getAgents() {

    const response = this.agentService.getAgentes().subscribe({
      next: (data) => {
        console.log(data);
        this.agents.set(data.mensaje);
      },
      error: (err) => {
        console.log(err);
      }, 
      complete: () => {
        console.log('complete');
        response.unsubscribe();
      }
    })

  }


}
