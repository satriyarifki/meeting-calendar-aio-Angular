import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MonthComponent } from './calendar/month/month.component';
import { DayComponent } from './calendar/day/day.component';
import { CreateComponent } from './activity/create/create.component';
import { LoginComponent } from './auth/login/login.component';
import { OnAuthGuard, OutAuthGuard } from './services/guard/auth.guard';

const routes: Routes = [
  { path: '', component: MonthComponent },
  { path: 'day', component: DayComponent },
  { path: 'create', component: CreateComponent },
  { path: 'login', component: LoginComponent, canActivate: [OutAuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
