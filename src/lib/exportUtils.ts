import { format } from "date-fns";

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(",")
    )
  ].join("\n");

  // Create blob and download
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const formatDataForExport = (records: any[]) => {
  return records.map(record => ({
    Tanggal: format(new Date(record.tardiness_date), "dd/MM/yyyy"),
    Waktu: record.tardiness_time,
    NIS: record.students?.nis || "-",
    "Nama Siswa": record.students?.full_name || "-",
    Kelas: record.students?.classes?.name || "-",
    Alasan: record.reason,
    Keterangan: record.reason_detail || "-",
    Tindakan: record.action_taken || "-",
    "Dicatat Oleh": record.profiles?.full_name || "-",
  }));
};

export const generateExportFilename = (filters: any) => {
  const startDate = format(filters.startDate, "yyyyMMdd");
  const endDate = format(filters.endDate, "yyyyMMdd");
  return `laporan-keterlambatan-${startDate}-${endDate}.csv`;
};
