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
import { AgentResumeService } from './services/agent-resume.service';
import { AgentData, Data } from '../../models/interface';

@Component({
  selector: 'app-resumen-por-agente',
  imports: [MultiSelectModule, ButtonModule, DatePickerModule, ReactiveFormsModule, FormsModule, TableModule, FloatLabel],
  templateUrl: './resumen-por-agente.component.html',
  styleUrl: './resumen-por-agente.component.scss'
})
export class ResumenPorAgenteComponent implements OnInit {

  private queueService: ColasService = inject(ColasService);
  fb: FormBuilder = inject(FormBuilder);
  agentService: AgentResumeService = inject(AgentResumeService);

  // Signals para manejar los datos 
  queues = signal<Cola[]>([])
  headers = signal<string[]>([]);
  agentsData = signal<AgentData[]>([]);
  data: FormGroup;

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
    this.headers.set(['Agente', 'Nombre Agente', 'Cola', 'Terminada', 'Activas', 'Dur. Mayor 15min', 'Dur. Min 15min', 'Dur. Mayor 60min', 'Dur. Min 60min', 'Espera Max 15m', 'Espera Min 15min', 'Media Duración', 'Conversación', 'Espera Min', 'Espera Max']);
    console.log(this.agentsData())
  }

  // Función para obtener las colas y mostralas en el multiselect
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

    console.log(this.data.value);

    if(this.data.value.initDate === '' || this.data.value.endDate === ''){
      return alert('Campos vacios');
    }

    // Se crea un objeto con los datos del formulario
    const formData = {
      'initDate': this.data.value.initDate,
      'endDate': this.data.value.endDate,
      'queues': this.data.value.selectedQueue.map((queue: Cola) => queue.cola)
    };

    console.log(formData)

    // Se hace la llamada a la API para obtener los datos de resumen por agente
    this.getResumeAgentData(formData);

  }

  getResumeAgentData(data: Data): void {

    const response = this.agentService.getAgentResume(data).subscribe({
      next: (data) => {
        this.agentsData.set(data.mensaje);
        console.log(this.agentsData());
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
