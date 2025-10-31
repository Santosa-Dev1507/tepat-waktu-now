import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay, subDays } from "date-fns";

export interface AnalyticsFilters {
  startDate: Date;
  endDate: Date;
  classIds?: string[];
  reasons?: string[];
}

export const useAnalyticsData = (filters: AnalyticsFilters) => {
  // Statistics Query
  const { data: statistics, isLoading: statsLoading } = useQuery({
    queryKey: ["analytics-statistics", filters],
    queryFn: async () => {
      const { startDate, endDate, classIds, reasons } = filters;
      
      // Build base query
      let query = supabase
        .from("tardiness_records")
        .select("*, students!inner(*, classes!inner(*))");
      
      // Apply filters
      query = query
        .gte("tardiness_date", startOfDay(startDate).toISOString())
        .lte("tardiness_date", endOfDay(endDate).toISOString());
      
      if (classIds && classIds.length > 0) {
        query = query.in("students.class_id", classIds);
      }
      
      if (reasons && reasons.length > 0) {
        query = query.in("reason", reasons as any);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Calculate statistics
      const totalCount = data?.length || 0;
      
      // Top student
      const studentCounts = data?.reduce((acc: any, record: any) => {
        const studentId = record.students.id;
        const studentName = record.students.full_name;
        if (!acc[studentId]) {
          acc[studentId] = { name: studentName, count: 0 };
        }
        acc[studentId].count++;
        return acc;
      }, {});
      
      const topStudent = Object.values(studentCounts || {})
        .sort((a: any, b: any) => b.count - a.count)[0] as any;
      
      // Top class
      const classCounts = data?.reduce((acc: any, record: any) => {
        const className = record.students.classes.name;
        if (!acc[className]) {
          acc[className] = 0;
        }
        acc[className]++;
        return acc;
      }, {});
      
      const topClass = Object.entries(classCounts || {})
        .sort((a: any, b: any) => b[1] - a[1])[0];
      
      // Top reason
      const reasonCounts = data?.reduce((acc: any, record: any) => {
        const reason = record.reason;
        if (!acc[reason]) {
          acc[reason] = 0;
        }
        acc[reason]++;
        return acc;
      }, {});
      
      const topReason = Object.entries(reasonCounts || {})
        .sort((a: any, b: any) => b[1] - a[1])[0];
      
      return {
        totalCount,
        topStudent: topStudent ? { name: topStudent.name, count: topStudent.count } : null,
        topClass: topClass ? { name: topClass[0] as string, count: topClass[1] as number } : null,
        topReason: topReason ? { reason: topReason[0] as string, count: topReason[1] as number } : null,
      };
    },
  });

  // Trend Data Query
  const { data: trendData, isLoading: trendLoading } = useQuery({
    queryKey: ["analytics-trend", filters],
    queryFn: async () => {
      const { startDate, endDate, classIds, reasons } = filters;
      
      let query = supabase
        .from("tardiness_records")
        .select("tardiness_date, students!inner(class_id)");
      
      query = query
        .gte("tardiness_date", startOfDay(startDate).toISOString())
        .lte("tardiness_date", endOfDay(endDate).toISOString());
      
      if (classIds && classIds.length > 0) {
        query = query.in("students.class_id", classIds);
      }
      
      if (reasons && reasons.length > 0) {
        query = query.in("reason", reasons as any);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Group by date
      const dateGroups = data?.reduce((acc: any, record: any) => {
        const date = record.tardiness_date;
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date]++;
        return acc;
      }, {});
      
      return Object.entries(dateGroups || {})
        .map(([date, count]) => ({ date, count: count as number }))
        .sort((a, b) => a.date.localeCompare(b.date));
    },
  });

  // Class Distribution Query
  const { data: classDistribution, isLoading: classLoading } = useQuery({
    queryKey: ["analytics-class", filters],
    queryFn: async () => {
      const { startDate, endDate, classIds, reasons } = filters;
      
      let query = supabase
        .from("tardiness_records")
        .select("*, students!inner(*, classes!inner(*))");
      
      query = query
        .gte("tardiness_date", startOfDay(startDate).toISOString())
        .lte("tardiness_date", endOfDay(endDate).toISOString());
      
      if (classIds && classIds.length > 0) {
        query = query.in("students.class_id", classIds);
      }
      
      if (reasons && reasons.length > 0) {
        query = query.in("reason", reasons as any);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Group by class
      const classGroups = data?.reduce((acc: any, record: any) => {
        const className = record.students.classes.name;
        if (!acc[className]) {
          acc[className] = 0;
        }
        acc[className]++;
        return acc;
      }, {});
      
      return Object.entries(classGroups || {})
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a: any, b: any) => b.count - a.count);
    },
  });

  // Reason Distribution Query
  const { data: reasonDistribution, isLoading: reasonLoading } = useQuery({
    queryKey: ["analytics-reason", filters],
    queryFn: async () => {
      const { startDate, endDate, classIds, reasons } = filters;
      
      let query = supabase
        .from("tardiness_records")
        .select("reason, students!inner(class_id)");
      
      query = query
        .gte("tardiness_date", startOfDay(startDate).toISOString())
        .lte("tardiness_date", endOfDay(endDate).toISOString());
      
      if (classIds && classIds.length > 0) {
        query = query.in("students.class_id", classIds);
      }
      
      if (reasons && reasons.length > 0) {
        query = query.in("reason", reasons as any);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Group by reason
      const reasonGroups = data?.reduce((acc: any, record: any) => {
        const reason = record.reason;
        if (!acc[reason]) {
          acc[reason] = 0;
        }
        acc[reason]++;
        return acc;
      }, {});
      
      return Object.entries(reasonGroups || {})
        .map(([name, value]) => ({ name, value: value as number }))
        .sort((a: any, b: any) => b.value - a.value);
    },
  });

  // Top Students Query
  const { data: topStudents, isLoading: studentsLoading } = useQuery({
    queryKey: ["analytics-students", filters],
    queryFn: async () => {
      const { startDate, endDate, classIds, reasons } = filters;
      
      let query = supabase
        .from("tardiness_records")
        .select("*, students!inner(*, classes!inner(*))");
      
      query = query
        .gte("tardiness_date", startOfDay(startDate).toISOString())
        .lte("tardiness_date", endOfDay(endDate).toISOString());
      
      if (classIds && classIds.length > 0) {
        query = query.in("students.class_id", classIds);
      }
      
      if (reasons && reasons.length > 0) {
        query = query.in("reason", reasons as any);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Group by student
      const studentGroups = data?.reduce((acc: any, record: any) => {
        const studentId = record.students.id;
        if (!acc[studentId]) {
          acc[studentId] = {
            name: record.students.full_name,
            nis: record.students.nis,
            class: record.students.classes.name,
            count: 0,
            reasons: [],
          };
        }
        acc[studentId].count++;
        acc[studentId].reasons.push(record.reason);
        return acc;
      }, {});
      
      return Object.values(studentGroups || {})
        .map((student: any) => {
          // Find most common reason
          const reasonCounts = student.reasons.reduce((acc: any, r: string) => {
            acc[r] = (acc[r] || 0) + 1;
            return acc;
          }, {});
          const commonReason = Object.entries(reasonCounts)
            .sort((a: any, b: any) => b[1] - a[1])[0]?.[0];
          
          return {
            name: student.name,
            nis: student.nis,
            class: student.class,
            count: student.count,
            commonReason,
          };
        })
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 10);
    },
  });

  return {
    statistics,
    trendData,
    classDistribution,
    reasonDistribution,
    topStudents,
    isLoading: statsLoading || trendLoading || classLoading || reasonLoading || studentsLoading,
  };
};
