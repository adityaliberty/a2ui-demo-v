import { GoogleGenerativeAI } from "@google/generative-ai";
import { A2UIMessage } from "../../shared/types.js";
import { A2UIGenerator } from "../a2ui/generator.js";
import {
  fetchAssets,
  generateDashboardData,
  clearCache,
} from "../services/assetService.js";
import { ASSET_LIFECYCLE_SYSTEM_PROMPT } from "./assetPromptTemplate.js";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

interface ConversationContext {
  messages: Array<{ role: "user" | "model"; content: string }>;
  taskType: string;
  taskData: Record<string, any>;
}

export class GeminiAgent {
  private conversationContexts: Map<string, ConversationContext> = new Map();

  /**
   * Process user message and generate A2UI response using Gemini
   */
  async processMessage(
    userId: string,
    userMessage: string,
    surfaceId: string
  ): Promise<{
    text: string;
    a2uiMessages: A2UIMessage[];
    dashboardData?: any;
  }> {
    let context = this.conversationContexts.get(userId);
    if (!context) {
      context = {
        messages: [],
        taskType: "general",
        taskData: {},
      };
      this.conversationContexts.set(userId, context);
    }

    context.messages.push({ role: "user", content: userMessage });

    // Fetch assets and dashboard data
    const assets = await fetchAssets(userId);
    const dashboardData = await generateDashboardData(userId);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const today = new Date().toISOString();
    const systemPrompt = ASSET_LIFECYCLE_SYSTEM_PROMPT.replace(
      "{TODAY_DATE}",
      today
    );

    // Provide raw asset data for A2UI generation as requested in the mission
    const promptWithData = `${systemPrompt}\n\nINPUT ASSET DATA:\n${JSON.stringify(assets, null, 2)}`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: promptWithData }],
        },
        ...context.messages.map(msg => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        })),
      ],
    });

    let responseText = result.response.text();
    let parsedResponse;
    try {
      // The prompt asks for ONLY valid A2UI JSON, but we handle potential extra text or markdown
      if (responseText.includes("```json")) {
        responseText = responseText.split("```json")[1].split("```")[0].trim();
      } else if (responseText.includes("```")) {
        responseText = responseText.split("```")[1].split("```")[0].trim();
      }

      // Remove potential leading/trailing non-JSON characters
      const startIdx = responseText.indexOf("{");
      const endIdx = responseText.lastIndexOf("}");
      if (startIdx !== -1 && endIdx !== -1) {
        responseText = responseText.substring(startIdx, endIdx + 1);
      }

      parsedResponse = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse Gemini response as JSON:", responseText);
      return {
        text: "I'm sorry, I encountered an error generating the interface.",
        a2uiMessages: A2UIGenerator.errorCard(
          surfaceId,
          "Invalid response from AI"
        ),
      };
    }

    // Map the custom dashboard format to A2UI components
    // Inject the real dashboard data so it can be passed to the UI
    parsedResponse.fullData = dashboardData;
    const a2uiMessages: A2UIMessage[] = this.mapDashboardToA2UI(
      surfaceId,
      parsedResponse
    );

    const text =
      parsedResponse.summary ||
      "Here is your Asset Lifecycle Management Dashboard.";
    context.messages.push({ role: "model", content: text });

    return {
      text,
      a2uiMessages,
      dashboardData, // This is for the right-side dashboard panel
    };
  }

  /**
   * Map the custom dashboard JSON from the prompt to A2UI components
   */
  private mapDashboardToA2UI(surfaceId: string, dashboard: any): A2UIMessage[] {
    const components: any[] = [];
    const rootId = "root_container";

    // Root container
    components.push({
      id: rootId,
      type: "Column",
      properties: { title: dashboard.title },
      children: [],
    });

    // Add components from the dashboard JSON
    if (dashboard.components) {
      dashboard.components.forEach((comp: any, index: number) => {
        const compId = `comp_${index}`;

        // Map custom types to A2UI components with necessary properties
        components.push({
          id: compId,
          type: "Card",
          properties: {
            title: comp.title,
            data: comp.data,
            chartType: comp.type,
            columns: comp.columns, // For table components
            action: "show_dashboard",
            dashboardData: dashboard.fullData || dashboard, // Pass the dashboard data to be opened
          },
          children: [],
        });

        components.find(c => c.id === rootId).children.push(compId);
      });
    }

    return [
      A2UIGenerator.surfaceUpdate(surfaceId, components),
      A2UIGenerator.dataModelUpdate(surfaceId, {}),
      A2UIGenerator.beginRendering(surfaceId, rootId),
    ];
  }

  /**
   * Handle user action
   */
  async handleUserAction(
    userId: string,
    action: string,
    data: Record<string, any>,
    surfaceId: string
  ): Promise<{
    text: string;
    a2uiMessages: A2UIMessage[];
    dashboardData?: any;
  }> {
    // Similar logic to processMessage but with action context
    return this.processMessage(
      userId,
      `Action: ${action} with data: ${JSON.stringify(data)}`,
      surfaceId
    );
  }

  clearContext(userId: string): void {
    this.conversationContexts.delete(userId);
    clearCache(userId);
  }
}

export const geminiAgent = new GeminiAgent();
