import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

interface TopStudentsChartProps {
  data: {
    name: string;
    nis: string;
    class: string;
    count: number;
    commonReason: string;
  }[] | undefined;
  isLoading: boolean;
}

const TopStudentsChart = ({ data, isLoading }: TopStudentsChartProps) => {
  const chartConfig = {
    count: {
      label: "Jumlah",
      color: "hsl(var(--destructive))",
    },
  };

  const formattedData = data?.map(student => ({
    ...student,
    displayName: `${student.name.split(" ")[0]} (${student.class})`,
  }));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Siswa</CardTitle>
          <CardDescription>Siswa dengan keterlambatan terbanyak</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Siswa</CardTitle>
          <CardDescription>Siswa dengan keterlambatan terbanyak</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">Tidak ada data untuk ditampilkan</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Siswa</CardTitle>
        <CardDescription>Siswa dengan keterlambatan terbanyak dalam periode yang dipilih</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                type="number" 
                className="text-xs"
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                dataKey="displayName" 
                type="category"
                className="text-xs"
                stroke="hsl(var(--muted-foreground))"
                width={120}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                cursor={{ fill: 'hsl(var(--muted))' }}
              />
              <Bar 
                dataKey="count" 
                fill="hsl(var(--destructive))"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default TopStudentsChart;
