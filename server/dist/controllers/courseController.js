"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCourse = exports.updateCourse = exports.createCourse = exports.getCourses = exports.listCourses = exports.getUploadVideoUrl = void 0;
const courseModel_1 = __importDefault(require("../models/courseModel"));
const uuid_1 = require("uuid");
const express_1 = require("@clerk/express");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const client_s3_2 = require("@aws-sdk/client-s3");
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY || '',
        secretAccessKey: process.env.AWS_SECRET_KEY || '',
    },
});
const getUploadVideoUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fileName, fileType } = req.body;
    if (!fileName || !fileType) {
        res.status(400).json({ message: "File name and type are required" });
        return;
    }
    try {
        const id = (0, uuid_1.v4)();
        const s3Key = `videos/${id}/${fileName}`;
        const putObjectCommand = new client_s3_2.PutObjectCommand({
            Bucket: process.env.S3_BUCKET || "",
            Key: s3Key,
            ContentType: fileType,
        });
        // Generate presigned URL using v3 SDK
        const uploadUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3Client, putObjectCommand, {
            expiresIn: 3600 // URL expires in 1 hour
        });
        const videoUrl = `${process.env.CLOUDFRONT_DOMAIN}/videos/${id}/${fileName}`;
        res.json({
            message: "Upload URL generated successfully",
            data: { uploadUrl, videoUrl },
        });
    }
    catch (error) {
        console.error("Failed to generate upload URL:", error);
        res.status(500).json({
            message: "Failed to generate upload URL",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
exports.getUploadVideoUrl = getUploadVideoUrl;
const listCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { category } = req.query;
    try {
        const courses = category && category !== "all"
            ? yield courseModel_1.default.scan("category").eq(category).exec()
            : yield courseModel_1.default.scan().exec();
        // console.log(courses);
        res.json({ message: "Courses retrieved successfully", data: courses });
    }
    catch (error) {
        res.status(500).json({ message: "error retrieving courses", error: error });
        console.log("Video error: ", error);
    }
});
exports.listCourses = listCourses;
const getCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.params;
    try {
        const course = yield courseModel_1.default.get(courseId);
        if (!course) {
            res.status(404).json({ message: "Course not found" });
            return;
        }
        res.json({ message: "Courses retrieved successfully", data: course });
    }
    catch (error) {
        res.status(500).json({ message: "error retrieving courses", error: error });
    }
});
exports.getCourses = getCourses;
const createCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teacherId, teacherName } = req.body;
        console.log("Hello world, I'm here");
        if (!teacherId || !teacherName) {
            res.status(400).json({ message: "Error no teacher id or teacher name" });
            return;
        }
        const newCourse = new courseModel_1.default({
            courseId: (0, uuid_1.v4)(),
            teacherId,
            teacherName,
            title: "Untitled Course",
            description: "Uncategorized",
            image: "",
            price: 0,
            level: "Beginner",
            status: "Draft",
            sections: [],
            enrollments: [],
            category: "",
        });
        yield newCourse.save();
        res.json({ message: "Courses created successfully", data: newCourse });
    }
    catch (error) {
        res.status(500).json({ message: "error retrieving courses", error: error });
        console.log(error);
    }
});
exports.createCourse = createCourse;
const updateCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.params;
    const updateData = Object.assign({}, req.body);
    const { userId } = (0, express_1.getAuth)(req);
    try {
        const course = yield courseModel_1.default.get(courseId);
        if (!course) {
            res.status(404).json({ message: "Course not found " });
            return;
        }
        if (course.teacherId !== userId) {
            res.status(404).json({ message: "Not authorized to update this course" });
            return;
        }
        if (updateData.price) {
            const price = parseInt(updateData.price);
            if (isNaN(price)) {
                res.status(404).json({ message: "Not correct" });
                return;
            }
            updateData.price = price * 100;
        }
        if (updateData.sections) {
            const sectionsData = typeof updateData.sections === "string"
                ? JSON.parse(updateData.sections)
                : updateData.sections;
            updateData.sections = sectionsData.map((section) => (Object.assign(Object.assign({}, section), { sectionId: section.sectionId || (0, uuid_1.v4)(), chapters: section.chapters.map((chapter) => (Object.assign(Object.assign({}, chapter), { chapterId: chapter.chapterId || (0, uuid_1.v4)() }))) })));
        }
        Object.assign(course, updateData);
        yield course.save();
        res.json({ message: "Courses updated successfully", data: course });
    }
    catch (error) {
        res.status(500).json({ message: "error updating courses", error: error });
        console.log(error);
    }
});
exports.updateCourse = updateCourse;
const deleteCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.params;
    const { userId } = (0, express_1.getAuth)(req);
    try {
        const course = yield courseModel_1.default.get(courseId);
        if (!course) {
            res.status(404).json({ message: "Course not found " });
            return;
        }
        if (course.teacherId !== userId) {
            res.status(404).json({ message: "Not authorized to update this course" });
            return;
        }
        yield course.delete(course.courseId);
        res.json({ message: "Courses deleted successfully", data: course });
    }
    catch (error) {
        res.status(500).json({ message: "error updating courses", error: error });
    }
});
exports.deleteCourse = deleteCourse;
