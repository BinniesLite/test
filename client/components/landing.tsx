"use client"
import React from 'react'
import { motion } from "framer-motion"
import Link from 'next/link'
import Image from 'next/image'
import { useCarousel } from '@/hooks/useCarousel'
import { Skeleton } from './ui/skeleton'

import hero1 from "@/images/hero1.jpg"
import hero2 from "@/images/hero2.jpg"
import hero3 from "@/images/hero3.jpg"
import { useGetCoursesQuery } from '@/state/api'

import CourseCardSearch from './course-card-search'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

const LoadingSkeleton = () => {
  return (
    <div className="landing-skeleton">
      <div className="landing-skeleton__hero">
        <div className="landing-skeleton__hero-content">
          <Skeleton className="landing-skeleton__title" />
          <Skeleton className="landing-skeleton__subtitle" />
          <Skeleton className="landing-skeleton__subtitle-secondary" />
          <Skeleton className="landing-skeleton__button" />
        </div>
        <Skeleton className="landing-skeleton__hero-image" />
      </div>

      <div className="landing-skeleton__featured">
        <Skeleton className="landing-skeleton__featured-title" />
        <Skeleton className="landing-skeleton__featured-description" />

        <div className="landing-skeleton__tags">
          {[1, 2, 3, 4, 5].map((_, index) => (
            <Skeleton key={index} className="landing-skeleton__tag" />
          ))}
        </div>

        <div className="landing-skeleton__courses">
          {[1, 2, 3, 4].map((_, index) => (
            <Skeleton key={index} className="landing-skeleton__course-card" />
          ))}
        </div>
      </div>
    </div>
  );
};

const Landing = () => {

  const currentImage = useCarousel({ totalImages: 3 });
  const { data: courses, isLoading, isError } = useGetCoursesQuery({});

  const router = useRouter();
  
  const handleCourseClick = (courseId: string) => {
    router.push(`/search?id=${courseId}`);
  }
  
  // console.log(courses)
  if (isLoading) {
    return <LoadingSkeleton/>
  }

  // if (isError) {
  //   return <div>Error</div>
  // }
  console.log(courses);
  console.log(isError);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className='landing'
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className='landing__hero'
      >
        <div className='landing__hero-content'>
          <h1 className='landing__title'>Courses</h1>
          <p className='landing__description'>
            This is the list of courses you can enroll
          </p>
          <div className='landing__cta'>
            <Link href="/search">
              <div className='landing__cta-button'>Search four courses</div>
            </Link>
          </div>
        </div>

        <div className='landing__hero-images'>
          {[hero1, hero2, hero3].map((src, idx) => (
            <Image
              key={idx}
              src={src}
              alt={`Hero banner`}
              fill
              priority={idx === currentImage}
              sizes="(max-width:768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`landing__hero-image ${idx === currentImage ? 'landing__hero-image--active' : ""}`}
            />
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ amount: 0.3, once: true }}
        className="landing__featured"
      >
        <h2 className='landing__featured-title'>
          Featured Courses
        </h2>
        <p className='landing__featured-description'>
          From beginner to advanced, in all industries, we have the right courses
          just for you and preparing your entire journey for learning
          and making the most.
        </p>
        <div className='landing__tags'>
          {["web development", "enterprise IT", "react nextjs", "ai and machine learning"].map(
            (tag, idx) => (
              <span key={idx} className='landing__tag'>
                {tag}
              </span>
            )
          )}
        </div>

        <div className='landing__courses'>
          {/* COURSES DISPLAY */}
          {courses &&
            courses.slice(0, 4).map((course, index) => (
              <motion.div
                key={course.courseId}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ amount: 0.3 }}
                className='landing__featured'
              >
                  <CourseCardSearch
                    course={course}
                    onClick={() => handleCourseClick(course.courseId)}
                  />
              </motion.div>
            ))
          }

        </div>
      </motion.div>
    </motion.div>
  )
}

export default Landing