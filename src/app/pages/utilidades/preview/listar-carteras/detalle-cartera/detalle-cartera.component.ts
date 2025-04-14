import { Component, inject, Input, OnChanges, signal, SimpleChanges } from '@angular/core';
import { ProgressSpinner } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { CarteraService } from '../services/cartera.service';
import { DetalleCartera } from '../interfaces/cartera.interface';

@Component({
  selector: 'app-detalle-cartera',
  imports: [
    TableModule
  ],
  templateUrl: './detalle-cartera.component.html',
  styleUrl: './detalle-cartera.component.scss'
})
export class DetalleCarteraComponent implements OnChanges {
  private carteraService: CarteraService = inject(CarteraService);
  @Input() idCartera: any = null;

  detalleCartera = signal<DetalleCartera[]>([]);
  isLoading: boolean = false;
  rows: number = 10;
  totalRecords: number = 0;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['idCartera'] && changes['idCartera'].currentValue) {
      this.loadData();
    }
  }

  loadData() {
    if (!this.idCartera) return;

    this.isLoading = true;
    this.detalleCartera.set([]);

    this.carteraService.getDetalleCartera(this.idCartera).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.detalleCartera.set(response.mensaje);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching data:', error);
      }
    })
  }
}
