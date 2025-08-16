
"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  ExternalLink,
  Loader2,
  MapPin,
  Package,
  Plus,
  Trash2,
  Truck,
  X,
  Check,
  AlertCircle
} from "lucide-react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  addHours,
  isBefore,
  startOfToday,
} from "date-fns";
import { es, enUS } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Dictionary } from "@/lib/get-dictionary";
import type { DisposalEvent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useCompany } from "@/components/layout/app-shell";
import { RequestCollectionDialog } from "@/components/request-collection-dialog";
import type { Locale } from "@/i18n-config";
import { getDisposalEvents } from "@/services/waste-data-service";
import { useAuth } from "@/context/auth-context";

const statusStyles: Record<DisposalEvent["status"], { bg: string, text: string, border: string, icon: React.ReactNode }> = {
  Scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', icon: <Clock className="h-3 w-3" /> },
  Ongoing: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', icon: <Truck className="h-3 w-3 animate-pulse" /> },
  Completed: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: <Check className="h-3 w-3" /> },
  Cancelled: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', icon: <X className="h-3 w-3" /> },
};


interface ScheduleClientProps {
  dictionary: Dictionary["schedulePage"];
  lang: Locale;
}

export function ScheduleClient({ dictionary, lang }: ScheduleClientProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [isRequestDialogOpen, setRequestDialogOpen] = React.useState(false);
  const { selectedCompany } = useCompany();
  const [events, setEvents] = React.useState<DisposalEvent[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { role, isLoading: isAuthLoading } = useAuth();
  
  const dateLocale = lang === 'es' ? es : enUS;

  React.useEffect(() => {
    const fetchEvents = async () => {
      if (!selectedCompany) {
        setEvents([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const fetchedEvents = await getDisposalEvents(selectedCompany.id);
      setEvents(fetchedEvents);
      setIsLoading(false);
    };
    fetchEvents();
  }, [selectedCompany]);

  const handleEventAdded = React.useCallback((newEvent: DisposalEvent) => {
    setEvents(currentEvents => [...currentEvents, newEvent].sort((a, b) => b.date.getTime() - a.date.getTime()));
  }, []);

  const goToPreviousMonth = () => setCurrentMonth(addMonths(currentMonth, -1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const firstDayOfMonth = startOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(firstDayOfMonth, { locale: dateLocale }),
    end: endOfWeek(endOfMonth(firstDayOfMonth), { locale: dateLocale }),
  });
  
  const colStartClasses = ["", "col-start-2", "col-start-3", "col-start-4", "col-start-5", "col-start-6", "col-start-7"];
  
  const canRequestCollection = !isAuthLoading && (role === 'admin' || role === 'client');

  if (isLoading || isAuthLoading) {
      return (
        <div className="flex flex-1 items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )
  }

  if (!selectedCompany) {
    return (
       <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">{dictionary.title}</h1>
            <p className="text-muted-foreground mt-2">Please select a company to manage the collection schedule.</p>
          </div>
       </div>
    );
  }

  const DayDetails = () => {
    const dayCollections = events.filter(e => isSameDay(e.date, selectedDate)).sort((a,b) => a.date.getTime() - b.date.getTime());
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 md:p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {format(selectedDate, "PPP", { locale: dateLocale })}
              </h3>
              <p className="text-gray-500 text-sm">
                {lang === 'es' ? `${dayCollections.length} recolección(es) programada(s)` : `${dayCollections.length} collection(s) scheduled`}
              </p>
            </div>
            {canRequestCollection && (
              <Button 
                onClick={() => setRequestDialogOpen(true)}
                className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 mt-4 sm:mt-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                {dictionary.requestCollection}
              </Button>
            )}
          </div>
        </div>
        
        <div className="p-4 md:p-6">
          {dayCollections.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No collections scheduled for this day</p>
              {canRequestCollection && (
                 <Button 
                    onClick={() => setRequestDialogOpen(true)}
                    variant="outline"
                    className="border-dashed border-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule first collection
                  </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {dayCollections.map(event => {
                 const statusStyle = statusStyles[event.status];
                 return (
                    <Card key={event.id} className="hover:shadow-md transition-shadow duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="font-medium text-gray-800">{format(event.date, 'p', { locale: dateLocale })}</span>
                              </div>
                              <Badge className={cn(statusStyle.bg, statusStyle.text, statusStyle.border, "px-2 py-1")}>
                                <span className="flex items-center gap-1">
                                  {statusStyle.icon}
                                  {dictionary.details.status[event.status]}
                                </span>
                              </Badge>
                            </div>
                            
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-orange-500" />
                                <span><strong>{event.wasteTypes.join(', ')}</strong></span>
                              </div>
                              {event.instructions && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-green-500" />
                                  <span>{event.instructions}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {role === 'admin' && (
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 h-8 w-8">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                 )
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">{dictionary.title}</h1>
          <p className="text-gray-600">{dictionary.description}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 capitalize">
                <CalendarIcon className="h-5 w-5 text-primary" />
                {format(currentMonth, "MMMM yyyy", { locale: dateLocale })}
              </h2>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" onClick={goToPreviousMonth} className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={goToNextMonth} className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {Array.from({length: 7}).map((_, i) => (
                 <div key={i} className="p-2 text-xs font-medium text-gray-500 text-center capitalize">
                  {format(startOfWeek(new Date(), { locale: dateLocale, weekStartsOn: i as any }), 'eee', { locale: dateLocale })}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {daysInMonth.map((day) => {
                const hasEvents = events.some(e => isSameDay(e.date, day));
                return (
                  <div
                    key={day.toString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                        "p-2 text-sm cursor-pointer rounded-lg transition-all duration-200 relative aspect-square flex items-center justify-center",
                        "hover:bg-primary/10",
                        !isSameMonth(day, currentMonth) && "text-gray-400",
                        isToday(day) && !isSameDay(day, selectedDate) && "bg-accent/50 text-accent-foreground font-semibold",
                        hasEvents && !isSameDay(day, selectedDate) && "bg-orange-50 border border-orange-200",
                        isSameDay(day, selectedDate) && "bg-primary text-primary-foreground shadow-lg scale-105",
                        isBefore(day, startOfToday()) && !isToday(day) && "text-gray-400/70"
                    )}
                  >
                    <span>{format(day, 'd')}</span>
                     {hasEvents && (
                        <div className="absolute top-1 right-1">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-accent/50 rounded border border-gray-300"></div>
                <span>Hoy</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-orange-50 rounded border border-orange-200"></div>
                <span>Con recolecciones</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-primary rounded"></div>
                <span>Seleccionado</span>
              </div>
            </div>
          </div>
          
          <DayDetails />
        </div>
        
        {canRequestCollection && (
          <RequestCollectionDialog
            open={isRequestDialogOpen}
            onOpenChange={setRequestDialogOpen}
            dictionary={dictionary.requestCollectionDialog}
            onEventAdded={handleEventAdded}
          />
        )}
      </div>
    </div>
  );
}
