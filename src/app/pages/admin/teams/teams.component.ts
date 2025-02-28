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
import { finalize, forkJoin } from 'rxjs';
import { ColasService } from '../colas/services/colas.service';
import { Cola } from '../colas/interfaces/colas.interface';

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
  @ViewChild('dtColas') dtColas!: Table;
  
  teamForm: FormGroup;
  teamDialog: boolean = false;
  colasDialog: boolean = false;
  teams = signal<Team[]>([]);
  availableColas = signal<Cola[]>([]);
  associatedColas = signal<string[]>([]);
  team!: Team;
  selectedTeams: Team[] | null = null;
  submitted: boolean = false;
  isLoading: boolean = false;
  isLoadingColas: boolean = false;
  totalRecords: number = 0;
  rows: number = 10;
  first: number = 0;
  isSubmitting: boolean = false;
  isEditMode: boolean = false;
  currentEditId = '';
  messages: any[] = [];

  private teamsService = inject(TeamsService);
  private colasService = inject(ColasService);
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
        this.teamsService.createTeam(formValues.n_team).pipe(
          finalize(() => this.isSubmitting = false)
        ).subscribe({
          next: (response) => {
            if (response.err_code === "200") {
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

  openColasDialog() {
    this.isLoadingColas = true;
    this.colasDialog = true;
    
    forkJoin({
      allColas: this.colasService.getColas(),
      teamColas: this.teamsService.getTeamColas(this.currentEditId)
    }).subscribe({
      next: (results) => {
        if (results.allColas.err_code === '200') {
          this.availableColas.set(results.allColas.mensaje);
          
          if (results.teamColas.err_code === '200') {
            const associatedColaExtens = results.teamColas.mensaje.map((cola: any) => cola.exten);
            console.log('Colas asociadas:', associatedColaExtens);
            this.associatedColas.set(associatedColaExtens);
          } else {
            this.associatedColas.set([]);
            this.messageService.add({
              severity: 'info',
              summary: 'Info',
              detail: 'Este equipo no tiene colas asociadas',
              life: 3000
            });
          }
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar las colas',
            life: 3000
          });
        }
        this.isLoadingColas = false;
      },
      error: (error) => {
        console.error('Error cargando datos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar las colas',
          life: 3000
        });
        this.isLoadingColas = false;
      }
    });
  }
  
  isColaAssociated(cola: Cola): boolean {
    return this.associatedColas().includes(cola.cola);
  }
  
  addCola(cola: Cola) {
    this.isLoadingColas = true;
    this.teamsService.addColaToTeam(this.currentEditId, cola.cola).subscribe({
      next: (response) => {
        if (response.err_code === '200') {
          this.associatedColas.update(current => [...current, cola.cola]);
          
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Cola ${cola.n_cola} asociada correctamente al equipo`,
            life: 3000
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.mensaje || 'Error al asociar la cola',
            life: 3000
          });
        }
        this.isLoadingColas = false;
      },
      error: (error) => {
        console.error('Error al asociar cola:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al asociar la cola',
          life: 3000
        });
        this.isLoadingColas = false;
      }
    });
  }
  
  removeCola(cola: Cola) {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar la cola ${cola.n_cola} del equipo?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.isLoadingColas = true;
        this.teamsService.removeColaFromTeam(this.currentEditId, cola.cola).subscribe({
          next: (response) => {
            if (response.err_code === '200') {
              this.associatedColas.update(current => 
                current.filter(id => id !== cola.cola)
              );
              
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: `Cola ${cola.n_cola} desasociada correctamente del equipo`,
                life: 3000
              });
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: response.mensaje || 'Error al desasociar la cola',
                life: 3000
              });
            }
            this.isLoadingColas = false;
          },
          error: (error) => {
            console.error('Error al desasociar cola:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al desasociar la cola',
              life: 3000
            });
            this.isLoadingColas = false;
          }
        });
      }
    });
  }
  

  hideColasDialog() {
    this.colasDialog = false;
  }

  applyFilterGlobal(event: any) {
    this.dt?.filterGlobal(event.target.value, 'contains');
  }

  applyColasFilterGlobal(event: any) {
    this.dtColas?.filterGlobal(event.target.value, 'contains');
  }
}
