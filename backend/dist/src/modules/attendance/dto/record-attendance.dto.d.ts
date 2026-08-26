export declare class AttendanceItemDto {
    studentId: string;
    status: string;
    note?: string;
}
export declare class RecordAttendanceBatchDto {
    classId: string;
    date: string;
    records: AttendanceItemDto[];
}
