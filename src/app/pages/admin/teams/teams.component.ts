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

// Service and Interfaces
import { TeamsService } from './service/teams.service';
import { Team } from './interface/teams.interface';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-teams',
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
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss']
})
export class TeamsComponent {
  @ViewChild('dt') dt!: Table;
  
  teamForm: FormGroup;
  teamDialog: boolean = false;
  teams = signal<Team[]>([]);
  team!: Team;
  selectedTeams: Team[] | null = null;
  submitted: boolean = false;
  isLoading: boolean = false;
  totalRecords: number = 0;
  rows: number = 10;
  first: number = 0;
  isSubmitting: boolean = false;
  isEditMode: boolean = false;
  currentEditId = '';
  messages: any[] = [];

  private teamsService = inject(TeamsService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb: FormBuilder = inject(FormBuilder);
  
  constructor() {
    this.teamForm = this.fb.group({
      service: ['crea_team', Validators.required],
      n_team: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadTeams();
  }

  get teamFormControls(): { [key: string]: AbstractControl } {
    return this.teamForm.controls;
  }

  loadTeams() {
    this.isLoading = true;
    this.teamsService.getTeams().subscribe({
      next: (response) => {
        if (response.err_code === '200') {
          this.teams.set(response.mensaje);
          this.totalRecords = response.mensaje.length;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: typeof response.mensaje === 'string' ? response.mensaje : 'Error al cargar los equipos',
            life: 3000
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar equipos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los equipos',
          life: 3000
        });
        this.isLoading = false;
      }
    });
  }

  openNew() {
    this.team = {} as Team;
    this.teamForm.patchValue({
      service: 'crea_team',
      n_team: ''
    });
    
    this.submitted = false;
    this.isEditMode = false;
    this.currentEditId = '';
    this.teamDialog = true;
  }

  hideDialog() {
    this.teamDialog = false;
    this.submitted = false;
    this.isEditMode = false;
    this.currentEditId = '';
  }

  editTeam(team: Team) {
    this.isEditMode = true;
    this.team = { ...team };
    this.currentEditId = team.id_team || '';
    
    this.teamForm.patchValue({
      service: 'act_team',
      n_team: team.n_team
    });
    
    this.teamDialog = true;
  }

  saveTeam() {
    this.submitted = true;
   
    if (this.teamForm.valid) {
      this.isSubmitting = true;
      const formValues = {...this.teamForm.value};
   
      if (formValues.service === 'crea_team') {
        // Adaptar al formato que espera el servicio
        this.teamsService.createTeam(formValues.n_team).pipe(
          finalize(() => this.isSubmitting = false)
        ).subscribe({
          next: (response) => {
            if (response.err_code === "200") {
              // Asumiendo que el servicio devuelve el ID del nuevo equipo en lastId
              const newTeam: Team = {
                id_team: response.lastId || '',
                n_team: formValues.n_team
              };
        
              this.teams.update(currentTeams => [newTeam, ...currentTeams]);
              
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: response.mensaje || 'Equipo creado correctamente',
                life: 3000
              });
        
              this.teamDialog = false;
              this.submitted = false;
              this.teamForm.reset({
                service: 'crea_team'
              });
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: response.mensaje || 'Error al crear el equipo',
                life: 3000
              });
            }
          },
          error: (error) => {
            console.error('Error en la petición:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al crear el equipo',
              life: 3000
            });
          }
        });
      } else if (formValues.service === 'act_team') {
        // Adaptar al formato que espera el servicio para actualizar
        this.teamsService.updateTeam(this.currentEditId, formValues.n_team).pipe(
          finalize(() => this.isSubmitting = false)
        ).subscribe({
          next: (response) => {
            if (response.err_code === "200") {
              this.teams.update(currentTeams => {
                return currentTeams.map(t => {
                  if (t.id_team === this.currentEditId) {
                    return {
                      ...t,
                      n_team: formValues.n_team
                    };
                  }
                  return t;
                });
              });
              
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: response.mensaje || 'Equipo actualizado correctamente',
                life: 3000
              });
   
              this.teamDialog = false;
              this.submitted = false;
              this.teamForm.reset({
                service: 'crea_team'
              });
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: response.mensaje || 'Error al actualizar el equipo',
                life: 3000
              });
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al actualizar el equipo',
              life: 3000
            });
          }
        });
      }
    }
  }

  deleteTeam(team: Team) {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el equipo ${team.n_team}?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.isLoading = true;
        this.teamsService.deleteTeam(team.id_team).pipe(
          finalize(() => this.isLoading = false)
        ).subscribe({
          next: (response) => {
            if (response.err_code === "200") {
              this.teams.update(currentTeams => 
                currentTeams.filter(t => t.id_team !== team.id_team)
              );
              
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Equipo eliminado',
                life: 3000
              });
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: response.mensaje || 'Error al eliminar el equipo',
                life: 3000
              });
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar el equipo',
              life: 3000
            });
          }
        });
      }
    });
  }

  applyFilterGlobal(event: any) {
    this.dt?.filterGlobal(event.target.value, 'contains');
  }

  onInput(event: Event) {
    const searchValue = (event.target as HTMLInputElement).value;
    this.dt.filterGlobal(searchValue, 'contains');
  }
}
