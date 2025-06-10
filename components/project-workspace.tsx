'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { UploadVisuraDialog } from '@/components/upload-visura-dialog';
import { ImmobileCard } from '@/components/immobile-card';
import { CalculateIMUDialog } from '@/components/calculate-imu-dialog';
import { ProjectIMU, ImmobileEstratto } from '@/lib/types';
import { Upload, Calculator, FileText, Mail, Plus } from 'lucide-react';

interface ProjectWorkspaceProps {
  project: ProjectIMU;
  onUpdateProject: (project: ProjectIMU) => void;
}

export function ProjectWorkspace({ project, onUpdateProject }: ProjectWorkspaceProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCalculateDialogOpen, setIsCalculateDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('immobili');

  const handleAddImmobili = (immobili: ImmobileEstratto[]) => {
    const updatedProject = {
      ...project,
      immobili: [...(project.immobili || []), ...immobili],
      updated_at: new Date().toISOString()
    };
    onUpdateProject(updatedProject);
    setIsUploadDialogOpen(false);
  };

  const handleUpdateImmobile = (updatedImmobile: ImmobileEstratto) => {
    const updatedProject = {
      ...project,
      immobili: project.immobili?.map(i => 
        i.id === updatedImmobile.id ? updatedImmobile : i
      ) || [],
      updated_at: new Date().toISOString()
    };
    onUpdateProject(updatedProject);
  };

  const handleDeleteImmobile = (immobileId: string) => {
    const updatedProject = {
      ...project,
      immobili: project.immobili?.filter(i => i.id !== immobileId) || [],
      updated_at: new Date().toISOString()
    };
    onUpdateProject(updatedProject);
  };

  const handleExportReport = async () => {
    try {
      const response = await fetch('/api/export-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-imu-${project.nome}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Errore esportazione:', error);
    }
  };

  const handleSendEmail = async () => {
    if (!project.email) {
      alert('Nessuna email configurata per questo progetto');
      return;
    }

    try {
      await fetch('/api/send-email-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          project_id: project.id,
          email: project.email 
        })
      });
      alert('Email inviata con successo!');
    } catch (error) {
      console.error('Errore invio email:', error);
      alert('Errore nell\'invio dell\'email');
    }
  };

  const immobiliCount = project.immobili?.length || 0;
  const fabbricatiCount = project.immobili?.filter(i => i.tipo === 'fabbricato').length || 0;
  const terreniCount = project.immobili?.filter(i => i.tipo === 'terreno').length || 0;

  return (
    <div className="space-y-6">
      {/* Header progetto */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{project.nome}</CardTitle>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="outline">
                  {immobiliCount} {immobiliCount === 1 ? 'immobile' : 'immobili'}
                </Badge>
                {project.email && (
                  <Badge variant="secondary">📧 {project.email}</Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleExportReport}
                disabled={immobiliCount === 0}
              >
                <FileText className="w-4 h-4 mr-2" />
                Esporta PDF
              </Button>
              {project.email && (
                <Button 
                  variant="outline" 
                  onClick={handleSendEmail}
                  disabled={immobiliCount === 0}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Invia Email
                </Button>
              )}
              <Button onClick={() => setIsCalculateDialogOpen(true)}>
                <Calculator className="w-4 h-4 mr-2" />
                Calcola IMU
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs principali */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="immobili">
            Immobili ({immobiliCount})
          </TabsTrigger>
          <TabsTrigger value="fabbricati">
            Fabbricati ({fabbricatiCount})
          </TabsTrigger>
          <TabsTrigger value="terreni">
            Terreni ({terreniCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="immobili" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Tutti gli Immobili</h3>
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Carica Visura
            </Button>
          </div>

          {immobiliCount === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nessun immobile ancora
                </h3>
                <p className="text-gray-500 mb-6">
                  Carica una visura catastale per iniziare
                </p>
                <Button onClick={() => setIsUploadDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Carica la tua prima visura
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {project.immobili?.map((immobile) => (
                <ImmobileCard
                  key={immobile.id}
                  immobile={immobile}
                  onUpdate={handleUpdateImmobile}
                  onDelete={handleDeleteImmobile}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="fabbricati" className="space-y-4">
          <div className="grid gap-4">
            {project.immobili?.filter(i => i.tipo === 'fabbricato').map((immobile) => (
              <ImmobileCard
                key={immobile.id}
                immobile={immobile}
                onUpdate={handleUpdateImmobile}
                onDelete={handleDeleteImmobile}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="terreni" className="space-y-4">
          <div className="grid gap-4">
            {project.immobili?.filter(i => i.tipo === 'terreno').map((immobile) => (
              <ImmobileCard
                key={immobile.id}
                immobile={immobile}
                onUpdate={handleUpdateImmobile}
                onDelete={handleDeleteImmobile}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <UploadVisuraDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onUploadSuccess={handleAddImmobili}
        projectId={project.id}
      />

      <CalculateIMUDialog
        open={isCalculateDialogOpen}
        onOpenChange={setIsCalculateDialogOpen}
        project={project}
      />
    </div>
  );
} 