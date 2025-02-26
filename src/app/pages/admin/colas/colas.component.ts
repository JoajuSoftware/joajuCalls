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
import { ColasService } from './services/colas.service';
import { Cola } from './interfaces/colas.interface';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-colas',
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
  templateUrl: './colas.component.html',
  styleUrls: ['./colas.component.scss']
})
export class ColasComponent {
  @ViewChild('dt') dt!: Table;
  
  colaForm: FormGroup;
  colaDialog: boolean = false;
  colas = signal<Cola[]>([]);
  cola!: Cola;
  selectedColas: Cola[] | null = null;
  submitted: boolean = false;
  isLoading: boolean = false;
  totalRecords: number = 0;
  rows: number = 10;
  first: number = 0;
  isSubmitting: boolean = false;
  isEditMode: boolean = false;
  currentEditId = '';

  private colasService = inject(ColasService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb: FormBuilder = inject(FormBuilder);
  
  constructor() {
    this.colaForm = this.fb.group({
      service: ['crea_cola', Validators.required],
      cola: ['', Validators.required],
      n_cola: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadColas();
  }

  get colaFormControls(): { [key: string]: AbstractControl } {
    return this.colaForm.controls;
  }

  loadColas() {
    this.isLoading = true;
    this.colasService.getColas().subscribe({
      next: (response) => {
        if (response.err_code === '200') {
          this.colas.set(response.mensaje);
          this.totalRecords = response.mensaje.length;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: typeof response.mensaje === 'string' ? response.mensaje : 'Error al cargar las colas',
            life: 3000
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar colas:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar las colas',
          life: 3000
        });
        this.isLoading = false;
      }
    });
  }

  openNew() {
    this.cola = {} as Cola;
    this.colaForm.patchValue({
      service: 'crea_cola',
      cola: '',
      n_cola: ''
    });
    
    this.submitted = false;
    this.isEditMode = false;
    this.currentEditId = '';
    this.colaDialog = true;
  }

  hideDialog() {
    this.colaDialog = false;
    this.submitted = false;
    this.isEditMode = false;
    this.currentEditId = '';
  }

  editCola(cola: Cola) {
    this.isEditMode = true;
    this.cola = { ...cola };
    this.currentEditId = cola.id || '';
    
    this.colaForm.patchValue({
      service: 'act_cola',
      cola: cola.cola,
      n_cola: cola.n_cola
    });
    
    this.colaDialog = true;
  }

  saveCola() {
    this.submitted = true;
   
    if (this.colaForm.valid) {
      this.isSubmitting = true;
      const formValues = {...this.colaForm.value};
   
      if (formValues.service === 'crea_cola') {
        // Crear nueva cola
        this.colasService.createCola(formValues.cola, formValues.n_cola).pipe(
          finalize(() => this.isSubmitting = false)
        ).subscribe({
          next: (response) => {
            if (response.err_code === "200") {
              const newCola: Cola = {
                id: response.lastId || '',
                cola: formValues.cola,
                n_cola: formValues.n_cola
              };
        
              this.colas.update(currentColas => [newCola, ...currentColas]);
              
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: response.mensaje || 'Cola creada correctamente',
                life: 3000
              });
        
              this.colaDialog = false;
              this.submitted = false;
              this.colaForm.reset({
                service: 'crea_cola'
              });
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: response.mensaje || 'Error al crear la cola',
                life: 3000
              });
            }
          },
          error: (error) => {
            console.error('Error en la petición:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al crear la cola',
              life: 3000
            });
          }
        });
      } else if (formValues.service === 'act_cola') {
        // Actualizar cola existente
        this.colasService.updateCola(this.currentEditId, formValues.cola, formValues.n_cola).pipe(
          finalize(() => this.isSubmitting = false)
        ).subscribe({
          next: (response) => {
            if (response.err_code === "200") {
              this.colas.update(currentColas => {
                return currentColas.map(c => {
                  if (c.id === this.currentEditId) {
                    return {
                      ...c,
                      cola: formValues.cola,
                      n_cola: formValues.n_cola
                    };
                  }
                  return c;
                });
              });
              
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: response.mensaje || 'Cola actualizada correctamente',
                life: 3000
              });
   
              this.colaDialog = false;
              this.submitted = false;
              this.colaForm.reset({
                service: 'crea_cola'
              });
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: response.mensaje || 'Error al actualizar la cola',
                life: 3000
              });
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al actualizar la cola',
              life: 3000
            });
          }
        });
      }
    }
  }

  deleteCola(cola: Cola) {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar la cola ${cola.n_cola}?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.isLoading = true;
        this.colasService.deleteCola(cola.id).pipe(
          finalize(() => this.isLoading = false)
        ).subscribe({
          next: (response) => {
            if (response.err_code === "200") {
              this.colas.update(currentColas => 
                currentColas.filter(c => c.id !== cola.id)
              );
              
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Cola eliminada',
                life: 3000
              });
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: response.mensaje || 'Error al eliminar la cola',
                life: 3000
              });
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar la cola',
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
