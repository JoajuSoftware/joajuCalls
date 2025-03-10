import { Component, signal, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';

// PrimeNG Imports
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';

// Service and Interface
import { AgentesService } from './service/agentes.service';
import { Agent } from './interface/agentes.interface';
import { finalize } from 'rxjs';
import { TeamsService } from '../teams/service/teams.service';
import { Team, TeamResponse } from '../teams/interface/teams.interface';
import { ManageQueueComponent } from "./components/manage-queue/manage-queue.component";

@Component({
  selector: 'app-agentes',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    DialogModule,
    ButtonModule,
    ToastModule,
    ToolbarModule,
    ConfirmDialogModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    ProgressSpinnerModule,
    MessagesModule,
    MessageModule,
    TooltipModule,
    TagModule,
    SelectModule,
    ManageQueueComponent
],
  providers: [MessageService, ConfirmationService],
  templateUrl: './agentes.component.html',
  styleUrls: ['./agentes.component.scss'],
})
export class AgentesComponent {
  @ViewChild('dt') dt!: Table;
  
  agentForm: FormGroup;
  agentDialog: boolean = false;
  agents = signal<Agent[]>([]);
  agent!: Agent;
  selectedAgents: Agent[] | null = null;
  submitted: boolean = false;
  isLoading: boolean = false;
  totalRecords: number = 0;
  rows: number = 10;
  first: number = 0;
  isSubmitting: boolean = false;
  isEditMode: boolean = false;
  currentEditId = '';
  teams: Team[] = [];
  showQueueTable: boolean = false;

  private agentesService = inject(AgentesService);
  private messageService = inject(MessageService);
  private fb: FormBuilder = inject(FormBuilder);
  private teamsService: TeamsService = inject(TeamsService);
  
  constructor() {
    this.agentForm = this.fb.group({
      service: ['crea_agente', Validators.required],
      agente: ['', Validators.required],
      nombre: ['', Validators.required],
      exten: ['', Validators.required],
      team: ['', Validators.required],
      estado: ['Desconectado', Validators.required]
    });
  }

  ngOnInit() {
    this.loadAgentes();
    this.getTeams();
  }

  get agentFormControls(): { [key: string]: AbstractControl } {
    return this.agentForm.controls;
  }

