import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsociarColasTeamComponent } from './asociar-colas-team.component';

describe('AsociarColasTeamComponent', () => {
  let component: AsociarColasTeamComponent;
  let fixture: ComponentFixture<AsociarColasTeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsociarColasTeamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsociarColasTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
