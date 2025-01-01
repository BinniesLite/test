"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userCourseProgressController_1 = require("../controllers/userCourseProgressController");
const router = express_1.default.Router();
// fe: `/users/course-progress/${userId}/enrolled-courses`,
// be: /users/course-progress/:userId/enrolled-courses
// actual: /users/course-progress/user_2qBCcQBZ6YLUF6NIwou1QPPlBYZ/enrolled-courses
router.get("/:userId/enrolled-courses", userCourseProgressController_1.getUserEnrolledCourse);
router.get("/:userId/courses/:courseId", userCourseProgressController_1.getUserCourseProgress);
router.get("/:userId/courses/:courseId", userCourseProgressController_1.updateUserCourseProgress);
exports.default = router;
