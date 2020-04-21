import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { HomePageModule } from './home/home.module';
import { AuthGuardService } from './auth-guard.service';
import { InitialPageModule } from './initial/initial.module';

const routes: Routes = [
  { path: '', redirectTo: 'initial', pathMatch: 'full' },
  { path: 'home', loadChildren: () => HomePageModule, canActivate: [AuthGuardService]},
  { path: 'initial', loadChildren: () => InitialPageModule }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
