import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NotificationListComponent } from './notification-list/notification-list.component';
import { NotificationCardComponent } from './notification-card/notification-card.component';
import { NotificationBellComponent } from './notification-bell/notification-bell.component';

@NgModule({
  declarations: [
    NotificationListComponent,
    NotificationCardComponent,
    NotificationBellComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
  ],
  exports: [
    NotificationListComponent,
    NotificationCardComponent,
    NotificationBellComponent,
  ],
})
export class NotificationsModule {}
