import { Component, signal, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ContactManage, ContactResponse } from './interfaces/contact-manage.interface';
import { ContactManageService } from './services/contact-manage.service';

@Component({
  selector: 'app-contact-manage',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    InputTextModule,
    DialogModule
  ],
  templateUrl: './contact-manage.component.html',
  styleUrl: './contact-manage.component.scss'
})
export class ContactManageComponent {
  contactsManaged = signal<ContactManage[]>([]);
  openContactManageModal = signal<boolean>(false);
  selectManageContact: ContactManage;
  private contactManageService: ContactManageService = inject(ContactManageService);
  
  ngOnInit(): void {
    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}')

    this.contactManageService.getListGestionesDia(userData.agente).subscribe({
      next: (response: ContactResponse) => {
        if (Array.isArray(response.mensaje)) {
          this.contactsManaged.set(response.mensaje);
        } else {
          this.contactsManaged.set([]);
          console.log('server: ', response.mensaje);
        }
      },
      error: (error) => {
        console.error(error);
      }    
    })
  }

  viewContactDetail(contact: ContactManage): void {
    this.selectManageContact = contact;
    this.openContactManageModal.set(true);
  }
}
