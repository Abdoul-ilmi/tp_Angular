import { Injectable, computed, effect, signal } from '@angular/core';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskStore {
  // Une seule instance est partagée entre la liste, le formulaire et les stats.
  private readonly storageKey = 'tp2-angular-tasks';

  // Message affiché par la liste si localStorage ne peut pas être utilisé.
  readonly storageError = signal('');

  // Le contenu initial vient de localStorage, puis reste réactif via un Signal.
  readonly tasks = signal<Task[]>(this.loadTasks());

  // État de recherche et d'affichage utilisé par la liste.
  readonly search = signal('');
  readonly filter = signal<'all' | 'todo' | 'done'>('all');
  readonly sort = signal<'dueDate' | 'title'>('dueDate');

  // Valeurs dérivées utilisées par la liste et la page statistiques.
  readonly total = computed(() => this.tasks().length);

  readonly doneCount = computed(() =>
    this.tasks().filter(task => task.done).length
  );

  readonly todoCount = computed(() =>
    this.total() - this.doneCount()
  );

  readonly visibleTasks = computed(() => {
    const search = this.search().trim().toLocaleLowerCase();
    const filter = this.filter();
    const sort = this.sort();

    // On filtre d'abord les tâches selon le statut et le texte recherché.
    const filteredTasks = this.tasks().filter(task => {
      const matchesStatus =
        filter === 'all' ||
        (filter === 'todo' && !task.done) ||
        (filter === 'done' && task.done);

      const text =
        `${task.title} ${task.description ?? ''}`.toLocaleLowerCase();

      return matchesStatus && text.includes(search);
    });

    // Puis on trie uniquement le résultat visible, sans modifier tasks().
    return filteredTasks.sort((a, b) => {
      if (sort === 'title') {
        return a.title.localeCompare(b.title, 'fr');
      }

      if (!a.dueDate && b.dueDate) {
        return 1;
      }

      if (a.dueDate && !b.dueDate) {
        return -1;
      }

      return (
        (a.dueDate ?? '').localeCompare(b.dueDate ?? '') ||
        a.title.localeCompare(b.title, 'fr')
      );
    });
  });

  constructor() {
    // Chaque changement du Signal tasks est automatiquement sauvegardé.
    effect(() => {
      const tasks = this.tasks();

      if (typeof window === 'undefined') {
        return;
      }

      try {
        window.localStorage.setItem(
          this.storageKey,
          JSON.stringify(tasks)
        );
      } catch {
        this.storageError.set(
          'Sauvegarde impossible : les changements risquent ' +
          'd’être perdus après un rechargement.'
        );
      }
    });
  }

  add(
    title: string,
    description: string = '',
    dueDate: string = ''
  ): void {
    // Les champs texte sont nettoyés avant la création du modèle.
    const now = new Date().toISOString();

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || undefined,
      done: false,
      createdAt: now,
      updatedAt: now
    };

    this.tasks.update(tasks => [...tasks, newTask]);
  }

  toggle(id: string): void {
    // Met à jour uniquement la tâche ciblée et conserve les autres références.
    this.tasks.update(tasks =>
      tasks.map(task =>
        task.id === id
          ? {
              ...task,
              done: !task.done,
              updatedAt: new Date().toISOString()
            }
          : task
      )
    );
  }

  update(
    id: string,
    title: string,
    description: string = '',
    dueDate: string = ''
  ): void {
    // La mise à jour conserve l'identité de la tâche et actualise updatedAt.
    this.tasks.update(tasks =>
      tasks.map(task =>
        task.id === id
          ? {
              ...task,
              title: title.trim(),
              description: description.trim() || undefined,
              dueDate: dueDate || undefined,
              updatedAt: new Date().toISOString()
            }
          : task
      )
    );
  }

  remove(id: string): void {
    // Retire la tâche identifiée sans toucher aux autres tâches.
    this.tasks.update(tasks =>
      tasks.filter(task => task.id !== id)
    );
  }

  private loadTasks(): Task[] {
    // Cette garde permet au store de fonctionner aussi côté serveur.
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const savedTasks = window.localStorage.getItem(this.storageKey);

      if (savedTasks === null) {
        return [];
      }

      const parsedTasks: unknown = JSON.parse(savedTasks);

      // Le contenu lu est validé avant d'être utilisé par l'application.
      if (!Array.isArray(parsedTasks)) {
        throw new Error('Le stockage ne contient pas une liste.');
      }

      if (!parsedTasks.every(value => this.isTask(value))) {
        throw new Error('Certaines tâches ont un format invalide.');
      }

      return parsedTasks;
    } catch {
      this.storageError.set(
        'Impossible de charger les anciennes tâches. ' +
        'Une liste vide a été utilisée.'
      );

      return [];
    }
  }

  private isTask(value: unknown): value is Task {
    // Type guard : protège le typage TypeScript après le JSON.parse.
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const task = value as Record<string, unknown>;

    return (
      typeof task['id'] === 'string' &&
      typeof task['title'] === 'string' &&
      typeof task['done'] === 'boolean' &&
      typeof task['createdAt'] === 'string' &&
      typeof task['updatedAt'] === 'string' &&
      (
        task['description'] === undefined ||
        typeof task['description'] === 'string'
      ) &&
      (
        task['dueDate'] === undefined ||
        typeof task['dueDate'] === 'string'
      )
    );
  }
}