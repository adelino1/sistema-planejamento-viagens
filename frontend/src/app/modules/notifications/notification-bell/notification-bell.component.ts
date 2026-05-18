import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-notification-bell',
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss'],
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  unreadCount = 0;
  isOpen = false;
  private refreshInterval: any;

  constructor(private readonly notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadUnreadCount();
    // Refresh unread count every 30 seconds
    this.refreshInterval = setInterval(() => this.loadUnreadCount(), 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (res) => {
        this.unreadCount = res.data.count;
      },
      error: () => {
        // Silently fail
      },
    });
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.loadUnreadCount();
    }
  }

  closeDropdown(): void {
    this.isOpen = false;
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.unreadCount = 0;
      },
      error: () => {
        // Silently fail
      },
    });
  }
}
