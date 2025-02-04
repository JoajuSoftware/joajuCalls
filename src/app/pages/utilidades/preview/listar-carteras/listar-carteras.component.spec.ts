import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarCarterasComponent } from './listar-carteras.component';

describe('ListarCarterasComponent', () => {
  let component: ListarCarterasComponent;
  let fixture: ComponentFixture<ListarCarterasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarCarterasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarCarterasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
