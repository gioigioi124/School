"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordAttendanceBatchDto = exports.AttendanceItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class AttendanceItemDto {
    studentId;
    status;
    note;
}
exports.AttendanceItemDto = AttendanceItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID học sinh (Profile ID)', example: 'f87a8b42-1718-4720-94cb-5b65103a8ec4' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AttendanceItemDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Trạng thái điểm danh',
        enum: ['present', 'absent', 'late', 'leave'],
        example: 'present',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['present', 'absent', 'late', 'leave']),
    __metadata("design:type", String)
], AttendanceItemDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Ghi chú', example: 'Nghỉ có phép của phụ huynh' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AttendanceItemDto.prototype, "note", void 0);
class RecordAttendanceBatchDto {
    classId;
    date;
    records;
}
exports.RecordAttendanceBatchDto = RecordAttendanceBatchDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID của lớp học', example: 'd3b07384-d113-40a1-9a74-d4b2e675037d' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RecordAttendanceBatchDto.prototype, "classId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày điểm danh (YYYY-MM-DD)', example: '2026-08-26' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RecordAttendanceBatchDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Danh sách điểm danh các học sinh', type: [AttendanceItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AttendanceItemDto),
    __metadata("design:type", Array)
], RecordAttendanceBatchDto.prototype, "records", void 0);
//# sourceMappingURL=record-attendance.dto.js.map