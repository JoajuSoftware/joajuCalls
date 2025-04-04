import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentInterfaceComponent } from './agent-interface.component';

describe('AgentInterfaceComponent', () => {
  let component: AgentInterfaceComponent;
  let fixture: ComponentFixture<AgentInterfaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentInterfaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentInterfaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
