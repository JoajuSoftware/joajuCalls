import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactManageComponent } from './contact-manage.component';

describe('ContactManageComponent', () => {
  let component: ContactManageComponent;
  let fixture: ComponentFixture<ContactManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactManageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
