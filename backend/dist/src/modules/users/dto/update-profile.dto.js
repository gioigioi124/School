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
exports.UpdateProfileDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class UpdateProfileDto {
    displayName;
    phone;
    school;
    avatarUrl;
}
exports.UpdateProfileDto = UpdateProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Tên hiển thị của người dùng / giáo viên',
        example: 'Cô Nguyễn Mai Lan',
    }),
    (0, class_validator_1.IsString)({ message: 'Tên hiển thị phải là chuỗi ký tự' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(100, { message: 'Tên hiển thị không được vượt quá 100 ký tự' }),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "displayName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Số điện thoại liên hệ',
        example: '0912345678',
    }),
    (0, class_validator_1.IsString)({ message: 'Số điện thoại phải là chuỗi ký tự' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(20, { message: 'Số điện thoại không được vượt quá 20 ký tự' }),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Trường học / Đơn vị giảng dạy',
        example: 'Trường Mầm non Sao Mai',
    }),
    (0, class_validator_1.IsString)({ message: 'Tên trường học phải là chuỗi ký tự' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(200, { message: 'Tên trường học không được vượt quá 200 ký tự' }),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "school", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'URL ảnh đại diện hoặc avatar preset key / emoji',
        example: '👩‍🏫',
    }),
    (0, class_validator_1.IsString)({ message: 'URL ảnh đại diện phải là chuỗi ký tự' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500, { message: 'URL ảnh đại diện không được vượt quá 500 ký tự' }),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "avatarUrl", void 0);
//# sourceMappingURL=update-profile.dto.js.map