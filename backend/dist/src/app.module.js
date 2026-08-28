"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const classes_module_1 = require("./modules/classes/classes.module");
const class_enrollments_module_1 = require("./modules/class-enrollments/class-enrollments.module");
const attendance_module_1 = require("./modules/attendance/attendance.module");
const announcements_module_1 = require("./modules/announcements/announcements.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const lessons_module_1 = require("./modules/lessons/lessons.module");
const assignments_module_1 = require("./modules/assignments/assignments.module");
const gamification_module_1 = require("./modules/gamification/gamification.module");
const games_module_1 = require("./modules/games/games.module");
const schedules_module_1 = require("./modules/schedules/schedules.module");
const prisma_module_1 = require("./prisma/prisma.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            classes_module_1.ClassesModule,
            class_enrollments_module_1.ClassEnrollmentsModule,
            attendance_module_1.AttendanceModule,
            announcements_module_1.AnnouncementsModule,
            notifications_module_1.NotificationsModule,
            lessons_module_1.LessonsModule,
            assignments_module_1.AssignmentsModule,
            gamification_module_1.GamificationModule,
            games_module_1.GamesModule,
            schedules_module_1.SchedulesModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map