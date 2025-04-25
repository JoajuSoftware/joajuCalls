import { Injectable, inject } from '@angular/core';
import { map, forkJoin } from 'rxjs';
import { AgentResumeService } from '../../utilidades/reportes-historicos/resumen-por-agente/services/agent-resume.service';
import { QueueResumeService } from '../../utilidades/reportes-historicos/resumen-por-cola/services/queue-resume.service';
import { ReportsService } from '../../utilidades/reportes-historicos/call-detalle/services/reports.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardDataService {
  private agentResumeService = inject(AgentResumeService);
  private queueResumeService = inject(QueueResumeService);
  private callDetailsService = inject(ReportsService);

  getDashboardData(params: {
    initDate: string,
    endDate: string,
    queues: string
  }) {
    return forkJoin({
      agentResume: this.agentResumeService.getAgentResume({
        initDate: params.initDate,
        endDate: params.endDate,
        queues: params.queues
      }),
      queueResume: this.queueResumeService.getQueueResume({
        initDate: params.initDate,
        endDate: params.endDate,
        queues: params.queues
      }),
      callDetails: this.callDetailsService.getCallsDetails({
        initDate: params.initDate,
        endDate: params.endDate,
        queues: params.queues
      })
    }).pipe(
      map(results => {
        return this.transformDashboardData(results);
      })
    );
  }

  private transformDashboardData(data: any) {
    return {
      callVolumeData: this.createCallVolumeData(data.callDetails),
      callStatusData: this.createCallStatusData(data.callDetails),
      callsByQueueData: this.createCallsByQueueData(data.queueResume),
      callsByAgentData: this.createCallsByAgentData(data.agentResume),
      metrics: this.calculateMetrics(data),
      agentSummary: this.formatAgentSummary(data.agentResume, data.callDetails),
      queueSummary: this.formatQueueSummary(data.queueResume),
      callDetails: this.formatCallDetails(data.callDetails)
    };
  }

  private createCallVolumeData(callDetails: any) {
    if (!callDetails || !callDetails.mensaje || callDetails.mensaje.length === 0) {
      return this.getDefaultCallVolumeData();
    }

    const hourGroups: {[key: string]: any} = {};
    const calls = callDetails.mensaje;

    calls.forEach((call: any) => {
      const date = new Date(call.datetime_ini);
      const hour = date.getHours();
      const hourKey = `${hour}:00`;

      if (!hourGroups[hourKey]) {
        hourGroups[hourKey] = {
          received: 0,
          answered: 0,
          abandoned: 0
        };
      }

      hourGroups[hourKey].received++;

      if (call.estado.toLowerCase() === 'terminada') {
        hourGroups[hourKey].answered++;
      } else if (call.estado.toLowerCase() === 'abandonada') {
        hourGroups[hourKey].abandoned++;
      }
    });

    const sortedHours = Object.keys(hourGroups).sort((a, b) => {
      const hourA = parseInt(a.split(':')[0]);
      const hourB = parseInt(b.split(':')[0]);
      return hourA - hourB;
    });

    return {
      labels: sortedHours,
      datasets: [
        {
          label: 'Llamadas Recibidas',
          data: sortedHours.map(hour => hourGroups[hour].received),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Llamadas Atendidas',
          data: sortedHours.map(hour => hourGroups[hour].answered),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Llamadas Abandonadas',
          data: sortedHours.map(hour => hourGroups[hour].abandoned),
          borderColor: '#F43F5E',
          backgroundColor: 'rgba(244, 63, 94, 0.2)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  }

  private getDefaultCallVolumeData() {
    const hours = ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    return {
      labels: hours,
      datasets: [
        {
          label: 'Llamadas Recibidas',
          data: new Array(hours.length).fill(0),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Llamadas Atendidas',
          data: new Array(hours.length).fill(0),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Llamadas Abandonadas',
          data: new Array(hours.length).fill(0),
          borderColor: '#F43F5E',
          backgroundColor: 'rgba(244, 63, 94, 0.2)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  }

  private createCallStatusData(callDetails: any) {
    const statusCounts = {
      answered: 0,
      abandoned: 0,
      transferred: 0
    };

    if (callDetails && callDetails.mensaje && callDetails.mensaje.length > 0) {
      callDetails.mensaje.forEach((call: any) => {
        const estado = call.estado.toLowerCase();

        switch(estado) {
          case 'terminada':
            statusCounts.answered++;
            break;
          case 'abandonada':
            statusCounts.abandoned++;
            break;
          case 'transferida':
            statusCounts.transferred++;
            break;
        }
      });
    }

    console.log('Estado de llamadas:', statusCounts);

    return {
      labels: ['Atendidas', 'Abandonadas', 'Transferidas'],
      datasets: [
        {
          data: [statusCounts.answered, statusCounts.abandoned, statusCounts.transferred],
          backgroundColor: ['#10B981', '#F43F5E', '#F59E0B'],
          hoverBackgroundColor: ['#059669', '#E11D48', '#D97706']
        }
      ]
    };
  }

  private createCallsByQueueData(queueResume: any) {
    const queues = queueResume.mensaje;
    const queueNames = queues.map((q: any) => q.n_cola || q.cola);

    const totalCalls = queues.map((q: any) => {
      const terminadas = parseInt(q.terminada || '0');
      const abandonadas = parseInt(q.abandonadas || '0');
      return terminadas + abandonadas;
    });

    const waitTimes = queues.map((q: any) => parseInt(q.espera || q.wait_min_15 || '0'));

    return {
      labels: queueNames,
      datasets: [
        {
          label: 'Llamadas Recibidas',
          backgroundColor: '#3B82F6',
          data: totalCalls
        },
        {
          label: 'Tiempo Medio de Espera (seg)',
          backgroundColor: '#F59E0B',
          data: waitTimes
        }
      ]
    };
  }

  private createCallsByAgentData(agentResume: any) {
    const agents = agentResume.mensaje;
    const agentNames = agents.map((a: any) => a.n_agente).slice(0, 5);
    const answeredCalls = agents.map((a: any) => parseInt(a.terminada || '0')).slice(0, 5);

    const talkTimes = agents.map((a: any) => {
      if (a.conversacion) {
        const timeParts = a.conversacion.split(':');
        if (timeParts.length === 3) {
          const hours = parseInt(timeParts[0]);
          const mins = parseInt(timeParts[1]);
          const secs = parseInt(timeParts[2]);
          return hours * 3600 + mins * 60 + secs;
        }
      }
      return 0;
    }).slice(0, 5);

    return {
      labels: agentNames,
      datasets: [
        {
          label: 'Llamadas Atendidas',
          backgroundColor: '#10B981',
          data: answeredCalls
        },
        {
          label: 'Tiempo Medio de Conversación (min)',
          backgroundColor: '#8B5CF6',
          data: talkTimes.map(t => Math.round(t / 60))
        }
      ]
    };
  }

  private calculateMetrics(data: any) {
    let totalCalls = 0;
    let answeredCalls = 0;
    let abandonedCalls = 0;
    let serviceLevel = 0;
    let avgWaitTime = '00:00';
    let avgTalkTime = '00:00';
    let avgHandleTime = '00:00';

    if (data.callDetails && data.callDetails.mensaje && data.callDetails.mensaje.length > 0) {
      const calls = data.callDetails.mensaje;
      totalCalls = calls.length;

      calls.forEach((call: any) => {
        const estado = call.estado.toLowerCase();
        if (estado === 'terminada') {
          answeredCalls++;
        } else if (estado === 'abandonada') {
          abandonedCalls++;
        }
      });

      serviceLevel = Math.round((answeredCalls / totalCalls) * 100);
    }
    else if (data.agentResume && data.agentResume.mensaje && data.agentResume.mensaje.length > 0) {
      const agentMetrics = this.calculateTotalAgentCalls(data.agentResume);

      totalCalls = agentMetrics.totalCalls;
      answeredCalls = agentMetrics.totalAnsweredCalls;
      abandonedCalls = agentMetrics.totalAbandonedCalls;

      serviceLevel = Math.round((answeredCalls / totalCalls) * 100);
    }
    else if (data.queueResume && data.queueResume.mensaje && data.queueResume.mensaje.length > 0) {
      const queues = data.queueResume.mensaje;

      queues.forEach((queue: any) => {
        totalCalls += parseInt(queue.total_calls || queue.terminada || '0');
        answeredCalls += parseInt(queue.terminada || '0');
        abandonedCalls += parseInt(queue.abandonadas || '0');
      });

      if (totalCalls > 0) {
        serviceLevel = Math.round((answeredCalls / totalCalls) * 100);
      }
    }

    if (data.agentResume && data.agentResume.mensaje && data.agentResume.mensaje.length > 0) {
      const agents = data.agentResume.mensaje;

      let totalTalkSeconds = 0;
      let totalHandleSeconds = 0;
      let totalWaitSeconds = 0;
      let validAgentCount = 0;

      agents.forEach((agent: any) => {
        validAgentCount++;

        if (agent.conversacion) {
          const timeParts = agent.conversacion.split(':');
          if (timeParts.length === 3) {
            const hours = parseInt(timeParts[0]);
            const mins = parseInt(timeParts[1]);
            const secs = parseInt(timeParts[2]);
            totalTalkSeconds += hours * 3600 + mins * 60 + secs;
          }
        }

        if (agent.operacion) {
          const timeParts = agent.operacion.split(':');
          if (timeParts.length === 3) {
            const hours = parseInt(timeParts[0]);
            const mins = parseInt(timeParts[1]);
            const secs = parseInt(timeParts[2]);
            totalHandleSeconds += hours * 3600 + mins * 60 + secs;
          }
        }

        if (agent.dur_avg) {
          const timeParts = agent.dur_avg.split(':');
          if (timeParts.length === 3) {
            const hours = parseInt(timeParts[0]);
            const mins = parseInt(timeParts[1]);
            const secs = parseInt(timeParts[2]);
            totalWaitSeconds += hours * 3600 + mins * 60 + secs;
          }
        }
      });

      if (validAgentCount > 0) {
        avgTalkTime = this.formatSecondsToTime(Math.floor(totalTalkSeconds / validAgentCount));
        avgHandleTime = this.formatSecondsToTime(Math.floor(totalHandleSeconds / validAgentCount) || Math.floor(totalTalkSeconds / validAgentCount));
        avgWaitTime = this.formatSecondsToTime(Math.floor(totalWaitSeconds / validAgentCount));
      }
    }

    return {
      totalCalls,
      answeredCalls,
      abandonedCalls,
      serviceLevel,
      avgTalkTime,
      avgWaitTime,
      avgHandleTime
    };
  }

  private formatAgentSummary(agentResume: any, callDetails: any) {
    const agentData = agentResume.mensaje.map((agent: any) => {
      const totalCalls = parseInt(agent.terminada || '0') + parseInt(agent.activas || '0');
      const answeredCalls = parseInt(agent.terminada || '0');
      const abandonedCalls = 0;

      let avgTalkTime = '00:00';
      if (agent.conversacion) {
        const timeParts = agent.conversacion.split(':');
        if (timeParts.length === 3) {
          avgTalkTime = agent.conversacion.substring(0, 5);
        }
      } else if (agent.dur_avg) {
        avgTalkTime = agent.dur_avg.substring(0, 5);
      }

      const serviceLevel = Math.round((answeredCalls / (totalCalls || 1)) * 100);

      return {
        agent: agent.n_agente,
        totalCalls,
        answeredCalls,
        abandonedCalls,
        avgTalkTime,
        avgHandleTime: avgTalkTime,
        serviceLevel
      };
    });

    const abandonedCalls = callDetails?.mensaje?.filter((call: any) =>
      call.estado.toLowerCase() === 'abandonada'
    ).length || 0;

    if (abandonedCalls > 0) {
      agentData.push({
        agent: 'Sin asignar',
        totalCalls: abandonedCalls,
        answeredCalls: 0,
        abandonedCalls: abandonedCalls,
        avgTalkTime: '-',
        avgHandleTime: '-',
        serviceLevel: 0
      });
    }

    return agentData;
  }

  private formatQueueSummary(queueResume: any) {
    return queueResume.mensaje.map((queue: any) => {
      const totalCalls = parseInt(queue.terminada || '0') + parseInt(queue.abandonadas || '0');
      const answeredCalls = parseInt(queue.terminada || '0');
      const abandonedCalls = parseInt(queue.abandonadas || '0');

      let avgWaitTime = '00:00';
      if (queue.espera) {
        const waitParts = queue.espera.split(':');
        if (waitParts.length === 3) {
          avgWaitTime = queue.espera.substring(0, 5);
        } else {
          const waitSecs = parseInt(queue.espera);
          const mins = Math.floor(waitSecs / 60);
          const secs = waitSecs % 60;
          avgWaitTime = `${mins}:${secs.toString().padStart(2, '0')}`;
        }
      }

      let avgTalkTime = '00:00';
      if (queue.conversacion) {
        const talkParts = queue.conversacion.split(':');
        if (talkParts.length === 3) {
          avgTalkTime = queue.conversacion.substring(0, 5);
        } else {
          const talkSecs = parseInt(queue.conversacion);
          const mins = Math.floor(talkSecs / 60);
          const secs = talkSecs % 60;
          avgTalkTime = `${mins}:${secs.toString().padStart(2, '0')}`;
        }
      }

      const serviceLevel = parseInt(queue.wait_min_15 || '85');

      return {
        queue: queue.n_cola || queue.cola,
        totalCalls,
        answeredCalls,
        abandonedCalls,
        avgWaitTime,
        avgTalkTime,
        serviceLevel
      };
    });
  }

  private formatCallDetails(callDetails: any) {
    return callDetails.mensaje.map((call: any) => {
      const date = new Date(call.datetime_ini);
      const formattedDate = date.toLocaleDateString();
      const formattedTime = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

      const callType = call.num && call.num.startsWith('0') ? 'Saliente' : 'Entrante';

      let status = 'Atendida';
      if (call.estado.toLowerCase() === 'abandonada') {
        status = 'Abandonada';
      } else if (call.estado.toLowerCase() === 'transferida') {
        status = 'Transferida';
      }

      return {
        id: call.callid,
        date: formattedDate,
        time: formattedTime,
        type: callType,
        agent: call.n_agente || '-',
        queue: call.n_cola || call.cola,
        waitTime: call.espera || '0:00',
        talkTime: call.duracion || '-',
        status
      };
    });
  }

  private calculateTotalAgentCalls(agentResume: any) {
    let totalCalls = 0;
    let totalAnsweredCalls = 0;
    let totalAbandonedCalls = 0;

    agentResume.mensaje.forEach((agent: any) => {
      const terminadas = parseInt(agent.terminada || '0');
      const activas = parseInt(agent.activas || '0');

      totalCalls += terminadas + activas;
      totalAnsweredCalls += terminadas;
    });

    return {
      totalCalls,
      totalAnsweredCalls,
      totalAbandonedCalls
    };
  }

  private formatSecondsToTime(seconds: number): string {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    const paddedMin = min.toString().padStart(2, '0');
    const paddedSec = sec.toString().padStart(2, '0');
    return `${paddedMin}:${paddedSec}`;
  }
}
