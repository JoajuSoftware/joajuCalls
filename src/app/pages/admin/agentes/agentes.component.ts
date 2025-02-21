import { Component, signal, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';

// Service and Interface
import { AgentesService } from '../agentes/service/agentes.service';
import { Agent } from '../agentes/interface/agentes.interface';

// Local Types
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
    DropdownModule,
    MessagesModule,
    MessageModule
  ],
  templateUrl: './agentes.component.html',
  styleUrls: ['./agentes.component.scss'],
})
export class AgentesComponent {
  @ViewChild('dt') dt!: Table;

  private agentesService = inject(AgentesService);
  agents = signal<Agent[]>([]);
  dialogVisible = false;
  isEditing = false;
  currentEditId = '';
  messages: any[] = [];

  newAgent = signal<Agent>({
    id: '',
    agente: '',
    nombre: '',
    exten: 0,
    team: '',
    estado: 'Desconectado',
  });

  teams: TeamOption[] = [
    { name: 'Administrador', value: 'administrador' },
    { name: 'Ventas', value: 'ventas' },
    { name: 'Cobranzas', value: 'cobranzas' },
    { name: 'SAC', value: 'SAC' },
    { name: 'Joaju', value: 'Joaju' },
  ];

  constructor() {
    this.getAgentes();
  }

  getAgentes() {
    this.agentesService.getAgentes().subscribe({
      next: (response) => {
        console.log('Respuesta original:', response);
        const formattedAgents = response.mensaje.map((agent) => ({
          id: agent.id,
          agente: agent.agente,
          nombre: agent.nombre,
          exten: Number(agent.exten),
          team: agent.team,
          estado: agent.estado,
        }));
        console.log('Agentes formateados:', formattedAgents);
        this.agents.set(formattedAgents);
      },
      error: (error) => {
        console.error('Error al obtener agentes:', error);
        this.messages = [
          { severity: 'error', summary: 'Error', detail: 'Error al obtener los agentes' }
        ];
      },
    });
  }

  applyFilterGlobal(event: any) {
    this.dt?.filterGlobal(event.target.value, 'contains');
  }

  showCreateDialog() {
    this.isEditing = false;
    this.currentEditId = '';
    this.newAgent.set({
      id: '',
      agente: '',
      nombre: '',
      exten: 0,
      team: '',
      estado: 'Desconectado',
    });
    this.dialogVisible = true;
    this.messages = [];
  }

  hideDialog() {
    this.dialogVisible = false;
    this.isEditing = false;
    this.currentEditId = '';
    this.newAgent.set({
      id: '',
      agente: '',
      nombre: '',
      exten: 0,
      team: '',
      estado: 'Desconectado',
    });
    this.messages = [];
  }

  editAgent(agent: Agent) {
    this.isEditing = true;
    this.currentEditId = agent.id || '';
    this.newAgent.set({
      id: agent.id,
      agente: agent.agente,
      nombre: agent.nombre,
      exten: agent.exten,
      team: agent.team,
      estado: agent.estado
    });
    this.dialogVisible = true;
    this.messages = [];
  }

  saveAgent() {
    const agent = this.newAgent();

    if (agent.agente && agent.nombre && agent.team) {
      if (this.isEditing) {
        const updateData = {
          service: 'update_agente',
          n_agente: agent.agente,
          des_agente: agent.nombre,
          id_agente: this.currentEditId,
          team: agent.team
        };

        this.agentesService.updateAgent(updateData).subscribe({
          next: (response) => {
            console.log('Respuesta:', response);
            if (response.err_code === '200') {
              this.messages = [
                { severity: 'success', summary: 'Éxito', detail: 'Agente actualizado correctamente' }
              ];
              this.hideDialog();
              this.getAgentes();
            } else if (response.err_code === '401') {
              this.messages = [
                { severity: 'error', summary: 'Error', detail: 'El agente no existe' }
              ];
              this.getAgentes();
            } else {
              this.messages = [
                { severity: 'error', summary: 'Error', detail: response.mensaje }
              ];
            }
          },
          error: (error) => {
            console.error('Error al actualizar agente:', error);
            this.messages = [
              { severity: 'error', summary: 'Error', detail: 'Error al actualizar el agente' }
            ];
            this.getAgentes();
          }
        });
      } else {
        const createData = {
          service: 'add_agente',
          n_agente: agent.agente,
          des_agente: agent.nombre,
          team: agent.team
        };

        this.agentesService.createAgent(createData).subscribe({
          next: (response) => {
            console.log('Respuesta:', response);
            if (response.err_code === '200') {
              this.messages = [
                { severity: 'success', summary: 'Éxito', detail: 'Agente creado correctamente' }
              ];
              this.hideDialog();
              this.getAgentes();
            } else {
              this.messages = [
                { severity: 'error', summary: 'Error', detail: response.mensaje }
              ];
            }
          },
          error: (error) => {
            console.error('Error al crear agente:', error);
            this.messages = [
              { severity: 'error', summary: 'Error', detail: 'Error al crear el agente' }
            ];
          }
        });
      }
    }
  }

  deleteAgent(agent: Agent) {
    this.agents.update((currentAgents) =>
      currentAgents.filter((a) => a.agente !== agent.agente)
    );
  }
}
