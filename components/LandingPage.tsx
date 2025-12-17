import { BookOpen, Award, Users } from 'lucide-react';

interface LandingPageProps {
  onShowSignup: () => void;
  onShowAdmin: () => void; // New prop for admin panel
}

export default function LandingPage({ onShowSignup, onShowAdmin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Elite Protective Security Training
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Master the art of protective security with comprehensive training from industry experts.
                Develop the skills needed to excel as a Protective Security Specialist.
              </p>

              {/* Buttons: Signup + Admin */}
              <div className="flex space-x-4 mt-4">
                <button
                  onClick={onShowSignup}
                  className="bg-black hover:bg-gray-800 text-white font-semibold px-8 py-4 rounded-lg text-lg"
                >
                  Start Learning Today
                </button>

                <button
                  onClick={onShowAdmin}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-4 rounded-lg text-lg"
                >
                  Admin Panel
                </button>
              </div>
            </div>

            <div className="bg-black rounded-lg p-8 text-white">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <BookOpen className="h-8 w-8 flex-shrink-0 text-white" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Professional Training</h3>
                    <p className="text-gray-300">
                      Industry-standard curriculum designed by security professionals
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <BookOpen className="h-8 w-8 flex-shrink-0 text-white" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">17 Specialized Courses</h3>
                    <p className="text-gray-300">
                      Comprehensive modules covering all aspects of protective security
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Award className="h-8 w-8 flex-shrink-0 text-white" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Certification Ready</h3>
                    <p className="text-gray-300">
                      Prepare for professional security certifications
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose SSU Academy?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-gray-300 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Expert Instructors</h3>
              <p className="text-gray-600">
                Learn from experienced protective security professionals with real-world expertise
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-gray-300 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Flexible Learning</h3>
              <p className="text-gray-600">
                Study at your own pace with on-demand content and practical exercises
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-gray-300 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Career Advancement</h3>
              <p className="text-gray-600">
                Gain credentials that open doors to elite protective security positions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of security professionals advancing their careers with SSU Academy
          </p>
          <button
            onClick={onShowSignup}
            className="bg-black hover:bg-gray-800 text-white font-semibold px-8 py-4 rounded-lg text-lg"
          >
            Get Started Free
          </button>
        </div>
      </section>
    </div>
  );
}
