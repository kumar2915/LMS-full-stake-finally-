import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { Line } from 'rc-progress';
import Footer from '../../components/student/Footer';
import { toast } from 'react-toastify'; // Make sure you have this imported

const MyEnrollments = () => {
  const {
    userData,
    enrolledCourses,
    fetchUserEnrolledCourses,
    navigate,
    backendUrl,
    getToken,
    calculateCourseDuration,
    calculateNoOfLectures
  } = useContext(AppContext);

  const [progressArray, setProgressData] = useState([]);

  const getCourseProgress = async () => {
    try {
      const token = await getToken();

      const tempProgressArray = await Promise.all(
        enrolledCourses.map(async (course) => {
          const { data } = await axios.post(
            `${backendUrl}/api/user/get-course-progress`,
            { courseId: course._id },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const totalLectures = calculateNoOfLectures(course);
          const lectureCompleted = data.progressData?.lectureCompleted?.length || 0;

          return { totalLectures, lectureCompleted };
        })
      );

      setProgressData(tempProgressArray);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (userData) {
      fetchUserEnrolledCourses();
    }
  }, [userData]);

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      getCourseProgress();
    }
  }, [enrolledCourses]);

  return (
    <>
      <div className='md:px-36 px-8 pt-10'>
        <h1 className='text-2xl font-semibold'>My Enrollments</h1>

        <table className="md:table-auto table-fixed w-full overflow-hidden border mt-10">
          <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left max-sm:hidden">
            <tr>
              <th className="px-4 py-3 font-semibold truncate">Course</th>
              <th className="px-4 py-3 font-semibold truncate max-sm:hidden">Duration</th>
              <th className="px-4 py-3 font-semibold truncate max-sm:hidden">Completed</th>
              <th className="px-4 py-3 font-semibold truncate">Status</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {enrolledCourses.map((course, index) => {
              const progress = progressArray[index];
              const percent = progress
                ? (progress.lectureCompleted * 100) / progress.totalLectures
                : 0;

              return (
                <tr key={index} className="border-b border-gray-500/20">
                  <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3">
                    <img src={course.courseThumbnail} alt="" className="w-14 sm:w-24 md:w-28" />
                    <div className='flex-1'>
                      <p className='mb-1 max-sm:text-sm'>{course.courseTitle}</p>
                      <Line
                        className='bg-gray-300 rounded-full'
                        strokeWidth={2}
                        percent={percent}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 max-sm:hidden">{calculateCourseDuration(course)}</td>
                  <td className="px-4 py-3 max-sm:hidden">
                    {progress
                      ? `${progress.lectureCompleted} / ${progress.totalLectures}`
                      : '0 / 0'}
                    <span className='text-xs ml-2'>Lectures</span>
                  </td>
                  <td className="px-4 py-3 max-sm:text-right">
                    <button
                      onClick={() => navigate('/player/' + course._id)}
                      className='px-3 sm:px-5 py-1.5 sm:py-2 bg-blue-600 max-sm:text-xs text-white'
                    >
                      {progress && progress.lectureCompleted / progress.totalLectures === 1
                        ? 'Completed'
                        : 'On Going'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Footer />
    </>
  );
};

export default MyEnrollments;
