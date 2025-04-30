import { Component, inject, Input, OnInit, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { Team } from '../../../teams/interface/teams.interface';
import { Usuario } from '../../interfaces/usuario.interface';
import { UsuariosService } from '../../services/usuarios.service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-manage-team',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, ProgressSpinnerModule, TooltipModule],
  templateUrl: './manage-team.component.html',
  styleUrl: './manage-team.component.scss',
})
export class ManageTeamComponent implements OnInit, OnChanges {
  private usuarioService = inject(UsuariosService);

  @Input() user: Usuario = {} as Usuario;
  @Input() teams: Team[] = [];

  teamsAcl = signal<string[]>([]);
  isLoading = signal<boolean>(false);
  userId = signal<string>('');

  ngOnInit() {
    if (this.user && this.user.n_usuario) {
      this.userId.set(this.user.n_usuario);
      this.loadUserTeams();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['user'] && !changes['user'].firstChange) {
      const newUserId = changes['user'].currentValue?.n_usuario;
      const previousUserId = changes['user'].previousValue?.n_usuario;

      if (newUserId !== previousUserId) {
        this.teamsAcl.set([]);
        this.userId.set(newUserId || '');

        if (newUserId) {
          this.loadUserTeams();
        }
      }
    }
  }

  loadUserTeams(): void {
    if (!this.user.n_usuario) {
      return;
    }

    this.teamsAcl.set([]);
    this.isLoading.set(true);

    this.usuarioService.listAclSup(this.user.n_usuario).subscribe({
      next: (response) => {
        if (response.err_code === '200') {
          if (this.user.n_usuario === this.userId()) {
            if (typeof(response.mensaje.acl) === 'string') {
              toast.info('No hay teams asociados al usuario');
              this.teamsAcl.set([]);
            } else {
              this.teamsAcl.set(response.mensaje.acl || []);
            }
            console.log(`Teams asociados para ${this.user.n_usuario}:`, this.teamsAcl());
          } else {
            console.warn(`Datos ignorados: se solicitó para ${this.user.n_usuario} pero el usuario actual es ${this.userId()}`);
          }
        } else {
          console.error('Error al obtener los teams asociados:', response);
          toast.error('Error al obtener los teams asociados');
        }
      },
      error: (error) => {
        console.error('Error al obtener los teams asociados:', error);
        toast.error('Error al obtener los teams asociados');
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  isTeamAssociated(teamId: string): boolean {
    const teamIdStr = teamId.toString();
    return this.teamsAcl().some(id => id.toString() === teamIdStr);
  }

  addTeam(team: Team) {
    if (this.isTeamAssociated(team.id_team)) {
      toast.info('Este equipo ya está asociado al usuario');
      return;
    }

    const data = new FormData();
    data.append('service', 'add_usu_team');
    data.append('usuario', this.user.n_usuario);
    data.append('team', team.id_team);

    this.isLoading.set(true);
    this.usuarioService.addUsuarioTeam(data).subscribe({
      next: (response) => {
        if (response.err_code === '200') {
          toast.success('Equipo asociado correctamente');
          this.teamsAcl.update(current => [...current, team.id_team]);
        } else {
          toast.error('Error al asociar el equipo: ' + response.mensaje);
        }
      },
      error: (error) => {
        console.error('Error al asociar el equipo:', error);
        toast.error('Error al asociar el equipo');
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  deleteTeam(team: Team) {
    if (!this.isTeamAssociated(team.id_team)) {
      toast.info('Este equipo no está asociado al usuario');
      return;
    }

    const data = new FormData();
    data.append('service', 'del_usu_team');
    data.append('usuario', this.user.n_usuario);
    data.append('team', team.id_team);

    this.isLoading.set(true);
    this.usuarioService.delUsuarioTeam(data).subscribe({
      next: (response) => {
        if (response.err_code === '200') {
          toast.success('Equipo desasociado correctamente');
          this.teamsAcl.update(current => current.filter(id => id !== team.id_team));
        } else {
          toast.error('Error al desasociar el equipo: ' + response.mensaje);
        }
      },
      error: (error) => {
        console.error('Error al desasociar el equipo:', error);
        toast.error('Error al desasociar el equipo');
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }
}
