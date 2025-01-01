"use client"

import Header from '@/components/header';
import Loading from '@/components/loading';
import CourseCard from '@/components/CourseCard';
import Toolbar from '@/components/toolbar';
import { useGetUserEnrolledCourseQuery } from '@/state/api';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import React, { useState, useMemo } from 'react'

const CoursesPage = () => {
  const router = useRouter();
  const { user } = useUser();

  const { data: courses, isLoading, isError } = useGetUserEnrolledCourseQuery(user?.id as string);
  
  console.log(courses);

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

  
  const handleGoToCourse = (course: Course) => {
    if (
      course.sections &&
      course.sections.length > 0 &&
      course.sections[0].chapters.length > 0
    ) {
      const firstChapter = course.sections[0].chapters[0];
      router.push(
        `/user/courses/${course.courseId}/chapters/${firstChapter.chapterId}`,
        {
          scroll: false
        }
      )
    }
    else {
      router.push(`/user/courses/${course.courseId}`, {
        scroll: false,
      });
    }
  }

  if (isLoading) return <Loading />;
  if (isError || !courses) return <div>Error loading courses.</div>;

  return (
    <div className='teacher-courses'>
      <Header
        title="Courses"
        subtitle="Browse your course"
       
      />

      <Toolbar
        onSearch={setSearchTerm}
        onCategoryChange={setSelectedCategory}
      />

      <div className='teacher-courses__grid'>
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.courseId}
            course={course}
            onGoToCourse={handleGoToCourse}

          />
        ))}
      </div>

    </div>
  )
}

export default CoursesPage