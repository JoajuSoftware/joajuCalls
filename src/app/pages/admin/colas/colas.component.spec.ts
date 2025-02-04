import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColasComponent } from './colas.component';

describe('ColasComponent', () => {
  let component: ColasComponent;
  let fixture: ComponentFixture<ColasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
