import { Component, Output, EventEmitter } from '@angular/core';

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
  @Output() disconnect = new EventEmitter<void>();
  
  onDisconnect(): void {
    this.disconnect.emit();
  }
}
