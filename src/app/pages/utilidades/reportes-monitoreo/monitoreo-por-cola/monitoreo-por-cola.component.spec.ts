import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitoreoPorColaComponent } from './monitoreo-por-cola.component';

describe('MonitoreoPorColaComponent', () => {
  let component: MonitoreoPorColaComponent;
  let fixture: ComponentFixture<MonitoreoPorColaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonitoreoPorColaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonitoreoPorColaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
