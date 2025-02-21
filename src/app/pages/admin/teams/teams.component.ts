import { Component, signal, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';

// Service and Interfaces
import { TeamsService } from './service/teams.service';
import { Team } from './interface/teams.interface';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    TooltipModule,
    MessagesModule,
    MessageModule
  ],
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss']
})
export class TeamsComponent {
  @ViewChild('dt') dt!: Table;

  private teamsService = inject(TeamsService);
  teams = signal<Team[]>([]);
  dialogVisible = false;
  isEditing = false;
  messages: any[] = [];

  newTeam = signal<Team>({
    id_team: '',
    n_team: ''
  });

  constructor() {
    this.loadTeams();
  }

  loadTeams() {
    this.teamsService.getTeams().subscribe({
      next: (response) => {
        if (response.err_code === '200') {
          this.teams.set(response.mensaje);
        }
      },
      error: (error) => {
        console.error('Error al cargar teams:', error);
        this.messages = [
          { severity: 'error', summary: 'Error', detail: 'Error al cargar los teams' }
        ];
      }
    });
  }

  applyFilterGlobal(event: any) {
    this.dt?.filterGlobal(event.target.value, 'contains');
  }

  showCreateDialog() {
    this.isEditing = false;
    this.newTeam.set({
      id_team: '',
      n_team: ''
    });
    this.dialogVisible = true;
    this.messages = [];
  }

  hideDialog() {
    this.dialogVisible = false;
    this.isEditing = false;
    this.newTeam.set({
      id_team: '',
      n_team: ''
    });
    this.messages = [];
  }

  editTeam(team: Team) {

  }

  saveTeam() {
    const team = this.newTeam();
    if (team.n_team) {
      if (this.isEditing) {
        console.log('Editando team:', team);
      } else {
        // Crear nuevo team
        this.teamsService.createTeam(team.n_team).subscribe({
          next: (response) => {
            if (response.err_code === '200') {
              this.messages = [
                { severity: 'success', summary: 'Éxito', detail: 'Team creado correctamente' }
              ];
              this.hideDialog();
              this.loadTeams();
            } else {
              this.messages = [
                { severity: 'error', summary: 'Error', detail: response.mensaje }
              ];
            }
          },
          error: (error) => {
            console.error('Error al crear team:', error);
            this.messages = [
              { severity: 'error', summary: 'Error', detail: 'Error al crear el team' }
            ];
          }
        });
      }
    }
  }

  deleteTeam(team: Team) {
    console.log('Eliminando team:', team);
  }
}
