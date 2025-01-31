import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallDetalleComponent } from './call-detalle.component';

describe('CallDetalleComponent', () => {
  let component: CallDetalleComponent;
  let fixture: ComponentFixture<CallDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CallDetalleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CallDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