  getTeams():void {

    this.teamsService.getTeams().subscribe({
      next: (response) => {
        this.teams = response.mensaje;
      },
      error: (error) => {
        console.error('Error al obtener los teams:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los teams',
          life: 3000
        });
      }
    });

  }

  loadAgentes() {
    this.isLoading = true;
    this.agentesService.getAgentes().subscribe({
      next: (response) => {
        const formattedAgents = response.mensaje.map((agent) => ({
          id: agent.id,
          agente: agent.agente,
          nombre: agent.nombre,
          exten: Number(agent.exten),
          team: agent.team,
          estado: agent.estado,
        }));
        
        this.agents.set(formattedAgents);
        this.totalRecords = formattedAgents.length;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener agentes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los agentes',
          life: 3000
        });
        this.isLoading = false;
      }
    });
  }

  openNew() {
    this.agent = {} as Agent;
    this.agentForm.patchValue({
      service: 'crea_agente',
      agente: '',
      nombre: '',
      exten: '',
      team: '',
      estado: 'Desconectado'
    });
    
    this.submitted = false;
    this.isEditMode = false;
    this.currentEditId = '';
    this.agentDialog = true;
  }

  hideDialog() {
    this.agentDialog = false;
    this.submitted = false;
    this.isEditMode = false;
    this.currentEditId = '';
  }

  editAgent(agent: Agent) {
    this.isEditMode = true;
    this.agent = { ...agent };
    this.currentEditId = agent.id || '';
    
    this.agentForm.patchValue({
      service: 'act_agente',
      agente: agent.agente,
      nombre: agent.nombre,
      exten: agent.exten,
      team: agent.team,
      estado: agent.estado
    });
    
    this.agentDialog = true;
  }

  saveAgent() {
    this.submitted = true;
   
    if (this.agentForm.valid) {
      this.isSubmitting = true;
      const formValues = {...this.agentForm.value};
      const formData = new FormData();
   
      Object.keys(formValues).forEach(key => {
        formData.append(key, formValues[key]);
      });
   
      if (formValues.service === 'crea_agente') {
        this.agentesService.createAgent(formData).pipe(
          finalize(() => this.isSubmitting = false)
        ).subscribe({
          next: (response) => {
            if (response.err_code === "200") {
              const newAgent: Agent = {
                id: response.lastId || '',
                agente: formValues.agente,
                nombre: formValues.nombre,
                exten: formValues.exten,
                team: formValues.team,
                estado: formValues.estado
              };
        
              this.agents.update(currentAgents => [newAgent, ...currentAgents]);
              
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: response.mensaje,
                life: 3000
              });
        
              this.agentDialog = false;
              this.submitted = false;
              this.agentForm.reset({
                service: 'crea_agente',
                estado: 'Desconectado'
              });
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: response.mensaje,
                life: 3000
              });
            }
          },
          error: (error) => {
            console.error('Error en la petición:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al crear el agente',
              life: 3000
            });
          }
        });
      } else if (formValues.service === 'act_agente') {
        formData.append('id', this.currentEditId);
   
        this.agentesService.updateAgent(formData).pipe(
          finalize(() => this.isSubmitting = false)
        ).subscribe({
          next: (response) => {
            if (response.err_code === "200") {
              this.agents.update(currentAgents => {
                return currentAgents.map(a => {
                  if (a.id === this.currentEditId) {
                    return {
                      ...a,
                      agente: formValues.agente,
                      nombre: formValues.nombre,
                      exten: formValues.exten,
                      team: formValues.team,
                      estado: formValues.estado
                    };
                  }
                  return a;
                });
              });
              
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: response.mensaje,
                life: 3000
              });
   
              this.agentDialog = false;
              this.submitted = false;
              this.agentForm.reset({
                service: 'crea_agente',
                estado: 'Desconectado'
              });
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: response.mensaje,
                life: 3000
              });
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al actualizar el agente',
              life: 3000
            });
          }
        });
      }
    }
  }

  // deleteAgent(agent: Agent) {
  //   this.confirmationService.confirm({
  //     message: `¿Está seguro de eliminar al agente ${agent.nombre}?`,
  //     header: 'Confirmar',
  //     icon: 'pi pi-exclamation-triangle',
  //     accept: () => {
  //       this.isLoading = true;
  //       this.agentesService.deleteAgent(agent.id).pipe(
  //         finalize(() => this.isLoading = false)
  //       ).subscribe({
  //         next: (response) => {
  //           if (response.err_code === "200") {
  //             this.agents.update(currentAgents => 
  //               currentAgents.filter(a => a.id !== agent.id)
  //             );
              
  //             this.messageService.add({
  //               severity: 'success',
  //               summary: 'Éxito',
  //               detail: 'Agente eliminado',
  //               life: 3000
  //             });
  //           } else {
  //             this.messageService.add({
  //               severity: 'error',
  //               summary: 'Error',
  //               detail: response.mensaje,
  //               life: 3000
  //             });
  //           }
  //         },
  //         error: (error) => {
  //           this.messageService.add({
  //             severity: 'error',
  //             summary: 'Error',
  //             detail: 'Error al eliminar el agente',
  //             life: 3000
  //           });
  //         }
  //       });
  //     }
  //   });
  // }

  applyFilterGlobal(event: any) {
    this.dt?.filterGlobal(event.target.value, 'contains');
  }

  onInput(event: Event) {
    const searchValue = (event.target as HTMLInputElement).value;
    this.dt.filterGlobal(searchValue, 'contains');
  }
  selectedAgent!: Agent; 
  manageQueue(agent: Agent) {
    this.showQueueTable = true;
    this.selectedAgent = agent;
    

  }

}
