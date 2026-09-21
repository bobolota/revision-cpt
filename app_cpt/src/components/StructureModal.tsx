import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface StructureModalProps {
  isOpen: boolean; setIsOpen: (val: boolean) => void;
  action: 'addMatiere' | 'editMatiere' | 'addTheme' | 'editTheme' | 'addChapitre' | 'editChapitre' | null;
  inputValue: string; setInputValue: (val: string) => void;
  niveauValue?: string; setNiveauValue?: (val: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export function StructureModal({ isOpen, setIsOpen, action, inputValue, setInputValue, niveauValue, setNiveauValue, handleSubmit, isSubmitting }: StructureModalProps) {
  const isTheme = action === 'addTheme' || action === 'editTheme';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {action === 'addMatiere' && "Nouvelle matière"}
            {action === 'editMatiere' && "Modifier la matière"}
            {action === 'addTheme' && "Nouveau thème"}
            {action === 'editTheme' && "Modifier le thème"}
            {action === 'addChapitre' && "Nouveau chapitre"}
            {action === 'editChapitre' && "Modifier le chapitre"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-4">
          <div className="flex flex-col gap-2">
            <Label>Nom</Label>
            <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} required placeholder="Saisir le nom..." className="rounded-xl"/>
          </div>

          {/* Le niveau n'est demandé QUE pour les thèmes */}
          {isTheme && setNiveauValue && (
            <div className="flex flex-col gap-2">
              <Label>Niveau de la classe</Label>
              <select 
                value={niveauValue || 'Autre'} 
                onChange={(e) => setNiveauValue(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="2nde">2nde</option>
                <option value="1ère">1ère</option>
                <option value="Terminale">Terminale</option>
                <option value="Supérieur">Supérieur</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          )}

          <Button type="submit" disabled={isSubmitting} className="rounded-xl mt-2">Enregistrer</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}