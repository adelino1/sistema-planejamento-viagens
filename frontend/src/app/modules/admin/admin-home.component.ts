import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AuthUser } from '../../models/user.model';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss'],
})
export class AdminHomeComponent {
  user: AuthUser | null;

  constructor(private readonly auth: AuthService) {
    this.user = this.auth.getCurrentUser();
  }
}
