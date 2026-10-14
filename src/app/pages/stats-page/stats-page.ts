import { Component, computed, inject } from '@angular/core';
import { TaskStore } from '../../services/task.store';

@Component({
  selector: 'app-stats-page',
  standalone: true,
  templateUrl: './stats-page.html',
  styleUrl: './stats-page.css'
})
export class StatsPage {
  // La page observe exactement la même instance que la liste des tâches.
  readonly store = inject(TaskStore);

  // Avec une liste vide, le pourcentage est explicitement fixé à 0 %.
  readonly completionPercentage = computed(() => {
    const total = this.store.total();
    return total === 0 ? 0 : Math.round((this.store.doneCount() / total) * 100);
  });
}
