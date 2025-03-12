import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dial-pad',
  standalone: true,
  templateUrl: './dial-pad.component.html',
  styleUrl: './dial-pad.component.scss',
  imports: [CommonModule]
})
export class DialPadComponent {
  keypadButtons = [
    [
      { label: '1', value: '1' },
      { label: '2', value: '2' },
      { label: '3', value: '3' },
    ],
    [
      { label: '4', value: '4' },
      { label: '5', value: '5' },
      { label: '6', value: '6' },
    ],
    [
      { label: '7', value: '7' },
      { label: '8', value: '8' },
      { label: '9', value: '9' },
    ]
  ];

  displayNumber = signal<string>('');
  isCallActive = signal<boolean>(false);
  activeButton = signal<string | null>(null);
  isMuted = signal<boolean>(false);
  isOnHold = signal<boolean>(false);
  currentCall = signal<any | null>(null);
  callDuration = signal<string>('00:00');
  
  private durationInterval: any;

  @Output() callStatusChange = new EventEmitter<boolean>();
  @Output() numberDialed = new EventEmitter<string>();

  handleButtonPress(value: string): void {
    this.activeButton.set(value);
    this.displayNumber.update(current => current + value);
    
    setTimeout(() => {
      this.activeButton.set(null);
    }, 200);
  }

  toggleCall(): void {
    const newState = !this.isCallActive();
    this.isCallActive.set(newState);
    this.callStatusChange.emit(newState);
    
    if (newState) {
      this.startCall();
    } else {
      this.endCall();
    }
  }
  
  startCall(): void {
    if (this.displayNumber()) {
      this.numberDialed.emit(this.displayNumber());
      
      this.currentCall.set({
        agentName: 'Agente 1056',
        number: this.displayNumber()
      });
      
      let seconds = 0;
      this.durationInterval = setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        this.callDuration.set(
          `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    }
  }
  
  endCall(): void {
    clearInterval(this.durationInterval);
    this.callDuration.set('00:00');
    this.currentCall.set(null);
    this.displayNumber.set('');
    this.isMuted.set(false);
    this.isOnHold.set(false);
  }
}
