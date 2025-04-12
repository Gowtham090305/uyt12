import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { 
  Briefcase, 
  Users, 
  BookOpen, 
  Trophy,
  Bell,
  ChevronRight,
  Star,
  TrendingUp,
  Calendar
} from 'lucide-react';
import type { Student, PerformanceMetrics, JobMatch, CourseAttendance } from '../types';
import { useAttendance } from '../contexts/AttendanceContext';
import { useAuth } from '../contexts/AuthContext';
import { usePerformance } from '../contexts/PerformanceContext';
import { useCourses } from '../contexts/CourseContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardProps {
  student: Student;
  metrics: PerformanceMetrics;
  jobMatches: JobMatch[];
}

const generateJobMatches = (skills: string[], proficiencyLevels: number[]): JobMatch[] => {
  const jobRoles = {
    'Python': [
      { role: 'Data Scientist', company: 'DataCorp Analytics', minScore: 85 },
      { role: 'Machine Learning Engineer', company: 'AI Solutions Ltd', minScore: 90 },
      { role: 'Backend Developer', company: 'TechStack Inc', minScore: 80 }
    ],
    'JavaScript': [
      { role: 'Frontend Developer', company: 'WebTech Solutions', minScore: 80 },
      { role: 'Full Stack Developer', company: 'Digital Innovations', minScore: 85 },
      { role: 'React Developer', company: 'Modern Apps Inc', minScore: 82 }
    ],
    'Java': [
      { role: 'Software Engineer', company: 'Enterprise Systems', minScore: 85 },
      { role: 'Android Developer', company: 'Mobile Solutions', minScore: 88 },
      { role: 'Backend Developer', company: 'Cloud Services Ltd', minScore: 82 }
    ],
    'C++': [
      { role: 'Systems Engineer', company: 'Hardware Solutions', minScore: 88 },
      { role: 'Game Developer', company: 'Gaming Studios', minScore: 85 },
      { role: 'Embedded Systems Developer', company: 'IoT Technologies', minScore: 90 }
    ]
  };

  const matches: JobMatch[] = [];
  
  skills.forEach((skill, index) => {
    const proficiency = proficiencyLevels[index];
    const roleOptions = jobRoles[skill as keyof typeof jobRoles] || [];
    
    roleOptions.forEach(option => {
      if (proficiency >= option.minScore) {
        const matchScore = Math.round((proficiency / option.minScore) * 100);
        matches.push({
          role: option.role,
          company: option.company,
          matchScore: Math.min(matchScore, 98), // Cap at 98% to show room for growth
          recommendation: `Strong match based on your ${skill} skills (${proficiency}%). Your recent projects and assessments demonstrate the required expertise for this role.`
        });
      }
    });
  });

  // Sort by match score and take top 2
  return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 2);
};

