import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

interface GeminiContent {
  role: string;
  parts: { text: string }[];
}

interface GeminiResponse {
  candidates: {
    content: { parts: { text: string }[] };
    finishReason: string;
  }[];
}

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private http = inject(HttpClient);

  private readonly BASE_URL =
    `https://generativelanguage.googleapis.com/v1beta/models/${environment.geminiModel}:generateContent`;

  async chat(
    systemPrompt: string,
    history: GeminiContent[],
    userMessage: string
  ): Promise<string> {
    const key = environment.geminiApiKey;

    if (!key || key === 'YOUR_GEMINI_API_KEY_HERE') {
      // Fallback: return null so ChatService uses local engine
      return '';
    }

    const body = {
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        ...history.slice(-10),
        { role: 'user', parts: [{ text: userMessage }] },
      ],
      generationConfig: {
        temperature:     0.7,
        maxOutputTokens: 300,
        topP:            0.9,
      },
    };

    try {
      const res = await firstValueFrom(
        this.http.post<GeminiResponse>(`${this.BASE_URL}?key=${key}`, body)
      );
      return res.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
    } catch (err) {
      console.warn('[GeminiService] API error — falling back to local engine', err);
      return '';
    }
  }

  buildHistory(messages: { role: 'user' | 'ai'; text: string }[]): GeminiContent[] {
    return messages
      .filter(m => !m.text.includes('<')) // skip HTML-heavy messages
      .slice(-12)
      .map(m => ({
        role:  m.role === 'ai' ? 'model' : 'user',
        parts: [{ text: m.text.replace(/<[^>]+>/g, '') }],
      }));
  }
}
