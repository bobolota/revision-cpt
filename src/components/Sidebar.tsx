import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, LogOut, PanelLeftClose, PanelLeftOpen, ChevronRight, X, Brain, Flame, Search, GripVertical } from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { Matiere } from "../types"

interface SidebarProps {
  userRole: string | null; email: string; matieres: Matiere[];
  selectedChapitreId: number | null; setSelectedChapitreId: (id: number) => void;
  handleLogout: () => void;
  openStructureModal: (action: 'addMatiere' | 'editMatiere' | 'addTheme' | 'editTheme' | 'addChapitre' | 'editChapitre', targetId?: number | null, initialValue?: string, initialNiveau?: string) => void;
  handleDeleteStructure: (type: 'matiere' | 'theme' | 'chapitre', id: number) => void;
  setIsMobileOpen?: (val: boolean) => void;
  appMode?: 'chapitre' | 'revisions' | 'quiz' | 'search';
  startReviewMode?: () => void;
  startQuizMode?: () => void;
  searchQuery?: string; 
  setSearchQuery?: (val: string) => void; 
  executeSearch?: (query: string) => void; 
  searchSuggestions?: string[]; 
  onReorder: (result: any) => void; // NOUVEAU
}

export function Sidebar({
  userRole, email, matieres, selectedChapitreId, setSelectedChapitreId,
  handleLogout, openStructureModal, handleDeleteStructure, setIsMobileOpen,
  appMode, startReviewMode, startQuizMode, searchQuery, setSearchQuery, executeSearch, searchSuggestions,
  onReorder // NOUVEAU
}: SidebarProps) {
  
  const [expandedMatieres, setExpandedMatieres] = useState<number[]>([])
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const toggleMatiere = (id: number) => { setExpandedMatieres(prev => prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]) }

  useEffect(() => {
    if (selectedChapitreId && appMode === 'chapitre') {
      const parentMatiere = matieres.find(m => m.themes.some(t => t.chapitres.some(c => c.id === selectedChapitreId)))
      if (parentMatiere && !expandedMatieres.includes(parentMatiere.id)) setExpandedMatieres(prev => [...prev, parentMatiere.id])
    }
  }, [selectedChapitreId, matieres, appMode])

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth < 768) setIsCollapsed(false) }
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const niveauxOrder = ['2nde', '1ère', 'Terminale', 'Supérieur', 'Autre'];

  return (
    <aside className={`bg-white border-r shadow-sm flex flex-col justify-between h-full transition-[width] duration-300 ease-in-out z-20 md:rounded-r-2xl w-[85vw] max-w-[320px] ${isCollapsed ? 'md:w-16' : 'md:w-80'}`}>
      
      <div className={`flex flex-col h-full ${isCollapsed ? 'overflow-visible' : 'overflow-hidden'}`}>
        
        <div className={`p-4 border-b flex items-center min-h-[72px] md:min-h-[80px] ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <div className="whitespace-nowrap">
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Flashcards</h1>
              {userRole && <span className="inline-block mt-1 text-[10px] font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full uppercase tracking-wider">Mode : {userRole}</span>}
            </div>
          )}
          <div className="flex gap-2 items-center">
            <Button variant="ghost" size="icon" className="md:hidden rounded-xl h-8 w-8 text-gray-500" onClick={() => setIsMobileOpen?.(false)}><X className="w-5 h-5" /></Button>
            {!isCollapsed && userRole === 'prof' && (
              <Button variant="outline" size="icon" className="h-8 w-8 md:h-9 md:w-9 shrink-0 rounded-xl hidden md:flex" onClick={() => openStructureModal('addMatiere')}><Plus className="w-4 h-4 text-gray-600" /></Button>
            )}
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl hidden md:flex" onClick={() => setIsCollapsed(!isCollapsed)}>
              {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        
        <div className="px-3 md:px-4 mt-4 mb-2 flex flex-col gap-2 relative">
          <div className={`relative flex items-center mb-1 ${isCollapsed ? 'justify-center' : ''}`}>
            {isCollapsed ? (
              <Button variant="ghost" className="w-10 h-10 p-0 rounded-xl bg-gray-50 hover:bg-gray-100" onClick={() => setIsCollapsed(false)}>
                <Search className="w-5 h-5 text-gray-500" />
              </Button>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); if (executeSearch && searchQuery) executeSearch(searchQuery); if (window.innerWidth < 768 && setIsMobileOpen) setIsMobileOpen(false); }} className="w-full relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="Rechercher..." value={searchQuery || ''} onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)} onFocus={() => setIsSearchFocused(true)} onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm rounded-xl pl-9 pr-3 py-2.5 transition-all outline-none" />
                {isSearchFocused && searchSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full mt-1.5 left-0 w-full bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-50 max-h-64 overflow-y-auto">
                    {searchSuggestions.map((sug, idx) => (
                      <button key={idx} type="button" onClick={() => { if (setSearchQuery) setSearchQuery(sug); if (executeSearch) executeSearch(sug); if (window.innerWidth < 768 && setIsMobileOpen) setIsMobileOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 truncate transition-colors border-b border-gray-50 last:border-0">{sug}</button>
                    ))}
                  </div>
                )}
              </form>
            )}
          </div>
          <Button onClick={() => { if (startReviewMode) startReviewMode(); if (window.innerWidth < 768 && setIsMobileOpen) setIsMobileOpen(false); }} className={`w-full flex ${isCollapsed ? 'justify-center w-10 h-10 p-0 mx-auto' : 'justify-start items-center gap-3 px-4 h-11'} rounded-xl shadow-sm transition-all ${appMode === 'revisions' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100'}`} title="Révisions du jour"><Brain className="w-5 h-5 shrink-0" /> {!isCollapsed && <span className="font-bold">Révisions du jour</span>}</Button>
          <Button onClick={() => { if (startQuizMode) startQuizMode(); if (window.innerWidth < 768 && setIsMobileOpen) setIsMobileOpen(false); }} className={`w-full flex ${isCollapsed ? 'justify-center w-10 h-10 p-0 mx-auto' : 'justify-start items-center gap-3 px-4 h-11'} rounded-xl shadow-sm transition-all ${appMode === 'quiz' ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md' : 'bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-100'}`} title="Quiz : Points faibles"><Flame className="w-5 h-5 shrink-0" /> {!isCollapsed && <span className="font-bold">Quiz : Points faibles</span>}</Button>
        </div>

        <div className={`flex-1 p-3 md:p-4 pt-0 md:pt-0 ${isCollapsed ? 'px-2 overflow-visible' : 'pr-1 md:pr-2 overflow-y-auto overflow-x-hidden'}`}>
          
          {/* AFFICHAGE COMPLET (NON REPLIÉ) AVEC DRAG & DROP */}
          {!isCollapsed && (
            <DragDropContext onDragEnd={onReorder}>
              {matieres.map((matiere) => {
                const isExpanded = expandedMatieres.includes(matiere.id)
                const isMatiereActive = appMode === 'chapitre' && selectedChapitreId && matiere.themes.some(t => t.chapitres.some(c => c.id === selectedChapitreId))
                
                const groupedThemes = matiere.themes.reduce((acc, theme) => {
                  const niv = theme.niveau || 'Autre';
                  if (!acc[niv]) acc[niv] = [];
                  acc[niv].push(theme);
                  return acc;
                }, {} as Record<string, typeof matiere.themes>);

                const sortedNiveaux = Object.keys(groupedThemes).sort((a, b) => {
                  const indexA = niveauxOrder.indexOf(a); const indexB = niveauxOrder.indexOf(b);
                  return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
                });

                return (
                  <div key={matiere.id} className="mb-2 whitespace-nowrap">
                    <div className="flex justify-between items-center mb-1 ml-1 group">
                      <button onClick={() => toggleMatiere(matiere.id)} className={`flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-wider p-2 rounded-xl transition-colors flex-1 text-left truncate ${isMatiereActive ? 'text-blue-700 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                        <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }} />
                        <span className="truncate">{matiere.nom}</span>
                      </button>
                      {userRole === 'prof' && (
                        <div className="hidden group-hover:flex gap-1 shrink-0 bg-white pl-2">
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-xl hover:bg-gray-100" onClick={() => openStructureModal('addTheme', matiere.id)} title="Ajouter un thème"><Plus className="w-4 h-4 text-indigo-600" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-xl hover:bg-gray-100" onClick={() => openStructureModal('editMatiere', matiere.id, matiere.nom)}><Pencil className="w-4 h-4 text-blue-600" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-xl hover:bg-red-100" onClick={() => handleDeleteStructure('matiere', matiere.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                        </div>
                      )}
                    </div>
                    
                    <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                      <div className="overflow-hidden">
                        <div className="flex flex-col gap-1 ml-4 mt-1 mb-3">
                          {sortedNiveaux.map(niveau => (
                            <div key={niveau} className="mb-3">
                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-1">{niveau}</div>
                              
                              <Droppable droppableId={`matiere-${matiere.id}-niveau-${niveau}`} type="THEME">
                                {(provided) => (
                                  <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col gap-1 border-l border-gray-200 ml-3 pl-1 min-h-[20px]">
                                    {groupedThemes[niveau].map((theme, themeIndex) => (
                                      <Draggable key={`theme-${theme.id}`} draggableId={`theme-${theme.id}`} index={themeIndex} isDragDisabled={userRole !== 'prof'}>
                                        {(provided) => (
                                          <div ref={provided.innerRef} {...provided.draggableProps} className="flex flex-col gap-0.5 mt-1 bg-white rounded-lg">
                                            <div className="group/theme flex justify-between items-center px-2 py-1">
                                              <div className="flex items-center gap-1 overflow-hidden" {...provided.dragHandleProps}>
                                                {userRole === 'prof' && <GripVertical className="w-3 h-3 text-gray-300 shrink-0 cursor-grab active:cursor-grabbing" />}
                                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider truncate" title={theme.nom}>{theme.nom}</span>
                                              </div>
                                              {userRole === 'prof' && (
                                                <div className="hidden group-hover/theme:flex gap-1 shrink-0 bg-white/90 rounded shadow-sm p-0.5 ml-2">
                                                  <Button variant="ghost" size="icon" className="h-5 w-5 rounded hover:bg-gray-200" onClick={() => openStructureModal('addChapitre', theme.id)} title="Ajouter un chapitre"><Plus className="w-3 h-3 text-gray-600" /></Button>
                                                  <Button variant="ghost" size="icon" className="h-5 w-5 rounded hover:bg-gray-200" onClick={() => openStructureModal('editTheme', theme.id, theme.nom, theme.niveau)} title="Modifier le thème"><Pencil className="w-3 h-3 text-blue-600" /></Button>
                                                  <Button variant="ghost" size="icon" className="h-5 w-5 rounded hover:bg-red-200" onClick={() => handleDeleteStructure('theme', theme.id)} title="Supprimer le thème"><Trash2 className="w-3 h-3 text-red-600" /></Button>
                                                </div>
                                              )}
                                            </div>

                                            <Droppable droppableId={`theme-${theme.id}`} type="CHAPITRE">
  {(provided) => (
    <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-[20px] pb-1 flex flex-col gap-0.5">
      {theme.chapitres.map((chap, chapIndex) => (
        <Draggable key={`chap-${chap.id}`} draggableId={`chap-${chap.id}`} index={chapIndex} isDragDisabled={userRole !== 'prof'}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.draggableProps} className="flex items-center group relative bg-white rounded-lg">
              
              {/* LA POIGNÉE EST MAINTENANT SÉPARÉE DU BOUTON */}
              {userRole === 'prof' && (
                <div {...provided.dragHandleProps} className="pl-2 pr-1 py-2 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-3.5 h-3.5 shrink-0" />
                </div>
              )}

              <Button 
                variant={selectedChapitreId === chap.id && appMode === 'chapitre' ? "default" : "ghost"} 
                className={`justify-start text-left h-auto py-2 flex-1 text-xs md:text-sm truncate rounded-xl font-medium ${userRole === 'prof' ? 'px-1' : 'px-3'}`} 
                onClick={() => setSelectedChapitreId(chap.id)}
              >
                <span className="truncate pr-14">{chap.nom}</span>
              </Button>

              {userRole === 'prof' && (
                <div className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-1 bg-white/90 p-1 rounded-xl shadow-sm shrink-0 backdrop-blur-sm">
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg hover:bg-gray-200" onClick={() => openStructureModal('editChapitre', chap.id, chap.nom)}>
                    <Pencil className="w-3.5 h-3.5 text-blue-600" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg hover:bg-red-200" onClick={() => handleDeleteStructure('chapitre', chap.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </Draggable>
      ))}
      {provided.placeholder}
    </div>
  )}
</Droppable>
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>

                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </DragDropContext>
          )}

          {/* AFFICHAGE REPLIÉ (INCHANGÉ) */}
          {isCollapsed && (
            <div className="flex flex-col items-center gap-3 mt-2 border-t border-gray-100 pt-4">
              {matieres.map((matiere) => {
                const isMatiereActive = appMode === 'chapitre' && selectedChapitreId && matiere.themes.some(t => t.chapitres.some(c => c.id === selectedChapitreId))
                
                const groupedThemes = matiere.themes.reduce((acc, theme) => {
                  const niv = theme.niveau || 'Autre';
                  if (!acc[niv]) acc[niv] = [];
                  acc[niv].push(theme);
                  return acc;
                }, {} as Record<string, typeof matiere.themes>);

                const sortedNiveaux = Object.keys(groupedThemes).sort((a, b) => {
                  const indexA = niveauxOrder.indexOf(a); const indexB = niveauxOrder.indexOf(b);
                  return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
                });

                return (
                  <div key={matiere.id} className="relative group">
                    <Button 
                      variant={isMatiereActive ? "secondary" : "ghost"} 
                      className={`w-10 h-10 p-0 rounded-xl flex items-center justify-center transition-all shadow-sm border border-transparent ${isMatiereActive ? 'bg-blue-100 text-blue-700 border-blue-200' : 'text-gray-500 hover:bg-gray-100 hover:border-gray-200 hover:text-gray-900'}`}
                      onClick={() => { 
                        for(const t of matiere.themes) { 
                          if(t.chapitres.length > 0) { setSelectedChapitreId(t.chapitres[0].id); return; } 
                        } 
                      }}
                    >
                      <span className="font-bold text-lg">{matiere.nom.charAt(0).toUpperCase()}</span>
                    </Button>

                    <div className="absolute left-full top-0 hidden group-hover:block pl-4 z-[100]">
                      <div className="bg-white shadow-xl border border-gray-100 rounded-2xl w-max min-w-[240px] max-w-[400px] py-2 cursor-default whitespace-normal">
                        <div className="px-4 pb-2 pt-1 border-b border-gray-50 mb-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">{matiere.nom}</span>
                        </div>
                        <div className="flex flex-col px-2 gap-1 max-h-[60vh] overflow-y-auto">
                          {matiere.themes.length === 0 && <span className="text-xs text-gray-400 px-2 py-2 italic">Aucun contenu</span>}
                          
                          {sortedNiveaux.map(niveau => (
                            <div key={niveau} className="mb-2">
                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-1">{niveau}</div>
                              
                              {groupedThemes[niveau].map(theme => (
                                <div key={theme.id} className="mb-1">
                                  {theme.nom && <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider px-3 py-1">{theme.nom}</div>}
                                  {theme.chapitres.map(chap => (
                                    <button
                                      key={chap.id}
                                      onClick={() => setSelectedChapitreId(chap.id)}
                                      className={`text-left px-3 py-2 text-sm rounded-xl transition-colors w-full ${selectedChapitreId === chap.id && appMode === 'chapitre' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                    >
                                      {chap.nom}
                                    </button>
                                  ))}
                                </div>
                              ))}
                            </div>
                          ))}

                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className={`p-4 border-t bg-gray-50 flex flex-col gap-3 rounded-br-2xl ${isCollapsed ? 'items-center' : ''}`}>
        {!isCollapsed && <p className="text-xs md:text-sm font-medium text-gray-500 truncate px-1" title={email}>{email}</p>}
        <Button variant="outline" className={`rounded-xl ${isCollapsed ? "w-10 h-10 p-0" : "w-full flex items-center justify-center gap-2"}`} onClick={handleLogout} title="Déconnexion">
          <LogOut className="w-4 h-4" /> {!isCollapsed && "Déconnexion"}
        </Button>
      </div>
    </aside>
  )
}