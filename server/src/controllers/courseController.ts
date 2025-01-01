import { Response, Request } from "express";
import Course from "../models/courseModel";
import { v4 as uuidv4 } from "uuid";
import { getAuth } from "@clerk/express";

import { S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";



const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY || '',
    secretAccessKey: process.env.AWS_SECRET_KEY || '',
  },
});

export const getUploadVideoUrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { fileName, fileType } = req.body;

  if (!fileName || !fileType) {
    res.status(400).json({ message: "File name and type are required" });
    return;
  }

  try {
    const id = uuidv4();
    const s3Key = `videos/${id}/${fileName}`;

    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET || "",
      Key: s3Key,
      ContentType: fileType,
    });

    // Generate presigned URL using v3 SDK
    const uploadUrl = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 3600 // URL expires in 1 hour
    });
    
    const videoUrl = `${process.env.CLOUDFRONT_DOMAIN}/videos/${id}/${fileName}`;

    res.json({
      message: "Upload URL generated successfully",
      data: { uploadUrl, videoUrl },
    });
  } catch (error) {
    console.error("Failed to generate upload URL:", error);
    res.status(500).json({ 
      message: "Failed to generate upload URL",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};


export const listCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { category } = req.query;

  try {
    const courses =
      category && category !== "all"
        ? await Course.scan("category").eq(category).exec()
        : await Course.scan().exec();

    // console.log(courses);
    res.json({ message: "Courses retrieved successfully", data: courses });
  } catch (error) {
    res.status(500).json({ message: "error retrieving courses", error: error });
    console.log("Video error: ", error);
  }
};

export const getCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { courseId } = req.params;

  try {
    const course = await Course.get(courseId);

    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    res.json({ message: "Courses retrieved successfully", data: course });
  } catch (error) {
    res.status(500).json({ message: "error retrieving courses", error: error });
  }
};

export const createCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { teacherId, teacherName } = req.body;
    console.log("Hello world, I'm here");
    if (!teacherId || !teacherName) {
      res.status(400).json({ message: "Error no teacher id or teacher name" });

      return;
    }

    const newCourse = new Course({
      courseId: uuidv4(),
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

    await newCourse.save();

    res.json({ message: "Courses created successfully", data: newCourse });
  } catch (error) {
    res.status(500).json({ message: "error retrieving courses", error: error });
    console.log(error);
  }
};

export const updateCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { courseId } = req.params;
  const updateData = { ...req.body };

  const { userId } = getAuth(req);

  try {
    const course = await Course.get(courseId);

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
      const sectionsData =
        typeof updateData.sections === "string"
          ? JSON.parse(updateData.sections)
          : updateData.sections;
      updateData.sections = sectionsData.map((section: any) => ({
        ...section,
        sectionId: section.sectionId || uuidv4(),
        chapters: section.chapters.map((chapter: any) => ({
          ...chapter,
          chapterId: chapter.chapterId || uuidv4(),
        })),
      }));
    }

    Object.assign(course, updateData);

    await course.save();

    res.json({ message: "Courses updated successfully", data: course });
  } catch (error) {
    res.status(500).json({ message: "error updating courses", error: error });
    console.log(error);
  }
};

export const deleteCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { courseId } = req.params;

  const { userId } = getAuth(req);

  try {
    const course = await Course.get(courseId);

    if (!course) {
      res.status(404).json({ message: "Course not found " });
      return;
    }

    if (course.teacherId !== userId) {
      res.status(404).json({ message: "Not authorized to update this course" });
      return;
    }

    await course.delete(course.courseId);

    res.json({ message: "Courses deleted successfully", data: course });
  } catch (error) {
    res.status(500).json({ message: "error updating courses", error: error });
  }
};
