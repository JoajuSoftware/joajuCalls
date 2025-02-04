import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearCarteraComponent } from './crear-cartera.component';

describe('CrearCarteraComponent', () => {
  let component: CrearCarteraComponent;
  let fixture: ComponentFixture<CrearCarteraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearCarteraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearCarteraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
