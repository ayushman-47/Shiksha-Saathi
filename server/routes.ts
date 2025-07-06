import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { aiService } from "./services/openai";
import { contentService } from "./services/content";
import { insertDoubtSchema, insertTestAttemptSchema, insertStudyPlanSchema, insertForumPostSchema, insertForumReplySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard route
  app.get('/api/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const dashboardData = await storage.getUserDashboardData(userId);
      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // AI Doubt Solver routes
  app.post('/api/doubts/solve', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { question, questionType, questionImageUrl, subjectId, chapterId, class: userClass, board, language } = req.body;
      
      // Validate input
      const doubtData = insertDoubtSchema.parse({
        userId,
        question,
        questionType,
        questionImageUrl,
        subjectId,
        chapterId,
        class: userClass,
        board,
        language: language || 'en',
        status: 'pending',
      });

      // Create doubt record
      const doubt = await storage.createDoubt(doubtData);

      // Get AI response
      const aiResponse = await aiService.solveDoubt(question, questionType, questionImageUrl, {
        subject: subjectId,
        class: userClass,
        board,
        language,
      });

      // Update doubt with AI response
      const updatedDoubt = await storage.updateDoubt(doubt.id, {
        answer: aiResponse.answer,
        answerAudioUrl: aiResponse.audioUrl,
        status: 'resolved',
        aiModel: aiResponse.model,
        resolvedAt: new Date(),
      });

      // Update user stats
      const user = await storage.getUser(userId);
      await storage.updateUserProgress(userId, {
        doubtsResolved: (user?.totalDoubtsResolved || 0) + 1,
      });

      res.json({
        doubt: updatedDoubt,
        answer: aiResponse.answer,
        audioUrl: aiResponse.audioUrl,
      });
    } catch (error) {
      console.error("Error solving doubt:", error);
      res.status(500).json({ message: "Failed to solve doubt" });
    }
  });

  // Get user doubts
  app.get('/api/doubts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      const doubts = await storage.getUserDoubts(userId, limit);
      res.json(doubts);
    } catch (error) {
      console.error("Error fetching doubts:", error);
      res.status(500).json({ message: "Failed to fetch doubts" });
    }
  });

  // Content routes
  app.get('/api/subjects', async (req, res) => {
    try {
      const subjects = await storage.getSubjects();
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  app.get('/api/chapters', async (req, res) => {
    try {
      const { subjectId, class: userClass, board } = req.query;
      const chapters = await storage.getChaptersBySubject(
        parseInt(subjectId as string),
        userClass as string,
        board as string
      );
      res.json(chapters);
    } catch (error) {
      console.error("Error fetching chapters:", error);
      res.status(500).json({ message: "Failed to fetch chapters" });
    }
  });

  app.get('/api/videos', async (req, res) => {
    try {
      const { subjectId, chapterId, class: userClass, board } = req.query;
      const videos = await storage.getVideoLectures(
        subjectId ? parseInt(subjectId as string) : undefined,
        chapterId ? parseInt(chapterId as string) : undefined,
        userClass as string,
        board as string
      );
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  // Test routes
  app.get('/api/tests', async (req, res) => {
    try {
      const { subjectId, class: userClass, board } = req.query;
      const tests = await storage.getTests(
        subjectId ? parseInt(subjectId as string) : undefined,
        userClass as string,
        board as string
      );
      res.json(tests);
    } catch (error) {
      console.error("Error fetching tests:", error);
      res.status(500).json({ message: "Failed to fetch tests" });
    }
  });

  app.get('/api/tests/:id', async (req, res) => {
    try {
      const testId = parseInt(req.params.id);
      const test = await storage.getTestById(testId);
      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }
      res.json(test);
    } catch (error) {
      console.error("Error fetching test:", error);
      res.status(500).json({ message: "Failed to fetch test" });
    }
  });

  app.post('/api/tests/:id/attempt', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const testId = parseInt(req.params.id);
      
      const attemptData = insertTestAttemptSchema.parse({
        userId,
        testId,
        answers: req.body.answers,
        status: 'in_progress',
      });

      const attempt = await storage.createTestAttempt(attemptData);
      res.json(attempt);
    } catch (error) {
      console.error("Error creating test attempt:", error);
      res.status(500).json({ message: "Failed to create test attempt" });
    }
  });

  app.put('/api/test-attempts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const attemptId = parseInt(req.params.id);
      const { answers, score, timeTaken, status } = req.body;
      
      const attempt = await storage.updateTestAttempt(attemptId, {
        answers,
        score,
        timeTaken,
        status,
        completedAt: status === 'completed' ? new Date() : undefined,
      });

      // Update user stats if test completed
      if (status === 'completed') {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        await storage.updateUserProgress(userId, {
          testsCompleted: (user?.totalTestsCompleted || 0) + 1,
        });
      }

      res.json(attempt);
    } catch (error) {
      console.error("Error updating test attempt:", error);
      res.status(500).json({ message: "Failed to update test attempt" });
    }
  });

  // Previous year papers
  app.get('/api/previous-papers', async (req, res) => {
    try {
      const { subjectId, class: userClass, board, year } = req.query;
      const papers = await storage.getPreviousYearPapers(
        subjectId ? parseInt(subjectId as string) : undefined,
        userClass as string,
        board as string,
        year ? parseInt(year as string) : undefined
      );
      res.json(papers);
    } catch (error) {
      console.error("Error fetching previous papers:", error);
      res.status(500).json({ message: "Failed to fetch previous papers" });
    }
  });

  // Study plan routes
  app.get('/api/study-plans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const plans = await storage.getUserStudyPlans(userId);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching study plans:", error);
      res.status(500).json({ message: "Failed to fetch study plans" });
    }
  });

  app.post('/api/study-plans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const planData = insertStudyPlanSchema.parse({
        userId,
        ...req.body,
      });

      const plan = await storage.createStudyPlan(planData);
      res.json(plan);
    } catch (error) {
      console.error("Error creating study plan:", error);
      res.status(500).json({ message: "Failed to create study plan" });
    }
  });

  app.put('/api/study-plans/:id', isAuthenticated, async (req: any, res) => {
    try {
      const planId = parseInt(req.params.id);
      const plan = await storage.updateStudyPlan(planId, req.body);
      res.json(plan);
    } catch (error) {
      console.error("Error updating study plan:", error);
      res.status(500).json({ message: "Failed to update study plan" });
    }
  });

  // Forum routes
  app.get('/api/forum/posts', async (req, res) => {
    try {
      const { subjectId, class: userClass, board, limit } = req.query;
      const posts = await storage.getForumPosts(
        subjectId ? parseInt(subjectId as string) : undefined,
        userClass as string,
        board as string,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(posts);
    } catch (error) {
      console.error("Error fetching forum posts:", error);
      res.status(500).json({ message: "Failed to fetch forum posts" });
    }
  });

  app.post('/api/forum/posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postData = insertForumPostSchema.parse({
        userId,
        ...req.body,
      });

      const post = await storage.createForumPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Error creating forum post:", error);
      res.status(500).json({ message: "Failed to create forum post" });
    }
  });

  app.get('/api/forum/posts/:id/replies', async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const replies = await storage.getForumReplies(postId);
      res.json(replies);
    } catch (error) {
      console.error("Error fetching forum replies:", error);
      res.status(500).json({ message: "Failed to fetch forum replies" });
    }
  });

  app.post('/api/forum/posts/:id/replies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = parseInt(req.params.id);
      const replyData = insertForumReplySchema.parse({
        userId,
        postId,
        ...req.body,
      });

      const reply = await storage.createForumReply(replyData);
      res.json(reply);
    } catch (error) {
      console.error("Error creating forum reply:", error);
      res.status(500).json({ message: "Failed to create forum reply" });
    }
  });

  // Social media links
  app.get('/api/social-links', async (req, res) => {
    try {
      const links = await storage.getSocialMediaLinks();
      res.json(links);
    } catch (error) {
      console.error("Error fetching social links:", error);
      res.status(500).json({ message: "Failed to fetch social links" });
    }
  });

  // Content seeding route (for initial setup)
  app.post('/api/seed-content', async (req, res) => {
    try {
      await contentService.seedInitialContent();
      res.json({ message: "Content seeded successfully" });
    } catch (error) {
      console.error("Error seeding content:", error);
      res.status(500).json({ message: "Failed to seed content" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
