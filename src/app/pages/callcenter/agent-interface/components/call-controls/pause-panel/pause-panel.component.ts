import { Component, signal, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PauseService } from './services/pause.service';
import { MessageService } from 'primeng/api';
import { checkAgentStatusResponse } from './interfaces/pause.interface';

interface PauseOption {
  id: string;
  label: string;
}

@Component({
  selector: 'app-pause-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    ToastModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService],
  templateUrl: './pause-panel.component.html',
  styleUrl: './pause-panel.component.scss'
})
export class PausePanelComponent implements OnInit {
  isPaused = signal<boolean>(false);
  currentPause = signal<string>('');
  isLoading = signal<boolean>(false);
  
  displayPasswordDialog = signal<boolean>(false);
  selectedPauseId = signal<string>('');
  selectedPauseOption: PauseOption | null = null;
  agentPass = '';
  passwordError = signal<string>('');
  pauseReason = signal<string>('');

  private pauseService: PauseService = inject(PauseService);
  private messageService = inject(MessageService);
  
  pauseOptions: PauseOption[] = [
    { id: '1', label: 'ALMUERZO' },
    { id: '2', label: 'SANITARIO' },
    { id: '3', label: 'FEEDBACK_TL' },
    { id: '4', label: 'FEEDBACK_CALIDAD' },
    { id: '5', label: 'REUNION' },
    { id: '6', label: 'DESCANSO' },
    { id: '7', label: 'ASUNTOS_TECNICOS' },
    { id: '8', label: 'SINIESTRO' },
    { id: '9', label: 'ENVIO_MENSAJES' }
  ];
  
  @Output() pauseStatusChange = new EventEmitter<boolean>();

  ngOnInit(): void {
    this.checkAgentPause();
  }

