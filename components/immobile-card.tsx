'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EditImmobileDialog } from '@/components/edit-immobile-dialog';
import { MoreHorizontal, MapPin, Hash, Calculator, Edit, Trash2 } from 'lucide-react';
import { ImmobileEstratto } from '@/lib/types';

interface ImmobileCardProps {
  immobile: ImmobileEstratto;
  onUpdate: (immobile: ImmobileEstratto) => void;
  onDelete: (immobileId: string) => void;
}

export function ImmobileCard({ immobile, onUpdate, onDelete }: ImmobileCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const getCategoriaColor = (tipo: string) => {
    if (tipo === 'fabbricato') return 'bg-blue-100 text-blue-800';
    if (tipo === 'terreno') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Header con tipo e categoria */}
              <div className="flex items-center gap-3 mb-3">
                <Badge className={getCategoriaColor(immobile.tipo)}>
                  {immobile.tipo}
                </Badge>
                {immobile.categoria && (
                  <Badge variant="outline">
                    {immobile.categoria}
                  </Badge>
                )}
                {immobile.classe && (
                  <Badge variant="outline">
                    Classe {immobile.classe}
                  </Badge>
                )}
              </div>

              {/* Dati principali */}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{immobile.identificativo.comune}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <span>
                      Fg. {immobile.identificativo.foglio}, Part. {immobile.identificativo.particella}
                      {immobile.identificativo.subalterno && `, Sub. ${immobile.identificativo.subalterno}`}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-500">
                      {immobile.tipo === 'fabbricato' ? 'Rendita: ' : 'Reddito dominicale: '}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(immobile.rendita || immobile.redditoDominicale || 0)}
                    </span>
                  </div>
                  {immobile.superficie && (
                    <div className="text-sm">
                      <span className="text-gray-500">Superficie: </span>
                      <span className="font-medium">{immobile.superficie} m²</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Condizioni d'uso */}
              {immobile.uso && (
                <div className="mb-3">
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    {immobile.uso}
                  </Badge>
                </div>
              )}
            </div>

            {/* Menu azioni */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Modifica
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(immobile.id!)}
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

      <EditImmobileDialog
        immobile={immobile}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={onUpdate}
      />
    </>
  );
} 