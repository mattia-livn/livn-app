'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProjectIMU } from '@/lib/types';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject: (project: ProjectIMU) => void;
}

export function CreateProjectDialog({ 
  open, 
  onOpenChange, 
  onCreateProject 
}: CreateProjectDialogProps) {
  const [formData, setFormData] = useState({
    nome: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;

    setIsSubmitting(true);

    const newProject: ProjectIMU = {
      id: crypto.randomUUID(),
      nome: formData.nome.trim(),
      email: formData.email.trim() || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      immobili: []
    };

    try {
      onCreateProject(newProject);
      setFormData({ nome: '', email: '' });
    } catch (error) {
      console.error('Errore nella creazione del progetto:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({ nome: '', email: '' });
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crea Nuovo Progetto</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Progetto *</Label>
            <Input
              id="nome"
              placeholder="es. Casa Milano 2024"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (opzionale)</Label>
            <Input
              id="email"
              type="email"
              placeholder="per ricevere i report via email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
            <p className="text-xs text-gray-500">
              Inserisci un'email per ricevere automaticamente i report dei calcoli
            </p>
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
            <Button
              type="submit"
              disabled={!formData.nome.trim() || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Creazione...' : 'Crea Progetto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 