import { useState } from 'react';
import { BookOpen, Award, Clock, Search, Filter } from 'lucide-react';
import { Course, User } from '../types';
import { courses as coursesData } from '../data/courses';
import CourseCard from './CourseCard';
import { useRouter } from 'next/navigation';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export default function Dashboard({ user }: DashboardProps) {
  const router = useRouter();
  const [courses] = useState<Course[]>(coursesData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const totalProgress =
    courses.reduce((sum, course) => sum + course.progress, 0) / courses.length;

  const completedCourses = courses.filter((c) => c.progress === 100).length;

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel =
      selectedLevel === 'all' || course.level === selectedLevel;

    return matchesSearch && matchesLevel;
  });

  const handleCourseClick = (courseId: string) => {
    router.push(`/course/${courseId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}
          </h1>
          <p className="text-gray-600">
            Continue your protective security training journey
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-black p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {courses.length}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Total Courses</h3>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {completedCourses}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Completed</h3>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {totalProgress.toFixed(0)}%
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Overall Progress</h3>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-3">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="all">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Course Catalog */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Course Catalog
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onClick={() => handleCourseClick(course.id)}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}