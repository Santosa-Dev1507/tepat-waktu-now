import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface ClassFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: any;
  onSuccess: () => void;
}

const ClassFormDialog = ({ open, onOpenChange, classData, onSuccess }: ClassFormDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    grade: "10",
  });

  useEffect(() => {
    if (classData) {
      setFormData({
        name: classData.name || "",
        grade: classData.grade?.toString() || "10",
      });
    } else {
      setFormData({
        name: "",
        grade: "10",
      });
    }
  }, [classData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        name: formData.name,
        grade: parseInt(formData.grade),
      };

      if (classData) {
        const { error } = await supabase
          .from("classes")
          .update(submitData)
          .eq("id", classData.id);

        if (error) throw error;
        toast.success("Kelas berhasil diupdate");
      } else {
        const { error } = await supabase.from("classes").insert([submitData]);

        if (error) throw error;
        toast.success("Kelas berhasil ditambahkan");
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{classData ? "Edit Kelas" : "Tambah Kelas"}</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk {classData ? "mengupdate" : "menambahkan"} data kelas
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Kelas *</Label>
            <Input
              id="name"
              required
              placeholder="Contoh: X-A, XI-B, XII-C"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">Tingkat *</Label>
            <Select value={formData.grade} onValueChange={(value) => setFormData({ ...formData, grade: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">Kelas 10</SelectItem>
                <SelectItem value="11">Kelas 11</SelectItem>
                <SelectItem value="12">Kelas 12</SelectItem>
              </SelectContent>
            </Select>
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

export default ClassFormDialog;
