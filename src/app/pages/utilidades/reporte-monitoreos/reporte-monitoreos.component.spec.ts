import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteMonitoreosComponent } from './reporte-monitoreos.component';

describe('ReporteMonitoreosComponent', () => {
  let component: ReporteMonitoreosComponent;
  let fixture: ComponentFixture<ReporteMonitoreosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteMonitoreosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteMonitoreosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