export default function Dashboard({ student, metrics, jobMatches }: DashboardProps) {
  const { user } = useAuth();
  const { getStudentAttendance } = useAttendance();
  const { getStudentPerformance } = usePerformance();
  const { courses } = useCourses();
  
  if (!user) {
    return null;
  }

  // Get actual attendance data for the logged-in student
  const studentAttendance = getStudentAttendance(user.id);
  
  // Calculate attendance percentage
  const attendancePercentage = studentAttendance.length > 0
    ? (studentAttendance.filter(record => record.present).length / studentAttendance.length) * 100
    : 0;

  // Get student performance data
  const performance = getStudentPerformance(user.id);

  // Update metrics with real data
  const updatedMetrics = {
    codingProficiency: performance.codingProficiency,
    attendance: Math.round(attendancePercentage),
    assignmentCompletion: performance.assignmentCompletion,
    overallProgress: performance.overallProgress
  };

  // Update student data with real values
  const updatedStudent = {
    ...student,
    skills: performance.skills,
    completedAssignments: performance.completedAssignments,
    attendance: Math.round(attendancePercentage),
    performance: performance.overallProgress
  };

  // Generate skill proficiency levels (70-100 range)
  const skillProficiencyLevels = performance.skills.map(() => 
    Math.floor(Math.random() * 30) + 70
  );

  // Update skill data for the chart
  const updatedSkillData = {
    labels: performance.skills,
    datasets: [
      {
        label: 'Skill Level',
        data: skillProficiencyLevels,
        backgroundColor: [
          'rgba(99, 102, 241, 0.7)',
          'rgba(168, 85, 247, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(34, 197, 94, 0.7)',
        ],
        borderRadius: 8,
      },
    ],
  };

  // Generate course attendance data from enrolled courses
  const courseAttendanceData = courses.map(course => ({
    courseId: course.id,
    courseName: course.title,
    totalClasses: 24, // Assuming a fixed number of classes per course
    attendedClasses: Math.floor(Math.random() * 5) + 19, // Random attendance between 19-24 classes
    lastAttendance: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })).slice(0, 3); // Show only first 3 courses

  // Generate job recommendations based on skills and proficiency
  const updatedJobMatches = generateJobMatches(performance.skills, skillProficiencyLevels);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <motion.h1 
            className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Welcome back, {updatedStudent.name}
          </motion.h1>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={<Trophy className="w-8 h-8 text-indigo-600" />}
            title="Coding Proficiency"
            value={updatedMetrics.codingProficiency}
            color="indigo"
          />
          <MetricCard
            icon={<Users className="w-8 h-8 text-purple-600" />}
            title="Attendance"
            value={updatedMetrics.attendance}
            color="purple"
          />
          <MetricCard
            icon={<BookOpen className="w-8 h-8 text-blue-600" />}
            title="Assignments"
            value={updatedMetrics.assignmentCompletion}
            color="blue"
          />
          <MetricCard
            icon={<TrendingUp className="w-8 h-8 text-green-600" />}
            title="Overall Progress"
            value={updatedMetrics.overallProgress}
            color="green"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          
          <motion.div 
            className="bg-white backdrop-blur-lg bg-opacity-80 p-6 rounded-2xl shadow-lg border border-gray-100"
            {...fadeInUp}
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-purple-600" />
              Skill Distribution
            </h2>
            <div className="h-64">
              <Bar data={updatedSkillData} options={chartOptions} />
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="bg-white backdrop-blur-lg bg-opacity-80 rounded-2xl shadow-lg border border-gray-100"
          {...fadeInUp}
        >
          <h2 className="text-xl font-semibold p-6 border-b border-gray-100 flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
            Recommended Job Matches
          </h2>
          <div className="divide-y divide-gray-100">
            {updatedJobMatches.map((match, index) => (
              <motion.div 
                key={index}
                className="p-6 hover:bg-gray-50 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{match.role}</h3>
                    <p className="text-gray-600">{match.company}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="w-16 h-16">
                        <CircularProgressbar
                          value={match.matchScore}
                          text={`${match.matchScore}%`}
                          styles={buildStyles({
                            textSize: '24px',
                            pathColor: `rgba(99, 102, 241, ${match.matchScore / 100})`,
                            textColor: '#4F46E5',
                            trailColor: '#E5E7EB'
                          })}
                        />
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <p className="mt-2 text-gray-700">{match.recommendation}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function MetricCard({ icon, title, value, color }: { 
  icon: React.ReactNode; 
  title: string; 
  value: number;
  color: 'indigo' | 'purple' | 'blue' | 'green';
}) {
  const colorClasses = {
    indigo: 'from-indigo-500 to-indigo-600',
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600'
  };

  return (
    <motion.div 
      className="bg-white backdrop-blur-lg bg-opacity-80 p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-lg bg-gray-50">{icon}</div>
        <div className="w-16 h-16">
          <CircularProgressbar
            value={value}
            text={`${value}%`}
            styles={buildStyles({
              textSize: '24px',
              pathColor: `url(#${color}Gradient)`,
              textColor: '#1F2937',
              trailColor: '#E5E7EB'
            })}
          />
          <svg style={{ height: 0 }}>
            <defs>
              <linearGradient id={`${color}Gradient`} gradientTransform="rotate(90)">
                <stop offset="0%" stopColor={`var(--${color}-500)`} />
                <stop offset="100%" stopColor={`var(--${color}-600)`} />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      <h3 className="text-gray-600 font-medium">{title}</h3>
    </motion.div>
  );
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
};