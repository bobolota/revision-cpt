export interface Flashcard {
  id: number;
  chapitre_id: number;
  question: string;
  reponse: string;
  type: string;
  categorie?: string | null;
  image_url?: string | null;
  image_reponse_url?: string | null;
}

export interface Chapitre {
  id: number;
  theme_id: number;
  nom: string;
  flashcards?: Flashcard[];
  ordre: number;
}

export interface Theme {
  id: number;
  matiere_id: number;
  nom: string;
  niveau: string;
  chapitres: Chapitre[];
  ordre: number;
}

export interface Matiere {
  id: number;
  nom: string;
  themes: Theme[];
}