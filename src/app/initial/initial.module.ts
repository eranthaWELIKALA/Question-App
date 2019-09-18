import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { InitialPage } from './initial.page';
import { LoginPage } from './login/login.page';
import { RegisterPage } from './register/register.page';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

const routes: Routes = [
  {
    path: '',
    component: InitialPage,
    children: [
      {
        path: "",
        redirectTo: "login",
        component: InitialPage,
      },
      {
        path: "login",
        component: LoginPage,
      },
      {
        path: "register",
        component: RegisterPage
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FontAwesomeModule,
    RouterModule.forChild(routes)
  ],
  declarations: [InitialPage, RegisterPage, LoginPage]
})
export class InitialPageModule {}
