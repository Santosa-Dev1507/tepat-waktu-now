import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GraduationCap, Users, School } from "lucide-react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StudentsManagement from "@/components/admin/StudentsManagement";
import ClassesManagement from "@/components/admin/ClassesManagement";

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { role, loading: roleLoading } = useUserRole(user?.id);

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

  useEffect(() => {
    if (!loading && !roleLoading && role && role !== 'admin') {
      toast.error("Akses ditolak. Hanya admin yang dapat mengakses halaman ini.");
      navigate("/dashboard");
    }
  }, [role, loading, roleLoading, navigate]);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  if (role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="rounded-lg bg-primary/10 p-2">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">SI-PATAS Admin</h1>
                <p className="text-sm text-muted-foreground">Manajemen Data Master</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Siswa
            </TabsTrigger>
            <TabsTrigger value="classes" className="flex items-center gap-2">
              <School className="h-4 w-4" />
              Kelas
            </TabsTrigger>
          </TabsList>
          <TabsContent value="students" className="mt-6">
            <StudentsManagement />
          </TabsContent>
          <TabsContent value="classes" className="mt-6">
            <ClassesManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
