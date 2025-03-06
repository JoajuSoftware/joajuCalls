import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { UsuariosService } from './services/usuarios.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Usuario } from './interfaces/usuario.interface';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { finalize } from 'rxjs';
import { Agent } from '../agentes/interface/agentes.interface';
import { AgentesService } from '../agentes/service/agentes.service';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-usuarios',
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
    DropdownModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent {
  @ViewChild('dt') dt!: Table;
  
  usuarioForm: FormGroup;
  usuarioDialog: boolean = false;
  agentes: Agent[] = [];
  usuarios: Usuario[] = [];
  usuario!: Usuario;
  selectedUsuarios: Usuario[] | null = null;
  submitted: boolean = false;
  isLoading: boolean = false;
  totalRecords: number = 0;
  rows: number = 10;
  first: number = 0;
  isSubmitting: boolean = false;
  isEditMode: boolean = false;

  private agentesService = inject(AgentesService);
  private usuariosService: UsuariosService = inject(UsuariosService);
  private messageService: MessageService = inject(MessageService);
  private fb: FormBuilder = inject(FormBuilder)

  constructor(
  ) {
    this.usuarioForm = this.fb.group({
      service: ['crea_usuario', Validators.required],
      usuario: ['', Validators.required],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      crea_pass: [''],
      crea_pass2: [''],
      acd_predef: ['4001', Validators.required],
      nro_exten: [''],
      agente: ['']
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private passwordMatchValidator(g: FormGroup) {
    const passControl = g.get('crea_pass');
    const pass2Control = g.get('crea_pass2');
    
    if (!passControl || !pass2Control) return null;
    
    if (g.get('service')?.value === 'act_usuario' && 
        (!passControl.value || passControl.value.length === 0) && 
        (!pass2Control.value || pass2Control.value.length === 0)) {
      return null;
    }
    
    return passControl.value === pass2Control.value
      ? null
      : { 'mismatch': true };
  }

  ngOnInit() {
    this.loadUsuarios();
    this.loadAgentes();
  }

  get usuarioFormControls(): { [key: string]: AbstractControl } {
    return this.usuarioForm.controls;
  }

  loadUsuarios() {
    this.isLoading = true;
    this.usuariosService.getUsuarios().subscribe({
      next: (response) => {
        this.usuarios = Object.values(response.mensaje);
        this.totalRecords = this.usuarios.length;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando usuarios:', error);
        this.isLoading = false;
      }
    });
  }

  loadAgentes() {
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
        
        this.agentes = formattedAgents;
      },
      error: (error) => {
        console.error('Error al obtener agentes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los agentes',
          life: 3000
        });
      }
    });
  }

  openNew() {
    this.usuario = {} as Usuario;

    const nroExtenControl = this.usuarioForm.get('nro_exten');
    if (nroExtenControl) {
      nroExtenControl.clearValidators();
      nroExtenControl.updateValueAndValidity();
    }

    const agenteControl = this.usuarioForm.get('agente');
    if (agenteControl) {
      agenteControl.setValidators([Validators.required]);
      agenteControl.updateValueAndValidity();
    }

    this.usuarioForm.patchValue({
      service: 'crea_usuario',
      usuario: '',
      nombre: '',
      apellido: '',
      crea_pass: '',
      crea_pass2: '',
      acd_predef: '4001',
      nro_exten: this.usuario.nro_exten,
      agente: this.usuario.nro_agente
    });

    const passControl = this.usuarioForm.get('crea_pass');
    const pass2Control = this.usuarioForm.get('crea_pass2');
    
    if (passControl && pass2Control) {
      passControl.setValidators([Validators.required, Validators.minLength(6)]);
      pass2Control.setValidators([Validators.required]);
      passControl.updateValueAndValidity();
      pass2Control.updateValueAndValidity();
    }
    
    this.submitted = false;
    this.usuarioDialog = true;
  }

  hideDialog() {
    this.usuarioDialog = false;
    this.submitted = false;
    this.isEditMode = false;
  }

  editUsuario(usuario: Usuario) {
    this.isEditMode = true;
    this.usuario = { ...usuario };

    const nroExtenControl = this.usuarioForm.get('nro_exten');
    if (nroExtenControl) {
      nroExtenControl.setValidators([Validators.required]);
      nroExtenControl.updateValueAndValidity();
    }
    
    this.usuarioForm.patchValue({
      service: 'act_usuario',
      usuario: usuario.n_usuario,
      nombre: usuario.nom,
      apellido: usuario.ape,
      acd_predef: usuario.acd_predef,
      crea_pass: '',
      crea_pass2: '',
      nro_exten: usuario.nro_exten,
    });

    const passControl = this.usuarioForm.get('crea_pass');
    const pass2Control = this.usuarioForm.get('crea_pass2');
    
    if (passControl && pass2Control) {
      passControl.setValidators([Validators.minLength(6)]);
      pass2Control.clearValidators();
      passControl.updateValueAndValidity();
      pass2Control.updateValueAndValidity();
    }
    
    this.usuarioDialog = true;
  }

  saveUsuario() {
    this.submitted = true;
   
    if (this.usuarioForm.valid) {
      this.isSubmitting = true;
      const formValues = {...this.usuarioForm.value};

      delete formValues.estado;

      const formData = new FormData();

      if (
        (!formValues.crea_pass || formValues.crea_pass.trim() === '') && 
        (!formValues.crea_pass2 || formValues.crea_pass2.trim() === '')
      ) {
        delete formValues.crea_pass;
        delete formValues.crea_pass2;
      }

      if (!this.isEditMode) {
        delete formValues.nro_exten;
        delete formValues.agente;
      } else {
        delete formValues.acd_predef;
      }  
   
      Object.keys(formValues).forEach(key => {
        formData.append(key, formValues[key]);
      });
   
      if (formValues.service === 'crea_usuario') {
        this.usuariosService.createUsuario(formData).pipe(
          finalize(() => this.isSubmitting = false)
        ).subscribe({
          next: (response) => {
            console.log('Respuesta procesada:', response);
        
            if (response.err_code === "200") {
              this.usuarioDialog = false;

              const newUser: Usuario = {
                id_usuario: response.lastId || '',
                n_usuario: formValues.usuario,
                team: "1",
                nro_exten: "0",
                nro_agente: "0",
                nom: formValues.nombre,
                ape: formValues.apellido,
                acd_predef: formValues.acd_predef,
                n_perfil: "admin",
                id_perfil: "1",
                activo: "1",
                id_team: "1"
              };
        
              this.usuarios.unshift(newUser);
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: response.mensaje,
                life: 3000
              });
        
              this.usuarioDialog = false;
              this.submitted = false;
              this.usuarioForm.reset({
                service: 'crea_usuario',
                acd_predef: '4001'
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
              detail: 'Error al crear el usuario',
              life: 3000
            });
          }
        });
      } else if (formValues.service === 'act_usuario') {
        formData.append('id_usuario', this.usuario.id_usuario);
        formData.append('id_perfil', this.usuario.id_perfil);
        formData.append('agente', this.usuario.nro_agente);
        formData.append('nro_exten', formValues.nro_exten);
        formData.append('acd_predef', this.usuario.acd_predef);
   
        this.usuariosService.updateUsuario(formData).pipe(
          finalize(() => this.isSubmitting = false)
        ).subscribe({
          next: (response) => {
            if (response.err_code === "200") {
              const index = this.usuarios.findIndex(u => u.id_usuario === this.usuario.id_usuario);
              if (index !== -1) {
                this.usuarios[index] = {
                  ...this.usuarios[index],
                  n_usuario: formValues.usuario,
                  nom: formValues.nombre,
                  ape: formValues.apellido,
                  acd_predef: formValues.acd_predef,
                  nro_agente: formValues.agente,
                  nro_exten: formValues.nro_exten
                };
              }
              
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: response.mensaje,
                life: 3000
              });
   
              this.usuarioDialog = false;
              this.submitted = false;
              this.usuarioForm.reset({
                service: 'crea_usuario',
                acd_predef: '4001'
              });
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al actualizar el usuario',
              life: 3000
            });
          }
        });
      }
    }
  }

  applyFilterGlobal(event: any) {
    this.dt?.filterGlobal(event.target.value, 'contains');
  }

  onInput(event: Event) {
    const searchValue = (event.target as HTMLInputElement).value;
    this.dt.filterGlobal(searchValue, 'contains');
  }
}
