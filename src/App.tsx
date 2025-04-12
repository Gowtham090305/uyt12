import React, { useState } from 'react';
import { Layers, Code, Users, BarChart, LogOut, UserCircle, BookOpen, ClipboardList } from 'lucide-react';
import CodeEditor from './components/CodeEditor';
import Dashboard from './components/Dashboard';
import { AuthProvider } from './contexts/AuthContext';
import { AssessmentProvider } from './contexts/AssessmentContext';
import { CourseProvider } from './contexts/CourseContext';
import { AttendanceProvider } from './contexts/AttendanceContext';
import { PerformanceProvider } from './contexts/PerformanceContext';
import Auth from './components/Auth';
import { useAuth } from './contexts/AuthContext';
import AttendanceManager from './components/AttendanceManager';
import CourseList from './components/CourseList';
import AssessmentList from './components/AssessmentList';
import AdminDashboard from './components/AdminDashboard';
import NotificationCenter from './components/NotificationCenter';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'javascript' | 'java' | 'cpp'>('python');
  const { user, userRole, loading, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Auth />;
  }

  const handleLogout = async () => {
    await signOut();
  };

  const getNavigationItems = () => {
    if (userRole === 'student') {
      return [
        {
          id: 'editor',
          icon: <Code className="w-5 h-5" />,
          text: 'Code Editor'
        },
        {
          id: 'courses',
          icon: <BookOpen className="w-5 h-5" />,
          text: 'Courses'
        },
        {
          id: 'assessments',
          icon: <ClipboardList className="w-5 h-5" />,
          text: 'Assessments'
        },
        {
          id: 'dashboard',
          icon: <BarChart className="w-5 h-5" />,
          text: 'Dashboard'
        }
      ];
    } else if (userRole === 'faculty') {
      return [
        {
          id: 'courses',
          icon: <BookOpen className="w-5 h-5" />,
          text: 'Manage Courses'
        },
        {
          id: 'assessments',
          icon: <ClipboardList className="w-5 h-5" />,
          text: 'Assessments'
        },
        {
          id: 'attendance',
          icon: <Users className="w-5 h-5" />,
          text: 'Attendance'
        }
      ];
    } else if (userRole === 'admin') {
      return [
        {
          id: 'dashboard',
          icon: <BarChart className="w-5 h-5" />,
          text: 'Dashboard'
        }
      ];
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Code className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">CodeMentor AI</span>
              </div>
              
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {getNavigationItems().map((item) => (
                  <NavButton
                    key={item.id}
                    active={activeTab === item.id}
                    onClick={() => setActiveTab(item.id)}
                    icon={item.icon}
                    text={item.text}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center">
              {activeTab === 'editor' && userRole === 'student' && (
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as any)}
                  className="ml-4 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              )}

              <div className="ml-4 relative flex items-center space-x-4">
                {user && <NotificationCenter userId={user.id} />}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                  >
                    <UserCircle className="w-6 h-6" />
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-gray-700">
                          {user.email}
                        </div>
                        <div className="px-4 py-2 text-sm text-gray-500">
                          Role: {userRole}
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {activeTab === 'editor' && userRole === 'student' && (
          <div className="h-[calc(100vh-4rem)]">
            <CodeEditor language={selectedLanguage} />
          </div>
        )}
        {activeTab === 'courses' && (
          <CourseList />
        )}
        {activeTab === 'assessments' && (
          <AssessmentList isTeacher={userRole === 'faculty'} />
        )}
        {activeTab === 'dashboard' && userRole === 'student' && (
          <Dashboard
            student={mockStudent}
            metrics={mockMetrics}
            jobMatches={mockJobMatches}
          />
        )}
        {activeTab === 'dashboard' && userRole === 'admin' && (
          <AdminDashboard />
        )}
        {activeTab === 'attendance' && userRole === 'faculty' && (
          <AttendanceManager />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <PerformanceProvider>
        <AttendanceProvider>
          <CourseProvider>
            <AssessmentProvider>
              <AppContent />
            </AssessmentProvider>
          </CourseProvider>
        </AttendanceProvider>
      </PerformanceProvider>
    </AuthProvider>
  );
}

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  text: string;
}

function NavButton({ active, onClick, icon, text }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
        active
          ? 'border-indigo-500 text-gray-900 border-b-2'
          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 border-b-2'
      }`}
    >
      {icon}
      <span className="ml-2">{text}</span>
    </button>
  );
}

const mockStudent = {
  id: '1',
  name: 'John Doe',
  skills: ['Python', 'JavaScript', 'Java', 'C++'],
  completedAssignments: 15,
  attendance: 90,
  performance: 85
};

const mockMetrics = {
  codingProficiency: 85,
  attendance: 90,
  assignmentCompletion: 88,
  overallProgress: 87
};

const mockJobMatches = [
  {
    role: 'Junior Software Developer',
    company: 'Tech Corp',
    matchScore: 92,
    recommendation: 'Strong match based on your Python and JavaScript skills. Recent projects demonstrate solid problem-solving abilities.'
  },
  {
    role: 'Frontend Developer Intern',
    company: 'Web Solutions Inc',
    matchScore: 88,
    recommendation: 'Your recent focus on React and modern JavaScript makes you a great fit for this role.'
  }
];

export default App;