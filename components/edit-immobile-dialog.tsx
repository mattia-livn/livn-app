'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImmobileEstratto } from '@/lib/types';

interface EditImmobileDialogProps {
  immobile: ImmobileEstratto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (immobile: ImmobileEstratto) => void;
}

export function EditImmobileDialog({ 
  immobile, 
  open, 
  onOpenChange, 
  onSave 
}: EditImmobileDialogProps) {
  const [formData, setFormData] = useState(immobile);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData(immobile); // Reset form
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifica Immobile</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo immobile */}
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select 
              value={formData.tipo} 
              onValueChange={(value: 'fabbricato' | 'terreno') => 
                setFormData(prev => ({ ...prev, tipo: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fabbricato">Fabbricato</SelectItem>
                <SelectItem value="terreno">Terreno</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Input
              value={formData.categoria || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
              placeholder="es. A/2, C/6"
            />
          </div>

          {/* Classe */}
          <div className="space-y-2">
            <Label>Classe</Label>
            <Input
              value={formData.classe || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, classe: e.target.value }))}
              placeholder="es. 3"
            />
          </div>

          {/* Dati catastali */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Foglio</Label>
              <Input
                value={formData.identificativo.foglio}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  identificativo: { ...prev.identificativo, foglio: e.target.value }
                }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Particella</Label>
              <Input
                value={formData.identificativo.particella}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  identificativo: { ...prev.identificativo, particella: e.target.value }
                }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Subalterno (opzionale)</Label>
            <Input
              value={formData.identificativo.subalterno || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                identificativo: { 
                  ...prev.identificativo, 
                  subalterno: e.target.value || undefined 
                }
              }))}
            />
          </div>

          {/* Comune */}
          <div className="space-y-2">
            <Label>Comune</Label>
            <Input
              value={formData.identificativo.comune}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                identificativo: { ...prev.identificativo, comune: e.target.value }
              }))}
              required
            />
          </div>

          {/* Rendita o Reddito Dominicale */}
          <div className="space-y-2">
            <Label>
              {formData.tipo === 'fabbricato' ? 'Rendita Catastale (€)' : 'Reddito Dominicale (€)'}
            </Label>
            <Input
              type="number"
              step="0.01"
              value={formData.tipo === 'fabbricato' ? (formData.rendita || '') : (formData.redditoDominicale || '')}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                if (formData.tipo === 'fabbricato') {
                  setFormData(prev => ({ ...prev, rendita: value }));
                } else {
                  setFormData(prev => ({ ...prev, redditoDominicale: value }));
                }
              }}
              required
            />
          </div>

          {/* Superficie (per terreni) */}
          {formData.tipo === 'terreno' && (
            <div className="space-y-2">
              <Label>Superficie (m²)</Label>
              <Input
                type="number"
                value={formData.superficie || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  superficie: parseInt(e.target.value) || undefined 
                }))}
              />
            </div>
          )}

          {/* Uso */}
          <div className="space-y-2">
            <Label>Destinazione d'uso</Label>
            <Select 
              value={formData.uso || ''} 
              onValueChange={(value) => 
                setFormData(prev => ({ 
                  ...prev, 
                  uso: value as typeof formData.uso || null 
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona uso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="abitazione">Abitazione</SelectItem>
                <SelectItem value="pertinenza">Pertinenza</SelectItem>
                <SelectItem value="terreno_agricolo">Terreno Agricolo</SelectItem>
                <SelectItem value="terreno_edificabile">Terreno Edificabile</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="flex-1"
            >
              Annulla
            </Button>
            <Button type="submit" className="flex-1">
              Salva Modifiche
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 