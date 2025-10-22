import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Clock, User } from "lucide-react";

const TodayRecords = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayRecords();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("tardiness_records_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tardiness_records",
        },
        () => {
          fetchTodayRecords();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTodayRecords = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("tardiness_records")
        .select(`
          *,
          students(full_name, nis, classes(name))
        `)
        .eq("tardiness_date", today)
        .order("tardiness_time", { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error: any) {
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const reasonLabels: Record<string, string> = {
    bangun_kesiangan: "Bangun Kesiangan",
    kendaraan_bermasalah: "Kendaraan Bermasalah",
    macet: "Macet",
    sakit: "Sakit",
    keperluan_keluarga: "Keperluan Keluarga",
    lainnya: "Lainnya",
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Memuat...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Keterlambatan Hari Ini
        </CardTitle>
        <CardDescription>
          Total {records.length} siswa terlambat hari ini
        </CardDescription>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Belum ada siswa yang terlambat hari ini
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {records.map((record) => (
              <div
                key={record.id}
                className="p-4 bg-muted rounded-lg smooth-transition hover:bg-muted/80"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="rounded-full bg-background p-2">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {record.students?.full_name}
                      </p>
                      <div className="text-sm text-muted-foreground space-y-1 mt-1">
                        <p>NIS: {record.students?.nis} • Kelas: {record.students?.classes?.name}</p>
                        <p>Alasan: {reasonLabels[record.reason]}</p>
                        {record.reason_detail && (
                          <p className="italic">{record.reason_detail}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm whitespace-nowrap">
                    <p className="font-semibold text-destructive">
                      {formatTime(record.tardiness_time)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodayRecords;
