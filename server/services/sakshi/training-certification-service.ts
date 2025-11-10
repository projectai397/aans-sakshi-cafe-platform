/**
 * Staff Training & Certification Program Service
 * Learning management system with courses, quizzes, and certifications
 */

type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
type CourseStatus = 'draft' | 'published' | 'archived';
type EnrollmentStatus = 'enrolled' | 'in_progress' | 'completed' | 'failed';
type CertificationStatus = 'not_started' | 'in_progress' | 'completed' | 'expired';

interface Course {
  id: string;
  title: string;
  description: string;
  level: CourseLevel;
  category: string;
  duration: number; // minutes
  modules: Module[];
  status: CourseStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  duration: number; // minutes
  lessons: Lesson[];
  order: number;
}

interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  videoUrl?: string;
  duration: number; // minutes
  order: number;
}

interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  passingScore: number; // percentage
  duration: number; // minutes
  attempts: number;
}

interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  order: number;
}

interface Enrollment {
  id: string;
  staffId: string;
  courseId: string;
  status: EnrollmentStatus;
  enrolledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  progress: number; // percentage
  score?: number;
  certificateId?: string;
}

interface Certification {
  id: string;
  staffId: string;
  courseId: string;
  issuedAt: Date;
  expiresAt: Date;
  status: CertificationStatus;
  score: number;
  certificateNumber: string;
}

interface TrainingAnalytics {
  totalCourses: number;
  totalEnrollments: number;
  completionRate: number; // percentage
  averageScore: number;
  averageCompletionTime: number; // hours
  coursePopularity: Array<{ courseId: string; courseTitle: string; enrollments: number }>;
  staffProgress: Array<{ staffId: string; staffName: string; completedCourses: number; certifications: number }>;
  topPerformers: Array<{ staffId: string; staffName: string; averageScore: number }>;
  improvementAreas: Array<{ courseId: string; courseTitle: string; averageScore: number }>;
}

class TrainingCertificationService {
  private courses: Map<string, Course> = new Map();
  private quizzes: Map<string, Quiz> = new Map();
  private enrollments: Map<string, Enrollment> = new Map();
  private certifications: Map<string, Certification> = new Map();

