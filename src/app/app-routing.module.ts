import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MonthComponent } from './calendar/month/month.component';
import { DayComponent } from './calendar/day/day.component';
import { CreateComponent } from './activity/create/create.component';

const routes: Routes = [
  { path: '', component: MonthComponent },
  { path: 'day/:date', component: DayComponent },
  { path: 'create', component: CreateComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
