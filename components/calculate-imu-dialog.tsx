'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, FileText, Loader2 } from 'lucide-react';
import { ProjectIMU, AliquotaIMU, RisultatoCalcoloIMU } from '@/lib/types';

interface CalculateIMUDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectIMU;
}

export function CalculateIMUDialog({ 
  open, 
  onOpenChange, 
  project 
}: CalculateIMUDialogProps) {
  const [step, setStep] = useState<'config' | 'calculating' | 'results'>('config');
  const [year, setYear] = useState(new Date().getFullYear());
  const [aliquote, setAliquote] = useState<Record<string, AliquotaIMU>>({});
  const [results, setResults] = useState<RisultatoCalcoloIMU[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ottieni comuni unici dal progetto
  const comuni = Array.from(new Set(
    project.immobili?.map(i => i.identificativo.comune) || []
  ));

  const handleCalculate = async () => {
    if (comuni.length === 0) {
      setError('Nessun immobile trovato nel progetto');
      return;
    }

    setLoading(true);
    setError(null);
    setStep('calculating');

    try {
      // Prepara aliquote per il calcolo
      const aliquoteArray = Object.values(aliquote);
      
      const response = await fetch('/api/calculate-imu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          immobili: project.immobili,
          aliquote: aliquoteArray,
          anno: year
        })
      });

      if (!response.ok) {
        throw new Error('Errore nel calcolo IMU');
      }

      const result = await response.json();
      setResults(result.risultati);
      setStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      setStep('config');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadAliquote = async (comune: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/load-aliquote-from-md', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comune, anno: year })
      });

      if (response.ok) {
        const aliquota = await response.json();
        setAliquote(prev => ({ ...prev, [comune]: aliquota }));
      } else {
        // Se non trova aliquote, mostra campi manuali
        setAliquote(prev => ({ 
          ...prev, 
          [comune]: {
            comune,
            provincia: '',
            anno: year,
            aliquotaOrdinaria: 0.86, // Default
            aliquotaRidotta: 0.76,
            aliquotaTerrenAgricoli: 0.76,
            aliquotaTerrenEdificabili: 0.86
          }
        }));
      }
    } catch (err) {
      console.error('Errore caricamento aliquote:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateAliquota = (comune: string, field: keyof AliquotaIMU, value: any) => {
    setAliquote(prev => ({
      ...prev,
      [comune]: {
        ...prev[comune],
        [field]: value
      }
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const resetDialog = () => {
    setStep('config');
    setAliquote({});
    setResults([]);
    setError(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetDialog();
    }
    onOpenChange(open);
  };

  const renderConfigStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Calculator className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Calcolo IMU</h3>
        <p className="text-gray-500">
          Configura le aliquote per ogni comune e calcola l'IMU
        </p>
      </div>

      {/* Anno */}
      <div className="space-y-2">
        <Label>Anno di riferimento</Label>
        <Input
          type="number"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          min="2010"
          max={new Date().getFullYear() + 1}
        />
      </div>

      {/* Aliquote per comune */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Aliquote per Comune</Label>
        
        {comuni.map(comune => (
          <Card key={comune}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{comune}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLoadAliquote(comune)}
                  disabled={loading}
                >
                  Carica Aliquote
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {aliquote[comune] ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Aliquota Ordinaria (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={aliquote[comune].aliquotaOrdinaria}
                      onChange={(e) => updateAliquota(comune, 'aliquotaOrdinaria', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Aliquota Ridotta (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={aliquote[comune].aliquotaRidotta || 0}
                      onChange={(e) => updateAliquota(comune, 'aliquotaRidotta', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Terreni Agricoli (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={aliquote[comune].aliquotaTerrenAgricoli || 0}
                      onChange={(e) => updateAliquota(comune, 'aliquotaTerrenAgricoli', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Terreni Edificabili (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={aliquote[comune].aliquotaTerrenEdificabili || 0}
                      onChange={(e) => updateAliquota(comune, 'aliquotaTerrenEdificabili', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Clicca "Carica Aliquote" per configurare le aliquote di questo comune
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {error && (
        <Alert>
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
          onClick={handleCalculate}
          disabled={Object.keys(aliquote).length !== comuni.length || loading}
          className="flex-1"
        >
          {loading ? 'Caricamento...' : 'Calcola IMU'}
        </Button>
      </div>
    </div>
  );

  const renderCalculatingStep = () => (
    <div className="space-y-6 text-center py-8">
      <Loader2 className="w-16 h-16 text-blue-600 mx-auto animate-spin" />
      <h3 className="text-lg font-medium">Calcolo in corso...</h3>
      <p className="text-gray-500">
        Stiamo calcolando l'IMU per tutti i tuoi immobili
      </p>
    </div>
  );

  const renderResultsStep = () => {
    const totalIMU = results.reduce((sum, r) => sum + r.importo, 0);
    const acconto = totalIMU * 0.5; // 50% per acconto
    const saldo = totalIMU - acconto;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Risultato Calcolo IMU {year}</h3>
          <div className="text-3xl font-bold text-green-600">
            {formatCurrency(totalIMU)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Acconto: {formatCurrency(acconto)} • Saldo: {formatCurrency(saldo)}
          </div>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {results.map((result, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">
                      {result.immobile.tipo} - {result.immobile.categoria}
                    </div>
                    <div className="text-sm text-gray-500">
                      {result.immobile.identificativo.comune} • 
                      Fg. {result.immobile.identificativo.foglio}, 
                      Part. {result.immobile.identificativo.particella}
                    </div>
                    {result.esente && (
                      <div className="text-xs text-orange-600 mt-1">
                        Esente: {result.motivazioneEsenzione}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {formatCurrency(result.importo)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Base: {formatCurrency(result.baseImponibile)} • 
                      Aliquota: {result.aliquota}%
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
            onClick={() => setStep('config')}
            className="flex-1"
          >
            Ricalcola
          </Button>
          <Button
            onClick={() => handleOpenChange(false)}
            className="flex-1"
          >
            <FileText className="w-4 h-4 mr-2" />
            Esporta Report
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              Calcolo IMU
            </div>
          </DialogTitle>
        </DialogHeader>
        
        {step === 'config' && renderConfigStep()}
        {step === 'calculating' && renderCalculatingStep()}
        {step === 'results' && renderResultsStep()}
      </DialogContent>
    </Dialog>
  );
} 