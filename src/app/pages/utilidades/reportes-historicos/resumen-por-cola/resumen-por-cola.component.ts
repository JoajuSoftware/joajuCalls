import { Component, OnInit, inject, signal } from '@angular/core';

// PRIMENG imports
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { FloatLabel } from 'primeng/floatlabel';
import { ColasService } from '../../../admin/colas/services/colas.service';
import { Cola } from '../../../admin/colas/interfaces/colas.interface';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Data, QueueData } from '../../models/interface';
import { QueueResumeService } from './services/queue-resume.service';

import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-resumen-por-cola',
  imports: [ MultiSelectModule, ButtonModule, DatePickerModule, ReactiveFormsModule, FormsModule, TableModule, FloatLabel],
  templateUrl: './resumen-por-cola.component.html',
  styleUrl: './resumen-por-cola.component.scss'
})
export class ResumenPorColaComponent {

  private queueService: ColasService = inject(ColasService);
  fb: FormBuilder = inject(FormBuilder);
  private queueResumeService: QueueResumeService = inject(QueueResumeService);

  // Signals para manejar los datos 
  queues = signal<Cola[]>([])
  headers = signal<string[]>([]);
  queuesData = signal<QueueData[]>([]);
  data: FormGroup;

  protected readonly toast = toast;

  constructor() {
    this.data = this.fb.group({
      initDate: ['', Validators.required ],
      endDate: ['', Validators.required ],
      selectedQueue: ['', Validators.required ]
    })
  }

  ngOnInit(): void { 
    
    // Se hace la llamada a la API para obtener las colas al montarse el componente
    this.getQueues();
    this.headers.set(['Cola', 'Nombre Cola', 'Terminada', 'Activas', 'Duración Mayor 15min', 'Duración Min 15min', 'Duración Mayor 60min', 'Duración Min 60min', 'Espera Max 15m', 'Espera Min 15min', 'Media Duración', 'Conversación', 'Espera Min', 'Espera Max']);

    console.log(this.queuesData())
  }

  getQueues() {

    const response = this.queueService.getColas().subscribe({
      next: (data) => {
        console.log(data);
        this.queues.set(data.mensaje);
      },
      error: (err) => {
        console.log(err);
      }, 
      complete: () => {
        console.log('complete');
        response.unsubscribe();
      }
    });
  }

  submitForm(): void {

    if(this.data.value.initDate === '' || this.data.value.endDate === '' || this.data.value.selectedQueue === ''){
      this.toast.error('Debes llenar todos los campos');
      return;
    }

    const formData = { 
      'initDate': this.data.value.initDate,
      'endDate': this.data.value.endDate,
      'queues': this.data.value.selectedQueue.map((queue: Cola) => queue.cola)
    };
    
    this.getQueueResume(formData);

  }

  getQueueResume(data: Data): void {

    const response = this.queueResumeService.getQueueResume(data).subscribe({
      next: (data) => {
        this.queuesData.set(data.mensaje);
        console.log(this.queuesData());
      },
      error: (err) => {
        console.log(err);
      }, 
      complete: () => {
        console.log('complete');
        response.unsubscribe();
      }
    });

  }

}
