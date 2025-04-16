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
// import { MessageService } from 'primeng/api';
import { joajuLogo } from '../../shared/utilities/utils';

// toast import 
import { toast } from 'ngx-sonner';

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
    PasswordModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  joajuLogo = joajuLogo;

  protected readonly toast = toast;

  constructor(
    private authService: AuthService, 
    private router: Router, 
    // private messageService: MessageService, 
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
      this.loading = true;
      const credentials = this.loginForm.value;
      this.authService.signIn(credentials).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.err_code === "200") {
            this.toast.success('Sesión iniciada exitosamente');
          } else {
            this.loading = false;
            this.toast.error(`Error al iniciar sesión: ${response.mensaje}`);
          }
        },
        error: (error) => {
          console.log('Error estructura:', error);
          
          if (error.error?.mensaje) {
            this.toast.error(error.error.mensaje);
          } else {
            this.toast.error('Error al iniciar sesión');
          }
        }
      });
    } else {
      this.toast.error('Todos los campos son obligatorios');
    }
  }

  ngOnInit(): void {
    if (this.authService.isAuth.value) {
      this.router.navigate(['/dashboard']);
    }
  }
}
