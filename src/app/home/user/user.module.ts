import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { UserPage } from './user.page';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AdminGuardService } from './admin-guard.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

const routes: Routes = [
  {
    path: '',
    component: UserPage
  }, 
  { 
    path: 'admin', 
    loadChildren: () => import('./admin/admin.module').then( m=> m.AdminPageModule),
    canActivate: [AdminGuardService]
  },{ 
    path: 'attempt', 
    loadChildren: () => import('./attempt/attempt.module').then( m=> m.AttemptPageModule)
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FontAwesomeModule,
    NgxDatatableModule,
    RouterModule.forChild(routes)
  ],
  declarations: [UserPage]
})
export class UserPageModule {}
