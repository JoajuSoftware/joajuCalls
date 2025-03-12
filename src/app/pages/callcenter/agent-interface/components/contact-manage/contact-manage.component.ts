import { Component, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';

interface Contact {
  id: string;
  name: string;
  phone: string;
  status: 'pending' | 'attempted' | 'completed';
}

@Component({
  selector: 'app-contact-manage',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    InputTextModule,
    TagModule
  ],
  templateUrl: './contact-manage.component.html',
  styleUrl: './contact-manage.component.scss'
})
export class ContactManageComponent {
  contacts = signal<Contact[]>([
    { id: '1', name: 'Juan Pérez', phone: '0981123456', status: 'pending' },
    { id: '2', name: 'María González', phone: '0982234567', status: 'pending' },
    { id: '3', name: 'Carlos Rodríguez', phone: '0983345678', status: 'attempted' },
    { id: '4', name: 'Laura Martínez', phone: '0984456789', status: 'pending' },
    { id: '5', name: 'Roberto Silva', phone: '0985567890', status: 'completed' }
  ]);
  
  isAnyCallActive = signal<boolean>(false);
  
  @Output() contactCall = new EventEmitter<{phone: string, name: string}>();
  @Output() contactUpdate = new EventEmitter<Contact>();
  
  callContact(contact: Contact): void {
    if (this.isAnyCallActive()) return;
    
    this.contactCall.emit({
      phone: contact.phone,
      name: contact.name
    });
    
    const updatedContact: Contact = {
      ...contact,
      status: contact.status === 'pending' ? 'attempted' : contact.status
    };
    
    this.updateContactStatus(updatedContact);
    this.contactUpdate.emit(updatedContact);
  }
  
  updateContactStatus(contact: Contact): void {
    this.contacts.update(contacts => 
      contacts.map(c => c.id === contact.id ? contact : c)
    );
  }
  
  setCallActive(active: boolean): void {
    this.isAnyCallActive.set(active);
  }
  
  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'attempted': return 'Intentado';
      case 'completed': return 'Completado';
      default: return '';
    }
  }
  
  getStatusSeverity(status: string): string {
    switch (status) {
      case 'pending': return 'info';
      case 'attempted': return 'warning';
      case 'completed': return 'success';
      default: return 'info';
    }
  }
  
  applyFilterGlobal(event: any, stringVal: string) {
    const value = (event.target as HTMLInputElement).value;
  }
}
