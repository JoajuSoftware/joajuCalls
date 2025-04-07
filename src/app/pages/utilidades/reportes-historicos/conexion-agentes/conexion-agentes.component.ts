import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

// PRIMENG imports
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';

import { TeamsService } from '../../../admin/teams/service/teams.service';
import { Team } from '../../../admin/teams/interface/teams.interface';
import { FloatLabelModule } from 'primeng/floatlabel';
import { AgentConectionsService } from './services/agent-connections.service';
import { ConnectionAgentData } from '../../models/interface';

@Component({
  selector: 'app-conexion-agentes',
  imports: [TableModule, TagModule, ButtonModule, DatePickerModule, MultiSelectModule, ReactiveFormsModule, FormsModule, FloatLabelModule],
  templateUrl: './conexion-agentes.component.html',
  styleUrl: './conexion-agentes.component.scss'
})
export class ConexionAgentesComponent implements OnInit {

  private teamService: TeamsService = inject(TeamsService);
  private agentConectionsService: AgentConectionsService = inject(AgentConectionsService);
  fb: FormBuilder = inject(FormBuilder);
  data: FormGroup;

  teams = signal<Team[]>([]);
  headers = signal<string[]>([]);
  agentsConnectionsData = signal<ConnectionAgentData[]>([]);

  constructor() {
    this.data = this.fb.group({
      initDate: ['', Validators.required ],
      endDate: ['', Validators.required ],
      selectedTeams: ['', Validators.required ]
    })
  }

  ngOnInit(): void {
    this.getTeams();
    this.headers.set(['Estado', 'Agente', 'Nombre Agente', 'Descanso', 'Inicio', 'Fin', 'Team', 'Tiempo Ausente']);
  }

  // Función para obtener los teams
  getTeams() {
    const response = this.teamService.getTeams().subscribe({
      next: (data) => {
        console.log(data);
        this.teams.set(data.mensaje);
      },
      error: (err) => {
        console.log(err);
      }, 
      complete: () => {
        console.log('complete');
        response.unsubscribe();
      }
    })
  }

  submitForm(): void {

    const formData = {
      'fecha_ini': this.data.value.initDate,
      'fecha_fin': this.data.value.endDate,
      'id_teams': this.data.value.selectedTeams.map((team: Team) => team.id_team)
    }

    console.log(formData)

    this.getConnectionsData(formData);

  }

  getConnectionsData(data): void {

    const response = this.agentConectionsService.getConnectionsData(data).subscribe({
      next: (data) => {
        console.log(data);
        this.agentsConnectionsData.set(data.mensaje);
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => {
        console.log('complete');
        response.unsubscribe();
      }
    })

  }


}