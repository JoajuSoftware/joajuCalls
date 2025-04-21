import { Component, OnInit, inject, signal } from '@angular/core';

// PRIMENG imports
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { FloatLabel } from 'primeng/floatlabel';
import { ColasService } from '../../../admin/colas/services/colas.service';
import { Cola } from '../../../admin/colas/interfaces/colas.interface';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ReportsService } from './services/reports.service';
import { TableModule } from 'primeng/table';

// Import Types
import { CallData, Data, ResponseInterface } from '../../models/interface';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-call-detalle',
  imports: [SelectModule, ButtonModule, DatePickerModule, FloatLabel, ReactiveFormsModule, FormsModule, TableModule],
  templateUrl: './call-detalle.component.html',
  styleUrl: './call-detalle.component.scss'
})
export class CallDetalleComponent implements OnInit {

  private queueService: ColasService = inject(ColasService);
  fb: FormBuilder = inject(FormBuilder);
  reportService: ReportsService = inject(ReportsService);

  queues: Cola[] = []
  data: FormGroup;
  callsDetails = signal<CallData[]>([]);
  headers = signal<string[]>([]);

  protected readonly toast = toast;

  constructor() { 
    this.data = this.fb.group({
      initDate: ['', Validators.required ],
      endDate: ['', Validators.required ],
      selectedQueue: ['', Validators.required ]
    });
  }

  ngOnInit(): void {

    this.getQueues();
    this.headers.set(['Id','Estado','Fecha Inicio','Fecha Fin','Número','Espera','Duración','Grabación','Agente','Cola','Nro Cola']);

  }

  getQueues() {
    const response = this.queueService.getColas().subscribe({
      next: (data) => {
        console.log(data);
        this.queues = data.mensaje;
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

  checkResponse(response: any) {
    console.log(response);
  }

  submitForm(): void { 

    if(this.data.value.selectedQueue === '' || this.data.value.initDate === '' || this.data.value.endDate === ''){
      this.toast.error('Debes llenar todos los campos');
      return; 
    }

    console.log(this.data.value);

    const formData = {
      initDate: this.data.value.initDate,
      endDate: this.data.value.endDate,
      queues: this.data.value.selectedQueue.cola
    }

    this.getCallsDetails(formData);

  }

  getCallsDetails(data: Data): void {
    const response = this.reportService.getCallsDetails(data).subscribe({

      next: (data: ResponseInterface<CallData>) => {
        this.callsDetails.set(data.mensaje);
        console.log(this.callsDetails());
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
