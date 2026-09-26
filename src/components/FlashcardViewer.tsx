import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Latex from 'react-latex-next'
import { Pencil, Trash2, ChevronRight, ChevronDown, ArrowRight, Trophy, Calculator, BookOpen, Lightbulb, Calendar, User, HelpCircle, FileText, RotateCcw, Brain, CheckCircle2, Flame, Sparkles, Search, GripVertical, ListOrdered } from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { Flashcard } from "../types"

interface FlashcardViewerProps {
  flashcards: Flashcard[]; currentIndex: number; setCurrentIndex: (val: number) => void;
  showAnswer: boolean; setShowAnswer: (val: boolean) => void;
  currentMatiereName?: string; currentThemeName?: string; currentChapitreName?: string; userRole: string | null;
  openEditModal: (card: Flashcard) => void; handleDelete: (id: number) => void;
  handleEvaluation?: (cardId: number, evaluation: 'revoir' | 'difficile' | 'facile') => void;
  appMode?: 'chapitre' | 'revisions' | 'quiz' | 'search';
  startQuizMode?: () => void;
  searchQuery?: string; 
  onReorderCards?: (cards: Flashcard[]) => void; // NOUVEAU
}

const getCategoryConfig = (cat?: string | null) => {
  switch (cat) {
    case 'formule': return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: Calculator, label: 'Formule' };
    case 'definition': return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', icon: BookOpen, label: 'Définition' };
    case 'theoreme': return { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200', icon: Lightbulb, label: 'Théorème' };
    case 'date': return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', icon: Calendar, label: 'Date clé' };
    case 'personnage': return { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', icon: User, label: 'Personnage' };
    default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: HelpCircle, label: 'Question' };
  }
}

