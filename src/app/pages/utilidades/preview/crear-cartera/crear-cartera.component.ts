import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';


// PRIMENG imports
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageModule } from 'primeng/message';

// Others imports
import { TeamsService } from '../../../admin/teams/service/teams.service';
import { ColasService } from '../../../admin/colas/services/colas.service';
import { Team } from '../../../admin/teams/interface/teams.interface';
import { Agent, AgentResponse } from '../../../admin/agentes/interface/agentes.interface';
import { AgentesService } from '../../../admin/agentes/service/agentes.service';
import { Cola } from '../../../admin/colas/interfaces/colas.interface';
import { PreviewService } from '../services/preview.service';


@Component({
  selector: 'app-crear-cartera',
  imports: [SelectModule, ButtonModule, InputTextModule, MultiSelectModule, CheckboxModule, ReactiveFormsModule, FormsModule, FileUploadModule, MessageModule],
  templateUrl: './crear-cartera.component.html',
  styleUrl: './crear-cartera.component.scss'
})
export class CrearCarteraComponent implements OnInit {

  private teamService: TeamsService = inject(TeamsService)
  private agentsService: AgentesService = inject(AgentesService)
  private queuesService: ColasService = inject(ColasService)
  private previewService: PreviewService = inject(PreviewService)
  fb: FormBuilder = inject(FormBuilder);

  teams = signal<Team[]>([]);
  teamSelected = signal<Team>({
    n_team: '',
    id_team: '',
  });
  selectTeamForm: FormGroup;
  totalAgents = signal<AgentResponse[]>([]);
  filteredAgents: AgentResponse[] = [];
  data: FormGroup;
  file: File;
  queues = signal<Cola[]>([]);
  // portfolioId = signal<string[]>([]);
  agents = signal<Agent[]>([]);
  // portfolioId = signal<{ [key: string]: string }>({});
  // portfolioId= signal<Map<string, string>>(new Map());
  portfolioId = signal<any[]>([{
    agent: '',
    campaignId: ''
  }]);
  contacts = signal<string[]>([]);

