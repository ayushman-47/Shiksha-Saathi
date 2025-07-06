import {
  users,
  subjects,
  chapters,
  doubts,
  videoLectures,
  tests,
  testAttempts,
  previousYearPapers,
  studyPlans,
  userProgress,
  forumPosts,
  forumReplies,
  socialMediaLinks,
  type User,
  type UpsertUser,
  type Subject,
  type InsertSubject,
  type Chapter,
  type InsertChapter,
  type Doubt,
  type InsertDoubt,
  type VideoLecture,
  type InsertVideoLecture,
  type Test,
  type InsertTest,
  type TestAttempt,
  type InsertTestAttempt,
  type PreviousYearPaper,
  type InsertPreviousYearPaper,
  type StudyPlan,
  type InsertStudyPlan,
  type UserProgress,
  type InsertUserProgress,
  type ForumPost,
  type InsertForumPost,
  type ForumReply,
  type InsertForumReply,
  type SocialMediaLink,
  type InsertSocialMediaLink,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProgress(userId: string, stats: { doubtsResolved?: number; testsCompleted?: number; streakDays?: number }): Promise<void>;
  
  // Subject operations
  getSubjects(): Promise<Subject[]>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  
  // Chapter operations
  getChaptersBySubject(subjectId: number, className: string, board: string): Promise<Chapter[]>;
  createChapter(chapter: InsertChapter): Promise<Chapter>;
  
  // Doubt operations
  createDoubt(doubt: InsertDoubt): Promise<Doubt>;
  updateDoubt(id: string, updates: Partial<Doubt>): Promise<Doubt>;
  getUserDoubts(userId: string, limit?: number): Promise<Doubt[]>;
  
  // Video lecture operations
  getVideoLectures(subjectId?: number, chapterId?: number, className?: string, board?: string): Promise<VideoLecture[]>;
  createVideoLecture(lecture: InsertVideoLecture): Promise<VideoLecture>;
  
  // Test operations
  getTests(subjectId?: number, className?: string, board?: string): Promise<Test[]>;
  getTestById(id: number): Promise<Test | undefined>;
  createTest(test: InsertTest): Promise<Test>;
  
  // Test attempt operations
  createTestAttempt(attempt: InsertTestAttempt): Promise<TestAttempt>;
  updateTestAttempt(id: number, updates: Partial<TestAttempt>): Promise<TestAttempt>;
  getUserTestAttempts(userId: string, limit?: number): Promise<TestAttempt[]>;
  
  // Previous year papers operations
  getPreviousYearPapers(subjectId?: number, className?: string, board?: string, year?: number): Promise<PreviousYearPaper[]>;
  createPreviousYearPaper(paper: InsertPreviousYearPaper): Promise<PreviousYearPaper>;
  
  // Study plan operations
  getUserStudyPlans(userId: string): Promise<StudyPlan[]>;
  createStudyPlan(plan: InsertStudyPlan): Promise<StudyPlan>;
  updateStudyPlan(id: number, updates: Partial<StudyPlan>): Promise<StudyPlan>;
  
  // User progress operations
  getUserProgress(userId: string, subjectId?: number): Promise<UserProgress[]>;
  recordUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  
  // Forum operations
  getForumPosts(subjectId?: number, className?: string, board?: string, limit?: number): Promise<ForumPost[]>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  getForumReplies(postId: number): Promise<ForumReply[]>;
  createForumReply(reply: InsertForumReply): Promise<ForumReply>;
  
  // Social media operations
  getSocialMediaLinks(): Promise<SocialMediaLink[]>;
  updateSocialMediaLink(id: number, updates: Partial<SocialMediaLink>): Promise<SocialMediaLink>;
  
  // Dashboard data
  getUserDashboardData(userId: string): Promise<{
    user: User;
    todayProgress: number;
    recentDoubts: Doubt[];
    recentTests: TestAttempt[];
    studyPlan: StudyPlan | null;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProgress(userId: string, stats: { doubtsResolved?: number; testsCompleted?: number; streakDays?: number }): Promise<void> {
    await db
      .update(users)
      .set({
        totalDoubtsResolved: stats.doubtsResolved,
        totalTestsCompleted: stats.testsCompleted,
        streakDays: stats.streakDays,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // Subject operations
  async getSubjects(): Promise<Subject[]> {
    return await db.select().from(subjects);
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    const [created] = await db.insert(subjects).values(subject).returning();
    return created;
  }

  // Chapter operations
  async getChaptersBySubject(subjectId: number, className: string, board: string): Promise<Chapter[]> {
    return await db
      .select()
      .from(chapters)
      .where(
        and(
          eq(chapters.subjectId, subjectId),
          eq(chapters.class, className),
          eq(chapters.board, board)
        )
      )
      .orderBy(chapters.chapterNumber);
  }

  async createChapter(chapter: InsertChapter): Promise<Chapter> {
    const [created] = await db.insert(chapters).values(chapter).returning();
    return created;
  }

  // Doubt operations
  async createDoubt(doubt: InsertDoubt): Promise<Doubt> {
    const [created] = await db.insert(doubts).values(doubt).returning();
    return created;
  }

  async updateDoubt(id: string, updates: Partial<Doubt>): Promise<Doubt> {
    const [updated] = await db
      .update(doubts)
      .set(updates)
      .where(eq(doubts.id, id))
      .returning();
    return updated;
  }

  async getUserDoubts(userId: string, limit = 10): Promise<Doubt[]> {
    return await db
      .select()
      .from(doubts)
      .where(eq(doubts.userId, userId))
      .orderBy(desc(doubts.createdAt))
      .limit(limit);
  }

  // Video lecture operations
  async getVideoLectures(subjectId?: number, chapterId?: number, className?: string, board?: string): Promise<VideoLecture[]> {
    let query = db.select().from(videoLectures);
    
    const conditions = [];
    if (subjectId) conditions.push(eq(videoLectures.subjectId, subjectId));
    if (chapterId) conditions.push(eq(videoLectures.chapterId, chapterId));
    if (className) conditions.push(eq(videoLectures.class, className));
    if (board) conditions.push(eq(videoLectures.board, board));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(videoLectures.createdAt));
  }

  async createVideoLecture(lecture: InsertVideoLecture): Promise<VideoLecture> {
    const [created] = await db.insert(videoLectures).values(lecture).returning();
    return created;
  }

  // Test operations
  async getTests(subjectId?: number, className?: string, board?: string): Promise<Test[]> {
    let query = db.select().from(tests);
    
    const conditions = [];
    if (subjectId) conditions.push(eq(tests.subjectId, subjectId));
    if (className) conditions.push(eq(tests.class, className));
    if (board) conditions.push(eq(tests.board, board));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(tests.createdAt));
  }

  async getTestById(id: number): Promise<Test | undefined> {
    const [test] = await db.select().from(tests).where(eq(tests.id, id));
    return test;
  }

  async createTest(test: InsertTest): Promise<Test> {
    const [created] = await db.insert(tests).values(test).returning();
    return created;
  }

  // Test attempt operations
  async createTestAttempt(attempt: InsertTestAttempt): Promise<TestAttempt> {
    const [created] = await db.insert(testAttempts).values(attempt).returning();
    return created;
  }

  async updateTestAttempt(id: number, updates: Partial<TestAttempt>): Promise<TestAttempt> {
    const [updated] = await db
      .update(testAttempts)
      .set(updates)
      .where(eq(testAttempts.id, id))
      .returning();
    return updated;
  }

  async getUserTestAttempts(userId: string, limit = 10): Promise<TestAttempt[]> {
    return await db
      .select()
      .from(testAttempts)
      .where(eq(testAttempts.userId, userId))
      .orderBy(desc(testAttempts.startedAt))
      .limit(limit);
  }

  // Previous year papers operations
  async getPreviousYearPapers(subjectId?: number, className?: string, board?: string, year?: number): Promise<PreviousYearPaper[]> {
    let query = db.select().from(previousYearPapers);
    
    const conditions = [];
    if (subjectId) conditions.push(eq(previousYearPapers.subjectId, subjectId));
    if (className) conditions.push(eq(previousYearPapers.class, className));
    if (board) conditions.push(eq(previousYearPapers.board, board));
    if (year) conditions.push(eq(previousYearPapers.year, year));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(previousYearPapers.year));
  }

  async createPreviousYearPaper(paper: InsertPreviousYearPaper): Promise<PreviousYearPaper> {
    const [created] = await db.insert(previousYearPapers).values(paper).returning();
    return created;
  }

  // Study plan operations
  async getUserStudyPlans(userId: string): Promise<StudyPlan[]> {
    return await db
      .select()
      .from(studyPlans)
      .where(eq(studyPlans.userId, userId))
      .orderBy(desc(studyPlans.createdAt));
  }

  async createStudyPlan(plan: InsertStudyPlan): Promise<StudyPlan> {
    const [created] = await db.insert(studyPlans).values(plan).returning();
    return created;
  }

  async updateStudyPlan(id: number, updates: Partial<StudyPlan>): Promise<StudyPlan> {
    const [updated] = await db
      .update(studyPlans)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(studyPlans.id, id))
      .returning();
    return updated;
  }

  // User progress operations
  async getUserProgress(userId: string, subjectId?: number): Promise<UserProgress[]> {
    let query = db.select().from(userProgress).where(eq(userProgress.userId, userId));
    
    if (subjectId) {
      query = query.where(and(eq(userProgress.userId, userId), eq(userProgress.subjectId, subjectId)));
    }
    
    return await query.orderBy(desc(userProgress.createdAt));
  }

  async recordUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const [created] = await db.insert(userProgress).values(progress).returning();
    return created;
  }

  // Forum operations
  async getForumPosts(subjectId?: number, className?: string, board?: string, limit = 20): Promise<ForumPost[]> {
    let query = db.select().from(forumPosts);
    
    const conditions = [];
    if (subjectId) conditions.push(eq(forumPosts.subjectId, subjectId));
    if (className) conditions.push(eq(forumPosts.class, className));
    if (board) conditions.push(eq(forumPosts.board, board));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(forumPosts.createdAt)).limit(limit);
  }

  async createForumPost(post: InsertForumPost): Promise<ForumPost> {
    const [created] = await db.insert(forumPosts).values(post).returning();
    return created;
  }

  async getForumReplies(postId: number): Promise<ForumReply[]> {
    return await db
      .select()
      .from(forumReplies)
      .where(eq(forumReplies.postId, postId))
      .orderBy(desc(forumReplies.createdAt));
  }

  async createForumReply(reply: InsertForumReply): Promise<ForumReply> {
    const [created] = await db.insert(forumReplies).values(reply).returning();
    return created;
  }

  // Social media operations
  async getSocialMediaLinks(): Promise<SocialMediaLink[]> {
    return await db
      .select()
      .from(socialMediaLinks)
      .where(eq(socialMediaLinks.isActive, true));
  }

  async updateSocialMediaLink(id: number, updates: Partial<SocialMediaLink>): Promise<SocialMediaLink> {
    const [updated] = await db
      .update(socialMediaLinks)
      .set(updates)
      .where(eq(socialMediaLinks.id, id))
      .returning();
    return updated;
  }

  // Dashboard data
  async getUserDashboardData(userId: string): Promise<{
    user: User;
    todayProgress: number;
    recentDoubts: Doubt[];
    recentTests: TestAttempt[];
    studyPlan: StudyPlan | null;
  }> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const recentDoubts = await this.getUserDoubts(userId, 5);
    const recentTests = await this.getUserTestAttempts(userId, 5);
    const studyPlansList = await this.getUserStudyPlans(userId);
    const studyPlan = studyPlansList.find(plan => plan.status === 'active') || null;

    // Calculate today's progress (simplified)
    const todayProgress = Math.min(100, (user.totalDoubtsResolved || 0) * 2 + (user.totalTestsCompleted || 0) * 5);

    return {
      user,
      todayProgress,
      recentDoubts,
      recentTests,
      studyPlan,
    };
  }
}

export const storage = new DatabaseStorage();