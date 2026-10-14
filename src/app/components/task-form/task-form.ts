import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject
} from '@angular/core';
import {
  FormControl,
  ReactiveFormsModule,
  ValidatorFn
} from '@angular/forms';
import { Task } from '../../models/task.model';
import { TaskStore } from '../../services/task.store';

// Le titre est obligatoire et doit contenir au moins trois caractères utiles.
const titleMin3: ValidatorFn = control => {
  const value = String(control.value ?? '').trim();

  return value.length >= 3 ? null : { titleMin3: true };
};

function todayLocal(): string {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
}

// Une échéance vide est autorisée, mais une date passée est refusée.
const validDueDate: ValidatorFn = control => {
  const value = String(control.value ?? '');

  if (!value) {
    return null;
  }

  return value >= todayLocal() ? null : { dueDate: true };
};

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './task-form.html',
  styleUrl: './task-form.css'
})
export class TaskForm {
  // Le store reste partagé avec la liste et la page de statistiques.
  private readonly taskStore = inject(TaskStore);

  // La page parente fournit la tâche sélectionnée lors d'une modification.
  @Input() taskToEdit: Task | null = null;
  // Événement utilisé pour sortir du mode modification.
  @Output() cancelEdit = new EventEmitter<void>();

  // Les contrôles non-nullables évitent de devoir gérer null dans saveTask().
  readonly title = new FormControl('', {
    nonNullable: true,
    validators: [titleMin3]
  });

  readonly description = new FormControl('', {
    nonNullable: true
  });

  readonly dueDate = new FormControl('', {
    nonNullable: true,
    validators: [validDueDate]
  });

  readonly today = todayLocal();

  get isEditing(): boolean {
    return this.taskToEdit !== null;
  }

  ngOnChanges(): void {
    // Quand une tâche est sélectionnée, le formulaire est prérempli.
    if (this.taskToEdit) {
      this.title.setValue(this.taskToEdit.title);
      this.description.setValue(this.taskToEdit.description ?? '');
      this.dueDate.setValue(this.taskToEdit.dueDate ?? '');
      return;
    }

    this.resetForm();
  }

  saveTask(): void {
    // Les erreurs sont affichées après la première tentative d'envoi.
    this.title.markAsTouched();
    this.dueDate.markAsTouched();

    if (this.title.invalid || this.dueDate.invalid) {
      return;
    }

    if (this.taskToEdit) {
      // En mode édition, on conserve l'identifiant et les dates du modèle.
      this.taskStore.update(
        this.taskToEdit.id,
        this.title.value,
        this.description.value,
        this.dueDate.value
      );

      this.cancel();
      return;
    }

    // Sinon, le store crée une nouvelle tâche.
    this.taskStore.add(
      this.title.value,
      this.description.value,
      this.dueDate.value
    );

    this.resetForm();
  }

  cancel(): void {
    this.resetForm();
    this.cancelEdit.emit();
  }

  private resetForm(): void {
    // Réinitialise les valeurs après un ajout ou une annulation.
    this.title.reset('');
    this.description.reset('');
    this.dueDate.reset('');
  }
}