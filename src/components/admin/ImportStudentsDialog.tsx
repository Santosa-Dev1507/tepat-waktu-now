import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface ImportError {
  row: number;
  field: string;
  message: string;
}

const ImportStudentsDialog = ({ onSuccess }: { onSuccess: () => void }) => {
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [successCount, setSuccessCount] = useState(0);

  const downloadTemplate = () => {
    const template = [
      {
        NIS: "12345",
        "Nama Lengkap": "Contoh Siswa",
        "Nama Kelas": "VII-A",
        "Nama Orang Tua": "Nama Orang Tua",
        "No HP Orang Tua": "08123456789",
        "WhatsApp Orang Tua": "08123456789",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Siswa");

    // Set column widths
    ws["!cols"] = [
      { wch: 15 },
      { wch: 30 },
      { wch: 15 },
      { wch: 30 },
      { wch: 20 },
      { wch: 20 },
    ];

    XLSX.writeFile(wb, "template-import-siswa.xlsx");
    toast.success("Template berhasil didownload");
  };

  const validateRow = (row: any, rowIndex: number): ImportError[] => {
    const errors: ImportError[] = [];

    if (!row["NIS"] || String(row["NIS"]).trim() === "") {
      errors.push({
        row: rowIndex,
        field: "NIS",
        message: "NIS tidak boleh kosong",
      });
    }

    if (!row["Nama Lengkap"] || String(row["Nama Lengkap"]).trim() === "") {
      errors.push({
        row: rowIndex,
        field: "Nama Lengkap",
        message: "Nama lengkap tidak boleh kosong",
      });
    }

    if (!row["Nama Kelas"] || String(row["Nama Kelas"]).trim() === "") {
      errors.push({
        row: rowIndex,
        field: "Nama Kelas",
        message: "Nama kelas tidak boleh kosong",
      });
    }

    // Validasi format nomor HP (opsional tapi harus valid jika diisi)
    if (row["No HP Orang Tua"]) {
      const phone = String(row["No HP Orang Tua"]).trim();
      if (!/^[\d\s\-\+\(\)]+$/.test(phone)) {
        errors.push({
          row: rowIndex,
          field: "No HP Orang Tua",
          message: "Format nomor HP tidak valid",
        });
      }
    }

    if (row["WhatsApp Orang Tua"]) {
      const wa = String(row["WhatsApp Orang Tua"]).trim();
      if (!/^[\d\s\-\+\(\)]+$/.test(wa)) {
        errors.push({
          row: rowIndex,
          field: "WhatsApp Orang Tua",
          message: "Format nomor WhatsApp tidak valid",
        });
      }
    }

    return errors;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset state
    setErrors([]);
    setSuccessCount(0);
    setProgress(0);
    setImporting(true);

    try {
      // Read file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast.error("File Excel kosong");
        setImporting(false);
        return;
      }

      // Validate all rows first
      const allErrors: ImportError[] = [];
      jsonData.forEach((row: any, index) => {
        const rowErrors = validateRow(row, index + 2); // +2 because row 1 is header
        allErrors.push(...rowErrors);
      });

      if (allErrors.length > 0) {
        setErrors(allErrors);
        toast.error(`Ditemukan ${allErrors.length} error dalam data`);
        setImporting(false);
        return;
      }

      // Get all classes
      const { data: classes, error: classError } = await supabase
        .from("classes")
        .select("id, name");

      if (classError) throw classError;

      const classMap = new Map(classes?.map((c) => [c.name.toUpperCase(), c.id]));

      // Prepare data for insert
      const studentsToInsert = [];
      const importErrors: ImportError[] = [];
      
      for (let i = 0; i < jsonData.length; i++) {
        const row: any = jsonData[i];
        const rowNum = i + 2;

        // Find class
        const className = String(row["Nama Kelas"]).trim().toUpperCase();
        const classId = classMap.get(className);

        if (!classId) {
          importErrors.push({
            row: rowNum,
            field: "Nama Kelas",
            message: `Kelas "${row["Nama Kelas"]}" tidak ditemukan`,
          });
          continue;
        }

        // Check if NIS already exists
        const { data: existingStudent } = await supabase
          .from("students")
          .select("id")
          .eq("nis", String(row["NIS"]).trim())
          .maybeSingle();

        if (existingStudent) {
          importErrors.push({
            row: rowNum,
            field: "NIS",
            message: `NIS ${row["NIS"]} sudah terdaftar`,
          });
          continue;
        }

        studentsToInsert.push({
          nis: String(row["NIS"]).trim(),
          full_name: String(row["Nama Lengkap"]).trim(),
          class_id: classId,
          parent_name: row["Nama Orang Tua"] ? String(row["Nama Orang Tua"]).trim() : null,
          parent_phone: row["No HP Orang Tua"] ? String(row["No HP Orang Tua"]).trim() : null,
          parent_whatsapp: row["WhatsApp Orang Tua"] ? String(row["WhatsApp Orang Tua"]).trim() : null,
        });

        setProgress(((i + 1) / jsonData.length) * 50);
      }

      if (importErrors.length > 0) {
        setErrors(importErrors);
        toast.error(`Ditemukan ${importErrors.length} error dalam data`);
        setImporting(false);
        return;
      }

      if (studentsToInsert.length === 0) {
        toast.error("Tidak ada data yang dapat diimpor");
        setImporting(false);
        return;
      }

      // Insert students in batches
      const batchSize = 50;
      let inserted = 0;

      for (let i = 0; i < studentsToInsert.length; i += batchSize) {
        const batch = studentsToInsert.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from("students")
          .insert(batch);

        if (insertError) throw insertError;
        
        inserted += batch.length;
        setProgress(50 + ((inserted / studentsToInsert.length) * 50));
      }

      setSuccessCount(inserted);
      toast.success(`Berhasil mengimpor ${inserted} siswa`);
      onSuccess();
      
      // Reset and close after success
      setTimeout(() => {
        setOpen(false);
        setErrors([]);
        setSuccessCount(0);
        setProgress(0);
      }, 2000);

    } catch (error: any) {
      console.error("Import error:", error);
      toast.error("Gagal mengimpor data: " + error.message);
    } finally {
      setImporting(false);
    }

    // Reset file input
    event.target.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Import Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Data Siswa dari Excel</DialogTitle>
          <DialogDescription>
            Upload file Excel dengan format yang sesuai untuk mengimpor data siswa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Download Template */}
          <Alert>
            <Download className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>Download template Excel untuk format yang benar</span>
                <Button
                  variant="link"
                  size="sm"
                  onClick={downloadTemplate}
                  className="h-auto p-0"
                >
                  Download Template
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          {/* Format Instructions */}
          <div className="border rounded-lg p-4 space-y-2">
            <h4 className="font-medium">Format Excel:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• <strong>NIS</strong>: Nomor Induk Siswa (wajib, harus unik)</li>
              <li>• <strong>Nama Lengkap</strong>: Nama lengkap siswa (wajib)</li>
              <li>• <strong>Nama Kelas</strong>: Contoh: VII-A, VIII-B, IX-C (wajib, kelas harus sudah ada)</li>
              <li>• <strong>Nama Orang Tua</strong>: Nama orang tua/wali (opsional)</li>
              <li>• <strong>No HP Orang Tua</strong>: Nomor telepon (opsional)</li>
              <li>• <strong>WhatsApp Orang Tua</strong>: Nomor WhatsApp (opsional)</li>
            </ul>
          </div>

          {/* Upload Section */}
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              type="file"
              id="excel-file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={importing}
              className="hidden"
            />
            <label
              htmlFor="excel-file"
              className={`cursor-pointer ${importing ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">
                {importing ? "Mengimpor data..." : "Klik untuk upload file Excel"}
              </p>
              <p className="text-xs text-muted-foreground">
                Format: .xlsx atau .xls (maksimal 20MB)
              </p>
            </label>
          </div>

          {/* Progress */}
          {importing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">
                {progress < 50 ? "Memvalidasi data..." : "Menyimpan ke database..."}
              </p>
            </div>
          )}

          {/* Success Message */}
          {successCount > 0 && !importing && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                Berhasil mengimpor {successCount} siswa
              </AlertDescription>
            </Alert>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Ditemukan {errors.length} error:</p>
                  <div className="max-h-40 overflow-y-auto space-y-1 text-sm">
                    {errors.slice(0, 10).map((error, index) => (
                      <div key={index}>
                        Baris {error.row}, {error.field}: {error.message}
                      </div>
                    ))}
                    {errors.length > 10 && (
                      <div className="text-xs italic">
                        ... dan {errors.length - 10} error lainnya
                      </div>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportStudentsDialog;
