import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { LoginScreen } from './components/LoginScreen'
import { Sidebar } from './components/Sidebar'
import { StructureModal } from './components/StructureModal'
import { FlashcardViewer } from './components/FlashcardViewer'
import { FlashcardModals } from './components/FlashcardModals'
import { Menu } from 'lucide-react'
import type { Matiere, Flashcard } from './types'
import 'katex/dist/katex.min.css'

function App() {
  const [session, setSession] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  const [matieres, setMatieres] = useState<Matiere[]>([])
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  
  const [appMode, setAppMode] = useState<'chapitre' | 'revisions' | 'quiz' | 'search'>('chapitre')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])

  const [selectedChapitreId, setSelectedChapitreIdState] = useState<number | null>(() => {
    const saved = localStorage.getItem('lastChapitreId');
    return saved ? parseInt(saved, 10) : null;
  });
  const [currentIndex, setCurrentIndexState] = useState<number>(() => {
    const saved = localStorage.getItem('lastIndex');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [showAnswer, setShowAnswer] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false)
  const [structureAction, setStructureAction] = useState<'addMatiere'|'editMatiere'|'addTheme'|'editTheme'|'addChapitre'|'editChapitre'|null>(null)
  const [structureTargetId, setStructureTargetId] = useState<number | null>(null)
  const [structureInputValue, setStructureInputValue] = useState('')
  const [structureNiveauValue, setStructureNiveauValue] = useState('2nde')

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newType, setNewType] = useState('classique')
  const [newCategorie, setNewCategorie] = useState('defaut')
  const [newQuestion, setNewQuestion] = useState('')
  const [newReponse, setNewReponse] = useState('')
  const [newImage, setNewImage] = useState<File | null>(null)
  const [newImageReponse, setNewImageReponse] = useState<File | null>(null)
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingCardId, setEditingCardId] = useState<number | null>(null)
  const [editType, setEditType] = useState('classique')
  const [editCategorie, setEditCategorie] = useState('defaut')
  const [editQuestion, setEditQuestion] = useState('')
  const [editReponse, setEditReponse] = useState('')
  const [editImage, setEditImage] = useState<File | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)
  const [editImageReponse, setEditImageReponse] = useState<File | null>(null)
  const [currentImageReponseUrl, setCurrentImageReponseUrl] = useState<string | null>(null)

  const setSelectedChapitreId = (id: number | null) => {
    setAppMode('chapitre'); 
    setSelectedChapitreIdState(id);
    if (id === null) localStorage.removeItem('lastChapitreId');
    else localStorage.setItem('lastChapitreId', id.toString());
    setCurrentIndexState(0);
    localStorage.setItem('lastIndex', '0');
  };

  const setCurrentIndex = (index: number) => {
    setCurrentIndexState(index);
    localStorage.setItem('lastIndex', index.toString());
  };

  const fetchUserRole = async (userId: string | undefined) => {
    if (!userId) { setUserRole(null); return; }
    const { data } = await supabase.from('profils').select('role').eq('id', userId).single()
    if (data) setUserRole(data.role)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); fetchUserRole(session?.user?.id) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setSession(session); fetchUserRole(session?.user?.id) })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthLoading(true); setAuthError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setAuthError("Email ou mot de passe incorrect."); setAuthLoading(false)
  }
  const handleLogout = async () => { await supabase.auth.signOut() }

  const loadMatieres = async () => {
    const { data, error } = await supabase.from('matieres').select('*, themes(*, chapitres(*))').order('nom');
    if (data && !error) {
      // Tri par ordre pour respecter le glisser-déposer
      data.forEach(m => {
        m.themes.sort((a: any, b: any) => (a.ordre || 0) - (b.ordre || 0));
        m.themes.forEach((t: any) => {
          t.chapitres.sort((a: any, b: any) => (a.ordre || 0) - (b.ordre || 0));
        });
      });

      setMatieres(data)
      if (appMode === 'chapitre' && data.length > 0 && !selectedChapitreId) {
        for (const m of data) {
          for (const t of m.themes) {
            if (t.chapitres.length > 0) { setSelectedChapitreId(t.chapitres[0].id); return setLoading(false); }
          }
        }
      }
    }
    setLoading(false)
  }
  
  useEffect(() => { if (session) loadMatieres() }, [session, appMode])

  useEffect(() => {
    if (selectedChapitreId === null || !session || appMode !== 'chapitre') return;
    const fetchCards = async () => {
      const { data, error } = await supabase.from('flashcards').select('*').eq('chapitre_id', selectedChapitreId).order('ordre', { ascending: true }).order('id', { ascending: true });
      if (data && !error) {
        setFlashcards(data);
        if (currentIndex >= data.length && data.length > 0) setCurrentIndex(data.length - 1);
        setShowAnswer(false)
      }
    };
    fetchCards();
  }, [selectedChapitreId, session, appMode])

  const getHierarchy = (chapId: number) => {
    for (const m of matieres) {
      for (const t of m.themes) {
        const c = t.chapitres.find(x => x.id === chapId);
        if (c) return { matiere: m.nom, theme: t.nom, niveau: t.niveau, chapitre: c.nom };
      }
    }
    return null;
  }

  const startReviewMode = async () => {
    setAppMode('revisions');
    setSelectedChapitreIdState(null); 
    localStorage.removeItem('lastChapitreId');
    setCurrentIndex(0);
    setShowAnswer(false);
    
    const { data, error } = await supabase.from('progressions').select('flashcards (*)').lte('prochaine_revision', new Date().toISOString()).eq('user_id', session.user.id);
      
    if (!error && data) {
      const cardsToReview = data.map((item: any) => item.flashcards).filter(Boolean);
      cardsToReview.sort((a: any, b: any) => {
        const hA = getHierarchy(a.chapitre_id);
        const hB = getHierarchy(b.chapitre_id);
        if (hA?.matiere !== hB?.matiere) return (hA?.matiere || '').localeCompare(hB?.matiere || '');
        if (hA?.theme !== hB?.theme) return (hA?.theme || '').localeCompare(hB?.theme || '');
        return a.chapitre_id - b.chapitre_id;
      });
      setFlashcards(cardsToReview);
    }
  }

  const startQuizMode = async () => {
    setAppMode('quiz');
    setSelectedChapitreIdState(null);
    localStorage.removeItem('lastChapitreId');
    setCurrentIndex(0);
    setShowAnswer(false);
    
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    
    const { data, error } = await supabase.from('progressions').select('flashcards (*)').eq('user_id', session.user.id).or(`niveau.lte.1,updated_at.lt.${fiveDaysAgo.toISOString()}`).limit(20);
      
    if (!error && data) {
      const cardsToQuiz = data.map((item: any) => item.flashcards).filter(Boolean);
      cardsToQuiz.sort((a: any, b: any) => {
        const hA = getHierarchy(a.chapitre_id);
        const hB = getHierarchy(b.chapitre_id);
        if (hA?.matiere !== hB?.matiere) return (hA?.matiere || '').localeCompare(hB?.matiere || '');
        if (hA?.theme !== hB?.theme) return (hA?.theme || '').localeCompare(hB?.theme || '');
        return a.chapitre_id - b.chapitre_id;
      });
      setFlashcards(cardsToQuiz);
    }
  }

  const handleSearchInput = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) { setSearchSuggestions([]); return; }
    const { data, error } = await supabase.from('flashcards').select('question').or(`question.ilike.%${query}%,reponse.ilike.%${query}%`).limit(5);
    if (!error && data) {
      const unique = Array.from(new Set(data.map(d => d.question)));
      setSearchSuggestions(unique);
    }
  }

  const executeSearch = async (query: string) => {
    if (!query.trim()) return;
    setSearchSuggestions([]); 
    setAppMode('search');
    setSelectedChapitreIdState(null);
    localStorage.removeItem('lastChapitreId');
    setCurrentIndex(0);
    setShowAnswer(false);
    
    const { data, error } = await supabase.from('flashcards').select('*').or(`question.ilike.%${query}%,reponse.ilike.%${query}%`);
    if (!error && data) {
      data.sort((a: any, b: any) => {
        const hA = getHierarchy(a.chapitre_id);
        const hB = getHierarchy(b.chapitre_id);
        if (hA?.matiere !== hB?.matiere) return (hA?.matiere || '').localeCompare(hB?.matiere || '');
        if (hA?.theme !== hB?.theme) return (hA?.theme || '').localeCompare(hB?.theme || '');
        return a.chapitre_id - b.chapitre_id;
      });
      setFlashcards(data);
    }
  }

  const openStructureModal = (action: any, targetId: number | null = null, initialValue: string = '', initialNiveau: string = '2nde') => {
    setStructureAction(action); setStructureTargetId(targetId); setStructureInputValue(initialValue); setStructureNiveauValue(initialNiveau); setIsStructureModalOpen(true)
  }

  const handleStructureSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); let error = null
    if (structureAction === 'addMatiere') error = (await supabase.from('matieres').insert([{ nom: structureInputValue }])).error
    else if (structureAction === 'editMatiere') error = (await supabase.from('matieres').update({ nom: structureInputValue }).eq('id', structureTargetId)).error
    else if (structureAction === 'addTheme') error = (await supabase.from('themes').insert([{ matiere_id: structureTargetId, nom: structureInputValue, niveau: structureNiveauValue, ordre: 999 }])).error
    else if (structureAction === 'editTheme') error = (await supabase.from('themes').update({ nom: structureInputValue, niveau: structureNiveauValue }).eq('id', structureTargetId)).error
    else if (structureAction === 'addChapitre') error = (await supabase.from('chapitres').insert([{ theme_id: structureTargetId, nom: structureInputValue, ordre: 999 }])).error
    else if (structureAction === 'editChapitre') error = (await supabase.from('chapitres').update({ nom: structureInputValue }).eq('id', structureTargetId)).error
    
    if (!error) { setIsStructureModalOpen(false); loadMatieres() }
    setIsSubmitting(false)
  }

  const handleDeleteStructure = async (type: 'matiere' | 'theme' | 'chapitre', id: number) => {
    if (!window.confirm(`Supprimer ${type === 'matiere' ? 'cette matière' : type === 'theme' ? 'ce thème' : 'ce chapitre'} ?`)) return;
    const table = type === 'matiere' ? 'matieres' : type === 'theme' ? 'themes' : 'chapitres'
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (!error) { if (type === 'chapitre' && selectedChapitreId === id) setSelectedChapitreId(null); loadMatieres() }
  }

  const handleAddFlashcard = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!selectedChapitreId) return; 
    setIsSubmitting(true);

    let finalImageUrl = null;
    let finalImageReponseUrl = null;

    if (newImage) {
      const fileExt = newImage.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error } = await supabase.storage.from('images').upload(`flashcards/${fileName}`, newImage);
      if (!error) { const { data } = supabase.storage.from('images').getPublicUrl(`flashcards/${fileName}`); finalImageUrl = data.publicUrl; }
    }

    if (newImageReponse) {
      const fileExt = newImageReponse.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error } = await supabase.storage.from('images').upload(`flashcards/${fileName}`, newImageReponse);
      if (!error) { const { data } = supabase.storage.from('images').getPublicUrl(`flashcards/${fileName}`); finalImageReponseUrl = data.publicUrl; }
    }

    const { data, error } = await supabase.from('flashcards')
      .insert([{ chapitre_id: selectedChapitreId, question: newQuestion, reponse: newReponse, type: newType, categorie: newType === 'classique' ? newCategorie : 'defaut', image_url: finalImageUrl, image_reponse_url: finalImageReponseUrl }])
      .select();

    if (!error && data) { 
      setFlashcards([...flashcards, data[0]]); setIsAddModalOpen(false); 
      setNewQuestion(''); setNewReponse(''); setNewType('classique'); setNewCategorie('defaut'); setNewImage(null); setNewImageReponse(null);
    }
    setIsSubmitting(false);
  }

  const handleDeleteFlashcard = async (id: number) => {
    if (!window.confirm("Supprimer ce contenu ?")) return;
    const { error } = await supabase.from('flashcards').delete().eq('id', id)
    if (!error) {
      const newFlashcards = flashcards.filter(c => c.id !== id); setFlashcards(newFlashcards); setShowAnswer(false)
      if (currentIndex >= newFlashcards.length) setCurrentIndex(Math.max(0, newFlashcards.length - 1))
    }
  }

  const openEditModal = (card: Flashcard) => { 
    setEditingCardId(card.id); setEditQuestion(card.question); setEditReponse(card.reponse); setEditType(card.type || 'classique'); setEditCategorie(card.categorie || 'defaut'); setCurrentImageUrl(card.image_url || null); setEditImage(null); setCurrentImageReponseUrl(card.image_reponse_url || null); setEditImageReponse(null); setIsEditModalOpen(true) 
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!editingCardId) return; 
    setIsSubmitting(true)

    let finalImageUrl = currentImageUrl; let finalImageReponseUrl = currentImageReponseUrl; 

    if (editImage) {
      const fileExt = editImage.name.split('.').pop(); const fileName = `${Math.random()}.${fileExt}`;
      const { error } = await supabase.storage.from('images').upload(`flashcards/${fileName}`, editImage);
      if (!error) { const { data } = supabase.storage.from('images').getPublicUrl(`flashcards/${fileName}`); finalImageUrl = data.publicUrl; }
    }

    if (editImageReponse) {
      const fileExt = editImageReponse.name.split('.').pop(); const fileName = `${Math.random()}.${fileExt}`;
      const { error } = await supabase.storage.from('images').upload(`flashcards/${fileName}`, editImageReponse);
      if (!error) { const { data } = supabase.storage.from('images').getPublicUrl(`flashcards/${fileName}`); finalImageReponseUrl = data.publicUrl; }
    }

    const { error } = await supabase.from('flashcards').update({ question: editQuestion, reponse: editReponse, type: editType, categorie: editType === 'classique' ? editCategorie : 'defaut', image_url: finalImageUrl, image_reponse_url: finalImageReponseUrl }).eq('id', editingCardId)

    if (!error) { 
      setFlashcards(flashcards.map(c => c.id === editingCardId ? { ...c, question: editQuestion, reponse: editReponse, type: editType, categorie: editType === 'classique' ? editCategorie : 'defaut', image_url: finalImageUrl || undefined, image_reponse_url: finalImageReponseUrl || undefined } : c)); 
      setIsEditModalOpen(false) 
    }
    setIsSubmitting(false)
  }

  const handleEvaluation = async (cardId: number, evaluation: 'revoir' | 'difficile' | 'facile') => {
    const now = new Date(); let daysToAdd = 1; let niveau = 0;
    if (evaluation === 'difficile') { daysToAdd = 3; niveau = 1; }
    else if (evaluation === 'facile') { daysToAdd = 7; niveau = 2; }
    now.setDate(now.getDate() + daysToAdd);
    
    const { error } = await supabase.from('progressions').upsert({
      user_id: session.user.id, flashcard_id: cardId, niveau: niveau, prochaine_revision: now.toISOString(), updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, flashcard_id' }); 
    if (error) console.error("Erreur sauvegarde", error);
    setCurrentIndex(currentIndex + 1); setShowAnswer(false);
  }

  const handleReorderFlashcards = async (reorderedCards: Flashcard[]) => {
  setFlashcards(reorderedCards); // Mise à jour visuelle instantanée
  
  const updates = reorderedCards.map((c, index) => ({
    id: c.id,
    ordre: index,
    chapitre_id: c.chapitre_id,
    question: c.question,
    reponse: c.reponse
  }));
  
  await supabase.from('flashcards').upsert(updates);
};

  const handleDragEnd = async (result: any) => {
    const { source, destination, type } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newMatieres = [...matieres];

    if (type === 'THEME') {
      const [, matiereId, , niveau] = source.droppableId.split('-');
      const matiereIndex = newMatieres.findIndex(m => m.id === parseInt(matiereId));
      if (matiereIndex === -1) return;
      
      const themesDuNiveau = newMatieres[matiereIndex].themes.filter(t => (t.niveau || 'Autre') === niveau);
      const autresThemes = newMatieres[matiereIndex].themes.filter(t => (t.niveau || 'Autre') !== niveau);
      
      const [movedTheme] = themesDuNiveau.splice(source.index, 1);
      themesDuNiveau.splice(destination.index, 0, movedTheme);
      
      themesDuNiveau.forEach((t, index) => { t.ordre = index; });
      newMatieres[matiereIndex].themes = [...autresThemes, ...themesDuNiveau];
      
      setMatieres(newMatieres); 
      
      // NOUVELLE SAUVEGARDE ROBUSTE (THEMES)
      const updatePromises = themesDuNiveau.map(t => 
        supabase.from('themes').update({ ordre: t.ordre }).eq('id', t.id)
      );
      const results = await Promise.all(updatePromises);
      const errors = results.filter(r => r.error);
      if (errors.length > 0) console.error("Erreurs lors de la sauvegarde des thèmes :", errors);
    } 
    else if (type === 'CHAPITRE') {
      const themeId = parseInt(source.droppableId.split('-')[1]);
      
      const matiere = newMatieres.find(m => m.themes.some(t => t.id === themeId));
      if (!matiere) return;
      const theme = matiere.themes.find(t => t.id === themeId);
      if (!theme) return;

      const newChapitres = Array.from(theme.chapitres);
      const [movedChapitre] = newChapitres.splice(source.index, 1);
      newChapitres.splice(destination.index, 0, movedChapitre);
      
      newChapitres.forEach((c, index) => { c.ordre = index; });
      theme.chapitres = newChapitres;
      
      setMatieres(newMatieres); 
      
      // NOUVELLE SAUVEGARDE ROBUSTE (CHAPITRES)
      const updatePromises = newChapitres.map(c => 
        supabase.from('chapitres').update({ ordre: c.ordre }).eq('id', c.id)
      );
      const results = await Promise.all(updatePromises);
      const errors = results.filter(r => r.error);
      if (errors.length > 0) console.error("Erreurs lors de la sauvegarde des chapitres :", errors);
    }
  };

  if (!session) return <LoginScreen email={email} setEmail={setEmail} password={password} setPassword={setPassword} authLoading={authLoading} authError={authError} handleLogin={handleLogin} />
  if (loading) return <div className="flex h-screen items-center justify-center">Chargement...</div>

  const activeChapitreId = flashcards[currentIndex]?.chapitre_id || selectedChapitreId;
  const activeHierarchy = activeChapitreId ? getHierarchy(activeChapitreId) : null;

  return (
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row">
      {isMobileOpen && (<div className="fixed inset-0 bg-black/30 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />)}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar 
          userRole={userRole} email={session.user.email} matieres={matieres} 
          selectedChapitreId={selectedChapitreId} 
          setSelectedChapitreId={(id) => { setSelectedChapitreId(id); setIsMobileOpen(false); }}
          handleLogout={handleLogout} openStructureModal={openStructureModal} handleDeleteStructure={handleDeleteStructure} 
          setIsMobileOpen={setIsMobileOpen} appMode={appMode} 
          startReviewMode={startReviewMode} startQuizMode={startQuizMode}
          searchQuery={searchQuery} setSearchQuery={handleSearchInput} executeSearch={executeSearch} searchSuggestions={searchSuggestions}
          onReorder={handleDragEnd} // AJOUTÉ ICI
        />
      </div>
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 z-10 shadow-sm">
          <div className="flex items-center gap-3"><button onClick={() => setIsMobileOpen(true)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"><Menu className="w-5 h-5 text-gray-700" /></button><h1 className="font-bold text-lg text-gray-800">Flashcards</h1></div>
        </div>
        <div className="flex-1 p-4 md:p-8 overflow-hidden relative flex flex-col items-stretch">
          <StructureModal 
            isOpen={isStructureModalOpen} setIsOpen={setIsStructureModalOpen} 
            action={structureAction} inputValue={structureInputValue} setInputValue={setStructureInputValue} 
            niveauValue={structureNiveauValue} setNiveauValue={setStructureNiveauValue} 
            handleSubmit={handleStructureSubmit} isSubmitting={isSubmitting} 
          />
          <FlashcardModals 
            userRole={userRole} isSubmitting={isSubmitting} isAddOpen={isAddModalOpen} setIsAddOpen={setIsAddModalOpen} 
            newType={newType} setNewType={setNewType} newCategorie={newCategorie} setNewCategorie={setNewCategorie} 
            newQuestion={newQuestion} setNewQuestion={setNewQuestion} newReponse={newReponse} setNewReponse={setNewReponse} 
            newImage={newImage} setNewImage={setNewImage} newImageReponse={newImageReponse} setNewImageReponse={setNewImageReponse}
            handleAdd={handleAddFlashcard} isEditOpen={isEditModalOpen} setIsEditOpen={setIsEditModalOpen} 
            editType={editType} setEditType={setEditType} editCategorie={editCategorie} setEditCategorie={setEditCategorie} 
            editQuestion={editQuestion} setEditQuestion={setEditQuestion} editReponse={editReponse} setEditReponse={setEditReponse} 
            editImage={editImage} setEditImage={setEditImage} currentImageUrl={currentImageUrl || undefined} 
            editImageReponse={editImageReponse} setEditImageReponse={setEditImageReponse} currentImageReponseUrl={currentImageReponseUrl || undefined}
            handleEdit={handleEditSubmit}
          />
          <FlashcardViewer 
            flashcards={flashcards} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} 
            showAnswer={showAnswer} setShowAnswer={setShowAnswer} 
            currentMatiereName={activeHierarchy?.matiere}
            currentThemeName={activeHierarchy?.theme}
            currentChapitreName={activeHierarchy?.chapitre}
            userRole={userRole} openEditModal={openEditModal} handleDelete={handleDeleteFlashcard}
            handleEvaluation={handleEvaluation} appMode={appMode} startQuizMode={startQuizMode} searchQuery={searchQuery}
            onReorderCards={handleReorderFlashcards}
          />
        </div>
      </main>
    </div>
  )
}
export default App