// agentes.component.ts
import { Component, signal, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Agent } from '../agentes/interface/agentes.interface';
import { AgentesService } from '../agentes/service/agentes.service';

// PrimeNG Imports
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';

interface TeamOption {
  name: string;
  value: string;
}

@Component({
  selector: 'app-agentes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    TooltipModule,
    DropdownModule
  ],
  templateUrl: './agentes.component.html',
  styleUrl: './agentes.component.scss'
})
export class AgentesComponent {
  @ViewChild('dt') dt!: Table;

  private agentesService = inject(AgentesService);
  agents = signal<Agent[]>([]);
  dialogVisible = false;

  newAgent = signal<Agent>({
    agente: '',
    nombre: '',
    exten: 0,
    team: '',
    estado: 'Desconectado'
  });

  teams: TeamOption[] = [
    { name: 'Administrador', value: 'administrador' },
    { name: 'Ventas', value: 'ventas' },
    { name: 'Cobranzas', value: 'cobranzas' },
    { name: 'SAC', value: 'SAC' },
    { name: 'Joaju', value: 'Joaju' }
  ];

  constructor() {
    this.getAgentes();
  }

  getAgentes() {
    this.agentesService.getAgentes().subscribe({
      next: (response) => {
        console.log('Respuesta original:', response);
        const formattedAgents = response.mensaje.map(agent => ({
          agente: agent.agente,
          nombre: agent.nombre,
          exten: Number(agent.exten),
          team: agent.team,
          estado: agent.estado
        }));
        console.log('Agentes formateados:', formattedAgents);
        this.agents.set(formattedAgents);
      },
      error: (error) => {
        console.error('Error al obtener agentes:', error);
      }
    });
  }

  applyFilterGlobal(event: any) {
    this.dt?.filterGlobal(event.target.value, 'contains');
  }

  showCreateDialog() {
    this.newAgent.set({
      agente: '',
      nombre: '',
      exten: 0,
      team: '',
      estado: 'Desconectado'
    });
    this.dialogVisible = true;
  }

  hideDialog() {
    this.dialogVisible = false;
  }

  saveAgent() {
    const agent = this.newAgent();
    if (agent.agente && agent.nombre && agent.team) {
      this.agents.update(currentAgents => [...currentAgents, agent]);
      this.hideDialog();
    }
  }

  editAgent(agent: Agent) {
    console.log('Editar agente', agent);
  }

  deleteAgent(agent: Agent) {
    this.agents.update(currentAgents =>
      currentAgents.filter(a => a.agente !== agent.agente)
    );
  }
}
