import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CallInfo } from './interfaces/callInfo';

@Component({
  selector: 'app-call-data',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './call-data.component.html',
  styleUrl: './call-data.component.scss'
})
export class CallDataComponent {
  callInfo = signal<CallInfo | null>(null);
  private timerInterval: any;
  
  @Input() set callNumber(value: string) {
    if (value) {
      this.startCall(value);
    } else {
      this.endCall();
    }
  }
  
  @Input() set callStatus(isActive: boolean) {
    if (!isActive) {
      this.endCall();
    }
  }
  
  startCall(number: string): void {
    const startTime = new Date();
    this.callInfo.set({
      number,
      startTime,
      duration: '00:00',
      status: 'active'
    });
    
    let seconds = 0;
    this.timerInterval = setInterval(() => {
      seconds++;
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      const duration = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
      
      this.callInfo.update(info => {
        if (info) {
          return { ...info, duration };
        }
        return null;
      });
    }, 1000);
  }
  
  endCall(): void {
    clearInterval(this.timerInterval);
    this.callInfo.set(null);
  }
  
  setCallOnHold(onHold: boolean): void {
    this.callInfo.update(info => {
      if (info) {
        return { ...info, status: onHold ? 'hold' : 'active' };
      }
      return null;
    });
  }
  
  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  getStatusText(status: string): string {
    switch (status) {
      case 'active': return 'En curso';
      case 'hold': return 'En espera';
      case 'ended': return 'Finalizada';
      default: return '';
    }
  }
}
