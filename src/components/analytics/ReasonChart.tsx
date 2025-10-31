import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

interface ReasonChartProps {
  data: { name: string; value: number }[] | undefined;
  isLoading: boolean;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const ReasonChart = ({ data, isLoading }: ReasonChartProps) => {
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

  const chartConfig = data?.reduce((acc, item, index) => {
    acc[item.name] = {
      label: getReasonLabel(item.name),
      color: COLORS[index % COLORS.length],
    };
    return acc;
  }, {} as any) || {};

  const formattedData = data?.map(item => ({
    ...item,
    name: getReasonLabel(item.name),
  }));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribusi Alasan</CardTitle>
          <CardDescription>Alasan keterlambatan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribusi Alasan</CardTitle>
          <CardDescription>Alasan keterlambatan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Tidak ada data untuk ditampilkan</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribusi Alasan</CardTitle>
        <CardDescription>Alasan keterlambatan dalam periode yang dipilih</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {formattedData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ReasonChart;
