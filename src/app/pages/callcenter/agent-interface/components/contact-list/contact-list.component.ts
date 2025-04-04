import { Component, signal, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { contactItem, contactListResponse } from './interfaces/contactList.interface';
import { ContactListService } from './services/contactList.service';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    InputTextModule,
    DialogModule
  ],
  templateUrl: './contact-list.component.html',
  styleUrl: './contact-list.component.scss'
})
export class ContactListComponent implements OnInit{
  contacts = signal<contactItem[]>([]);
  openModal = signal<boolean>(false);
  selectContact: contactItem;
  @Output() phoneNumber = new EventEmitter<string>();

  private contactListService: ContactListService = inject(ContactListService);
  
  ngOnInit(): void {
    this.contactListService.getProxCall().subscribe({
      next: (response: contactListResponse) => {
        this.contacts.set(response.mensaje);
      },
      error: (error) => {
        console.error(error);
      }    
    })
  }

  viewContactDetail(contact: contactItem): void {
    this.selectContact = contact;
    this.openModal.set(true);
  }

  callContact(phoneNumber: string): void {
    this.sendPhoneNumber(phoneNumber);
  }

  sendPhoneNumber(phoneNumber: string): void {
    this.phoneNumber.emit(phoneNumber);
  }
}