  checkAgentPause(): void {
    this.isLoading.set(true);
  
    const userDataString = sessionStorage.getItem('userData');
    if (!userDataString) {
      console.error('No user data found in session storage');
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se encontraron datos de usuario en la sesión'
      });
      this.isLoading.set(false);
      return;
    }
    
    const userData = JSON.parse(userDataString);
  
    this.pauseService.checkAgentStatus(userData.agente).subscribe({
      next: (response: checkAgentStatusResponse) => {
        this.isLoading.set(false);
        
        if (response.err_code === '200' && Array.isArray(response.mensaje)) {
          const agenteInfo = response.mensaje.find(item => item.agente === userData.agente);
          console.log('Información del agente:', JSON.stringify(agenteInfo, null, 2));
  
          if (agenteInfo && agenteInfo.estado === 'En Pausa') {
            this.isPaused.set(true);
            
            if (agenteInfo.info_pausa) {
              
              if (agenteInfo.info_pausa.pausa) {
                const pausaReason = agenteInfo.info_pausa.pausa;
                
                const matchedOption = this.pauseOptions.find(opt => 
                  pausaReason.toUpperCase().includes(opt.label)
                );
                
                if (matchedOption) {
                  console.log(`Coincidencia encontrada: ${matchedOption.label}`);
                  this.pauseReason.set(matchedOption.label);
                  this.currentPause.set(matchedOption.id);
                } else {
                  console.log('No se encontró coincidencia para:', pausaReason);
                  this.pauseReason.set(pausaReason);
                }
              } else {
                console.log('info_paused existe pero no tiene propiedad pausa');
                this.pauseReason.set('Pausa sin motivo especificado');
              }
            } else {
              console.log('No se encontró info_paused en el objeto del agente');
              this.pauseReason.set('Pausa activa');
            }
            
            this.pauseStatusChange.emit(true);
          } else {
            console.log('El agente no está en pausa o no se encontró');
          }
        } else {
          console.log('Formato de respuesta inesperado');
        }
      },
      error: (err) => {
        console.error('Error al verificar estado del agente:', err);
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al verificar el estado del agente'
        });
      }
    });
  }

  private getLabelForPause(pausaText: string): string {
    if (!pausaText) return 'Pausa activa';
    
    const upperReason = pausaText.toUpperCase();
    for (const option of this.pauseOptions) {
      if (upperReason.includes(option.label)) {
        return option.label;
      }
    }
    
    return pausaText;
  }

  showPasswordDialog(pauseId: string): void {
    if (!pauseId) return;
    
    this.selectedPauseId.set(pauseId);
    this.displayPasswordDialog.set(true);
    this.passwordError.set('');
    this.agentPass = '';
  }

  confirmPause(): void {
    if (!this.agentPass) {
      this.passwordError.set('Por favor, ingrese su contraseña.');
      return;
    }
    
    this.displayPasswordDialog.set(false);
    this.activatePause(this.selectedPauseId());
  }

  activatePause(pauseId: string): void {
    this.isLoading.set(true);
    this.currentPause.set(pauseId);
  
    const userDataString = sessionStorage.getItem('userData');
    if (!userDataString) {
      console.error('No user data found in session storage');
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se encontraron datos de usuario en la sesión'
      });
      this.isLoading.set(false);
      return;
    }
    
    const userData = JSON.parse(userDataString);
  
    const pauseData = {
      agente: userData.agente,
      ag_pass: this.agentPass,
      reason: pauseId
    };
  
    this.pauseService.pause(pauseData).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        
        if (response.err_code === '200') {
          this.handleSuccessfulPause(response, pauseId);
        } else if (response.err_code === 'parcial') {
          this.handlePartialSuccess(response, pauseId);
        } else {
          this.handlePauseError(response);
        }
      },
      error: (err: any) => {
        console.error('Error en la petición:', err);
        this.isLoading.set(false);
        this.currentPause.set('');
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al activar pausa: ' + (err.message || 'Error desconocido')
        });
      }
    });
  }
  
  private handleSuccessfulPause(response: any, pauseId: string): void {
    this.isPaused.set(true);
    this.pauseStatusChange.emit(true);
    
    const option = this.pauseOptions.find(opt => opt.id === pauseId);
    if (option) {
      this.pauseReason.set(option.label);
      console.log('Pausa activada con tipo:', option.label);
    }
    
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: response.mensaje || 'Pausa activada correctamente'
    });
  }
  
  private handlePartialSuccess(response: any, pauseId: string): void {
    this.isPaused.set(true);
    this.pauseStatusChange.emit(true);
    
    const option = this.pauseOptions.find(opt => opt.id === pauseId);
    if (option) {
      this.pauseReason.set(option.label);
      console.log('Pausa parcialmente activada con tipo:', option.label);
    }
    
    this.messageService.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'Pausa aplicada parcialmente: algunos canales no se pudieron pausar'
    });
  }
  
  private handlePauseError(response: any): void {
    this.isPaused.set(false);
    this.currentPause.set('');
    this.pauseReason.set('');
    
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: response.estado || response.mensaje || 'Error al activar la pausa'
    });
  }
  
  deactivatePause(): void {
    this.isLoading.set(true);
    
    const userDataString = sessionStorage.getItem('userData');
    if (!userDataString) {
      console.error('No user data found in session storage');
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se encontraron datos de usuario en la sesión'
      });
      this.isLoading.set(false);
      return;
    }
    
    const userData = JSON.parse(userDataString);
  
    const unPauseData = {
      agente: userData.agente,
      ag_pass: this.agentPass,
    };
    
    this.pauseService.unPause(unPauseData).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        
        if (response.err_code === '200' || (response.estado && response.estado.includes('correcta'))) {
          this.handleSuccessfulUnpause();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.estado || response.mensaje || 'Error al desactivar la pausa'
          });
        }
      },
      error: (err: any) => {
        console.error('Error en la petición:', err);
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al desactivar pausa: ' + (err.message || 'Error desconocido')
        });
      }
    });
  }
  
  private handleSuccessfulUnpause(): void {
    this.isPaused.set(false);
    this.currentPause.set('');
    this.pauseReason.set('');
    this.pauseStatusChange.emit(false);
    this.selectedPauseOption = null;
    
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Pausa desactivada correctamente'
    });
  }
  
  getCurrentPauseLabel(): string {
    const label = this.pauseReason();
    console.log('getCurrentPauseLabel devuelve:', label);
    return label || 'Pausa activa';
  }
}
