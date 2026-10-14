import { Routes } from '@angular/router';
import { TaskPage } from './pages/task-page/task-page';
import { StatsPage } from './pages/stats-page/stats-page';

export const routes: Routes = [
  { path: '', component: TaskPage },
  { path: 'stats', component: StatsPage },
  { path: '**', redirectTo: '' }
];
