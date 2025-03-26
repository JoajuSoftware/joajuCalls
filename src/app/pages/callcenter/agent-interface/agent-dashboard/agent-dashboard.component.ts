import { Component, signal, ViewChild } from '@angular/core';
import { DialPadComponent } from "../components/call-controls/dial-pad/dial-pad.component";
import { CallDataComponent } from "../components/call-controls/call-data/call-data.component";
import { DisconnectButtonComponent } from "../components/call-controls/disconnect-button/disconnect-button.component";
import { ContactListComponent } from "../components/contact-list/contact-list.component";
import { PausePanelComponent } from "../components/call-controls/pause-panel/pause-panel.component";
import { ContactManageComponent } from "../components/contact-manage/contact-manage.component";

@Component({
  selector: 'app-agent-dashboard',
  imports: [
    DialPadComponent,
    CallDataComponent,
    DisconnectButtonComponent,
    ContactListComponent,
    PausePanelComponent,
    ContactManageComponent
],
  templateUrl: './agent-dashboard.component.html',
  styleUrl: './agent-dashboard.component.scss'
})
export class AgentDashboardComponent {
  @ViewChild(DialPadComponent) dialPad!: DialPadComponent;
  @ViewChild(CallDataComponent) callData!: CallDataComponent;
  
  currentNumber = signal<string>('');
  isCallActive = signal<boolean>(false);

  handlePhoneNumber(phoneNumber: string): void {
    this.dialPad.displayNumber.set(phoneNumber);
  }
  
  handleCallStatusChange(isActive: boolean): void {
    this.isCallActive.set(isActive);
  }
  
  handleNumberDialed(number: string): void {
    this.currentNumber.set(number);
  }
  
  handleDisconnect(): void {
    if (this.isCallActive()) {
      this.dialPad.endCall();
      this.isCallActive.set(false);
      this.currentNumber.set('');
    }
  }
  
  handlePauseStatusChange(isPaused: boolean): void {
    if (isPaused && this.isCallActive()) {
      this.dialPad.endCall();
      this.isCallActive.set(false);
      this.currentNumber.set('');
    }
  }
  
  handleContactCall(contact: {phone: string, name: string}): void {
    if (!this.isCallActive()) {
      this.dialPad.displayNumber.set(contact.phone);
      this.dialPad.toggleCall();
    }
  }
}
