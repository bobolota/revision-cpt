import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, HelpCircle, FileText, Image as ImageIcon } from 'lucide-react'

interface FlashcardModalsProps {
  userRole: string | null; 
  isSubmitting: boolean;
  
  isAddOpen: boolean; setIsAddOpen: (val: boolean) => void;
  newType: string; setNewType: (val: string) => void;
  newCategorie: string; setNewCategorie: (val: string) => void;
  newQuestion: string; setNewQuestion: (val: string) => void;
  newReponse: string; setNewReponse: (val: string) => void;
  newImage: File | null; setNewImage: (val: File | null) => void;
  newImageReponse: File | null; setNewImageReponse: (val: File | null) => void;
  handleAdd: (e: React.FormEvent) => void;
  
  isEditOpen: boolean; setIsEditOpen: (val: boolean) => void;
  editType: string; setEditType: (val: string) => void;
  editCategorie: string; setEditCategorie: (val: string) => void;
  editQuestion: string; setEditQuestion: (val: string) => void;
  editReponse: string; setEditReponse: (val: string) => void;
  editImage?: File | null; setEditImage?: (val: File | null) => void;
  currentImageUrl?: string | null;
  editImageReponse?: File | null; setEditImageReponse?: (val: File | null) => void;
  currentImageReponseUrl?: string | null;
  handleEdit: (e: React.FormEvent) => void;
}

