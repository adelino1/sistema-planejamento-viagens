import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss']
})
export class AuthModalComponent {
  public mode: 'login' | 'register' = 'register';
  
  public name = '';
  public email = '';
  public password = '';
  public isLoading = false;

  constructor(public auth: AuthService) {}

  public async submit() {
    this.isLoading = true;
    
    let success = false;
    if (this.mode === 'login') {
      success = await this.auth.login(this.email, this.password);
    } else {
      success = await this.auth.register(this.name, this.email, this.password);
    }
    
    this.isLoading = false;
    if (!success) {
      alert('Ocorreu um erro. Tente novamente.');
    }
  }
}
