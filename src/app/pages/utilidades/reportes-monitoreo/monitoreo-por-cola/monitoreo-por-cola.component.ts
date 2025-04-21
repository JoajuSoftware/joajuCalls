import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

// PRIMENG imports
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';


// Other imports
import { ColasService } from '../../../admin/colas/services/colas.service';
import { Cola } from '../../../admin/colas/interfaces/colas.interface';
import { Data, QueueMonitoringData } from '../../models/interface';
import { QueueMonitoringService } from './services/queue-monitoring.service';
import { toast } from 'ngx-sonner';


@Component({
  selector: 'app-monitoreo-por-cola',
  imports: [SelectModule, ButtonModule, DatePickerModule, TableModule, ReactiveFormsModule, FormsModule, TagModule],
  templateUrl: './monitoreo-por-cola.component.html',
  styleUrl: './monitoreo-por-cola.component.scss'
})
export class MonitoreoPorColaComponent implements OnInit {

  fb: FormBuilder = inject(FormBuilder);
  private queueService: ColasService = inject(ColasService);
  private queueMonitoringServ: QueueMonitoringService = inject(QueueMonitoringService)


  // Signals para manejar los datos 
  queues = signal<Cola[]>([])
  headers = signal<string[]>([]);
  agentsQueueData = signal<QueueMonitoringData[]>([]);
  data: FormGroup;

  protected readonly toast = toast;

  constructor() {
    this.data = this.fb.group({
      selectedQueue: ['', Validators.required ]
    })
  }

  ngOnInit(): void {
    this.getQueues();
    this.headers.set(['Extensión', 'Nombre Agente', 'Estado']);
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

    if(this.data.value.selectedQueue === ''){
      this.toast.error('Debes seleccionar una cola');
      return;
    }

    const formData = { 
      'queues': this.data.value.selectedQueue.cola
    }
    
    this.getAgentsQueueData(formData);
    
  } 
  
  getAgentsQueueData(data: Pick<Data, 'queues'>): void {
  
    const response = this.queueMonitoringServ.getQueueMonitoringData(data).subscribe({
      next: (data) => {
        this.agentsQueueData.set(data.mensaje)
        console.log(this.agentsQueueData());
      
      }, 
      error : (err) => {
        console.log(err);
      },
      complete: () => {
        console.log('Culminando petición');
        
        response.unsubscribe()
      }
    })

  }

}