import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Clock, Search } from "lucide-react";
import StudentSearchDialog from "./StudentSearchDialog";

interface QuickInputFormProps {
  userId: string;
}

const QuickInputForm = ({ userId }: QuickInputFormProps) => {
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [reason, setReason] = useState<string>("bangun_kesiangan");
  const [reasonDetail, setReasonDetail] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      toast.error("Pilih siswa terlebih dahulu");
      return;
    }

    setLoading(true);

    try {
      const now = new Date();
      const { error } = await supabase.from("tardiness_records").insert([{
        student_id: selectedStudent.id,
        recorded_by: userId,
        tardiness_date: now.toISOString().split('T')[0],
        tardiness_time: now.toTimeString().split(' ')[0],
        reason: reason as any,
        reason_detail: reasonDetail || null,
        action_taken: actionTaken || null,
      }] as any);

      if (error) throw error;

      toast.success("Keterlambatan berhasil dicatat!");
      
      // Reset form
      setSelectedStudent(null);
      setReason("bangun_kesiangan");
      setReasonDetail("");
      setActionTaken("");
    } catch (error: any) {
      toast.error(error.message || "Gagal mencatat keterlambatan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Input Keterlambatan Cepat
          </CardTitle>
          <CardDescription>
            Catat siswa yang terlambat dengan cepat dan mudah
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Siswa</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-4 w-4 mr-2" />
                {selectedStudent ? (
                  <span>
                    {selectedStudent.full_name} - {selectedStudent.nis}
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Cari siswa berdasarkan nama atau NIS
                  </span>
                )}
              </Button>
              {selectedStudent && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p className="font-medium">{selectedStudent.full_name}</p>
                  <p className="text-muted-foreground">NIS: {selectedStudent.nis}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Alasan Keterlambatan</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bangun_kesiangan">Bangun Kesiangan</SelectItem>
                  <SelectItem value="kendaraan_bermasalah">Kendaraan Bermasalah</SelectItem>
                  <SelectItem value="macet">Macet</SelectItem>
                  <SelectItem value="sakit">Sakit</SelectItem>
                  <SelectItem value="keperluan_keluarga">Keperluan Keluarga</SelectItem>
                  <SelectItem value="lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reasonDetail">Keterangan Tambahan (Opsional)</Label>
              <Textarea
                id="reasonDetail"
                value={reasonDetail}
                onChange={(e) => setReasonDetail(e.target.value)}
                placeholder="Jelaskan detail alasan jika diperlukan..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actionTaken">Tindakan/Sanksi (Opsional)</Label>
              <Input
                id="actionTaken"
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                placeholder="Contoh: Peringatan lisan, tugas tambahan"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading || !selectedStudent}>
              {loading ? "Menyimpan..." : "Simpan & Kirim Notifikasi"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <StudentSearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelectStudent={(student) => {
          setSelectedStudent(student);
          setSearchOpen(false);
        }}
      />
    </>
  );
};

export default QuickInputForm;
