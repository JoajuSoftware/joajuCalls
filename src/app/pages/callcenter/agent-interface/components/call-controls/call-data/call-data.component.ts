import { Component, Input, signal, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CallInfoService } from './services/callInfo.service';
import { AgentCallInfo, CallInfo } from './interfaces/callInfo';

@Component({
  selector: 'app-call-data',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './call-data.component.html',
  styleUrl: './call-data.component.scss'
})
export class CallDataComponent implements OnInit, OnDestroy {
  callInfo = signal<CallInfo | null>(null);
  userData = JSON.parse(sessionStorage.getItem('userData') || '{}')
  private checkCallDataInterval: any;

  //temporizador
  timeInterval: any = null;
  seconds: number = 0;
  displayTime: string = '00:00:00';

  private callInfoService: CallInfoService = inject(CallInfoService);

  @Input() callNumber: string = '';
  @Input() callStatus: boolean = false;

  ngOnInit() {
    this.checkCallData();
  }

  checkCallData() {
    this.checkCallDataInterval = setInterval(() => {
      this.checkCallDataServer();
      console.log('Checking call data...');
    }, 2000);
  }

  checkCallDataServer() {
    this.callInfoService.getAgentCallInfo(this.userData.agente).subscribe({
      next: (data: AgentCallInfo) => {
        const previousCallStatus = this.callStatus;
        this.callInfo.set(data.mensaje.callinfo);
        if (!this.callInfo()) {
          this.callStatus = false;
        } else {
          this.callStatus = true;
        }

        if (!previousCallStatus && this.callStatus) {
          this.resetTimer();
          this.startTimer();
        } else if (previousCallStatus && !this.callStatus) {
          this.stopTimer();
        }
      },
      error: (error) => {
        console.error('Error fetching call info:', error);
      }
    })
  }

  //temporizador
  startTimer() {
    this.timeInterval = setInterval(() => {
      this.seconds++;
      const hours = Math.floor(this.seconds / 3600);
      const minutes = Math.floor((this.seconds % 3600) / 60);
      const seconds = this.seconds % 60;
      this.displayTime = `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
    }, 1000);
  }

  stopTimer() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
      this.timeInterval = null;
    }
  }

  resetTimer() {
    this.stopTimer();
    this.seconds = 0;
    this.displayTime = '00:00:00';
  }

  pad(value: number): string {
    return value.toString().padStart(2, '0');
  }

  ngOnDestroy() {
    if (this.checkCallDataInterval) {
      clearInterval(this.checkCallDataInterval);
    }
    this.stopTimer();
    this.resetTimer();
  }
}
