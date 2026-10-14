import { Component, EventEmitter, Output, inject } from '@angular/core';
import { Task } from '../../models/task.model';
import { TaskStore } from '../../services/task.store';

@Component({
  selector: 'app-task-list',
  standalone: true,
  templateUrl: './task-list.html',
  styleUrl: './task-list.css'
})
export class TaskList {
  // Le store contient l'état partagé : tâches, recherche, filtres et tri.
  readonly store = inject(TaskStore);

  // La page parente reçoit la tâche à modifier et affiche le formulaire adapté.
  @Output() editTask = new EventEmitter<Task>();

  edit(task: Task): void {
    this.editTask.emit(task);
  }

  remove(id: string, title: string): void {
    // Une confirmation évite une suppression accidentelle.
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer la tâche « ${title} » ?`
    );

    if (confirmed) {
      this.store.remove(id);
    }
  }

  changeFilter(value: string): void {
    // Vérifie les valeurs provenant du select avant de modifier le Signal.
    if (value === 'all' || value === 'todo' || value === 'done') {
      this.store.filter.set(value);
    }
  }

  changeSort(value: string): void {
    // Même garde-fou pour le choix du mode de tri.
    if (value === 'dueDate' || value === 'title') {
      this.store.sort.set(value);
    }
  }
}