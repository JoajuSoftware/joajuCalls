import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { FloatLabelModule } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { joajuLogo } from '../../../shared/utilities/utils';
import { LoginAgentService } from './services/login-agent.service';

@Component({
  selector: 'app-login-agent',
  standalone: true,
  imports: [
    DividerModule,
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    InputGroupAddonModule,
    InputGroupModule,
    FloatLabelModule,
    PasswordModule
  ],
  templateUrl: './login-agent.component.html',
  styleUrl: './login-agent.component.scss'
})
export class LoginAgentComponent {
  loginForm: FormGroup;
  loading = false;
  joajuLogo = joajuLogo;

  //services
  private messageService: MessageService = inject(MessageService); 
  private fb: FormBuilder = inject(FormBuilder);
  private loginAgentService: LoginAgentService = inject(LoginAgentService);

  constructor() {
    this.loginForm = this.fb.group({
      agente: new FormControl('', {
        validators: Validators.required,
        updateOn: 'change'
      }),
      extension: ['', Validators.required]
    });
  }
  
  login() {
    if (this.loginForm.valid) {
      this.loading = true;
      const credentials = this.loginForm.value;
      
      this.loginAgentService.signIn(credentials).subscribe({
        next: (response: any) => {
          if (response.err_code === "302"){
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Error', 
              detail: "No se encuentra el usuario"
            });
          } else {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Éxito', 
              detail: "Inicio de sesión éxitoso"
            });
          }
        },
        error: (err) => {
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error',
            detail: "Error al iniciar sesión"
          });
          console.error(err);
        }
      });
    } else {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Todos los campos son obligatorios' 
      });
    }
  }
}
