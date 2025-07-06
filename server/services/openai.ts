import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

interface DoubtContext {
  subject?: number;
  class?: string;
  board?: string;
  language?: string;
}

interface AIResponse {
  answer: string;
  audioUrl?: string;
  model: string;
}

class AIService {
  async solveDoubt(
    question: string,
    questionType: string,
    questionImageUrl?: string,
    context?: DoubtContext
  ): Promise<AIResponse> {
    try {
      let prompt = this.buildPrompt(question, context);
      
      if (questionType === 'image' && questionImageUrl) {
        return await this.solveImageDoubt(questionImageUrl, prompt, context);
      } else {
        return await this.solveTextDoubt(question, prompt, context);
      }
    } catch (error) {
      console.error("Error solving doubt:", error);
      throw new Error("Failed to solve doubt. Please try again.");
    }
  }

  private buildPrompt(question: string, context?: DoubtContext): string {
    const language = context?.language || 'en';
    const languageInstruction = language === 'hi' ? 'Please respond in Hindi (Devanagari script)' : 'Please respond in English';
    
    return `You are Shiksha Saathi, an AI tutor for Indian students. 
    
Student Details:
- Class: ${context?.class || 'Not specified'}
- Board: ${context?.board || 'Not specified'}
- Subject: ${context?.subject || 'Not specified'}

Question: ${question}

Instructions:
1. ${languageInstruction}
2. Provide a detailed, step-by-step explanation suitable for the student's class level
3. Include relevant examples and analogies
4. Be encouraging and supportive
5. If it's a math/science problem, show the complete solution process
6. For conceptual questions, provide clear explanations with real-world connections
7. Always end with a summary or key takeaway

Please provide a comprehensive answer that helps the student understand the concept thoroughly.`;
  }

  private async solveTextDoubt(question: string, prompt: string, context?: DoubtContext): Promise<AIResponse> {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are Shiksha Saathi, a helpful AI tutor for Indian students. Provide detailed, educational responses."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const answer = response.choices[0].message.content || "I couldn't generate an answer. Please try again.";
    
    // Generate audio if language is supported
    let audioUrl: string | undefined;
    if (context?.language && ['hi', 'en'].includes(context.language)) {
      audioUrl = await this.generateAudio(answer, context.language);
    }

    return {
      answer,
      audioUrl,
      model: "gpt-4o"
    };
  }

  private async solveImageDoubt(imageUrl: string, prompt: string, context?: DoubtContext): Promise<AIResponse> {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const answer = response.choices[0].message.content || "I couldn't analyze the image. Please try again.";
    
    // Generate audio if language is supported
    let audioUrl: string | undefined;
    if (context?.language && ['hi', 'en'].includes(context.language)) {
      audioUrl = await this.generateAudio(answer, context.language);
    }

    return {
      answer,
      audioUrl,
      model: "gpt-4o"
    };
  }

  private async generateAudio(text: string, language: string): Promise<string> {
    try {
      // Use OpenAI's text-to-speech API
      const response = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: text,
        speed: 0.9,
      });

      // In a real implementation, you would:
      // 1. Convert the response to a file
      // 2. Upload to cloud storage (AWS S3, Google Cloud Storage, etc.)
      // 3. Return the public URL
      
      // For now, returning a placeholder URL
      // TODO: Implement actual audio file storage and return real URL
      return `https://example.com/audio/${Date.now()}.mp3`;
    } catch (error) {
      console.error("Error generating audio:", error);
      return undefined;
    }
  }

  async generateStudyPlan(
    userClass: string,
    board: string,
    subjects: string[],
    targetDate: string,
    currentLevel: string
  ): Promise<any> {
    try {
      const prompt = `Create a detailed study plan for an Indian student:
      
Class: ${userClass}
Board: ${board}
Subjects: ${subjects.join(', ')}
Target Date: ${targetDate}
Current Level: ${currentLevel}

Please provide a JSON response with:
1. Weekly breakdown of topics
2. Daily study schedule
3. Revision plan
4. Test schedule
5. Important chapters to focus on

Format the response as a JSON object with structured data.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an educational planning expert. Create comprehensive study plans for Indian students."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
        temperature: 0.3,
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error("Error generating study plan:", error);
      throw new Error("Failed to generate study plan");
    }
  }

  async generateCareerGuidance(
    userClass: string,
    subjects: string[],
    interests: string[],
    strengths: string[]
  ): Promise<any> {
    try {
      const prompt = `Provide career guidance for an Indian student:
      
Class: ${userClass}
Subjects: ${subjects.join(', ')}
Interests: ${interests.join(', ')}
Strengths: ${strengths.join(', ')}

Please provide a JSON response with:
1. Recommended career paths
2. Required subjects/skills
3. Entrance exams to focus on
4. Colleges/universities to consider
5. Industry trends and opportunities

Format the response as a JSON object with structured data.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a career counselor specializing in Indian education system and career opportunities."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
        temperature: 0.3,
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error("Error generating career guidance:", error);
      throw new Error("Failed to generate career guidance");
    }
  }
}

export const aiService = new AIService();
