import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { NotificationPage } from './notification.page';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CreateNotificationModalPage } from './create-notification-modal/create-notification-modal.page';
import { IonicSelectableModule } from 'ionic-selectable';
import { EditNotificationModalPage } from './edit-notification-modal/edit-notification-modal.page';

const routes: Routes = [
  {
    path: '',
    component: NotificationPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FontAwesomeModule,
    IonicSelectableModule,
    RouterModule.forChild(routes)
  ],
  entryComponents: [CreateNotificationModalPage, EditNotificationModalPage],
  declarations: [NotificationPage, CreateNotificationModalPage, EditNotificationModalPage]
})
export class NotificationsPageModule {}
