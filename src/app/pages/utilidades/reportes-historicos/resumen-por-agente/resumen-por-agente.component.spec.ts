import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumenPorAgenteComponent } from './resumen-por-agente.component';

describe('ResumenPorAgenteComponent', () => {
  let component: ResumenPorAgenteComponent;
  let fixture: ComponentFixture<ResumenPorAgenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumenPorAgenteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResumenPorAgenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
