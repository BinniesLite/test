"use client"

import Header from '@/components/header';
import Loading from '@/components/loading';
import TeacherCourseCard from '@/components/teacher-course';
import Toolbar from '@/components/toolbar';
import { Button } from '@/components/ui/button';
import { useCreateCourseMutation, useDeleteMutation, useGetCoursesQuery } from '@/state/api';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import React, { useState, useMemo } from 'react'

const CoursesPage = () => {
  const router = useRouter();
  const { user } = useUser();

  const { data: courses, isLoading, isError } = useGetCoursesQuery({ category: "all" })

  const [createCourse] = useCreateCourseMutation();
  const [deleteCourse] = useDeleteMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredCourses = useMemo(() => {
    if (!courses) return [];

    return courses.filter((course) => {
      const matchesSearch = course.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || course.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [courses, searchTerm, selectedCategory]);

  const handleEdit = (course: Course) => {
    router.push(`/teacher/courses/${course.courseId}`, {
      scroll: false,
    });
  };

  const handleDelete = async (course: Course) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      await deleteCourse({ courseId: course.courseId }).unwrap();
    }
  };

  const handleCreateCourse = async () => {
    if (!user) return;

    const result = await createCourse({
      teacherId: user.id,
      teacherName: user.fullName || "Unknown Teacher",
    }).unwrap();
    
    console.log(result);

    router.push(`/teacher/courses/${result.courseId}`, {
      scroll: false,
    });
  };

  if (isLoading) return <Loading />;
  if (isError || !courses) return <div>Error loading courses.</div>;

  return (
    <div className='teacher-courses'>
      <Header
        title="Courses"
        subtitle="Browse your course"
        rightElement={
          <Button className="teacher-courses__header" onClick={handleCreateCourse}>
            Create Course
          </Button>}
      />

      <Toolbar
        onSearch={setSearchTerm}
        onCategoryChange={setSelectedCategory}
      />

      <div className='teacher-courses__grid'>
        {filteredCourses.map((course) => (
          <TeacherCourseCard
            key={course.courseId}
            course={course}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isOwner={course.teacherId === user?.id}
          />
        ))}
      </div>

    </div>
  )
}

export default CoursesPage