export function FlashcardViewer({
  flashcards, currentIndex, setCurrentIndex, showAnswer, setShowAnswer, currentMatiereName, currentThemeName, currentChapitreName, userRole, openEditModal, handleDelete, handleEvaluation, appMode, startQuizMode, searchQuery, onReorderCards
}: FlashcardViewerProps) {
  
  const [showFiches, setShowFiches] = useState(true)
  const [showQuestions, setShowQuestions] = useState(true)
  const [isReordering, setIsReordering] = useState(false) // NOUVEAU : État du mode réorganisation

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(flashcards);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Garder l'index actuel synchronisé avec la carte regardée
    if (currentIndex === result.source.index) setCurrentIndex(result.destination.index);
    else if (currentIndex > result.source.index && currentIndex <= result.destination.index) setCurrentIndex(currentIndex - 1);
    else if (currentIndex < result.source.index && currentIndex >= result.destination.index) setCurrentIndex(currentIndex + 1);

    if (onReorderCards) onReorderCards(items);
  };

  if (flashcards.length === 0) {
    if (appMode === 'search') return (<div className="flex flex-col items-center justify-center h-full text-center text-gray-500 mt-12 w-full max-w-lg mx-auto bg-white p-10 rounded-3xl border border-gray-100 shadow-sm"><Search className="w-16 h-16 text-blue-400 mb-4" /><h2 className="text-2xl font-black mb-2 text-gray-800">Aucun résultat</h2><p className="text-gray-500">Aucune carte ne contient "{searchQuery}".</p></div>)
    if (appMode === 'revisions') return (<div className="flex flex-col items-center justify-center h-full text-center text-gray-500 mt-12 w-full max-w-lg mx-auto bg-white p-10 rounded-3xl border border-gray-100 shadow-sm"><Trophy className="w-16 h-16 text-emerald-500 mb-4" /><h2 className="text-2xl font-black mb-2 text-gray-800">C'est tout pour aujourd'hui !</h2><Button onClick={startQuizMode} className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-11 px-6 shadow-md flex gap-2"><Flame className="w-5 h-5"/> Quiz de renforcement</Button></div>)
    if (appMode === 'quiz') return (<div className="flex flex-col items-center justify-center h-full text-center text-gray-500 mt-12 w-full max-w-lg mx-auto bg-white p-10 rounded-3xl border border-gray-100 shadow-sm"><Sparkles className="w-16 h-16 text-blue-400 mb-4" /><h2 className="text-2xl font-black mb-2 text-gray-800">Aucun point faible !</h2><p className="text-gray-500">Vous maîtrisez toutes vos cartes.</p></div>)
    return (<div className="text-center text-gray-500 mt-12 w-full"><h2 className="text-3xl font-bold mb-2">Chapitre vide</h2><p className="text-lg">Il n'y a pas encore de contenu.</p></div>)
  }

  const currentCard = flashcards[currentIndex]
  const fiches = flashcards.filter(c => c.type === 'fiche')
  const questions = flashcards.filter(c => c.type !== 'fiche')

  const handleNextCard = () => { setCurrentIndex(currentIndex + 1); setShowAnswer(false) }
  const changeCard = (index: number) => { setCurrentIndex(index); setShowAnswer(false); setIsReordering(false); } // Désactive la réorganisation au clic

  const activeCatConfig = getCategoryConfig(currentCard?.categorie);
  const ActiveIcon = activeCatConfig.icon;

  const headerSubtitle = appMode === 'chapitre' 
    ? `${currentMatiereName} ${currentThemeName ? `• ${currentThemeName}` : ''}`
    : appMode === 'search' ? 'RÉSULTATS DE RECHERCHE' : `${appMode === 'revisions' ? 'RÉVISIONS' : 'QUIZ'} • ${currentMatiereName || ''} ${currentThemeName ? `(${currentThemeName})` : ''}`;

  const headerTitle = appMode === 'chapitre'
    ? currentChapitreName
    : appMode === 'search' ? `Recherche : "${searchQuery}"` : (currentChapitreName || (appMode === 'revisions' ? "Révisions du jour" : "Quiz : Points faibles"));

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-6 lg:gap-10 items-stretch">
      <div className="w-full lg:w-[320px] xl:w-[380px] flex-shrink-0 flex flex-col h-auto max-h-[35vh] lg:max-h-none lg:h-[calc(100vh-4rem)] overflow-y-auto lg:pr-6 border-b lg:border-b-0 lg:border-r border-gray-200 pb-4 lg:pb-0">
        <div className="mb-4 md:mb-6 sticky top-0 bg-gray-50 pb-2 md:pb-4 z-10 border-b border-gray-100">
          <h2 className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest truncate">{headerSubtitle}</h2>
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-800 mt-1 leading-tight flex items-center gap-2">
            {appMode === 'revisions' && <Brain className="w-6 h-6 text-indigo-600" />}
            {appMode === 'quiz' && <Flame className="w-6 h-6 text-orange-500" />}
            {appMode === 'search' && <Search className="w-6 h-6 text-blue-500" />}
            {headerTitle}
          </h1>
          
          {/* BOUTON RÉORGANISER (Visible uniquement pour le prof dans un chapitre avec +1 carte) */}
          {userRole === 'prof' && appMode === 'chapitre' && flashcards.length > 1 && (
            <Button 
              variant={isReordering ? "default" : "outline"}
              onClick={() => setIsReordering(!isReordering)} 
              className={`w-full mt-4 flex items-center gap-2 ${isReordering ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-white'}`}
            >
              <ListOrdered className="w-4 h-4" /> 
              {isReordering ? "Terminer la réorganisation" : "Réorganiser les cartes"}
            </Button>
          )}
        </div>

        <div className={`flex flex-col gap-4 md:gap-5 pb-4 md:pb-8 ${isReordering ? 'opacity-50 pointer-events-none' : ''}`}>
          {fiches.length > 0 && (
            <div>
              <button onClick={() => setShowFiches(!showFiches)} className="flex items-center justify-between w-full p-2.5 md:p-3 bg-purple-50 text-purple-800 rounded-2xl font-bold text-xs md:text-sm mb-2 md:mb-3 hover:bg-purple-100 transition-colors">
                <span className="flex items-center gap-2"><ChevronRight className="w-4 h-4 transition-transform duration-300" style={{ transform: showFiches ? 'rotate(90deg)' : 'rotate(0deg)' }} /> Fiches de synthèse</span>
              </button>
              <div className={`grid transition-all duration-300 ease-in-out ${showFiches ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden"><div className="flex flex-col gap-2 md:gap-3 pb-2">
                    {fiches.map((card) => {
                      const globalIndex = flashcards.findIndex(f => f.id === card.id)
                      const isActive = globalIndex === currentIndex && !isReordering
                      return (
                        <div key={card.id} onClick={() => changeCard(globalIndex)} className={`p-3 md:p-4 rounded-2xl cursor-pointer transition-all border shadow-sm ${isActive ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-200' : 'bg-white border-gray-100 hover:border-purple-200 hover:bg-purple-50/50'}`}>
                          <div className="flex items-center gap-2 mb-1.5 md:mb-2"><span className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full"><FileText className="w-3 h-3"/> Fiche</span></div>
                          <div className={`text-xs md:text-sm line-clamp-2 ${isActive ? 'text-gray-900 font-medium' : 'text-gray-600'}`}><Latex>{card.question}</Latex></div>
                        </div>
                      )
                    })}
                </div></div>
              </div>
            </div>
          )}

          {questions.length > 0 && (
            <div>
              <button onClick={() => setShowQuestions(!showQuestions)} className="flex items-center justify-between w-full p-2.5 md:p-3 bg-blue-50 text-blue-800 rounded-2xl font-bold text-xs md:text-sm mb-2 md:mb-3 hover:bg-blue-100 transition-colors">
                <span className="flex items-center gap-2"><ChevronRight className="w-4 h-4 transition-transform duration-300" style={{ transform: showQuestions ? 'rotate(90deg)' : 'rotate(0deg)' }} /> {appMode === 'revisions' || appMode === 'quiz' ? 'Cartes à revoir' : appMode === 'search' ? 'Résultats trouvés' : "Questions d'entraînement"}</span>
              </button>
              <div className={`grid transition-all duration-300 ease-in-out ${showQuestions ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden"><div className="flex flex-col gap-2 md:gap-3 pb-2">
                    {questions.map((card) => {
                      const globalIndex = flashcards.findIndex(f => f.id === card.id)
                      const isActive = globalIndex === currentIndex && !isReordering
                      const catConfig = getCategoryConfig(card.categorie)
                      const Icon = catConfig.icon

                      return (
                        <div key={card.id} onClick={() => changeCard(globalIndex)} className={`p-3 md:p-4 rounded-2xl cursor-pointer transition-all border shadow-sm ${isActive ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200' : 'bg-white border-gray-100 hover:border-blue-200 hover:bg-blue-50/50'}`}>
                          <div className="flex items-center gap-2 mb-1.5 md:mb-2">
                            <span className={`flex items-center gap-1 text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${catConfig.bg} ${catConfig.text}`}>
                              <Icon className="w-3 h-3" /> {catConfig.label}
                            </span>
                          </div>
                          <div className={`text-xs md:text-sm line-clamp-3 ${isActive ? 'text-gray-900 font-medium' : 'text-gray-600'}`}><Latex>{card.question}</Latex></div>
                        </div>
                      )
                    })}
                </div></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ZONE DE DROITE : AFFICHE LA CARTE OU LA LISTE DE RÉORGANISATION */}
      <div className="flex-1 flex justify-center items-start pt-2 lg:pt-8 lg:h-[calc(100vh-4rem)] overflow-y-auto pb-12 w-full">
        
        {isReordering ? (
          <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-indigo-500" />
              Glissez et déposez pour réorganiser
            </h3>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="flashcards-list">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-3">
                    {flashcards.map((card, index) => {
                      const catConf = getCategoryConfig(card.categorie);
                      return (
                        <Draggable key={`card-${card.id}`} draggableId={`card-${card.id}`} index={index}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-2xl shadow-sm group hover:border-indigo-300 transition-colors">
                              <div {...provided.dragHandleProps} className="text-gray-300 hover:text-indigo-500 cursor-grab active:cursor-grabbing px-1">
                                <GripVertical className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col gap-1 overflow-hidden">
                                <span className={`w-max text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${card.type === 'fiche' ? 'bg-purple-100 text-purple-700' : catConf.bg + ' ' + catConf.text}`}>
                                  {card.type === 'fiche' ? 'Fiche' : catConf.label}
                                </span>
                                <div className="text-sm font-medium text-gray-700 truncate line-clamp-1"><Latex>{card.question}</Latex></div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      )
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        ) : !currentCard ? (
          <div className="flex flex-col items-center justify-center text-center bg-white p-10 rounded-3xl border border-gray-100 shadow-sm max-w-lg w-full mt-10 md:mt-20">
            {appMode === 'quiz' ? <Flame className="w-16 h-16 md:w-20 md:h-20 text-orange-500 mb-6 drop-shadow-md" /> : appMode === 'search' ? <Search className="w-16 h-16 md:w-20 md:h-20 text-blue-500 mb-6 drop-shadow-md" /> : <Trophy className="w-16 h-16 md:w-20 md:h-20 text-yellow-500 mb-6 drop-shadow-md" />}
            <h2 className="text-2xl md:text-3xl font-black mb-3 text-gray-800">{appMode === 'revisions' ? "Révisions terminées !" : appMode === 'quiz' ? "Session terminée !" : appMode === 'search' ? "Recherche terminée !" : "Chapitre terminé !"}</h2>
            <p className="text-gray-500 mb-8 text-base md:text-lg">{appMode === 'revisions' ? "Félicitations, vous êtes à jour pour aujourd'hui." : appMode === 'quiz' ? "Bravo pour cet entraînement intensif. Continuez comme ça !" : appMode === 'search' ? "Vous avez parcouru tous les résultats de votre recherche." : "Excellent travail, vous avez vu toutes les cartes de ce chapitre."}</p>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <Button onClick={() => { setCurrentIndex(0); setShowAnswer(false); }} className="rounded-xl h-11 md:h-12 text-base w-full shadow-sm hover:shadow-md">Recommencer</Button>
            </div>
          </div>
        ) : (
          <Card className={`w-full max-w-4xl shadow-xl md:shadow-2xl relative bg-white border-gray-100 rounded-3xl ${currentCard.type === 'fiche' ? 'border-t-4 border-t-purple-500' : ''}`}>
            <CardHeader className="pb-4 md:pb-5 border-b bg-gray-50/80 rounded-t-3xl px-4 md:px-8 pt-4 md:pt-6">
              <CardTitle className="text-xs md:text-sm font-semibold flex justify-between items-center">
                {currentCard.type === 'fiche' ? (
                  <span className="flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-1 rounded-full shadow-sm border font-bold text-[10px] md:text-xs uppercase tracking-wider bg-purple-100 text-purple-700 border-purple-200"><FileText className="w-3 h-3 md:w-4 md:h-4" /> Fiche de synthèse</span>
                ) : (
                  <span className={`flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-1 rounded-full shadow-sm border font-bold text-[10px] md:text-xs uppercase tracking-wider ${activeCatConfig.bg} ${activeCatConfig.text} ${activeCatConfig.border}`}><ActiveIcon className="w-3 h-3 md:w-4 md:h-4" /> {activeCatConfig.label}</span>
                )}
                {userRole === 'prof' && (
                  <div className="flex gap-1.5 md:gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditModal(currentCard)} className="h-8 md:h-9 px-2 md:px-3 rounded-xl text-blue-600 hover:bg-blue-50 border-blue-200 flex items-center"><Pencil className="w-3.5 h-3.5 md:mr-1.5" /> <span className="hidden md:inline">Modifier</span></Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(currentCard.id)} className="h-8 md:h-9 px-2 md:px-3 rounded-xl text-red-600 hover:bg-red-50 border-red-200 flex items-center"><Trash2 className="w-3.5 h-3.5 md:mr-1.5" /> <span className="hidden md:inline">Supprimer</span></Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 md:gap-8 pt-8 md:pt-12 pb-8 md:pb-12 px-5 md:px-10">
              {currentCard.type === 'fiche' ? (
                <div className="flex flex-col gap-6 md:gap-8">
                  <div className="flex flex-col items-center gap-6 pb-4 border-b-2 border-purple-100">
                    {currentCard.image_url && <img src={currentCard.image_url} alt="Illustration fiche" className="max-h-64 object-contain rounded-2xl shadow-sm border border-gray-100" />}
                    <div className="text-xl md:text-3xl font-black text-center text-purple-900"><Latex>{currentCard.question}</Latex></div>
                  </div>
                  <div className="bg-gray-50 p-5 md:p-8 rounded-2xl md:rounded-3xl text-left text-base md:text-lg min-h-[120px] overflow-x-auto text-gray-800 leading-relaxed flex flex-col gap-6">
                    {currentCard.image_reponse_url && <img src={currentCard.image_reponse_url} alt="Illustration contenu" className="max-h-80 object-contain rounded-2xl shadow-sm border border-gray-200 mx-auto" />}
                    <Latex>{currentCard.reponse}</Latex>
                  </div>
                  <Button onClick={handleNextCard} className="w-full h-11 md:h-12 text-base font-semibold bg-purple-600 hover:bg-purple-700 shadow-sm rounded-xl mt-2 md:mt-4 flex items-center justify-center gap-2">Passer à la suite <ArrowRight className="w-4 h-4" /></Button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center justify-center gap-6 min-h-[80px] md:min-h-[120px]">
                    {currentCard.image_url && <img src={currentCard.image_url} alt="Illustration question" className="max-h-64 object-contain rounded-2xl shadow-sm border border-gray-100" />}
                    <div className="text-xl md:text-3xl font-medium text-center leading-relaxed"><Latex>{currentCard.question}</Latex></div>
                  </div>
                  {showAnswer ? (
                    <div className="animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-6 md:gap-10 mt-2 md:mt-4">
                      <div className="bg-green-50/50 p-6 md:p-10 rounded-2xl md:rounded-3xl text-center text-xl md:text-3xl text-green-900 min-h-[120px] md:min-h-[160px] flex flex-col items-center justify-center gap-6 border-2 border-green-200 shadow-inner overflow-x-auto">
                        {currentCard.image_reponse_url && <img src={currentCard.image_reponse_url} alt="Illustration réponse" className="max-h-64 object-contain rounded-2xl shadow-sm border border-green-200" />}
                        <Latex>{currentCard.reponse}</Latex>
                      </div>
                      <div className="w-full">
                        <p className="text-center text-xs text-gray-400 font-medium mb-2 uppercase tracking-wider">Comment avez-vous trouvé cette carte ?</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Button onClick={() => handleEvaluation ? handleEvaluation(currentCard.id, 'revoir') : handleNextCard()} className="h-12 bg-red-100 hover:bg-red-200 text-red-700 border border-transparent hover:border-red-300 rounded-xl flex flex-col items-center justify-center shadow-sm transition-all"><div className="flex items-center gap-1.5 text-sm font-bold"><RotateCcw className="w-4 h-4" /> À revoir</div><span className="text-[10px] font-medium opacity-80 mt-0.5">Demain</span></Button>
                          <Button onClick={() => handleEvaluation ? handleEvaluation(currentCard.id, 'difficile') : handleNextCard()} className="h-12 bg-orange-100 hover:bg-orange-200 text-orange-700 border border-transparent hover:border-orange-300 rounded-xl flex flex-col items-center justify-center shadow-sm transition-all"><div className="flex items-center gap-1.5 text-sm font-bold"><Brain className="w-4 h-4" /> Difficile</div><span className="text-[10px] font-medium opacity-80 mt-0.5">Dans 3 jours</span></Button>
                          <Button onClick={() => handleEvaluation ? handleEvaluation(currentCard.id, 'facile') : handleNextCard()} className="h-12 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-transparent hover:border-emerald-300 rounded-xl flex flex-col items-center justify-center shadow-sm transition-all"><div className="flex items-center gap-1.5 text-sm font-bold"><CheckCircle2 className="w-4 h-4" /> Facile</div><span className="text-[10px] font-medium opacity-80 mt-0.5">Dans 7 jours</span></Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-8 md:mt-12 flex justify-center"><Button onClick={() => setShowAnswer(true)} className="w-full max-w-sm h-11 md:h-12 text-base font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2" variant="secondary"><ChevronDown className="w-4 h-4" /> Révéler la réponse</Button></div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}