  /**
   * Create course
   */
  async createCourse(course: Omit<Course, 'id | createdAt | updatedAt'>): Promise<Course> {
    const fullCourse: Course = {
      ...course,
      id: `COURSE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.courses.set(fullCourse.id, fullCourse);
    return fullCourse;
  }

  /**
   * Get course
   */
  async getCourse(courseId: string): Promise<Course | null> {
    return this.courses.get(courseId) || null;
  }

  /**
   * Get all courses
   */
  async getAllCourses(status?: CourseStatus, level?: CourseLevel): Promise<Course[]> {
    let courses = Array.from(this.courses.values());

    if (status) {
      courses = courses.filter((c) => c.status === status);
    }

    if (level) {
      courses = courses.filter((c) => c.level === level);
    }

    return courses;
  }

  /**
   * Create quiz
   */
  async createQuiz(quiz: Omit<Quiz, 'id'>): Promise<Quiz> {
    const fullQuiz: Quiz = {
      ...quiz,
      id: `QUIZ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    this.quizzes.set(fullQuiz.id, fullQuiz);
    return fullQuiz;
  }

  /**
   * Get quiz
   */
  async getQuiz(quizId: string): Promise<Quiz | null> {
    return this.quizzes.get(quizId) || null;
  }

  /**
   * Enroll staff in course
   */
  async enrollStaff(staffId: string, courseId: string): Promise<Enrollment> {
    const course = await this.getCourse(courseId);
    if (!course) {
      throw new Error(`Course ${courseId} not found`);
    }

    // Check if already enrolled
    const existing = Array.from(this.enrollments.values()).find(
      (e) => e.staffId === staffId && e.courseId === courseId && e.status !== 'completed'
    );

    if (existing) {
      return existing;
    }

    const enrollment: Enrollment = {
      id: `ENROLL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      staffId,
      courseId,
      status: 'enrolled',
      enrolledAt: new Date(),
      progress: 0,
    };

    this.enrollments.set(enrollment.id, enrollment);
    return enrollment;
  }

  /**
   * Get staff enrollments
   */
  async getStaffEnrollments(staffId: string, status?: EnrollmentStatus): Promise<Enrollment[]> {
    let enrollments = Array.from(this.enrollments.values()).filter((e) => e.staffId === staffId);

    if (status) {
      enrollments = enrollments.filter((e) => e.status === status);
    }

    return enrollments;
  }

  /**
   * Update enrollment progress
   */
  async updateEnrollmentProgress(enrollmentId: string, progress: number): Promise<Enrollment> {
    const enrollment = this.enrollments.get(enrollmentId);
    if (!enrollment) {
      throw new Error(`Enrollment ${enrollmentId} not found`);
    }

    enrollment.progress = Math.min(100, progress);

    if (progress === 100) {
      enrollment.status = 'in_progress';
      enrollment.startedAt = enrollment.startedAt || new Date();
    }

    return enrollment;
  }

  /**
   * Submit quiz
   */
  async submitQuiz(enrollmentId: string, quizId: string, answers: number[]): Promise<{ score: number; passed: boolean }> {
    const enrollment = this.enrollments.get(enrollmentId);
    const quiz = this.quizzes.get(quizId);

    if (!enrollment || !quiz) {
      throw new Error('Enrollment or quiz not found');
    }

    // Calculate score
    let correctAnswers = 0;
    for (let i = 0; i < answers.length; i++) {
      if (answers[i] === quiz.questions[i].correctAnswer) {
        correctAnswers++;
      }
    }

    const score = (correctAnswers / quiz.questions.length) * 100;
    const passed = score >= quiz.passingScore;

    enrollment.score = score;

    if (passed) {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();

      // Create certification
      await this.createCertification(enrollment.staffId, enrollment.courseId, score);
    } else {
      enrollment.status = 'failed';
    }

    return { score, passed };
  }

  /**
   * Create certification
   */
  private async createCertification(staffId: string, courseId: string, score: number): Promise<Certification> {
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year

    const certification: Certification = {
      id: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      staffId,
      courseId,
      issuedAt,
      expiresAt,
      status: 'completed',
      score,
      certificateNumber: `CERT-${Date.now()}`,
    };

    this.certifications.set(certification.id, certification);
    return certification;
  }

  /**
   * Get staff certifications
   */
  async getStaffCertifications(staffId: string, status?: CertificationStatus): Promise<Certification[]> {
    let certifications = Array.from(this.certifications.values()).filter((c) => c.staffId === staffId);

    if (status) {
      certifications = certifications.filter((c) => c.status === status);
    }

    return certifications;
  }

  /**
   * Get training analytics
   */
  async getTrainingAnalytics(): Promise<TrainingAnalytics> {
    const allCourses = Array.from(this.courses.values());
    const allEnrollments = Array.from(this.enrollments.values());
    const allCertifications = Array.from(this.certifications.values());

    const completedEnrollments = allEnrollments.filter((e) => e.status === 'completed');
    const completionRate = allEnrollments.length > 0 ? (completedEnrollments.length / allEnrollments.length) * 100 : 0;

    const totalScore = completedEnrollments.reduce((sum, e) => sum + (e.score || 0), 0);
    const averageScore = completedEnrollments.length > 0 ? totalScore / completedEnrollments.length : 0;

    const totalTime = completedEnrollments.reduce((sum, e) => {
      if (e.completedAt && e.enrolledAt) {
        return sum + (e.completedAt.getTime() - e.enrolledAt.getTime());
      }
      return sum;
    }, 0);
    const averageCompletionTime = completedEnrollments.length > 0 ? totalTime / completedEnrollments.length / (1000 * 60 * 60) : 0;

    // Course popularity
    const courseEnrollments: Record<string, number> = {};
    for (const enrollment of allEnrollments) {
      courseEnrollments[enrollment.courseId] = (courseEnrollments[enrollment.courseId] || 0) + 1;
    }

    const coursePopularity = Object.entries(courseEnrollments)
      .map(([courseId, count]) => ({
        courseId,
        courseTitle: this.courses.get(courseId)?.title || 'Unknown',
        enrollments: count,
      }))
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 5);

    // Staff progress
    const staffProgress: Record<string, { completedCourses: number; certifications: number }> = {};
    for (const enrollment of completedEnrollments) {
      if (!staffProgress[enrollment.staffId]) {
        staffProgress[enrollment.staffId] = { completedCourses: 0, certifications: 0 };
      }
      staffProgress[enrollment.staffId].completedCourses++;
    }

    for (const cert of allCertifications) {
      if (!staffProgress[cert.staffId]) {
        staffProgress[cert.staffId] = { completedCourses: 0, certifications: 0 };
      }
      staffProgress[cert.staffId].certifications++;
    }

    const staffProgressArray = Object.entries(staffProgress)
      .map(([staffId, data]) => ({
        staffId,
        staffName: `Staff-${staffId.slice(0, 8)}`,
        ...data,
      }))
      .sort((a, b) => b.completedCourses - a.completedCourses)
      .slice(0, 10);

    // Top performers
    const staffScores: Record<string, number[]> = {};
    for (const enrollment of completedEnrollments) {
      if (!staffScores[enrollment.staffId]) {
        staffScores[enrollment.staffId] = [];
      }
      if (enrollment.score) {
        staffScores[enrollment.staffId].push(enrollment.score);
      }
    }

    const topPerformers = Object.entries(staffScores)
      .map(([staffId, scores]) => ({
        staffId,
        staffName: `Staff-${staffId.slice(0, 8)}`,
        averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5);

    // Improvement areas
    const courseScores: Record<string, number[]> = {};
    for (const enrollment of completedEnrollments) {
      if (!courseScores[enrollment.courseId]) {
        courseScores[enrollment.courseId] = [];
      }
      if (enrollment.score) {
        courseScores[enrollment.courseId].push(enrollment.score);
      }
    }

    const improvementAreas = Object.entries(courseScores)
      .map(([courseId, scores]) => ({
        courseId,
        courseTitle: this.courses.get(courseId)?.title || 'Unknown',
        averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      }))
      .sort((a, b) => a.averageScore - b.averageScore)
      .slice(0, 5);

    return {
      totalCourses: allCourses.length,
      totalEnrollments: allEnrollments.length,
      completionRate: Math.round(completionRate),
      averageScore: Math.round(averageScore),
      averageCompletionTime: Math.round(averageCompletionTime * 10) / 10,
      coursePopularity,
      staffProgress: staffProgressArray,
      topPerformers,
      improvementAreas,
    };
  }

  /**
   * Get course completion rate
   */
  async getCourseCompletionRate(courseId: string): Promise<number> {
    const enrollments = Array.from(this.enrollments.values()).filter((e) => e.courseId === courseId);
    const completed = enrollments.filter((e) => e.status === 'completed').length;

    return enrollments.length > 0 ? (completed / enrollments.length) * 100 : 0;
  }

  /**
   * Get staff training status
   */
  async getStaffTrainingStatus(staffId: string): Promise<any> {
    const enrollments = await this.getStaffEnrollments(staffId);
    const certifications = await this.getStaffCertifications(staffId);

    return {
      staffId,
      totalEnrollments: enrollments.length,
      completedCourses: enrollments.filter((e) => e.status === 'completed').length,
      inProgressCourses: enrollments.filter((e) => e.status === 'in_progress').length,
      certifications: certifications.length,
      activeCertifications: certifications.filter((c) => c.status === 'completed' && c.expiresAt > new Date()).length,
      averageScore: enrollments.filter((e) => e.score).length > 0 ? enrollments.filter((e) => e.score).reduce((sum, e) => sum + (e.score || 0), 0) / enrollments.filter((e) => e.score).length : 0,
    };
  }
}

export default TrainingCertificationService;
