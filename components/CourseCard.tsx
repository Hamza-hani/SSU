import { Clock, BookOpen, TrendingUp } from 'lucide-react';
import CourseThumbnail from './CourseThumbnail';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  onClick: () => void;
}

export default function CourseCard({ course, onClick }: CourseCardProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"

    >
      {/* top bar */}
      <div className="h-2 bg-black"></div>

      {/* thumbnail */}
      <div className="overflow-hidden">
  <CourseThumbnail
    title={course.title}
    category={course.category}
    level={course.level}
  />
</div>


      <div className="p-6">

        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-black transition-colors">
          {course.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center space-x-1">
            <BookOpen className="h-4 w-4" />
            <span>{course.modules} modules</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">Progress</span>
            <span className="text-black font-semibold">{course.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-black h-2 rounded-full transition-all duration-300"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>

        {course.progress < 100 && (
          <button className="mt-4 w-full bg-black hover:bg-black text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center space-x-2">
            <span>{course.progress === 0 ? 'Start Course' : 'Continue Learning'}</span>
            <TrendingUp className="h-4 w-4" />
          </button>
        )}

        {course.progress === 100 && (
          <div className="mt-4 w-full bg-green-100 text-green-800 font-medium py-2 rounded-lg text-center">
            Completed
          </div>
        )}
      </div>
    </div>
  );
}
