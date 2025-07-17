
"use client";

import * as React from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  FileText,
  ImageIcon,
  Mic,
  PlusCircle,
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
} from "date-fns";
import { es, enUS } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Dictionary } from "@/lib/get-dictionary";
import type { DisposalEvent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useCompany } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { RequestCollectionDialog } from "@/components/request-collection-dialog";
import { useParams } from "next/navigation";
import type { Locale } from "@/i18n-config";

const statusColors: Record<DisposalEvent["status"], string> = {
  Scheduled: "bg-blue-500",
  Ongoing: "bg-yellow-500 animate-pulse",
  Completed: "bg-green-500",
  Cancelled: "bg-gray-500",
};

interface ScheduleClientProps {
  dictionary: Dictionary["schedulePage"];
  allEvents: DisposalEvent[];
}

export function ScheduleClient({ dictionary, allEvents: initialEvents }: ScheduleClientProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [isSheetOpen, setSheetOpen] = React.useState(false);
  const [isRequestDialogOpen, setRequestDialogOpen] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);
  const { selectedCompany } = useCompany();
  const [allEvents, setAllEvents] = React.useState(initialEvents);
  const params = useParams();
  const lang = params.lang as Locale;
  const dateLocale = lang === 'es' ? es : enUS;


  React.useEffect(() => {
    setIsClient(true);
    setAllEvents(initialEvents);
  }, [initialEvents]);

  if (!selectedCompany) {
    return (
       <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">{dictionary.title}</h1>
          </div>
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
            <div className="text-center">
              <p className="text-muted-foreground">Please select a company to see the schedule.</p>
            </div>
          </div>
       </div>
    );
  }
  
  const handleEventAdded = React.useCallback((newEvent: DisposalEvent) => {
    setAllEvents(currentEvents => [...currentEvents, newEvent].sort((a, b) => b.date.getTime() - a.date.getTime()));
  }, []);

  const events = allEvents.filter(event => event.companyId === selectedCompany.id);

  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(firstDayOfMonth),
    end: endOfWeek(lastDayOfMonth),
  });

  const handleDayClick = (day: Date) => {
    const eventsOnDay = events.filter((event) => isSameDay(event.date, day));
    if (eventsOnDay.length > 0) {
      setSelectedDate(day);
      setSheetOpen(true);
    }
  };

  const selectedDayEvents = selectedDate
    ? events.filter((event) => isSameDay(event.date, selectedDate))
    : [];

  const goToPreviousMonth = () => setCurrentMonth(addMonths(currentMonth, -1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const colStartClasses = [
    "",
    "col-start-2",
    "col-start-3",
    "col-start-4",
    "col-start-5",
    "col-start-6",
    "col-start-7",
  ];

  const attachmentIcons = {
    image: <ImageIcon className="h-5 w-5 flex-shrink-0" />,
    pdf: <FileText className="h-5 w-5 flex-shrink-0" />,
    audio: <Mic className="h-5 w-5 flex-shrink-0" />,
  };
  

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center">
          <div>
            <h1 className="text-lg font-semibold md:text-2xl">{dictionary.title}</h1>
            <p className="text-sm text-muted-foreground">{dictionary.description}</p>
          </div>
          <div className="ml-auto flex items-center gap-2 mt-4 sm:mt-0">
            <Button size="sm" className="h-8 gap-1" onClick={() => setRequestDialogOpen(true)}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                {dictionary.requestCollection}
              </span>
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold w-36 text-center capitalize">
              {isClient ? (
                format(currentMonth, "MMMM yyyy", { locale: dateLocale })
              ) : (
                <Skeleton className="h-6 w-full" />
              )}
            </span>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
        <div className="rounded-lg border">
          <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-2 capitalize">{lang === 'es' ? dictionary.days[day as keyof typeof dictionary.days] : day.substring(0,3)}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 text-sm">
            {daysInMonth.map((day, dayIdx) => (
              <div
                key={day.toString()}
                className={cn(
                  dayIdx === 0 && colStartClasses[getDay(day)],
                  "h-20 sm:h-28 border-t border-r p-1.5",
                  !isSameMonth(day, currentMonth) && "text-muted-foreground opacity-50"
                )}
              >
                <button
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    isToday(day) && "bg-primary text-primary-foreground",
                    events.some((event) => isSameDay(event.date, day)) &&
                      "font-bold hover:bg-accent"
                  )}
                  disabled={!events.some((event) => isSameDay(event.date, day))}
                >
                  {format(day, "d")}
                </button>
                <div className="mt-1 hidden sm:flex flex-col gap-1 overflow-y-auto">
                  {events
                    .filter((event) => isSameDay(event.date, day))
                    .map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "flex items-center gap-1 text-xs rounded-sm",
                          "text-white p-1"
                        )}
                         style={{ backgroundColor: statusColors[event.status].replace('bg-', 'var(--color-') }}
                      >
                        <span className="ml-1 truncate font-medium">
                          {event.wasteTypes.join(", ")}
                        </span>
                      </div>
                    ))}
                </div>
                 <div className="mt-1 flex sm:hidden flex-wrap gap-1">
                    {events
                    .filter((event) => isSameDay(event.date, day))
                    .map((event) => (
                      <div
                        key={event.id}
                        className={cn("h-1.5 w-1.5 rounded-full", statusColors[event.status])}
                        />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>
                {dictionary.details.title}:{" "}
                {isClient && selectedDate ? (
                  <span>{format(selectedDate, "PPP", { locale: dateLocale })}</span>
                ) : (
                  <Skeleton className="h-6 w-32 inline-block" />
                )}
              </SheetTitle>
              <SheetDescription>
                {dictionary.details.description}
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
              <div className="space-y-6 py-4">
                {selectedDayEvents.map((event) => (
                  <div key={event.id} className="space-y-4">
                    <div>
                      <h3 className="font-semibold">{event.wasteTypes.join(", ")}</h3>
                      <Badge
                        className={cn(
                          "mt-1 border-transparent text-white",
                          statusColors[event.status]
                        )}
                      >
                        {dictionary.details.status[event.status]}
                      </Badge>
                    </div>

                    {event.instructions && (
                      <div>
                        <h4 className="font-medium text-sm">
                          {dictionary.details.instructions}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {event.instructions}
                        </p>
                      </div>
                    )}

                    {event.attachments && event.attachments.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm">
                          {dictionary.details.attachments}
                        </h4>
                        <ul className="mt-2 space-y-2">
                          {event.attachments.map((file) => (
                            <li key={file.id}>
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 rounded-md p-2 hover:bg-accent"
                              >
                                {attachmentIcons[file.type]}
                                <span className="flex-1 truncate text-sm font-medium">
                                  {file.name}
                                </span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <Separator />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
      <RequestCollectionDialog
        open={isRequestDialogOpen}
        onOpenChange={setRequestDialogOpen}
        dictionary={dictionary.requestCollectionDialog}
        onEventAdded={handleEventAdded}
      />
    </>
  );
}
