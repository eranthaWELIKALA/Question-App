import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { EditNotificationModalPage } from './edit-notification-modal.page';

const routes: Routes = [
  {
    path: '',
    component: EditNotificationModalPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [EditNotificationModalPage]
})
export class EditNotificationModalPageModule {}
