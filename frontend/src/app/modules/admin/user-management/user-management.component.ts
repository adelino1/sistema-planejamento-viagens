import { Component, OnInit } from '@angular/core';
import { AdminService, User, AdminUsersResponse } from '../../../services/admin.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  loading = true;
  page = 1;
  limit = 20;
  total = 0;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.adminService.listUsers(this.page, this.limit).subscribe({
      next: (response: AdminUsersResponse) => {
        this.users = response.data;
        this.total = response.pagination.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
      },
    });
  }

  deactivateUser(userId: number): void {
    if (confirm('Are you sure you want to deactivate this user?')) {
      this.adminService.deactivateUser(userId).subscribe({
        next: () => {
          this.loadUsers();
        },
      });
    }
  }

  activateUser(userId: number): void {
    this.adminService.activateUser(userId).subscribe({
      next: () => {
        this.loadUsers();
      },
    });
  }

  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user permanently?')) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          this.loadUsers();
        },
      });
    }
  }

  nextPage(): void {
    this.page++;
    this.loadUsers();
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadUsers();
    }
  }
}
