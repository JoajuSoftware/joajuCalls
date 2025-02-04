// sidebar.component.ts
import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  standalone: true
})
export class SidebarComponent {
  isDropdownOpen = false;
  isCallCenterOpen = false;
  isUtilidadesOpen = false;
  isReporteHistoricoOpen = false;
  isReporteMonitoreoOpen = false;
  isPreviewOpen = false;

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

  toggleReporteHistorico(event: Event) {
    event.preventDefault();
    this.isReporteHistoricoOpen = !this.isReporteHistoricoOpen;
  }

  toggleReporteMonitoreo(event: Event) {
    event.preventDefault();
    this.isReporteMonitoreoOpen = !this.isReporteMonitoreoOpen;
  }

  togglePreview(event: Event) {
    event.preventDefault();
    this.isPreviewOpen = !this.isPreviewOpen;
  }
}
