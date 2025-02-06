import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { UsuariosService } from './usuarios.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { createUsuario, CreateUsuarioResponse, updateUsuario, Usuario } from './usuario.interface';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { finalize } from 'rxjs';

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
    MessagesModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './usuarios.component.html',
})
export class UsuariosComponent {
  @ViewChild('dt') dt!: Table;
  
  usuarioForm: FormGroup;
  usuarioDialog: boolean = false;
  usuarios: Usuario[] = [];
  usuario!: Usuario;
  selectedUsuarios: Usuario[] | null = null;
  submitted: boolean = false;
  isLoading: boolean = false;
  totalRecords: number = 0;
  rows: number = 10;
  first: number = 0;
  isSubmitting: boolean = false;

  constructor(
    private usuariosService: UsuariosService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.usuarioForm = this.fb.group({
      service: ['crea_usuario', Validators.required],
      usuario: ['', Validators.required],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      crea_pass: ['', [Validators.required, Validators.minLength(6)]],
      crea_pass2: ['', [Validators.required]],
      acd_predef: ['4001', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private passwordMatchValidator(g: FormGroup) {
    return g.get('crea_pass')?.value === g.get('crea_pass2')?.value
      ? null
      : { 'mismatch': true };
  }

  ngOnInit() {
    this.loadUsuarios();
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

  openNew() {
    this.usuario = {} as Usuario;
    this.usuarioForm.patchValue({
      service: 'crea_usuario',
      usuario: '',
      nombre: '',
      apellido: '',
      crea_pass: '',
      crea_pass2: '',
      acd_predef: '4001'
    });
    this.submitted = false;
    this.usuarioDialog = true;
  }

  hideDialog() {
    this.usuarioDialog = false;
    this.submitted = false;
  }

  editUsuario(usuario: Usuario) {
    this.usuario = { ...usuario };
    this.usuarioForm.patchValue({
      service: 'act_usuario',
      usuario: usuario.n_usuario,
      nombre: usuario.nom,
      apellido: usuario.ape,
      acd_predef: usuario.acd_predef,
      crea_pass: '',
      crea_pass2: ''
    });
    this.usuarioDialog = true;
  }

  saveUsuario() {
    this.submitted = true;
   
    if (this.usuarioForm.valid) {
      this.isSubmitting = true;
      const formValues = this.usuarioForm.value;
      const formData = new FormData();
   
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
        formData.append('nro_exten', this.usuario.nro_exten);
   
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
                  acd_predef: formValues.acd_predef
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

  onInput(event: Event) {
    const searchValue = (event.target as HTMLInputElement).value;
    this.dt.filterGlobal(searchValue, 'contains');
  }
}
