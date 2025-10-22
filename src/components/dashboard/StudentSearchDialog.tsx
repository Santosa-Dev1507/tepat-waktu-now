import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { toast } from "sonner";

interface StudentSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectStudent: (student: any) => void;
}

const StudentSearchDialog = ({ open, onOpenChange, onSelectStudent }: StudentSearchDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && searchQuery.length >= 2) {
      searchStudents();
    } else {
      setStudents([]);
    }
  }, [searchQuery, open]);

  const searchStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*, classes(name)")
        .or(`full_name.ilike.%${searchQuery}%,nis.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      setStudents(data || []);
    } catch (error: any) {
      toast.error("Gagal mencari siswa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cari Siswa</DialogTitle>
          <DialogDescription>
            Masukkan nama atau NIS siswa untuk mencari
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Ketik nama atau NIS siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {loading ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Mencari...</p>
            </div>
          ) : students.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {students.map((student) => (
                <Button
                  key={student.id}
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={() => onSelectStudent(student)}
                >
                  <div className="text-left">
                    <p className="font-medium">{student.full_name}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      <span>NIS: {student.nis}</span>
                      <span>Kelas: {student.classes?.name || "-"}</span>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          ) : searchQuery.length >= 2 ? (
            <div className="py-8 text-center text-muted-foreground">
              Tidak ada siswa ditemukan
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Ketik minimal 2 karakter untuk mencari
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentSearchDialog;
