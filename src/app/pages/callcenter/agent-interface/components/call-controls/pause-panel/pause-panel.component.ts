import { Component, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PauseOption {
  id: string;
  label: string;
}

@Component({
  selector: 'app-pause-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pause-panel.component.html',
  styleUrl: './pause-panel.component.scss'
})
export class PausePanelComponent {
  isPaused = signal<boolean>(false);
  currentPause = signal<string>('');
  pauseTime = signal<string>('00:00');
  
  pauseOptions: PauseOption[] = [
    { id: 'break', label: 'Descanso' },
    { id: 'lunch', label: 'Almuerzo' },
    { id: 'meeting', label: 'Reunión' },
    { id: 'training', label: 'Capacitación' }
  ];
  
  private timerInterval: any;
  
  @Output() pauseStatusChange = new EventEmitter<boolean>();
  
  activatePause(pauseId: string): void {
    this.isPaused.set(true);
    this.currentPause.set(pauseId);
    this.pauseStatusChange.emit(true);
    
    let seconds = 0;
    this.timerInterval = setInterval(() => {
      seconds++;
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      this.pauseTime.set(
        `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
      );
    }, 1000);
  }
  
  deactivatePause(): void {
    this.isPaused.set(false);
    this.currentPause.set('');
    this.pauseTime.set('00:00');
    this.pauseStatusChange.emit(false);
    
    clearInterval(this.timerInterval);
  }
  
  getCurrentPauseLabel(): string {
    const pauseId = this.currentPause();
    const option = this.pauseOptions.find(opt => opt.id === pauseId);
    return option ? option.label : '';
  }
}
