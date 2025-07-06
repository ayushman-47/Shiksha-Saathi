import { storage } from "../storage";

class ContentService {
  async seedInitialContent() {
    // Seed subjects
    const subjects = [
      { name: "Mathematics", nameHindi: "गणित", icon: "fas fa-calculator", color: "#FF6B35" },
      { name: "Science", nameHindi: "विज्ञान", icon: "fas fa-flask", color: "#2E86AB" },
      { name: "English", nameHindi: "अंग्रेजी", icon: "fas fa-book", color: "#A23B72" },
      { name: "Hindi", nameHindi: "हिंदी", icon: "fas fa-language", color: "#43AA8B" },
      { name: "Social Studies", nameHindi: "सामाजिक विज्ञान", icon: "fas fa-globe", color: "#F18F01" },
      { name: "Physics", nameHindi: "भौतिकी", icon: "fas fa-atom", color: "#007BFF" },
      { name: "Chemistry", nameHindi: "रसायन", icon: "fas fa-vial", color: "#28A745" },
      { name: "Biology", nameHindi: "जीव विज्ञान", icon: "fas fa-leaf", color: "#20C997" },
      { name: "History", nameHindi: "इतिहास", icon: "fas fa-scroll", color: "#6F42C1" },
      { name: "Geography", nameHindi: "भूगोल", icon: "fas fa-map", color: "#FD7E14" },
    ];

    for (const subject of subjects) {
      await storage.createSubject(subject);
    }

    // Seed sample chapters for Class 10 Mathematics
    const mathChapters = [
      { title: "Real Numbers", titleHindi: "वास्तविक संख्याएं", chapterNumber: 1 },
      { title: "Polynomials", titleHindi: "बहुपद", chapterNumber: 2 },
      { title: "Pair of Linear Equations", titleHindi: "दो चरों वाले रैखिक समीकरण", chapterNumber: 3 },
      { title: "Quadratic Equations", titleHindi: "द्विघात समीकरण", chapterNumber: 4 },
      { title: "Arithmetic Progressions", titleHindi: "समांतर श्रेढ़ी", chapterNumber: 5 },
      { title: "Triangles", titleHindi: "त्रिभुज", chapterNumber: 6 },
      { title: "Coordinate Geometry", titleHindi: "निर्देशांक ज्यामिति", chapterNumber: 7 },
      { title: "Trigonometry", titleHindi: "त्रिकोणमिति", chapterNumber: 8 },
      { title: "Circles", titleHindi: "वृत्त", chapterNumber: 9 },
      { title: "Areas and Volumes", titleHindi: "क्षेत्रफल और आयतन", chapterNumber: 10 },
    ];

    for (const chapter of mathChapters) {
      await storage.createChapter({
        ...chapter,
        subjectId: 1, // Mathematics
        class: "10",
        board: "CBSE",
        description: `Chapter ${chapter.chapterNumber}: ${chapter.title}`,
        pdfUrl: `https://example.com/pdfs/class10-math-chapter${chapter.chapterNumber}.pdf`,
      });
    }

    // Seed sample video lectures
    const videoLectures = [
      {
        title: "Introduction to Real Numbers",
        titleHindi: "वास्तविक संख्याओं का परिचय",
        description: "Understanding the concept of real numbers and their properties",
        videoUrl: "https://example.com/videos/real-numbers-intro.mp4",
        thumbnailUrl: "https://example.com/thumbnails/real-numbers.jpg",
        duration: 1800, // 30 minutes
        subjectId: 1,
        chapterId: 1,
        class: "10",
        board: "CBSE",
        language: "hi",
      },
      {
        title: "Solving Polynomials",
        titleHindi: "बहुपद हल करना",
        description: "Methods to solve polynomial equations",
        videoUrl: "https://example.com/videos/polynomials-solving.mp4",
        thumbnailUrl: "https://example.com/thumbnails/polynomials.jpg",
        duration: 2100, // 35 minutes
        subjectId: 1,
        chapterId: 2,
        class: "10",
        board: "CBSE",
        language: "hi",
      },
    ];

    for (const lecture of videoLectures) {
      await storage.createVideoLecture(lecture);
    }

    // Seed sample tests
    const sampleTest = {
      title: "Real Numbers - Practice Test",
      titleHindi: "वास्तविक संख्याएं - अभ्यास परीक्षा",
      description: "Practice test for Real Numbers chapter",
      subjectId: 1,
      chapterId: 1,
      class: "10",
      board: "CBSE",
      testType: "mcq",
      duration: 60,
      totalMarks: 50,
      passingMarks: 25,
      questions: [
        {
          id: 1,
          question: "Which of the following is a rational number?",
          options: ["√2", "π", "0.5", "√3"],
          correctAnswer: 2,
          marks: 2,
          explanation: "0.5 can be expressed as 1/2, making it a rational number."
        },
        {
          id: 2,
          question: "The decimal expansion of a rational number is:",
          options: ["Always terminating", "Always recurring", "Either terminating or recurring", "Always non-terminating"],
          correctAnswer: 2,
          marks: 2,
          explanation: "Rational numbers have decimal expansions that are either terminating or recurring."
        }
      ]
    };

    await storage.createTest(sampleTest);

    // Seed sample previous year papers
    const previousPapers = [
      {
        title: "CBSE Class 10 Mathematics - 2023",
        year: 2023,
        subjectId: 1,
        class: "10",
        board: "CBSE",
        pdfUrl: "https://example.com/papers/cbse-10-math-2023.pdf",
        solutionPdfUrl: "https://example.com/solutions/cbse-10-math-2023-solutions.pdf",
      },
      {
        title: "CBSE Class 10 Mathematics - 2022",
        year: 2022,
        subjectId: 1,
        class: "10",
        board: "CBSE",
        pdfUrl: "https://example.com/papers/cbse-10-math-2022.pdf",
        solutionPdfUrl: "https://example.com/solutions/cbse-10-math-2022-solutions.pdf",
      },
    ];

    for (const paper of previousPapers) {
      await storage.createPreviousYearPaper(paper);
    }

    // Seed social media links
    const socialLinks = [
      {
        platform: "telegram",
        url: "https://t.me/shikshaSaathi",
        icon: "fab fa-telegram-plane",
        isActive: true,
      },
      {
        platform: "instagram",
        url: "https://instagram.com/shikshaSaathi",
        icon: "fab fa-instagram",
        isActive: true,
      },
      {
        platform: "youtube",
        url: "https://youtube.com/shikshaSaathi",
        icon: "fab fa-youtube",
        isActive: true,
      },
      {
        platform: "whatsapp",
        url: "https://wa.me/919999999999",
        icon: "fab fa-whatsapp",
        isActive: true,
      },
    ];

    for (const link of socialLinks) {
      await storage.updateSocialMediaLink(1, link);
    }

    console.log("Initial content seeded successfully!");
  }
}

export const contentService = new ContentService();
