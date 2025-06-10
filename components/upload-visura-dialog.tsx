'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { ImmobileEstratto } from '@/lib/types';

interface UploadVisuraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess: (immobili: ImmobileEstratto[]) => void;
  projectId: string;
}

type UploadStage = 'select' | 'uploading' | 'extracting' | 'review' | 'success' | 'error';

export function UploadVisuraDialog({ 
  open, 
  onOpenChange, 
  onUploadSuccess,
  projectId 
}: UploadVisuraDialogProps) {
  const [stage, setStage] = useState<UploadStage>('select');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<ImmobileEstratto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Seleziona un file PDF valido');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setStage('uploading');
      setProgress(0);

      // 1. Upload file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('project_id', projectId);

      const uploadResponse = await fetch('/api/upload-visura', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Errore durante il caricamento del file');
      }

      const uploadResult = await uploadResponse.json();
      setProgress(50);

      // 2. Extract data with AI
      setStage('extracting');
      
      const extractResponse = await fetch('/api/extract-from-visura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          file_path: uploadResult.file_path 
        })
      });

      if (!extractResponse.ok) {
        throw new Error('Errore durante l\'estrazione dei dati');
      }

      const extractResult = await extractResponse.json();
      setProgress(100);

      // 3. Show extracted data for review
      setExtractedData(extractResult.immobili);
      setStage('review');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      setStage('error');
    }
  };

  const handleConfirmData = () => {
    onUploadSuccess(extractedData);
    setStage('success');
    
    // Reset after short delay
    setTimeout(() => {
      resetDialog();
      onOpenChange(false);
    }, 1500);
  };

  const resetDialog = () => {
    setStage('select');
    setFile(null);
    setProgress(0);
    setExtractedData([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetDialog();
    }
    onOpenChange(open);
  };

  const renderContent = () => {
    switch (stage) {
      case 'select':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Carica Visura Catastale</h3>
              <p className="text-gray-500 mb-6">
                Seleziona un file PDF della visura catastale per estrarre automaticamente i dati degli immobili
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf"
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="mb-4"
              >
                <Upload className="w-4 h-4 mr-2" />
                Seleziona File PDF
              </Button>
              {file && (
                <div className="text-sm text-gray-600">
                  File selezionato: {file.name}
                </div>
              )}
            </div>

            {error && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!file}
                className="flex-1"
              >
                Carica e Processa
              </Button>
            </div>
          </div>
        );

      case 'uploading':
      case 'extracting':
        return (
          <div className="space-y-6 text-center">
            <div className="space-y-4">
              <Loader2 className="w-16 h-16 text-blue-600 mx-auto animate-spin" />
              <h3 className="text-lg font-medium">
                {stage === 'uploading' ? 'Caricamento file...' : 'Estrazione dati con AI...'}
              </h3>
              <p className="text-gray-500">
                {stage === 'uploading' 
                  ? 'Stiamo caricando il tuo file PDF'
                  : 'La nostra AI sta leggendo la visura ed estraendo i dati degli immobili'
                }
              </p>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Dati Estratti</h3>
              <p className="text-gray-500">
                Abbiamo trovato {extractedData.length} {extractedData.length === 1 ? 'immobile' : 'immobili'}. 
                Verifica i dati e conferma per aggiungerli al progetto.
              </p>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-3">
              {extractedData.map((immobile, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {immobile.tipo} - {immobile.categoria}
                        </div>
                        <div className="text-sm text-gray-500">
                          Fg. {immobile.identificativo.foglio}, Part. {immobile.identificativo.particella}
                          {immobile.identificativo.subalterno && `, Sub. ${immobile.identificativo.subalterno}`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          €{(immobile.rendita || immobile.redditoDominicale || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {immobile.tipo === 'fabbricato' ? 'rendita' : 'reddito dominicale'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStage('select')}
                className="flex-1"
              >
                Riprova
              </Button>
              <Button
                onClick={handleConfirmData}
                className="flex-1"
              >
                Conferma e Aggiungi
              </Button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="space-y-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
            <h3 className="text-lg font-medium">Immobili Aggiunti con Successo!</h3>
            <p className="text-gray-500">
              Gli immobili sono stati aggiunti al tuo progetto
            </p>
          </div>
        );

      case 'error':
        return (
          <div className="space-y-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto" />
            <h3 className="text-lg font-medium">Errore</h3>
            <p className="text-gray-500">{error}</p>
            <Button onClick={() => setStage('select')}>
              Riprova
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Carica Visura Catastale
            </div>
          </DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
} 