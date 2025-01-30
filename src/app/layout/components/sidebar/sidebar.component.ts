import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

  isDropdownOpen = false;
  isCallCenterOpen = false;
  isUtilidadesOpen = false;

  toggleDropdown(event: Event) {
    event.preventDefault();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleCallCenter(event: Event) {
    event.preventDefault();
    this.isCallCenterOpen = !this.isCallCenterOpen;
  }

  toggleUtilidades(event: Event) {
    event.preventDefault();
    this.isUtilidadesOpen = !this.isUtilidadesOpen;
  }

}
