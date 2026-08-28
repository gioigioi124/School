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
exports.CreateScheduleDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateScheduleDto {
    classId;
    teacherId;
    dayOfWeek;
    startTime;
    endTime;
    subject;
    room;
    color;
    description;
}
exports.CreateScheduleDto = CreateScheduleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID lớp học', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Class ID không được để trống' }),
    __metadata("design:type", String)
], CreateScheduleDto.prototype, "classId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID giáo viên phụ trách môn học', example: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateScheduleDto.prototype, "teacherId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thứ trong tuần (2 = Thứ Hai, ..., 8 = Chủ Nhật)', example: 2 }),
    (0, class_validator_1.IsInt)({ message: 'Thứ trong tuần phải là số nguyên' }),
    (0, class_validator_1.Min)(2, { message: 'Thứ trong tuần từ 2 (Thứ Hai) đến 8 (Chủ Nhật)' }),
    (0, class_validator_1.Max)(8, { message: 'Thứ trong tuần từ 2 (Thứ Hai) đến 8 (Chủ Nhật)' }),
    __metadata("design:type", Number)
], CreateScheduleDto.prototype, "dayOfWeek", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Giờ bắt đầu (HH:mm)', example: '08:00' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Giờ bắt đầu không được để trống' }),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Giờ bắt đầu phải theo định dạng HH:mm (ví dụ 08:00)' }),
    __metadata("design:type", String)
], CreateScheduleDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Giờ kết thúc (HH:mm)', example: '08:45' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Giờ kết thúc không được để trống' }),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Giờ kết thúc phải theo định dạng HH:mm (ví dụ 08:45)' }),
    __metadata("design:type", String)
], CreateScheduleDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tên môn học hoặc hoạt động', example: 'Toán tư duy & Khám phá' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tên môn học không được để trống' }),
    __metadata("design:type", String)
], CreateScheduleDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Phòng học hoặc vị trí hoạt động', example: 'Phòng Montessori 01' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateScheduleDto.prototype, "room", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Mã màu nhận diện môn học', example: '#4F46E5' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateScheduleDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Ghi chú thêm về nội dung hoặc chuẩn bị', example: 'Chuẩn bị que tính và thẻ hình học' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateScheduleDto.prototype, "description", void 0);
//# sourceMappingURL=create-schedule.dto.js.map