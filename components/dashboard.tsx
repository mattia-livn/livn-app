'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectCard } from '@/components/project-card';
import { CreateProjectDialog } from '@/components/create-project-dialog';
import { Plus, FolderOpen } from 'lucide-react';
import { ProjectIMU } from '@/lib/types';

export function Dashboard() {
  const [projects, setProjects] = useState<ProjectIMU[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectIMU | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Carica progetti salvati localmente (per demo)
  useEffect(() => {
    const savedProjects = localStorage.getItem('livn-projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
    setLoading(false);
  }, []);

  // Salva progetti localmente
  const saveProjects = (newProjects: ProjectIMU[]) => {
    setProjects(newProjects);
    localStorage.setItem('livn-projects', JSON.stringify(newProjects));
  };

  const handleCreateProject = (project: ProjectIMU) => {
    const newProjects = [project, ...projects];
    saveProjects(newProjects);
    setSelectedProject(project);
    setIsCreateDialogOpen(false);
  };

  const handleSelectProject = (project: ProjectIMU) => {
    setSelectedProject(project);
  };

  const handleUpdateProject = (updatedProject: ProjectIMU) => {
    const newProjects = projects.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    );
    saveProjects(newProjects);
    setSelectedProject(updatedProject);
  };

  const handleDeleteProject = (projectId: string) => {
    const newProjects = projects.filter(p => p.id !== projectId);
    saveProjects(newProjects);
    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Caricamento progetti...</div>
      </div>
    );
  }

  // Se nessun progetto selezionato, mostra lista progetti
  if (!selectedProject) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-blue-600" />
                <CardTitle>I Tuoi Progetti IMU</CardTitle>
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nuovo Progetto
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nessun progetto ancora
                </h3>
                <p className="text-gray-500 mb-6">
                  Crea il tuo primo progetto per iniziare a calcolare l'IMU
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Crea il tuo primo progetto
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onSelect={handleSelectProject}
                    onDelete={handleDeleteProject}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <CreateProjectDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onCreateProject={handleCreateProject}
        />
      </div>
    );
  }

  // Mostra dettagli progetto selezionato
  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => setSelectedProject(null)}
          className="mb-4"
        >
          ← Torna ai progetti
        </Button>
      </div>

      {/* Progetto selezionato */}
      <ProjectWorkspace
        project={selectedProject}
        onUpdateProject={handleUpdateProject}
      />
    </div>
  );
}

// Importa il workspace che creeremo dopo
import { ProjectWorkspace } from '@/components/project-workspace'; 