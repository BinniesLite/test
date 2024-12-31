import { Request, Response } from "express";
import { getAuth } from "@clerk/express";

import { calculateOverallProgress, mergeSections } from "../utils/utils";
import UserCourseProgress from "../models/userCourseProgressModel";
import Course from "../models/courseModel";


export const getUserEnrolledCourse = async (
    req: Request,
    res: Response
) => {
    const { userId } = req.params;

    try {
        const enrolledCourses = await UserCourseProgress.
            query("userId").
            eq(userId).
            exec();

        const courseIds = enrolledCourses.map((item: any) => item.courseId);
        const courses = await Course.batchGet(courseIds);
        
        // console.log(courses);
        res.json({
            message: "Enrolled courses retrieved successfully",
            data: courses
        });

        // const courses = await Course.batch  

    } catch (error) {
        res
            .status(500)
            .json({ message: "Error retrieving enrolled courses", error})
    }
}

export const getUserCourseProgress = async (
    req: Request,
    res: Response
) => {
    const { userId, courseId } = req.params;

    try {
        const progress = await UserCourseProgress
            .query({
                userId,
                courseId
            })
            .exec();
        
        // if (!progress || progress.length === 0) {
        //     return res.status(404).json({
        //         message: "Course progress not found"
        //     });
        // }
        res.json({
            message: "Enrolled courses retrieved successfully",
            data: progress
        });

        // const courses = await Course.batch  

    } catch (error) {
        res
            .status(500)
            .json({ message: "Error retrieving course progress", error})
        console.log(error);
    }
}

export const updateUserCourseProgress = async (req: Request, res: Response) => {
    try {
        const { userId, courseId } = req.params;
        const progressData = req.body;

        let progress = await UserCourseProgress.get({ userId, courseId });

        if (!progress) {
            progress = new UserCourseProgress({
                userId,
                courseId,
                enrollmentDate: new Date().toISOString(),
                overallProgress: 0,
                sections: progressData.sections || [],
                lastAccessedTimestamp: new Date().toISOString() 
            })
        }
        else {
            progress.sections = mergeSections(
                progress.sections,
                progressData.sections || []
            )

            progress.lastAccessedTimestamp = new Date().toISOString();
            progress.overallProgress = calculateOverallProgress(progress.sections);
        }

        await progress.save();

        res.json({
            message: "Enrolled courses retrieved successfully",
            data: progress
        });

        // const courses = await Course.batch  

    } catch (error) {
        res
            .status(500)
            .json({ message: "Error updating user course progress", error})
    }
}