export function FlashcardModals({
  userRole, isSubmitting,
  isAddOpen, setIsAddOpen, newType, setNewType, newCategorie, setNewCategorie, newQuestion, setNewQuestion, newReponse, setNewReponse, newImage, setNewImage, newImageReponse, setNewImageReponse, handleAdd,
  isEditOpen, setIsEditOpen, editType, setEditType, editCategorie, setEditCategorie, editQuestion, setEditQuestion, editReponse, setEditReponse, setEditImage, currentImageUrl, setEditImageReponse, currentImageReponseUrl, handleEdit
}: FlashcardModalsProps) {
  
  return (
    <>
      {userRole === 'prof' && (
        <div className="absolute top-4 right-4 md:top-8 md:right-8 z-20">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white font-bold flex items-center gap-2 rounded-xl h-10 md:h-11 px-3 md:px-6 shadow-sm">
                <Plus className="w-5 h-5" /> <span className="hidden md:inline">Ajouter du contenu</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Nouveau contenu</DialogTitle></DialogHeader>
              <form onSubmit={handleAdd} className="flex flex-col gap-6 mt-2">
                <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                  <Button type="button" variant={newType === 'classique' ? 'default' : 'ghost'} onClick={() => setNewType('classique')} className="flex-1 flex items-center gap-2 rounded-lg">
                    <HelpCircle className="w-4 h-4" /> Flashcard (Q/R)
                  </Button>
                  <Button type="button" variant={newType === 'fiche' ? 'default' : 'ghost'} onClick={() => setNewType('fiche')} className="flex-1 flex items-center gap-2 rounded-lg">
                    <FileText className="w-4 h-4" /> Fiche de cours
                  </Button>
                </div>

                {newType === 'classique' && (
                  <div className="flex flex-col gap-2">
                    <Label>Catégorie de la question</Label>
                    <select value={newCategorie} onChange={(e) => setNewCategorie(e.target.value)} className="h-10 w-full rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="defaut">Général (Question classique)</option>
                      <option value="formule">Formule mathématique</option>
                      <option value="definition">Définition</option>
                      <option value="theoreme">Théorème / Propriété</option>
                      <option value="date">Date clé</option>
                      <option value="personnage">Personnage clé</option>
                    </select>
                  </div>
                )}

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-gray-700 font-bold">{newType === 'fiche' ? 'Titre de la fiche' : 'Question'}</Label>
                    <Textarea value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} required className="h-16 resize-none bg-white"/>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs text-gray-500 flex items-center gap-1"><ImageIcon className="w-3 h-3"/> Joindre une image pour la question (Optionnel)</Label>
                    <input type="file" accept="image/*" onChange={(e) => { if (e.target.files && e.target.files.length > 0) setNewImage(e.target.files[0]) }}
                      className="file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white file:border-gray-200 file:border file:text-gray-700 hover:file:bg-gray-100 cursor-pointer text-xs text-gray-500 w-full"
                    />
                    {newImage && <span className="text-xs text-gray-600 truncate">{newImage.name}</span>}
                  </div>
                </div>

                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-50 flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-blue-900 font-bold">{newType === 'fiche' ? 'Contenu (LaTeX autorisé)' : 'Réponse'}</Label>
                    <Textarea value={newReponse} onChange={(e) => setNewReponse(e.target.value)} required className="h-32 bg-white"/>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs text-blue-600 flex items-center gap-1"><ImageIcon className="w-3 h-3"/> Joindre une image pour la réponse (Optionnel)</Label>
                    <input type="file" accept="image/*" onChange={(e) => { if (e.target.files && e.target.files.length > 0) setNewImageReponse(e.target.files[0]) }}
                      className="file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white file:border-blue-200 file:border file:text-blue-700 hover:file:bg-blue-50 cursor-pointer text-xs text-gray-500 w-full"
                    />
                    {newImageReponse && <span className="text-xs text-blue-600 truncate">{newImageReponse.name}</span>}
                  </div>
                </div>

                <Button type="submit" size="lg" className="rounded-xl" disabled={isSubmitting}>Enregistrer</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* --- MODALE DE MODIFICATION --- */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Modifier</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="flex flex-col gap-6 mt-2">
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
              <Button type="button" variant={editType === 'classique' ? 'default' : 'ghost'} onClick={() => setEditType('classique')} className="flex-1 flex items-center gap-2 rounded-lg"><HelpCircle className="w-4 h-4" /> Flashcard</Button>
              <Button type="button" variant={editType === 'fiche' ? 'default' : 'ghost'} onClick={() => setEditType('fiche')} className="flex-1 flex items-center gap-2 rounded-lg"><FileText className="w-4 h-4" /> Fiche</Button>
            </div>

            {editType === 'classique' && (
              <div className="flex flex-col gap-2">
                <Label>Catégorie de la question</Label>
                <select value={editCategorie} onChange={(e) => setEditCategorie(e.target.value)} className="h-10 w-full rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="defaut">Général (Question classique)</option>
                  <option value="formule">Formule mathématique</option>
                  <option value="definition">Définition</option>
                  <option value="theoreme">Théorème / Propriété</option>
                  <option value="date">Date clé</option>
                  <option value="personnage">Personnage clé</option>
                </select>
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-gray-700 font-bold">{editType === 'fiche' ? 'Titre de la fiche' : 'Question'}</Label>
                <Textarea value={editQuestion} onChange={(e) => setEditQuestion(e.target.value)} required className="h-16 resize-none bg-white"/>
              </div>
              {setEditImage && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-xs text-gray-500 flex items-center gap-1"><ImageIcon className="w-3 h-3"/> Remplacer l'image (Question)</Label>
                    {currentImageUrl && <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Image présente</span>}
                  </div>
                  <input type="file" accept="image/*" onChange={(e) => { if (e.target.files && e.target.files.length > 0) setEditImage(e.target.files[0]) }}
                    className="file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white file:border-gray-200 file:border file:text-gray-700 hover:file:bg-gray-100 cursor-pointer text-xs text-gray-500 w-full"
                  />
                </div>
              )}
            </div>
            
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-50 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-blue-900 font-bold">{editType === 'fiche' ? 'Contenu' : 'Réponse'}</Label>
                <Textarea value={editReponse} onChange={(e) => setEditReponse(e.target.value)} required className="h-32 bg-white"/>
              </div>
              {setEditImageReponse && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-xs text-blue-600 flex items-center gap-1"><ImageIcon className="w-3 h-3"/> Remplacer l'image (Réponse)</Label>
                    {currentImageReponseUrl && <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Image présente</span>}
                  </div>
                  <input type="file" accept="image/*" onChange={(e) => { if (e.target.files && e.target.files.length > 0) setEditImageReponse(e.target.files[0]) }}
                    className="file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white file:border-blue-200 file:border file:text-blue-700 hover:file:bg-blue-50 cursor-pointer text-xs text-gray-500 w-full"
                  />
                </div>
              )}
            </div>

            <Button type="submit" size="lg" className="rounded-xl" disabled={isSubmitting}>Mettre à jour</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}