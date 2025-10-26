import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: any;
  onSuccess: () => void;
}

const StudentFormDialog = ({ open, onOpenChange, student, onSuccess }: StudentFormDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    nis: "",
    full_name: "",
    class_id: "",
    parent_name: "",
    parent_phone: "",
    parent_whatsapp: "",
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (student) {
      setFormData({
        nis: student.nis || "",
        full_name: student.full_name || "",
        class_id: student.class_id || "",
        parent_name: student.parent_name || "",
        parent_phone: student.parent_phone || "",
        parent_whatsapp: student.parent_whatsapp || "",
      });
    } else {
      setFormData({
        nis: "",
        full_name: "",
        class_id: "",
        parent_name: "",
        parent_phone: "",
        parent_whatsapp: "",
      });
    }
  }, [student, open]);

  const fetchClasses = async () => {
    const { data } = await supabase.from("classes").select("*").order("grade").order("name");
    setClasses(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (student) {
        const { error } = await supabase
          .from("students")
          .update(formData)
          .eq("id", student.id);

        if (error) throw error;
        toast.success("Siswa berhasil diupdate");
      } else {
        const { error } = await supabase.from("students").insert([formData]);

        if (error) throw error;
        toast.success("Siswa berhasil ditambahkan");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{student ? "Edit Siswa" : "Tambah Siswa"}</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk {student ? "mengupdate" : "menambahkan"} data siswa
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nis">NIS *</Label>
              <Input
                id="nis"
                required
                value={formData.nis}
                onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name">Nama Lengkap *</Label>
              <Input
                id="full_name"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="class_id">Kelas *</Label>
            <Select value={formData.class_id} onValueChange={(value) => setFormData({ ...formData, class_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kelas" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent_name">Nama Orang Tua</Label>
            <Input
              id="parent_name"
              value={formData.parent_name}
              onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="parent_phone">No. HP Orang Tua</Label>
              <Input
                id="parent_phone"
                value={formData.parent_phone}
                onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                placeholder="08123456789"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent_whatsapp">No. WhatsApp Orang Tua</Label>
              <Input
                id="parent_whatsapp"
                value={formData.parent_whatsapp}
                onChange={(e) => setFormData({ ...formData, parent_whatsapp: e.target.value })}
                placeholder="08123456789"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentFormDialog;
