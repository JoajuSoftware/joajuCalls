import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { AuthService } from '../../../shared/services/auth.service';
import { FloatLabelModule } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { joajuLogo } from '../../../shared/utilities/utils';

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

  constructor(
    private authService: AuthService,
    private messageService: MessageService, 
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      agent: new FormControl('', {
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
      // Logica de login de consola  
    } else {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Todos los campos son obligatorios' 
      });
    }
  }
}
