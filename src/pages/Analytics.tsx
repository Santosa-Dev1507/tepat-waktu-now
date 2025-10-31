import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import StatisticsCards from "@/components/analytics/StatisticsCards";
import TrendChart from "@/components/analytics/TrendChart";
import ClassChart from "@/components/analytics/ClassChart";
import ReasonChart from "@/components/analytics/ReasonChart";
import TopStudentsChart from "@/components/analytics/TopStudentsChart";
import AnalyticsFilters from "@/components/analytics/AnalyticsFilters";

const Analytics = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const filters = {
    startDate: dateRange?.from || subDays(new Date(), 29),
    endDate: dateRange?.to || new Date(),
  };

  const {
    statistics,
    trendData,
    classDistribution,
    reasonDistribution,
    topStudents,
    isLoading: dataLoading,
  } = useAnalyticsData(filters);

  const handleReset = () => {
    setDateRange({
      from: subDays(new Date(), 29),
      to: new Date(),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
              <div className="rounded-lg bg-primary/10 p-2">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Dashboard Analitik</h1>
                <p className="text-sm text-muted-foreground">Statistik dan laporan keterlambatan siswa</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Filters */}
          <AnalyticsFilters
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onReset={handleReset}
          />

          {/* Statistics Cards */}
          <StatisticsCards statistics={statistics} isLoading={dataLoading} />

          {/* Charts Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <TrendChart data={trendData} isLoading={dataLoading} />
            <ClassChart data={classDistribution} isLoading={dataLoading} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <ReasonChart data={reasonDistribution} isLoading={dataLoading} />
            <TopStudentsChart data={topStudents} isLoading={dataLoading} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
