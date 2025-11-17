import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, setHours, setMinutes } from "date-fns";
import { nl } from "date-fns/locale";
import { CalendarIcon, Clock, MapPin, Video, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { z } from "zod";

const interviewProposalSchema = z.object({
  location: z.string().optional(),
  onlineLink: z.string().url("Ongeldige URL").optional().or(z.literal("")),
  notes: z.string().max(500, "Notities mogen maximaal 500 karakters bevatten").optional(),
  locationType: z.enum(["online", "physical"]),
});

type InterviewProposalFormData = z.infer<typeof interviewProposalSchema>;

interface TimeSlot {
  date: Date;
  time: string;
  duration: number;
}

interface InterviewSchedulerProps {
  applicationId: string;
  candidateName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InterviewScheduler({
  applicationId,
  candidateName,
  isOpen,
  onClose,
  onSuccess,
}: InterviewSchedulerProps) {
  const { toast } = useToast();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("09:00");
  const [selectedDuration, setSelectedDuration] = useState<number>(60);

  const form = useForm<InterviewProposalFormData>({
    resolver: zodResolver(interviewProposalSchema),
    defaultValues: {
      locationType: "online",
      location: "",
      onlineLink: "",
      notes: "",
    },
  });

  const locationType = form.watch("locationType");

  const createProposalMutation = useMutation({
    mutationFn: async (data: InterviewProposalFormData & { timeSlots: TimeSlot[] }) => {
      const formattedTimeSlots = data.timeSlots.map((slot) => {
        const [hours, minutes] = slot.time.split(":").map(Number);
        const dateTime = setMinutes(setHours(slot.date, hours), minutes);
        return {
          dateTime: dateTime.toISOString(),
          duration: slot.duration,
        };
      });

      const response = await fetch("/api/interview-proposals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          applicationId,
          location: data.locationType === "physical" ? data.location : "Online",
          onlineLink: data.locationType === "online" ? data.onlineLink : undefined,
          notes: data.notes,
          timeSlots: formattedTimeSlots,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create interview proposal");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/v2/applications/${applicationId}/interview-proposals`] });
      queryClient.invalidateQueries({ queryKey: ["/api/v2/applications"] });
      toast({
        title: "Interview uitnodiging verzonden",
        description: `De interview uitnodiging is verzonden naar ${candidateName}.`,
      });
      onSuccess?.();
      handleClose();
    },
    onError: () => {
      toast({
        title: "Fout",
        description: "Er ging iets mis bij het verzenden van de interview uitnodiging.",
        variant: "destructive",
      });
    },
  });

  const handleAddTimeSlot = () => {
    if (!selectedDate) {
      toast({
        title: "Selecteer een datum",
        description: "Kies eerst een datum voor het tijdslot.",
        variant: "destructive",
      });
      return;
    }

    const newSlot: TimeSlot = {
      date: selectedDate,
      time: selectedTime,
      duration: selectedDuration,
    };

    // Check for duplicates
    const isDuplicate = timeSlots.some(
      (slot) =>
        slot.date.toDateString() === newSlot.date.toDateString() &&
        slot.time === newSlot.time
    );

    if (isDuplicate) {
      toast({
        title: "Dubbel tijdslot",
        description: "Dit tijdslot is al toegevoegd.",
        variant: "destructive",
      });
      return;
    }

    setTimeSlots([...timeSlots, newSlot]);
    setSelectedDate(undefined);
  };

  const handleRemoveTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const handleSubmit = (values: InterviewProposalFormData) => {
    if (timeSlots.length === 0) {
      toast({
        title: "Geen tijdslots",
        description: "Voeg minimaal één tijdslot toe voor het interview.",
        variant: "destructive",
      });
      return;
    }

    createProposalMutation.mutate({ ...values, timeSlots });
  };

  const handleClose = () => {
    form.reset();
    setTimeSlots([]);
    setSelectedDate(undefined);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Interview Plannen</DialogTitle>
          <DialogDescription>
            Plan een interview met {candidateName}. Voeg meerdere tijdslots toe waaruit de kandidaat kan kiezen.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Location Type */}
            <FormField
              control={form.control}
              name="locationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interview Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="online" id="online" />
                        <Label htmlFor="online" className="flex items-center cursor-pointer">
                          <Video className="mr-2 h-4 w-4" />
                          Online
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="physical" id="physical" />
                        <Label htmlFor="physical" className="flex items-center cursor-pointer">
                          <MapPin className="mr-2 h-4 w-4" />
                          Op locatie
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location or Online Link */}
            {locationType === "physical" ? (
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Locatie</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Bijv. Kantoor Amsterdam, Herengracht 123"
                        data-testid="input-location"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="onlineLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Link (optioneel)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://zoom.us/j/123456789"
                        data-testid="input-online-link"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Time Slots */}
            <div className="space-y-4">
              <FormLabel>Interview Tijdslots</FormLabel>
              
              <div className="flex flex-wrap gap-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[200px] justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                      data-testid="button-select-date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP", { locale: nl }) : "Kies datum"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date() || date > addDays(new Date(), 60)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="border rounded px-3 py-2"
                    data-testid="select-time"
                  >
                    {Array.from({ length: 19 }, (_, i) => {
                      const hour = Math.floor(i / 2) + 8;
                      const minute = i % 2 === 0 ? "00" : "30";
                      return `${hour.toString().padStart(2, "0")}:${minute}`;
                    }).map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Duur:</span>
                  <select
                    value={selectedDuration}
                    onChange={(e) => setSelectedDuration(Number(e.target.value))}
                    className="border rounded px-3 py-2"
                    data-testid="select-duration"
                  >
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>1 uur</option>
                    <option value={90}>1.5 uur</option>
                    <option value={120}>2 uur</option>
                  </select>
                </div>

                <Button
                  type="button"
                  onClick={handleAddTimeSlot}
                  disabled={!selectedDate}
                  data-testid="button-add-timeslot"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Toevoegen
                </Button>
              </div>

              {/* Added Time Slots */}
              {timeSlots.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      {timeSlots.map((slot, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-background rounded-lg"
                          data-testid={`timeslot-${index}`}
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">
                              {format(slot.date, "dd MMM yyyy", { locale: nl })}
                            </Badge>
                            <span className="font-medium">{slot.time}</span>
                            <span className="text-sm text-muted-foreground">
                              ({slot.duration} minuten)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTimeSlot(index)}
                            data-testid={`button-remove-timeslot-${index}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notities (optioneel)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Bijzondere instructies of opmerkingen voor de kandidaat..."
                      rows={3}
                      data-testid="input-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                data-testid="button-cancel"
              >
                Annuleren
              </Button>
              <Button
                type="submit"
                disabled={createProposalMutation.isPending || timeSlots.length === 0}
                data-testid="button-send-invitation"
              >
                Uitnodiging Versturen
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}