import { Component, signal, ViewChild, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MultiSelectModule } from 'primeng/multiselect';
import { ColasService } from '../../../admin/colas/services/colas.service';
import { Cartera } from './interfaces/cartera.interface';
import { CarteraService } from './services/cartera.service';

interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-listar-carteras',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    TooltipModule,
    MessagesModule,
    MessageModule,
    ToastModule,
    ToolbarModule,
    ProgressSpinnerModule,
    MultiSelectModule
  ],
  providers: [MessageService],
  templateUrl: './listar-carteras.component.html',
  styleUrl: './listar-carteras.component.scss'
})
export class ListarCarterasComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  
  private colasService = inject(ColasService);
  private messageService = inject(MessageService);
  private carteraService = inject(CarteraService);
  
  isLoading: boolean = false;
  detallesDialog: boolean = false;
  selectedCartera: Cartera | null = null;
  colasOptions: SelectOption[] = [];
  selectedColas: SelectOption[] = [];
  carteras = signal<Cartera[]>([]);
  filteredCarteras = signal<Cartera[]>([]);
  rows: number = 10;
  totalRecords: number = 0;
  
  ngOnInit() {
    this.loadData();
  }
  
  loadData() {
    this.isLoading = true;
    
    this.colasService.getColas().subscribe({
      next: (response) => {
        if (response.err_code === '200') {
          this.colasOptions = response.mensaje.map(cola => ({
            value: cola.cola,
            label: `${cola.cola} - ${cola.n_cola}`
          }));
          
          this.selectedColas = this.colasOptions.filter(
            option => option.value === '4000' || option.value === '4001'
          );
          
          this.loadCarteras();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar las colas',
            life: 3000
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener colas:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar las colas',
          life: 3000
        });
        this.isLoading = false;
      }
    });
  }
  
  loadCarteras() {
    this.isLoading = true;
    
    const selectedValues = this.selectedColas.map(option => option.value);
    const colasParam = selectedValues.join(',');

    this.carteraService.getCarteras(colasParam).subscribe({
      next: (response) => {
        if (response.err_code === '200') {
          this.carteras.set(response.mensaje);
          this.filteredCarteras.set(response.mensaje);
          this.totalRecords = response.mensaje.length;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar las carteras',
            life: 3000
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener carteras:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar las carteras',
          life: 3000
        });
        this.isLoading = false;
      }
    });
  }
  
  filterBySelectedColas() {
    if (this.selectedColas.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe seleccionar al menos una cola',
        life: 3000
      });
      return;
    }

    const selectedValues = this.selectedColas.map(option => option.value);
    const colasParam = selectedValues.join(',');
    
    this.isLoading = true;
    
    this.carteraService.getCarteras(colasParam).subscribe({
      next: (response) => {
        if (response.err_code === '200') {
          this.carteras.set(response.mensaje);
          this.filteredCarteras.set(response.mensaje);
          this.totalRecords = response.mensaje.length;
          
          this.messageService.add({
            severity: 'success',
            summary: 'Filtro aplicado',
            detail: 'Se han cargado las carteras con el filtro seleccionado',
            life: 3000
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al filtrar las carteras',
            life: 3000
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al filtrar carteras:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al filtrar las carteras',
          life: 3000
        });
        this.isLoading = false;
      }
    });
  }
  
  verDetalles(cartera: Cartera) {
    this.selectedCartera = cartera;
    this.detallesDialog = true;
  }
  
  applyFilterGlobal(event: any) {
    this.dt?.filterGlobal(event.target.value, 'contains');
  }
}
