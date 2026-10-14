// Contrat commun utilisé par le formulaire, la liste et le TaskStore.
export interface Task {
  // Identifiant stable utilisé pour modifier, supprimer et suivre une tâche.
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  // Vrai lorsque la tâche est terminée.
  done: boolean;
  // Dates ISO conservées pour suivre la création et la dernière modification.
  createdAt: string;
  updatedAt: string;
}