import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { AuthService } from '../../shared/services/auth.service';
import { FloatLabelModule } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    DividerModule,
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    InputGroupAddonModule,
    InputGroupModule,
    FloatLabelModule,
    PasswordModule,
    ToastModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private authService: AuthService, 
    private router: Router, 
    private messageService: MessageService, 
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      username: new FormControl('', {
        validators: Validators.required,
        updateOn: 'change'
      }),
      password: ['', Validators.required]
    });

    this.loginForm.get('username')?.valueChanges.subscribe(value => {
      if (value) {
        const lowercase = value.toLowerCase();
        if (value !== lowercase) {
          this.loginForm.get('username')?.setValue(lowercase, { emitEvent: false });
        }
      }
    });
  }
  
  login() {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;
      this.authService.signIn(credentials).subscribe({
        next: (response) => {
          if (response.err_code === "200") {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Success', 
              detail: 'Inicio de sesión exitoso' 
            });
          } else {
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Error', 
              detail: response.mensaje
            });
          }
        },
        error: (error) => {
          console.log('Error estructura:', error);
          
          if (error.error?.mensaje) {
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Error', 
              detail: error.error.mensaje 
            });
          } else {
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Error', 
              detail: 'Error al iniciar sesión' 
            });
          }
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

  ngOnInit(): void {
    if (this.authService.isAuth.value) {
      this.router.navigate(['/dashboard']);
    }
  }
}
