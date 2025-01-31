import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumenPorColaComponent } from './resumen-por-cola.component';

describe('ResumenPorColaComponent', () => {
  let component: ResumenPorColaComponent;
  let fixture: ComponentFixture<ResumenPorColaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumenPorColaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResumenPorColaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
