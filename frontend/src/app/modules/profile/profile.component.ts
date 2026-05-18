import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AuthUser } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  readonly user: AuthUser | null;

  constructor(private readonly auth: AuthService) {
    this.user = this.auth.getCurrentUser();
  }
}
