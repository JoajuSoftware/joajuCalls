import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialPadService } from './services/dial-pad.service';
import { ButtonModule } from 'primeng/button';
import { PauseService } from '../pause-panel/services/pause.service';
import { checkAgentStatusResponse } from '../pause-panel/interfaces/pause.interface';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-dial-pad',
  standalone: true,
  templateUrl: './dial-pad.component.html',
  styleUrl: './dial-pad.component.scss',
  imports: [
    CommonModule,
    ButtonModule
  ]
})
export class DialPadComponent implements OnInit {
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
  agentStatus = signal<string>('Libre');

  private dialPadService = inject(DialPadService);
  private pauseService = inject(PauseService);
  private messageService = inject(MessageService);

  private durationInterval: any;
  private statusCheckTimeout: any;
  private statusCheckInterval: any;
  
  @Output() callStatusChange = new EventEmitter<boolean>();
  @Output() numberDialed = new EventEmitter<string>();
  @Input() set isPaused(value: boolean) {
    this._isPaused.set(value);
  }

  _isPaused = signal<boolean>(false);

  ngOnInit(): void {
    this.handleCheckAgentStatus();
  }

  handleCheckAgentStatus(): void {
    const userDataString = sessionStorage.getItem('userData');
    if (!userDataString) {
      console.error('No user data found in session storage');
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se encontraron datos de usuario en la sesión'
      });
      return;
    }
    
    const userData = JSON.parse(userDataString);

    this.pauseService.checkAgentStatus(userData.agente).subscribe({
      next: (response: checkAgentStatusResponse) => {
        if (response.err_code === '200' && Array.isArray(response.mensaje)) {
          const agenteInfo = response.mensaje.find(item => item.agente === userData.agente);
          this.agentStatus.set(agenteInfo?.estado || 'Libre');
        }
      },
      error: (error) => {
        console.error('Error checking agent status', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al verificar el estado del agente'
        });
      }
    })
  }

  handleButtonPress(value: string): void {
    if (this._isPaused() || this.agentStatus() !== 'Libre') {
      return;
    }

    this.activeButton.set(value);
    this.displayNumber.update(current => current + value);
    
    setTimeout(() => {
      this.activeButton.set(null);
    }, 200);
  }

  deleteLastDigit(): void {
    if (this._isPaused() || this.agentStatus() !== 'Libre') {
      return;
    }

    if (this.displayNumber().length > 0) {
      this.displayNumber.update(current => current.slice(0, -1));
    }
  }

  toggleCall(): void {
    if (this._isPaused() || this.agentStatus() !== 'Libre') {
      return;
    }
  
    const newState = !this.isCallActive();
    this.isCallActive.set(newState);
    this.callStatusChange.emit(newState);
  
    const userDataString = sessionStorage.getItem('userData');
    if (!userDataString) {
      console.error('No user data found in session storage');
      return;
    }
  
    const userData = JSON.parse(userDataString);
    
    if (newState) { // Iniciar llamada
      const agent_call = {
        agent: userData.agente,
        nro_cliente: this.displayNumber(),
        cola: userData.acd_predef || '4001',
        tipo_call: 'Manual',
        id_call: '0',
        campana: '0'
      };
  
      this.dialPadService.call(agent_call).subscribe({
        next: (response) => {
          console.log('Call successful', response);
          if (response.err_code === '200') {
            this.startCall();
            this.agentStatus.set('Intentando llamar');
            
            this.statusCheckTimeout = setTimeout(() => {
              this.statusCheckInterval = setInterval(() => {
                console.log('Checking agent status...');
                
                this.pauseService.checkAgentStatus(userData.agente).subscribe({
                  next: (statusResponse: checkAgentStatusResponse) => {
                    if (statusResponse.err_code === '200' && Array.isArray(statusResponse.mensaje)) {
                      const agenteInfo = statusResponse.mensaje.find(item => item.agente === userData.agente);
                      
                      if (agenteInfo) {
                        this.agentStatus.set(agenteInfo.estado);
                        console.log('Estado actual del agente:', agenteInfo.estado);
                        
                        if (agenteInfo.estado === 'Libre' && this.isCallActive()) {
                          if (this.statusCheckInterval) {
                            clearInterval(this.statusCheckInterval);
                            this.statusCheckInterval = null;
                          }
                          
                          this.isCallActive.set(false);
                          this.callStatusChange.emit(false);
                          this.endCall();
                          
                          this.messageService.add({
                            severity: 'info',
                            summary: 'Llamada finalizada',
                            detail: 'La llamada ha finalizado'
                          });
                        }
                      }
                    }
                  },
                  error: (error) => {
                    console.error('Error checking agent status during call', error);
                  }
                });
              }, 3000);
              
              setTimeout(() => {
                if (this.statusCheckInterval) {
                  clearInterval(this.statusCheckInterval);
                  this.statusCheckInterval = null;
                  console.log('Verificación de estado detenida por tiempo máximo');
                }
              }, 30 * 60 * 1000);
              
            }, 5000);
          } else {
            console.warn('Llamada no completada con éxito:', response);
            this.isCallActive.set(false);
            this.callStatusChange.emit(false);
          }
        },
        error: (error) => {
          console.error('Error making call', error);
          this.isCallActive.set(false);
          this.callStatusChange.emit(false);
        }
      });
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
