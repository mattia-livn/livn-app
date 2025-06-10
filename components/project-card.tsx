'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Calendar, Home, Trash2, ExternalLink } from 'lucide-react';
import { ProjectIMU } from '@/lib/types';

interface ProjectCardProps {
  project: ProjectIMU;
  onSelect: (project: ProjectIMU) => void;
  onDelete: (projectId: string) => void;
}

export function ProjectCard({ project, onSelect, onDelete }: ProjectCardProps) {
  const immobiliCount = project.immobili?.length || 0;
  const createdDate = new Date(project.created_at).toLocaleDateString('it-IT');

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1" onClick={() => onSelect(project)}>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg">{project.nome}</h3>
              <Badge variant="secondary" className="text-xs">
                {immobiliCount} {immobiliCount === 1 ? 'immobile' : 'immobili'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Creato il {createdDate}</span>
              </div>
              {project.email && (
                <div className="flex items-center gap-1">
                  <span>📧 {project.email}</span>
                </div>
              )}
            </div>

            {immobiliCount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Home className="w-4 h-4 text-blue-600" />
                <span className="text-gray-600">
                  {project.immobili?.filter(i => i.tipo === 'fabbricato').length || 0} fabbricati, {' '}
                  {project.immobili?.filter(i => i.tipo === 'terreno').length || 0} terreni
                </span>
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSelect(project)}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Apri progetto
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(project.id)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Elimina
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
} 