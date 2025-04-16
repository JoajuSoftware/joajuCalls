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
import { CheckboxModule } from 'primeng/checkbox';
import { Agent } from '../agentes/interface/agentes.interface';
import { AgentesService } from '../agentes/service/agentes.service';
import { DropdownModule } from 'primeng/dropdown';
import { Cola } from '../colas/interfaces/colas.interface';
import { ColasService } from '../colas/services/colas.service';
import { TeamsService } from '../teams/service/teams.service';
import { Team } from '../teams/interface/teams.interface';
import { toast } from 'ngx-sonner';

interface Perfil {
  id_perfil: string;
  n_perfil: string;
}

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
    DropdownModule,
    CheckboxModule
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
  colas: Cola[] = [];
  teams: Team[] = [];
  perfiles: Perfil[] = [
    { id_perfil: "1", n_perfil: "admin" },
    { id_perfil: "3", n_perfil: "agente" },
    { id_perfil: "2", n_perfil: "supervisor" }
  ];
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

  private colasService = inject(ColasService);
  private agentesService = inject(AgentesService);
  private teamsService = inject(TeamsService);
  private usuariosService: UsuariosService = inject(UsuariosService);
  private messageService: MessageService = inject(MessageService);
  private fb: FormBuilder = inject(FormBuilder);

  constructor() {
    this.usuarioForm = this.fb.group({
      service: ['crea_usuario', Validators.required],
      usuario: ['', Validators.required],
      id_usuario: [''],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      crea_pass: [''],
      crea_pass2: [''],
      acd_predef: ['4001', Validators.required],
      nro_exten: [''],
      agente: [''],
      id_team: ['', Validators.required],
      id_perfil: ['', Validators.required],
      activo: [true]
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
    this.loadColas();
    this.loadTeams();
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
        toast.error('Error al cargar los usuarios');
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
        toast.error('Error al cargar los agentes');
      }
    });
  }

  loadColas() {
    this.colasService.getColas().subscribe({
      next: (response) => {
        if (response.err_code === '200') {
          this.colas = response.mensaje.map(cola => ({
            ...cola,
            displayName: `${cola.cola} - ${cola.n_cola}`
          }));
        } else {
          toast.error('Error al cargar las colas');
        }
      },
      error: (error) => {
        console.error('Error al obtener colas:', error);
        toast.error('Error al cargar las colas');
      }
    });
  }

  loadTeams() {
    this.teamsService.getTeams().subscribe({
      next: (response) => {
        if (response.err_code === '200') {
          this.teams = response.mensaje;
        } else {
          toast.error('Error al cargar los equipos');
        }
      },
      error: (error) => {
        console.error('Error al obtener equipos:', error);
        toast.error('Error al cargar los equipos');
      }
    });
  }

  openNew() {
    this.usuario = {} as Usuario;
    this.isEditMode = false;

    const nroExtenControl = this.usuarioForm.get('nro_exten');
    if (nroExtenControl) {
      nroExtenControl.clearValidators();
      nroExtenControl.updateValueAndValidity();
    }

    const agenteControl = this.usuarioForm.get('agente');
    if (agenteControl) {
      agenteControl.clearValidators();
      agenteControl.updateValueAndValidity();
    }

    this.usuarioForm.patchValue({
      service: 'crea_usuario',
      usuario: '',
      id_usuario: '',
      nombre: '',
      apellido: '',
      crea_pass: '',
      crea_pass2: '',
      acd_predef: '4001',
      nro_exten: '',
      agente: '',
      id_team: '',
      id_perfil: '',
      activo: true
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

    const activoValue = usuario.activo === '1';
    
    this.usuarioForm.patchValue({
      service: 'act_usuario',
      usuario: usuario.n_usuario,
      id_usuario: usuario.id_usuario,
      nombre: usuario.nom,
      apellido: usuario.ape,
      acd_predef: usuario.acd_predef,
      crea_pass: '',
      crea_pass2: '',
      nro_exten: usuario.nro_exten,
      agente: usuario.nro_agente,
      id_team: usuario.id_team,
      id_perfil: usuario.id_perfil,
      activo: activoValue
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

      formValues.activo = formValues.activo ? '1' : '0';

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
      }
   
      Object.keys(formValues).forEach(key => {
        if (formValues[key] !== null && formValues[key] !== undefined) {
          formData.append(key, formValues[key]);
        }
      });
   
      if (formValues.service === 'crea_usuario') {
        this.usuariosService.createUsuario(formData).pipe(
          finalize(() => this.isSubmitting = false)
        ).subscribe({
          next: (response) => {
            if (response.err_code === "200") {
              const teamNombre = this.teams.find(t => t.id_team === formValues.id_team)?.n_team || '';
              const perfilNombre = this.perfiles.find(p => p.id_perfil === formValues.id_perfil)?.n_perfil || '';

              const newUser: Usuario = {
                id_usuario: response.lastId || '',
                n_usuario: formValues.usuario,
                team: teamNombre,
                nro_exten: "0",
                nro_agente: "0",
                nom: formValues.nombre,
                ape: formValues.apellido,
                acd_predef: formValues.acd_predef,
                n_perfil: perfilNombre,
                id_perfil: formValues.id_perfil,
                activo: formValues.activo,
                id_team: formValues.id_team
              };
        
              this.usuarios.unshift(newUser);
              toast.success(response.mensaje || 'Usuario creado correctamente', {
                duration: 3000,
              });
        
              this.usuarioDialog = false;
              this.submitted = false;
              this.usuarioForm.reset({
                service: 'crea_usuario',
                acd_predef: '4001',
                activo: true
              });
            } else {
              toast.error(response.mensaje || 'Error al crear el usuario', {
                description: response.mensaje || 'Error al crear el usuario',
                duration: 3000,
              });
            }
          },
          error: (error) => {
            console.error('Error en la petición:', error);
            toast.error('Error al crear el usuario');
          }
        });
      } else if (formValues.service === 'act_usuario') {
        formData.append('id_usuario', this.usuario.id_usuario);
   
        this.usuariosService.updateUsuario(formData).pipe(
          finalize(() => this.isSubmitting = false)
        ).subscribe({
          next: (response) => {
            if (response.err_code === "200") {
              const teamNombre = this.teams.find(t => t.id_team === formValues.id_team)?.n_team || '';
              const perfilNombre = this.perfiles.find(p => p.id_perfil === formValues.id_perfil)?.n_perfil || '';
              
              const index = this.usuarios.findIndex(u => u.id_usuario === this.usuario.id_usuario);
              if (index !== -1) {
                this.usuarios[index] = {
                  ...this.usuarios[index],
                  n_usuario: formValues.usuario,
                  nom: formValues.nombre,
                  ape: formValues.apellido,
                  acd_predef: formValues.acd_predef,
                  nro_agente: formValues.agente,
                  nro_exten: formValues.nro_exten,
                  id_team: formValues.id_team,
                  team: teamNombre,
                  id_perfil: formValues.id_perfil,
                  n_perfil: perfilNombre,
                  activo: formValues.activo
                };
              }
              
              toast.success(response.mensaje || 'Usuario actualizado correctamente', {
                description: response.mensaje || 'Usuario actualizado correctamente',
                duration: 3000,
              });
   
              this.usuarioDialog = false;
              this.submitted = false;
              this.usuarioForm.reset({
                service: 'crea_usuario',
                acd_predef: '4001',
                activo: true
              });
            } else {
              toast.error(response.mensaje || 'Error al actualizar el usuario', {
                description: response.mensaje || 'Error al actualizar el usuario',
                duration: 3000,
              });
            }
          },
          error: (error) => {
            toast.error('Error al actualizar el usuario');
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
