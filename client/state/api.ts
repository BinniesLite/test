import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BaseQueryApi, FetchArgs } from "@reduxjs/toolkit/query";
import { User } from "@clerk/nextjs/server"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Clerk } from "@clerk/clerk-js";
import { toast } from "sonner";

const customBaseQuery = async (
  args: string | FetchArgs,
  api: BaseQueryApi,
  extraOptions: any
) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers) => { 
      const token = await window.Clerk?.session?.getToken();
      
      if (token) {
        headers.set("Authorization", `Bearer ${token}`)
      }
      // console.log(token);
      return headers;
    }
  });

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await baseQuery(args, api, extraOptions) as any;

    if (result.error) {
      const errorData = result.error.data as ErrorData;
      const errorMessage = errorData?.message || result.error.status.toString() || "An error occured";
      
      toast.error(`Error: ${errorMessage}`);

    }

    const isMutationRequest = (args as FetchArgs).method && (args as FetchArgs).method !== "GET";

    if (isMutationRequest) {
      const successMessage = result?.data?.message;
      if (successMessage) toast.success(successMessage);
    }

    if (result.data) {
      result.data = result?.data?.data;
    }
    

    return result;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown";
    return { error: { status: "FETCH_ERROR", error: errorMessage } };
  }
};

export const api = createApi({
  baseQuery: customBaseQuery,
  reducerPath: "api",
  tagTypes: ["Courses", "Users", "UserCourseProgress"],
  endpoints: (build) => ({
    /********** 
    COURSES
    ***********/
    getCourses: build.query<Course[], { category?: string }>({
      query: ({ category }) => ({
        url: "courses",
        params: { category },
      }),
      providesTags: ["Courses"],
    }),

    getCourse: build.query<Course, string>({
      query: (id) => `courses/${id}`,
      providesTags: (result, error, id) => [{ type: "Courses", id }],
    }),

    createCourse: build.mutation<Course, { teacherId: string, teacherName: string}>({
      query: (body) => ({
        url: "courses",
        method: "POST",
        body 
      }),
      invalidatesTags: ["Courses"]
    }),

    updateCourse: build.mutation<Course, { courseId: string, formData: FormData}>({
      query: ({ courseId, formData}) => ({
        url: `courses/${courseId}`,
        method: "PUT",
        body: formData 
      }),
      invalidatesTags: ["Courses"]
    }),

    delete: build.mutation<{ message: string}, { courseId: string}>({
      query: ({ courseId }) => ({
        url: `courses/${courseId}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Courses"]
    }),

    getUploadVideoUrl: build.mutation<
    {uploadUrl: string, videoUrl: string},
    {
      courseId: string,
      chapterId: string,
      sectionId: string,
      fileName: string,
      fileType: string
    }
    >({
      query: ({ courseId, chapterId, sectionId,fileName, fileType}) => ({
        url: `courses/${courseId}/sections/${sectionId}/chapters/${chapterId}/get-upload-url`,
        method: "POST",
        body: { fileName, fileType}
      })
    }),


    /********** 
    USER
    ***********/
    updateUser: build.mutation<User, Partial<User> & { userId: string}>({
      query: ({ userId, ...updatedUser}) => ({
        url: `/users/clerk/${userId}`,
        method: "PUT",
        body: updatedUser
      }),
      invalidatesTags: ["Users"]
    }),

    /********** 
    USER COURSE PROGRESS
    ***********/
    getUserCourseProgress: build.query<UserCourseProgress, { userId: string, courseId: string}>({
      query: ({ userId, courseId }) => ({
        url: `/users/course-progress/${userId}/courses/${courseId}`,
      }),
      providesTags: ["UserCourseProgress"]
    }),

    getUserEnrolledCourse: build.query<Course[], string>({
      query: (userId) => ({
        url: `/users/course-progress/${userId}/enrolled-courses`,
      }),
      providesTags: ["UserCourseProgress", "Courses"]
    }),

    updateUserCourseProgress: build.mutation<
      UserCourseProgress,
      {
        userId: string,
        courseId: string,
        progressData: {
          sections: SectionProgress[];
        };
      }
    >({
      query: ({ userId, courseId, progressData}) => ({
        url: `users/course-progress/${userId}/courses/${courseId}`,
        method: "PUT",
        body: progressData,
      })
    }),

    
    
    
    /********** 
    TRANSACTIONS 
    ***********/
    getTransactions: build.query<Transaction[], string>({
      query: (userId) => `transactions?userId=${userId}`
    }),

    createStripePaymentIntent: build.mutation<{ clientSecret: string }, {amount : number }>({
      query: ({ amount }) => ({
        url: `/transactions/stripe/payment-intent`,
        method: "POST",
        body: { amount }
      }),
    }),

    createTransaction: build.mutation<Transaction, Partial<Transaction>>({
      query: (transaction) => ({
        url: "/transactions",
        method: "POST",
        body: transaction
      })
    })
  }),
});

export const { 
  // course
  useGetCoursesQuery, 
  useGetCourseQuery, 
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteMutation,
  useGetUploadVideoUrlMutation,
  // user
  useUpdateUserMutation, 
  // transaction
  useGetTransactionsQuery,
  useCreateStripePaymentIntentMutation,
  useCreateTransactionMutation,
  // user progress 
  useGetUserEnrolledCourseQuery,
  useGetUserCourseProgressQuery,
  useUpdateUserCourseProgressMutation

} = api;
