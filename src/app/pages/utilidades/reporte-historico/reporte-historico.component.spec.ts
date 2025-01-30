import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteHistoricoComponent } from './reporte-historico.component';

describe('ReporteHistoricoComponent', () => {
  let component: ReporteHistoricoComponent;
  let fixture: ComponentFixture<ReporteHistoricoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteHistoricoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteHistoricoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
