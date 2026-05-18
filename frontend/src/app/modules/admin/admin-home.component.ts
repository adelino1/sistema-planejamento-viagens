import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AuthUser } from '../../models/user.model';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss'],
})
export class AdminHomeComponent implements OnInit {
  user: AuthUser | null = null;

  constructor(private readonly auth: AuthService) {}

  ngOnInit(): void {
    this.user = this.auth.getCurrentUser();
  }
}
