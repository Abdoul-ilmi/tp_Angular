import { Component, signal } from '@angular/core';
import { Task } from '../../models/task.model';
import { TaskForm } from '../../components/task-form/task-form';
import { TaskList } from '../../components/task-list/task-list';

@Component({
  selector: 'app-task-page',
  standalone: true,
  imports: [TaskForm, TaskList],
  templateUrl: './task-page.html',
  styleUrl: './task-page.css'
})
export class TaskPage {
  // Cette sélection permet au formulaire de basculer entre ajout et édition.
  readonly editingTask = signal<Task | null>(null);

  startEdit(task: Task): void {
    // La liste demande à la page d'ouvrir le formulaire sur cette tâche.
    this.editingTask.set(task);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void {
    // Revenir à null remet le formulaire en mode ajout.
    this.editingTask.set(null);
  }
}
