import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConexionAgentesComponent } from './conexion-agentes.component';

describe('ConexionAgentesComponent', () => {
  let component: ConexionAgentesComponent;
  let fixture: ComponentFixture<ConexionAgentesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConexionAgentesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConexionAgentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
