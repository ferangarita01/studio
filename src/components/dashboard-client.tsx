
"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Activity, CalendarIcon, Trash2, Recycle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { DisposalEvent, WasteEntry, Company } from "@/lib/types";
import type { Dictionary } from "@/lib/get-dictionary";
import { useCompany } from "./layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { getCompanies } from "@/services/waste-data-service";
import { useAuth } from "@/context/auth-context";

const chartConfig = {
  quantity: {
    label: "Quantity (kg)",
  },
  recycling: {
    label: "Recycling",
    color: "hsl(var(--chart-1))",
  },
  organic: {
    label: "Organic",
    color: "hsl(var(--chart-2))",
  },
  general: {
    label: "General",
    color: "hsl(var(--chart-3))",
  },
};

interface DashboardClientProps {
  dictionary: Dictionary["dashboard"];
  wasteDataAll: Record<string, any[]>;
  wasteLogAll: WasteEntry[];
  companies: Company[];
  initialDisposalEvents: DisposalEvent[];
}

export function DashboardClient({
  dictionary,
  wasteDataAll,
  wasteLogAll,
  initialDisposalEvents,
}: DashboardClientProps) {
  const { user, role } = useAuth();
  const { selectedCompany, setCompanies, setSelectedCompany, isLoading: isCompanyContextLoading } = useCompany();
  const [isClient, setIsClient] = React.useState(false);
  const [disposalEvents, setDisposalEvents] = React.useState<DisposalEvent[]>(initialDisposalEvents);

  React.useEffect(() => {
    setIsClient(true);
  }, []);
  
  React.useEffect(() => {
    const fetchAndSetCompanies = async () => {
      if (user) {
        // For admin, fetch companies created by them. For client, fetch all and filter.
        const userCompanies = await getCompanies(user.uid, role);
        
        setCompanies(userCompanies);
        if (userCompanies.length > 0 && !selectedCompany) {
          setSelectedCompany(userCompanies[0]);
        }
      }
    };
    fetchAndSetCompanies();
  }, [user, role, setCompanies, setSelectedCompany, selectedCompany]);


  React.useEffect(() => {
    setDisposalEvents(initialDisposalEvents);
  }, [initialDisposalEvents]);
  
  if (isCompanyContextLoading || !selectedCompany) {
    const WelcomeMessage = () => (
       <div className="text-center max-w-4xl mx-auto">
        <h3 className="mt-4 text-2xl font-bold">Bienvenido a EcoCircle: Tu Socio Estratégico en Gestión Ambiental Inteligente</h3>
        <div className="text-muted-foreground mt-4">
          <p>En EcoCircle, fusionamos la experiencia en servicios y asesorías ambientales con la vanguardia de la automatización de procesos y la inteligencia artificial (IA). Nuestra plataforma está diseñada para transformar la gestión de residuos y el cumplimiento ambiental en tu empresa, ofreciéndote herramientas intuitivas y eficientes para optimizar tus operaciones.</p>
        
          <div className="mt-8 text-left">
            <h4 className="font-semibold text-lg mb-4 text-center">¿Qué puedes esperar de EcoCircle?</h4>
            <div className="grid md:grid-cols-2 gap-6">
                <div><strong>Tablero Centralizado:</strong> Un espacio intuitivo donde podrás visualizar y gestionar todas tus actividades ambientales de un vistazo.</div>
                <div><strong>Analizador IA:</strong> Próximamente, nuestra potente inteligencia artificial te brindará insights profundos para la optimización de tus procesos de residuos.</div>
                <div><strong>Registro de Residuos:</strong> Simplifica el seguimiento y la documentación de tus residuos, asegurando la trazabilidad y el cumplimiento normativo.</div>
                <div><strong>Calendario:</strong> Organiza y programa tus actividades ambientales, desde recolecciones hasta auditorías.</div>
                <div><strong>Reportes Detallados:</strong> Genera informes completos para evaluar tu desempeño ambiental, identificar áreas de mejora y cumplir con las regulaciones.</div>
                <div><strong>Materiales:</strong> Accede a recursos y documentación relevante para una gestión ambiental efectiva.</div>
            </div>
          </div>

          <div className="mt-8">
            <h4 className="font-semibold text-lg">Comienza tu camino hacia la sostenibilidad:</h4>
            <div className="text-muted-foreground mt-2">
              {role === 'admin' ? (
                 <p>Para aprovechar al máximo las capacidades de EcoCircle, por favor selecciona o crea una empresa para empezar. Estamos aquí para ayudarte a automatizar tus procesos ambientales, optimizar tus recursos y avanzar hacia un futuro más sostenible con la ayuda de la inteligencia artificial.</p>
              ) : (
                <p>Has iniciado sesión como cliente. Por favor, espera a que un administrador te asigne a una empresa para poder ver los datos del tablero. Si crees que esto es un error, contacta con el administrador de tu cuenta.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );

    return (
       <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">{dictionary.title}</h1>
          </div>
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
            { isCompanyContextLoading ? <Skeleton className="h-32 w-full" /> : <WelcomeMessage />}
          </div>
       </div>
    );
  }

  const wasteData = wasteDataAll[selectedCompany.id] || [];
  const wasteLog = wasteLogAll.filter(entry => entry.companyId === selectedCompany.id);
  const upcomingDisposals = disposalEvents.filter(d => (d.status === 'Scheduled' || d.status === 'Ongoing') && d.companyId === selectedCompany.id);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  }
  
  const formatShortDate = (date: Date) => {
     return new Intl.DateTimeFormat(undefined, {
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  }

  return (
    <div className="flex w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">{dictionary.title}</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {dictionary.cards.totalWaste.title}
              </CardTitle>
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,254 kg</div>
              <p className="text-xs text-muted-foreground">
                {dictionary.cards.totalWaste.change}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{dictionary.cards.recyclingRate.title}</CardTitle>
              <Recycle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">68%</div>
              <p className="text-xs text-muted-foreground">
                {dictionary.cards.recyclingRate.change}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{dictionary.cards.upcomingDisposals.title}</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingDisposals.length}</div>
              <p className="text-xs text-muted-foreground">
                {dictionary.cards.upcomingDisposals.next}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{dictionary.cards.complianceStatus.title}</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{dictionary.cards.complianceStatus.status}</div>
              <p className="text-xs text-muted-foreground">
                {dictionary.cards.complianceStatus.detail}
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>{dictionary.wasteOverview.title}</CardTitle>
              <CardDescription>
                {dictionary.wasteOverview.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <BarChart data={wasteData} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="recycling" stackId="a" fill="var(--color-recycling)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="organic" stackId="a" fill="var(--color-organic)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="general" stackId="a" fill="var(--color-general)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{dictionary.disposals.title}</CardTitle>
              <CardDescription>
                {dictionary.disposals.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {upcomingDisposals.length > 0 ? (
                upcomingDisposals.map((disposal) => (
                  <div key={disposal.id} className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                    <div className="grid gap-1">
                      <p className="font-medium">
                        {disposal.wasteTypes.join(', ')} {dictionary.disposals.pickup}
                      </p>
                      {isClient ? (
                        <p className="text-sm text-muted-foreground">
                            {formatDate(disposal.date)}
                        </p>
                      ) : <Skeleton className="h-4 w-28" /> }
                      <Badge variant="secondary">{dictionary.disposals.status[disposal.status as keyof typeof dictionary.disposals.status]}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming disposals.</p>
              )}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{dictionary.recentEntries.title}</CardTitle>
            <CardDescription>
              {dictionary.recentEntries.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{dictionary.recentEntries.table.date}</TableHead>
                    <TableHead>{dictionary.recentEntries.table.type}</TableHead>
                    <TableHead className="text-right">{dictionary.recentEntries.table.quantity}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wasteLog.length > 0 ? (
                    wasteLog.slice(0, 5).map((entry: WasteEntry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {isClient ? <span>{formatShortDate(entry.date)}</span> : <Skeleton className="h-4 w-20" />}
                        </TableCell>
                        <TableCell>{entry.type}</TableCell>
                        <TableCell className="text-right">{entry.quantity.toFixed(2)} kg</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        No recent entries.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
