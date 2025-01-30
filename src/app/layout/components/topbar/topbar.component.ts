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
  @ViewChild('themeToggle') themeToggle!: ElementRef;
  searchQuery: string = '';
  userName: string = 'Thomas Anree';
  userRole: string = 'UX Designer';
  isDark: boolean = false;

  ngOnInit() {
    // Verificar el tema actual
    const savedTheme = localStorage.getItem('theme');
    this.isDark = savedTheme === 'dark';
    document.documentElement.classList.toggle('dark', this.isDark);
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    document.documentElement.classList.toggle('dark', this.isDark);
    localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
  }
}