  constructor() {
    this.selectTeamForm = this.fb.group({
      team: ['', Validators.required],
    });

    this.data = this.fb.group({
      agents: ['', Validators.required],
      name: ['', Validators.required],
      file: ['',Validators.required],
      cola: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.getAgents();
    this.getTeams();
    this.getQueues();
  }

  // Petición para obtener los teams
  getTeams() {
    const response = this.teamService.getTeams().subscribe({
      next: (data) => {
        this.teams.set(data.mensaje);
        console.log(this.teams());
        
      },
      error: (err: Error) => {
        console.log(err);
      },
      complete: () => {
        console.log('complete');
        response.unsubscribe();
      }
    })
  }

  // Petición para obtener los agentes
  getAgents() {

    const response = this.agentsService.getAgentes().subscribe({
      next: (data) => {
        this.totalAgents.set(data.mensaje);
        console.log(this.totalAgents());
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

  // Petición para obtener las Colas
  getQueues(): void {

    const response = this.queuesService.getColas().subscribe({
      next: (data) => {
        this.queues.set(data.mensaje);
        console.log(this.queues());
      },
      error: (err) => {
        console.log(err)
      },
      complete: () => {
        response.unsubscribe()
      }
    })

  }

  // primero validamos de que team se traeran los datos ( usuarios )
  submitForm(): void {
    
    this.teamSelected.set(this.selectTeamForm.value.team);

    this.filteredAgents = this.totalAgents().filter(agent => agent.team === this.teamSelected().n_team)

    // console.info(this.filteredAgents)

  }

  // funcion para subir el archivo
  uploadFile(event: Event) {

    const file = event.target as HTMLInputElement;

    if ( file.files.length > 0) {
      this.file = file.files[0];
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const contents = e.target?.result as string;
      // Implementa tu lógica para parsear el archivo
      this.contacts.set(this.parseContactsFile(contents));  
      console.table(this.contacts())
      // return (contacts);
    };
    // reader.onerror = reject;
    reader.readAsText(this.file);
  };

  campaignsReady = signal<boolean>(false);
  loadingCampaigns = signal<boolean>(false);
  

  // funcion para enviar la petición de creación de la campaña
  submitPreview() {

    // console.log(this.data.value);

    try {

      this.loadingCampaigns.set(true);
      this.campaignsReady.set(false);
      this.portfolioId.set([]);
  
      this.agents.set(this.data.value.agents);

      this.createCampaigns(this.agents());

    } catch (error) {
      alert('Error al crear la campaña');
      console.log(error);

    } finally {

      this.loadingCampaigns.set(false);
      this.campaignsReady.set(true);
      alert('Campañas creadas');
    }

  }

  // Por cada agente se hace una petición para obtener el id de la campaña creada 
  createCampaigns(agent: Agent[]): void {

    agent.forEach((agent: Agent) => {

      // Datos para la campaña
      const formData = new FormData();
      formData.append('service', 'agregar_campana');
      formData.append('n_agente', agent.agente);
      formData.append('cola', this.data.value.cola.cola);
      formData.append('nom_campana', this.data.value.name);

      // Hacer la petición para obtener el id de la campaña creada por cada agente asignado.
      this.getPortfolio(formData, agent.agente);

    })
  }

  // funcion para obtener el id de la campaña creada
  getPortfolio(data: any, agent: string): void {

    console.log(data, agent)

    const response = this.previewService.createPortfolio(data).subscribe({
      next: ({result}) => {
        this.portfolioId.update((values) => {
          return [
            ...values,
            {
              username: agent,
              campaignId: result.last_id
            }
          ]

          
        });
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

  // Funcion para la distribución de contactos
  distributeContacts(): void {

    if(!this.campaignsReady()) return alert('Por favor espere a que se hayan creado las campañas');
    
    try{

      const contacts = this.contacts();
      
      const agents = this.portfolioId();
      
      // Calculo de la cantidad de contactos por agente
      const contactPerAgent = Math.ceil(contacts.length / agents.length);

      agents.forEach((agent, index) => {
        const start = contactPerAgent * index;
        const end = start + contactPerAgent
        const chunk = contacts.slice(start, end);

        console.log({
          index: index,
          agente: agent, 
          empieza: start,
          termina: end,
          contactosAsignados: chunk
        })

        this.asignContactsToAgents(agent.username, agent.campaignId, chunk);

      })

    } catch (error) {

      alert('Error al distribuir los contactos');
      console.log(error);

    }

    this.clearGroups();

  } 

  // Función para asignar los contactos a los agentes
  asignContactsToAgents(agent: string, campaign: string, contacts: any[]): void {
    
    let formData = new FormData();

    // Iteramos por cada contacto, para agregar los datos necesarios al formdata para ser enviado a la API
    contacts.forEach((contact: any) => {

      formData.append('service', 'agregar_reg_preview')
      formData.append('campana', campaign)
      formData.append('agente', agent)
      formData.append('numero', contact.numero)
      formData.append('data_1',contact.data_1)
      formData.append('data_2',contact.data_2)
      formData.append('data_3',contact.data_3)
      formData.append('data_4',contact.data_4)
      formData.append('data_5',contact.data_5)

      // Por cada contacto que se genera en el for, se envia a la API para guardar el contacto
      this.saveContact(formData);

      // Luego se formatea el formData para que no se repitan los datos.
      formData = new FormData();
    })

  }

  // Función para guardar los contactos
  saveContact(data: any): void {

    const response = this.previewService.distributeContacts(data).subscribe({
      next: (response) => {
        console.log(response);
        alert('Contactos distribuidos');
      },
      error: (err) => {
        console.log(err);
        alert('Error al distribuir los contactos');
      },
      complete: () => {
        console.log('complete');
        response.unsubscribe();
      }
    })

  }
  
  // Función para limpiar los campos
  clearGroups() {
    this.portfolioId.set([]);
    this.agents.set([]);
  }

  // Función para parsear el archivo de contactos
  private parseContactsFile(csvData: string): any[] {
    const contacts = [];
    const rows = csvData.split('\n');
    const headers = rows[0].split(',');
  
    for (let i = 1; i < rows.length; i++) {
      const values = rows[i].split(',');
      const contact: any = {};
      
      headers.forEach((header, index) => {
        contact[header.trim()] = values[index]?.trim();
      });
      
      contacts.push(contact);
    }
  
    return contacts;
  }




}
