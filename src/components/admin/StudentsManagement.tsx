import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import StudentFormDialog from "./StudentFormDialog";
import ImportStudentsDialog from "./ImportStudentsDialog";

const StudentsManagement = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select(`
          *,
          classes(name, grade)
        `)
        .order("full_name");

      if (error) throw error;
      setStudents(data || []);
    } catch (error: any) {
      toast.error("Gagal memuat data siswa");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus siswa ini?")) return;

    try {
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Siswa berhasil dihapus");
      fetchStudents();
    } catch (error: any) {
      toast.error("Gagal menghapus siswa");
    }
  };

  const handleEdit = (student: any) => {
    setEditingStudent(student);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingStudent(null);
    setDialogOpen(true);
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
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Data Siswa</CardTitle>
              <CardDescription>Kelola data siswa sekolah</CardDescription>
            </div>
            <div className="flex gap-2">
              <ImportStudentsDialog onSuccess={fetchStudents} />
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Siswa
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NIS</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Nama Orang Tua</TableHead>
                  <TableHead>No. HP Orang Tua</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Belum ada data siswa
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.nis}</TableCell>
                      <TableCell>{student.full_name}</TableCell>
                      <TableCell>{student.classes?.name}</TableCell>
                      <TableCell>{student.parent_name || "-"}</TableCell>
                      <TableCell>{student.parent_phone || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(student)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDelete(student.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <StudentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        student={editingStudent}
        onSuccess={fetchStudents}
      />
    </>
  );
};

export default StudentsManagement;
