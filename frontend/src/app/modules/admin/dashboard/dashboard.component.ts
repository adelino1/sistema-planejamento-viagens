import { Component, OnInit } from '@angular/core';
import { AdminService, AdminDashboardStats } from '../../../services/admin.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  stats: AdminDashboardStats | null = null;
  loading = true;
  recentUsers: any[] = [];
  recentTrips: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.adminService.getStats().subscribe({
      next: (response) => {
        this.stats = response.data;
      },
      error: (error) => console.error('Error loading stats:', error),
      complete: () => {
        this.loadRecentData();
      },
    });
  }

  private loadRecentData(): void {
    this.adminService.getRecentUsers(10).subscribe({
      next: (response) => {
        this.recentUsers = response.data;
      },
    });

    this.adminService.getRecentTrips(10).subscribe({
      next: (response) => {
        this.recentTrips = response.data;
        this.loading = false;
      },
    });
  }
}
