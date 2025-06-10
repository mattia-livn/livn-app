'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Calculator, FileText, Zap } from 'lucide-react';

export function WelcomeHero() {
  return (
    <div className="text-center mb-12">
      {/* Header principale */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Home className="w-8 h-8 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">Livn</h1>
        </div>
        <p className="text-xl text-gray-600 mb-2">
          Calcolo IMU semplificato e professionale
        </p>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Carica le tue visure catastali, estrai i dati automaticamente con AI, 
          e calcola l'IMU in pochi click seguendo la normativa italiana.
        </p>
      </div>

      {/* Caratteristiche principali */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="border-blue-100 hover:border-blue-200 transition-colors">
          <CardContent className="pt-6">
            <Calculator className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Calcolo Automatico</h3>
            <p className="text-sm text-gray-600">
              Applica automaticamente moltiplicatori, aliquote e detrazioni secondo la normativa
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-100 hover:border-green-200 transition-colors">
          <CardContent className="pt-6">
            <Zap className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Estrazione AI</h3>
            <p className="text-sm text-gray-600">
              Carica PDF delle visure e lascia che l'AI estragga tutti i dati per te
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-100 hover:border-purple-200 transition-colors">
          <CardContent className="pt-6">
            <FileText className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Report Professionali</h3>
            <p className="text-sm text-gray-600">
              Esporta report PDF dettagliati o invia i risultati via email
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 