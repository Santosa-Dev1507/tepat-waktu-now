import { Button } from "@/components/ui/button";
import { GraduationCap, Clock, Bell, BarChart3 } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-accent py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center text-primary-foreground">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
              <GraduationCap className="h-5 w-5" />
              <span className="text-sm font-medium">Sistem Informasi Sekolah</span>
            </div>
            <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl">
              SI-PATAS
            </h1>
            <p className="mb-4 text-2xl font-semibold">
              Sistem Informasi Penanganan Keterlambatan Siswa
            </p>
            <p className="mx-auto mb-8 max-w-2xl text-lg opacity-90">
              Digitalkan pencatatan keterlambatan siswa dengan notifikasi otomatis ke orang tua dan wali kelas melalui WhatsApp
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                variant="secondary" 
                className="shadow-lg"
                onClick={() => window.location.href = '/auth'}
              >
                Masuk ke Sistem
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/20 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                onClick={() => window.location.href = '/dashboard'}
              >
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Fitur Utama</h2>
            <p className="text-muted-foreground">Solusi lengkap untuk manajemen keterlambatan siswa</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="card-hover rounded-xl bg-card p-6 shadow">
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Input Cepat</h3>
              <p className="text-muted-foreground">
                Guru piket dapat mencatat keterlambatan dengan cepat melalui pencarian NIS atau nama siswa
              </p>
            </div>
            <div className="card-hover rounded-xl bg-card p-6 shadow">
              <div className="mb-4 inline-flex rounded-lg bg-accent/10 p-3">
                <Bell className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Notifikasi Otomatis</h3>
              <p className="text-muted-foreground">
                Sistem otomatis mengirim notifikasi WhatsApp ke orang tua dan wali kelas
              </p>
            </div>
            <div className="card-hover rounded-xl bg-card p-6 shadow">
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Dashboard Analytics</h3>
              <p className="text-muted-foreground">
                Laporan dan statistik lengkap untuk evaluasi dan pengambilan keputusan
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
