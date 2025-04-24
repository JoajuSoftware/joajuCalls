import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { MenuModule } from 'primeng/menu';
import { DividerModule } from 'primeng/divider';
import { BadgeModule } from 'primeng/badge';
import { TabViewModule } from 'primeng/tabview';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgentesService } from '../admin/agentes/service/agentes.service';
import { ColasService } from '../admin/colas/services/colas.service';
import { TeamsService } from '../admin/teams/service/teams.service';
import { forkJoin } from 'rxjs';
import { DashboardDataService } from './services/dashboard-data.service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ChartModule,
    TableModule,
    ProgressBarModule,
    ToastModule,
    MenuModule,
    DividerModule,
    BadgeModule,
    TabViewModule,
    DropdownModule,
    CalendarModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  agentsCount = signal(0);
  teamsCount = signal(0);
  colasCount = signal(0);
  isLoading = signal(false);

  hasCallVolumeData = signal(false);
  hasCallStatusData = signal(false);
  hasCallsByQueueData = signal(false);
  hasCallsByAgentData = signal(false);

  selectedTimeRange = 'today';
  selectedAgent: string | null = null;
  selectedQueue: string | null = null;

  customDateRange: Date[] = [];
  showDatePicker = signal(false);
  maxDate = new Date();

  agents = signal<any[]>([]);
  queues = signal<any[]>([]);

  callVolumeData = {
    labels: [],
    datasets: []
  };

  callsByQueueData = {
    labels: [],
    datasets: []
  };

  callsByAgentData = {
    labels: [],
    datasets: []
  };

  callStatusData = {
    labels: [],
    datasets: []
  };

  agentSummary = signal<any[]>([]);
  queueSummary = signal<any[]>([]);
  callDetails = signal<any[]>([]);
  agentMonitoring = signal<any[]>([]);

  metrics = signal({
    totalCalls: 0,
    answeredCalls: 0,
    abandonedCalls: 0,
    avgWaitTime: '00:00',
    avgTalkTime: '00:00',
    avgHandleTime: '00:00'
  });

  timeRangeOptions = [
    { label: 'Hoy', value: 'today' },
    { label: 'Ayer', value: 'yesterday' },
    { label: 'Última semana', value: 'last_week' },
    { label: 'Último mes', value: 'last_month' },
    { label: 'Último año', value: 'last_year' }
  ];

  private agentesService = inject(AgentesService);
  private colasService = inject(ColasService);
  private teamsService = inject(TeamsService);
  private dashboardDataService = inject(DashboardDataService);
  private router = inject(Router);

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    this.isLoading.set(true);

    this.hasCallVolumeData.set(false);
    this.hasCallStatusData.set(false);
    this.hasCallsByQueueData.set(false);
    this.hasCallsByAgentData.set(false);

    this.loadAgentsTeamsAndQueues();
    this.loadDashboardData();
  }

  loadAgentsTeamsAndQueues() {
    forkJoin({
      agents: this.agentesService.getAgentes(),
      teams: this.teamsService.getTeams(),
      colas: this.colasService.getColas()
    }).subscribe({
      next: (results) => {
        const agents = results.agents.mensaje;
        this.agentsCount.set(agents.length);

        this.agents.set(
          agents.map(agent => ({
            value: agent.id,
            label: agent.nombre
          }))
        );

        this.teamsCount.set(results.teams.mensaje.length);
        this.colasCount.set(results.colas.mensaje.length);
        this.queues.set(
          results.colas.mensaje.map(cola => ({
            value: cola.id,
            label: cola.n_cola
          }))
        );
      },
      error: (error) => {
        console.error('Error cargando datos del dashboard:', error);
        toast.error('Error al cargar los datos del dashboard');
      }
    });
  }

  loadDashboardData() {
    this.colasService.getColas().subscribe({
      next: (colasResponse) => {
        const allColas = colasResponse.mensaje.map(cola => cola.cola).join(',');

        const dateRange = this.getDateRangeFromSelection();

        if (!dateRange) {
          this.isLoading.set(false);
          return;
        }

        this.dashboardDataService.getDashboardData({
          initDate: dateRange.initDate,
          endDate: dateRange.endDate,
          queues: allColas
        }).subscribe({
          next: (data) => {
            if (data.callVolumeData &&
                data.callVolumeData.labels &&
                data.callVolumeData.labels.length > 0 &&
                data.callVolumeData.datasets &&
                data.callVolumeData.datasets.length > 0) {
              this.callVolumeData = data.callVolumeData;
              this.hasCallVolumeData.set(true);
            } else {
              this.callVolumeData = { labels: [], datasets: [] };
              this.hasCallVolumeData.set(false);
            }

            if (data.callStatusData &&
                data.callStatusData.labels &&
                data.callStatusData.labels.length > 0 &&
                data.callStatusData.datasets &&
                data.callStatusData.datasets.length > 0) {
              this.callStatusData = data.callStatusData;
              this.hasCallStatusData.set(true);
            } else {
              this.callStatusData = { labels: [], datasets: [] };
              this.hasCallStatusData.set(false);
            }

            if (data.callsByQueueData &&
                data.callsByQueueData.labels &&
                data.callsByQueueData.labels.length > 0 &&
                data.callsByQueueData.datasets &&
                data.callsByQueueData.datasets.length > 0) {
              this.callsByQueueData = data.callsByQueueData;
              this.hasCallsByQueueData.set(true);
            } else {
              this.callsByQueueData = { labels: [], datasets: [] };
              this.hasCallsByQueueData.set(false);
            }

            if (data.callsByAgentData &&
                data.callsByAgentData.labels &&
                data.callsByAgentData.labels.length > 0 &&
                data.callsByAgentData.datasets &&
                data.callsByAgentData.datasets.length > 0) {
              this.callsByAgentData = data.callsByAgentData;
              this.hasCallsByAgentData.set(true);
            } else {
              this.callsByAgentData = { labels: [], datasets: [] };
              this.hasCallsByAgentData.set(false);
            }

            this.agentSummary.set(data.agentSummary || []);
            this.queueSummary.set(data.queueSummary || []);
            this.callDetails.set(data.callDetails || []);

            if (data.agentSummary && data.agentSummary.length > 0) {
              this.generateAgentMonitoring(data.agentSummary);
            } else {
              this.agentMonitoring.set([]);
            }

            this.metrics.set(data.metrics || {
              totalCalls: 0,
              answeredCalls: 0,
              abandonedCalls: 0,
              avgWaitTime: '00:00',
              avgTalkTime: '00:00',
              avgHandleTime: '00:00'
            });

            this.isLoading.set(false);
          },
          error: (error) => {
            console.error('Error cargando datos de reportes:', error);
            this.resetData();
            toast.warning('No se encontraron datos para el periodo seleccionado');
            this.isLoading.set(false);
          }
        });
      },
      error: (error) => {
        console.error('Error obteniendo colas:', error);
        toast.error('Error al obtener las colas');
        this.isLoading.set(false);
      }
    });
  }

  resetData() {
    this.callVolumeData = { labels: [], datasets: [] };
    this.callStatusData = { labels: [], datasets: [] };
    this.callsByQueueData = { labels: [], datasets: [] };
    this.callsByAgentData = { labels: [], datasets: [] };

    this.hasCallVolumeData.set(false);
    this.hasCallStatusData.set(false);
    this.hasCallsByQueueData.set(false);
    this.hasCallsByAgentData.set(false);

    this.agentSummary.set([]);
    this.queueSummary.set([]);
    this.callDetails.set([]);
    this.agentMonitoring.set([]);

    this.metrics.set({
      totalCalls: 0,
      answeredCalls: 0,
      abandonedCalls: 0,
      avgWaitTime: '00:00',
      avgTalkTime: '00:00',
      avgHandleTime: '00:00'
    });
  }

  getDateRangeFromSelection(): { initDate: string, endDate: string } | null {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (this.selectedTimeRange) {
      case 'today':
        break;

      case 'yesterday':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 1);
        endDate = new Date(startDate);
        break;

      case 'last_week':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        break;

      case 'last_month':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
        break;

        case 'last_year':
          startDate = new Date(today);
          startDate.setFullYear(today.getFullYear());
          startDate.setMonth(0);
          startDate.setDate(1);

          endDate = new Date(today.getFullYear(), 11, 31);
          break;
    }

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      initDate: formatDate(startDate),
      endDate: formatDate(endDate)
    };
  }

  onTimeRangeChange() {
    if (this.selectedTimeRange === 'custom') {
      this.showDatePicker.set(true);
      this.customDateRange = [];
    } else {
      this.showDatePicker.set(false);
      this.loadDashboardData();
    }
  }

  onCustomDateSelect() {
    if (this.customDateRange && this.customDateRange.length === 2) {
      this.loadDashboardData();
    }
  }

  generateAgentMonitoring(agentSummary: any[]) {
    const monitoring = [];

    for (let i = 0; i < agentSummary.length; i++) {
      const agent = agentSummary[i];
      const statuses = ['Disponible', 'En llamada', 'Pausa', 'Desconectado'];
      const pauseReasons = ['Almuerzo', 'Descanso', 'Reunión', 'Capacitación'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      monitoring.push({
        agent: agent.agent,
        extension: 1000 + i,
        status: status,
        pauseReason: status === 'Pausa' ? pauseReasons[Math.floor(Math.random() * pauseReasons.length)] : '-',
        lastCallTime: new Date(Date.now() - (Math.floor(Math.random() * 120) * 60000)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        callsToday: agent.totalCalls || 0,
        avgTalkTime: agent.avgTalkTime || '00:00'
      });
    }

    this.agentMonitoring.set(monitoring);
  }

  onAgentChange() {
    console.log('Agente seleccionado:', this.selectedAgent);
  }

  onQueueChange() {
    console.log('Cola seleccionada:', this.selectedQueue);
  }


  private processDashboardData(data: any) {
    this.callVolumeData = data.callVolumeData;
    this.callStatusData = data.callStatusData;
    this.callsByQueueData = data.callsByQueueData;
    this.callsByAgentData = data.callsByAgentData;

    this.agentSummary.set(data.agentSummary || []);
    this.queueSummary.set(data.queueSummary || []);
    this.callDetails.set(data.callDetails || []);

    this.metrics.set(data.metrics || {
      totalCalls: 0,
      answeredCalls: 0,
      abandonedCalls: 0,
      avgWaitTime: '00:00',
      avgTalkTime: '00:00',
      avgHandleTime: '00:00'
    });

    this.isLoading.set(false);
  }


  filterDataByAgent() {
    const filteredCalls = this.callDetails()
      .filter(call => call.agent && call.agent.includes(this.selectedAgent || ''));
    this.callDetails.set(filteredCalls);

    const selectedAgentData = this.agentSummary()
      .find(summary => summary.agent && summary.agent.includes(this.selectedAgent || ''));

    if (selectedAgentData) {
      this.metrics.update(current => ({
        ...current,
        totalCalls: selectedAgentData.totalCalls,
        answeredCalls: selectedAgentData.answeredCalls,
        abandonedCalls: selectedAgentData.abandonedCalls,
        avgTalkTime: selectedAgentData.avgTalkTime,
        avgHandleTime: selectedAgentData.avgHandleTime
      }));
    }
  }

  filterDataByQueue() {
    const filteredCalls = this.callDetails()
      .filter(call => call.queue && call.queue.includes(this.selectedQueue || ''));
    this.callDetails.set(filteredCalls);

    const selectedQueueData = this.queueSummary()
      .find(summary => summary.queue && summary.queue.includes(this.selectedQueue || ''));

    if (selectedQueueData) {
      this.metrics.update(current => ({
        ...current,
        totalCalls: selectedQueueData.totalCalls,
        answeredCalls: selectedQueueData.answeredCalls,
        abandonedCalls: selectedQueueData.abandonedCalls,
        avgWaitTime: selectedQueueData.avgWaitTime,
        avgTalkTime: selectedQueueData.avgTalkTime,
      }));
    }
  }

  refreshData() {
    this.selectedAgent = null;
    this.selectedQueue = null;

    if (this.selectedTimeRange !== 'custom' || (this.customDateRange && this.customDateRange.length === 2)) {
      this.loadInitialData();
      toast.success('Datos actualizados correctamente');
    } else {
      toast.warning('Por favor seleccione un rango de fechas completo');
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
