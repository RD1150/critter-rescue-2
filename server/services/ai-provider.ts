import { coachBriefSchema, routePlanSchema, type CoachBrief, type RoutePlan } from "@shared/visionroute";
import { buildDeterministicRoute, type PlanningContext } from "./planning";
import { z } from "zod";

const checkInSummarySchema = z.object({ summary: z.string().min(1).max(700), risk: z.string().min(1).max(500) });

export type AIUsageResult<T> = {
  value: T;
  model: string;
  usage?: { promptTokens?: number; completionTokens?: number };
  usedFallback: boolean;
};

export interface AIProvider {
  generateRoute(context: PlanningContext): Promise<AIUsageResult<RoutePlan>>;
  summarizeCheckIn(input: { completedText: string; obstacleText?: string | null; changedText?: string | null; needsReroute: boolean }): Promise<AIUsageResult<{ summary: string; risk: string }>>;
  buildCoachBrief(input: { completedActions: number; totalActions: number; missedActions: number; checkInText?: string; notes: string[] }): Promise<AIUsageResult<CoachBrief>>;
}

/**
 * Feature-to-model mapping. Environment overrides let an operator change models without
 * touching route, check-in, reroute, or brief business logic.
 */
export const AI_MODEL_REGISTRY = {
  intake: process.env.VISIONROUTE_AI_MODEL_INTAKE || process.env.VISIONROUTE_AI_MODEL || "gpt-5-mini",
  route: process.env.VISIONROUTE_AI_MODEL_ROUTE || process.env.VISIONROUTE_AI_MODEL || "gpt-5-mini",
  checkin: process.env.VISIONROUTE_AI_MODEL_CHECKIN || process.env.VISIONROUTE_AI_MODEL || "gpt-5-mini",
  reroute: process.env.VISIONROUTE_AI_MODEL_REROUTE || process.env.VISIONROUTE_AI_MODEL || "gpt-5-mini",
  brief: process.env.VISIONROUTE_AI_MODEL_BRIEF || process.env.VISIONROUTE_AI_MODEL || "gpt-5-mini",
} as const;

function stripJsonFence(value: string) {
  return value.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
}

async function managedCompletion(model: string, system: string, user: string) {
  const base = process.env.MANUS_API_URL;
  const apiKey = process.env.MANUS_API_KEY;
  if (!base || !apiKey) return null;
  const response = await fetch(`${base.replace(/\/$/, "")}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      response_format: { type: "json_object" },
    }),
  });
  if (!response.ok) throw new Error(`Managed AI request failed with ${response.status}`);
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }>; usage?: { prompt_tokens?: number; completion_tokens?: number } };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("Managed AI response was empty");
  return {
    content: stripJsonFence(content),
    usage: { promptTokens: payload.usage?.prompt_tokens, completionTokens: payload.usage?.completion_tokens },
    model,
  };
}

export class VisionRouteAIProvider implements AIProvider {
  async generateRoute(context: PlanningContext): Promise<AIUsageResult<RoutePlan>> {
    try {
      const completion = await managedCompletion(
        AI_MODEL_REGISTRY.route,
        "You are VisionRoute's structured planning service. Return only JSON. Never give medical diagnosis, treatment, clearance, or safety claims. Create a practical route with Active, Maintain, Next and Park work.",
        JSON.stringify(context)
      );
      if (completion) {
        const parsed = routePlanSchema.safeParse(JSON.parse(completion.content));
        if (parsed.success) return { value: parsed.data, model: completion.model, usage: completion.usage, usedFallback: false };
      }
    } catch (error) {
      console.warn("[VisionRoute AI] Route generation fell back to deterministic planning", error instanceof Error ? error.message : "unknown error");
    }
    return { value: buildDeterministicRoute(context), model: "deterministic-v1", usedFallback: true };
  }

  async summarizeCheckIn(input: { completedText: string; obstacleText?: string | null; changedText?: string | null; needsReroute: boolean }): Promise<AIUsageResult<{ summary: string; risk: string }>> {
    const fallback = {
      summary: `Client reported: ${input.completedText.slice(0, 420)}`,
      risk: input.needsReroute ? "Client requested a reroute; coach review is recommended." : input.obstacleText ? "An obstacle was reported; review at the next session." : "No reroute requested.",
    };
    try {
      const completion = await managedCompletion(
        AI_MODEL_REGISTRY.checkin,
        "Summarize a coaching check-in as JSON with summary and risk. Preserve uncertainty, do not invent facts, and never give medical diagnosis, treatment, clearance, or safety claims.",
        JSON.stringify(input)
      );
      if (completion) {
        const parsed = checkInSummarySchema.safeParse(JSON.parse(completion.content));
        if (parsed.success) return { value: parsed.data, model: completion.model, usage: completion.usage, usedFallback: false };
      }
    } catch (error) {
      console.warn("[VisionRoute AI] Check-in summary fell back to deterministic handling", error instanceof Error ? error.message : "unknown error");
    }
    return { value: fallback, model: "deterministic-v1", usedFallback: true };
  }

  async buildCoachBrief(input: { completedActions: number; totalActions: number; missedActions: number; checkInText?: string; notes: string[] }): Promise<AIUsageResult<CoachBrief>> {
    const fallback: CoachBrief = {
      systemData: [`Completed ${input.completedActions} of ${input.totalActions} planned actions.`, `${input.missedActions} action${input.missedActions === 1 ? "" : "s"} currently marked missed.`],
      clientReported: input.checkInText ? [input.checkInText] : ["No client check-in has been submitted yet."],
      coachNotes: input.notes.length ? input.notes : ["No private coach notes recorded."],
      aiInterpretation: input.missedActions > 0 ? ["AI interpretation: missed work may be slowing the current route. This is an interpretation, not a fact."] : ["AI interpretation: completion is tracking steadily against the current route. This is an interpretation, not a fact."],
      suggestedDiscussion: input.missedActions > 0 ? "Explore what changed before adding more work, then decide whether to protect the destination or reroute." : "Confirm which execution condition is making progress easier and protect it for the next week.",
    };
    try {
      const completion = await managedCompletion(
        AI_MODEL_REGISTRY.brief,
        "Create a coach pre-session brief as JSON with systemData, clientReported, coachNotes, aiInterpretation and suggestedDiscussion. Keep source categories separate. Label interpretations as interpretation. Never give medical diagnosis, treatment, clearance, or safety claims.",
        JSON.stringify(input)
      );
      if (completion) {
        const parsed = coachBriefSchema.safeParse(JSON.parse(completion.content));
        if (parsed.success) return { value: parsed.data, model: completion.model, usage: completion.usage, usedFallback: false };
      }
    } catch (error) {
      console.warn("[VisionRoute AI] Coach brief fell back to deterministic handling", error instanceof Error ? error.message : "unknown error");
    }
    return { value: coachBriefSchema.parse(fallback), model: "deterministic-v1", usedFallback: true };
  }
}

export const aiProvider: AIProvider = new VisionRouteAIProvider();
