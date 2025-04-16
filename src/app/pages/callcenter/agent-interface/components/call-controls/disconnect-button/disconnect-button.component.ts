import { Component, inject } from '@angular/core';
import { LoginAgentService } from '../../../../login-agent/services/login-agent.service';
import { MessageService } from 'primeng/api';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-disconnect-button',
  standalone: true,
  template: `
    <button class="disconnect-btn" (click)="onDisconnect()">
      Desconectarse
    </button>
  `,
  styles: [`
    .disconnect-btn {
      background-color: #ff6b6b;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 20px;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.2s;
      
      &:hover {
        background-color: #ff4f4f;
      }
    }
  `]
})
export class DisconnectButtonComponent {
  private loginAgentService: LoginAgentService = inject(LoginAgentService);
  private messageService: MessageService = inject(MessageService);

  onDisconnect(): void {
    this.loginAgentService.logout().subscribe({
      next: () => {
        toast.success("Cierre de sesión éxitoso");
      },
      error: (err) => {
        toast.error("Error al cerrar sesión");
        console.error(err);
      }
    });
  }
}
