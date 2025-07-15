
'use client';

import { useDictionaries } from "@/context/dictionary-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FinalDisposalPage() {
  const dictionary = useDictionaries()?.navigation.links;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">{dictionary?.finalDisposal}</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Certificados de Disposición Final</CardTitle>
          <CardDescription>
            Aquí podrá visualizar y descargar los certificados de disposición final de sus residuos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold tracking-tight">
                Próximamente
              </h3>
              <p className="text-muted-foreground mt-2">
                Estamos trabajando en esta sección para ofrecerle una gestión completa de sus certificados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    