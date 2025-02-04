import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitoreoAgentesComponent } from './monitoreo-agentes.component';

describe('MonitoreoAgentesComponent', () => {
  let component: MonitoreoAgentesComponent;
  let fixture: ComponentFixture<MonitoreoAgentesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonitoreoAgentesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonitoreoAgentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
