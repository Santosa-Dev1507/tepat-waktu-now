import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, School, AlertCircle } from "lucide-react";

interface StatisticsCardsProps {
  statistics: {
    totalCount: number;
    topStudent: { name: string; count: number } | null;
    topClass: { name: string; count: number } | null;
    topReason: { reason: string; count: number } | null;
  } | undefined;
  isLoading: boolean;
}

const StatisticsCards = ({ statistics, isLoading }: StatisticsCardsProps) => {
  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      bangun_kesiangan: "Bangun Kesiangan",
      macet: "Macet",
      izin_orang_tua: "Izin Orang Tua",
      keperluan_keluarga: "Keperluan Keluarga",
      sakit: "Sakit",
      lainnya: "Lainnya",
    };
    return labels[reason] || reason;
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 w-32 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Keterlambatan</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics?.totalCount || 0}</div>
          <p className="text-xs text-muted-foreground">
            Siswa terlambat pada periode ini
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Siswa Tersering</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics?.topStudent?.count || 0}x</div>
          <p className="text-xs text-muted-foreground truncate">
            {statistics?.topStudent?.name || "Tidak ada data"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Kelas Tertinggi</CardTitle>
          <School className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics?.topClass?.count || 0}x</div>
          <p className="text-xs text-muted-foreground">
            {statistics?.topClass?.name || "Tidak ada data"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alasan Utama</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics?.topReason?.count || 0}x</div>
          <p className="text-xs text-muted-foreground">
            {statistics?.topReason ? getReasonLabel(statistics.topReason.reason) : "Tidak ada data"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsCards;
