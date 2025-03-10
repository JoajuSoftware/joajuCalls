import { AfterViewInit, Component, inject, Input, OnInit, signal } from '@angular/core';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
// import { DialogModule } from 'primeng/dialog';
// Service and Interface
import { ColasService } from '../../../colas/services/colas.service';
import { Cola } from '../../../colas/interfaces/colas.interface';

@Component({
  selector: 'app-manage-queue',
  imports: [ TableModule, ButtonModule ],
  templateUrl: './manage-queue.component.html',
  styleUrl: './manage-queue.component.scss'
})
export class ManageQueueComponent implements OnInit, AfterViewInit {

  // Inyección de dependencias
  queueService: ColasService = inject(ColasService);

  @Input() user:any = {};

  // Variables locales
  queues: Cola[] = [];
  queuesSelected = signal<any>('');

  ngOnInit(): void {
    
    this.getQueues()
    // console.log(this.user)
    console.log(this.user)
    this.getUserQueues()

  }

  ngAfterViewInit(): void {

    
    
  }

  getQueues(): void {

    const response = this.queueService.getColas().subscribe({
      next: (response) => {
        this.queues = response.mensaje;
      },
      error: (error) => {
        console.error('Error al obtener las colas:', error);
      },
      complete: () => {
        response.unsubscribe()
      }
    })
  }

  getUserQueues(): void {

    const response = this.queueService.getUserQueues(this.user.agente).subscribe({
      next: (response) => {
        console.log(response)
        this.queuesSelected.set(response.mensaje.colas);
        console.log(this.queuesSelected())
      },
      error: (error) => {
        console.log('Error al obtener las colas vinculadas: ', error)
      },
      complete: () => {
        response.unsubscribe()
      }
    })

  }

  addQueue(queue: Cola) {
    console.log('Se ha agregado el agente a la cola')

    const data = new FormData();

    data.append('service', 'add_agente');
    data.append('agente', this.user.agente);
    data.append('cola', queue.cola);

    this.addQueueFetch(data)
    
  }

  addQueueFetch(data: any) {
    const response = this.queueService.addAgentToQueue(data).subscribe({
      next: (response) => {
        console.log(response)
      },
      error: (error) => {
        console.log('Error al agregar el agente a la cola: ', error)
      },
      complete: () => {
        response.unsubscribe()
      }
    })
  }

  deleteQueue(queue: Cola) {

    const data = new FormData();

    data.append('service', 'delete_agente');
    data.append('agente', this.user.agente);
    data.append('cola', queue.cola);

    this.deleteQueueFetch(data)

  }

  deleteQueueFetch(data: any) {
    
    const response = this.queueService.deleteAgentFromQueue(data).subscribe({
      next: (response) => {
        console.log(response)
      },
      error: (error) => {
        console.log('Error al eliminar el agente de la cola: ', error)
      },
      complete: () => {
        response.unsubscribe()
      }
    })
  }

  checkQueue(queue: Cola) {
    return this.queuesSelected().includes(queue.cola)
  }

}
