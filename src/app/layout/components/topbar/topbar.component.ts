import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent implements OnInit {
  userName: String = ''
  userRole: String = ''


  ngOnInit() {
    //obtemenos los datos guardados sessionStorage
    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}')
    this.userName = userData.usuario
    this.userRole = userData.perfil
  }

}
