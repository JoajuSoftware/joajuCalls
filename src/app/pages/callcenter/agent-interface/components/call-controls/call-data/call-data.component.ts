import { Component, Input, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CallInfo {
  number: string;
  startTime: Date;
  duration: string;
  status: 'active' | 'hold' | 'ended';
}

@Component({
  selector: 'app-call-data',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './call-data.component.html',
  styleUrl: './call-data.component.scss'
})
export class CallDataComponent implements OnChanges {
  callInfo = signal<CallInfo | null>(null);
  private timerInterval: any;
  
  @Input() callNumber: string = '';
  @Input() callStatus: boolean = false;
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['callStatus'] && !changes['callStatus'].firstChange) {
      const isActive = changes['callStatus'].currentValue;
      if (!isActive) {
        this.endCall();
      } else if (isActive && this.callNumber) {
        this.startCall(this.callNumber);
      }
    }
    
    if (changes['callNumber'] && !changes['callNumber'].firstChange) {
      const newNumber = changes['callNumber'].currentValue;
      if (newNumber && this.callStatus) {
        this.startCall(newNumber);
      } else if (!newNumber) {
        this.endCall();
      }
    }
    
    if (this.callStatus && this.callNumber && 
        (changes['callStatus']?.firstChange || changes['callNumber']?.firstChange)) {
      this.startCall(this.callNumber);
    }
  }
  
  startCall(number: string): void {
    this.endCall();
    
    const startTime = new Date();
    this.callInfo.set({
      number,
      startTime,
      duration: '00:00',
      status: 'active'
    });
    
    console.log('Iniciando llamada con número:', number);
    
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
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
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
    if (!date) return '';
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
