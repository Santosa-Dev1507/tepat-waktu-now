import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Download, RotateCcw } from "lucide-react";
import { format, subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { exportToCSV, formatDataForExport, generateExportFilename } from "@/lib/exportUtils";
import { startOfDay, endOfDay } from "date-fns";

interface AnalyticsFiltersProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onReset: () => void;
}

const AnalyticsFilters = ({ dateRange, onDateRangeChange, onReset }: AnalyticsFiltersProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleQuickSelect = (days: number) => {
    const end = new Date();
    const start = subDays(end, days - 1);
    onDateRangeChange({ from: start, to: end });
  };

  const handleExport = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Pilih rentang tanggal terlebih dahulu");
      return;
    }

    setIsExporting(true);
    try {
      const { data, error } = await supabase
        .from("tardiness_records")
        .select("*, students(*, classes(*)), profiles(*)")
        .gte("tardiness_date", startOfDay(dateRange.from).toISOString())
        .lte("tardiness_date", endOfDay(dateRange.to).toISOString())
        .order("tardiness_date", { ascending: false });

      if (error) throw error;

      const formattedData = formatDataForExport(data || []);
      const filename = generateExportFilename({ startDate: dateRange.from, endDate: dateRange.to });
      
      exportToCSV(formattedData, filename);
      toast.success("Data berhasil diexport");
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error("Gagal export data");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-card rounded-lg border">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickSelect(1)}
        >
          Hari Ini
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickSelect(7)}
        >
          7 Hari
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickSelect(30)}
        >
          30 Hari
        </Button>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                  {format(dateRange.to, "dd/MM/yyyy")}
                </>
              ) : (
                format(dateRange.from, "dd/MM/yyyy")
              )
            ) : (
              <span>Pilih tanggal</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      <div className="flex-1" />

      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Reset
      </Button>

      <Button
        variant="default"
        size="sm"
        onClick={handleExport}
        disabled={isExporting || !dateRange?.from || !dateRange?.to}
      >
        <Download className="h-4 w-4 mr-2" />
        {isExporting ? "Exporting..." : "Export CSV"}
      </Button>
    </div>
  );
};

export default AnalyticsFilters;
