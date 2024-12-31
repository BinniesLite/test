import express from 'express';
import { getUserCourseProgress, getUserEnrolledCourse, updateUserCourseProgress } from '../controllers/userCourseProgressController';

const router = express.Router();
// fe: `/users/course-progress/${userId}/enrolled-courses`,
// be: /users/course-progress/:userId/enrolled-courses
// actual: /users/course-progress/user_2qBCcQBZ6YLUF6NIwou1QPPlBYZ/enrolled-courses
router.get("/:userId/enrolled-courses", getUserEnrolledCourse)
router.get("/:userId/courses/:courseId", getUserCourseProgress)
router.get("/:userId/courses/:courseId", updateUserCourseProgress)

export default router;