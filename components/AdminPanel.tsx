import { useState } from 'react';
import { Users, BookOpen, TrendingUp, Settings, BarChart3 } from 'lucide-react';
import { Course } from '../types';
import { courses as coursesData } from '../data/courses';

export default function AdminPanel() {
  const [courses] = useState<Course[]>(coursesData);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'users'>('overview');

  const totalStudents = 247;
  const activeStudents = 189;
  const avgProgress =
    courses.length > 0
      ? courses.reduce((sum, course) => sum + course.progress, 0) / courses.length
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage courses, users, and monitor platform performance</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-black border-b-2 border-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'courses'
                ? 'text-black border-b-2 border-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Courses
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'users'
                ? 'text-black border-b-2 border-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Users
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-black p-3 rounded-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{courses.length}</span>
              </div>
              <h3 className="text-gray-600 font-medium">Total Courses</h3>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{totalStudents}</span>
              </div>
              <h3 className="text-gray-600 font-medium">Total Students</h3>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{activeStudents}</span>
              </div>
              <h3 className="text-gray-600 font-medium">Active Students</h3>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{avgProgress.toFixed(0)}%</span>
              </div>
              <h3 className="text-gray-600 font-medium">Avg Progress</h3>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
              <button className="bg-black hover:bg-black text-white font-medium px-6 py-2 rounded-lg">
                Add New Course
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modules
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{course.title}</div>
                        <div className="text-sm text-gray-500">{course.category}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{course.level}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{course.duration}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{course.modules}</td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-black hover:text-black font-medium mr-4">Edit</button>
                        <button className="text-gray-600 hover:text-gray-900 font-medium">
                          <Settings className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <button className="bg-black hover:bg-black text-white font-medium px-6 py-2 rounded-lg">
                Add New User
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">John Smith</td>
                    <td className="px-6 py-4 text-sm text-gray-900">john@example.com</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        User
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">45%</td>
                    <td className="px-6 py-4 text-sm">
                      <button className="text-black hover:text-black font-medium mr-4">View</button>
                      <button className="text-gray-600 hover:text-gray-900 font-medium">
                        <Settings className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Sarah Johnson</td>
                    <td className="px-6 py-4 text-sm text-gray-900">sarah@example.com</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        User
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">78%</td>
                    <td className="px-6 py-4 text-sm">
                      <button className="text-black hover:text-black font-medium mr-4">View</button>
                      <button className="text-gray-600 hover:text-gray-900 font-medium">
                        <Settings className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
