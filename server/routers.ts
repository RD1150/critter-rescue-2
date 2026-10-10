import { z } from "zod";
import {
  actionInput,
  capacityInput,
  checkInInput,
  coachNoteInput,
  createTenantInput,
  generateRouteInput,
  intakeInput,
  inviteClientInput,
  rerouteInput,
  resolveRerouteInput,
  selectRerouteOptionInput,
  updateTenantInput,
} from "@shared/visionroute";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getTenantScope } from "./policies/authz";
import {
  acceptInvitation,
  addCoachNote,
  approveRoute,
  bootstrap,
  completeAction,
  completeIntake,
  createClientInvitation,
  createReroute,
  createWorkspace,
  exportClientData,
  generateRoute,
  getClientDetail,
  getCoachBrief,
  getCoachDashboard,
  getRerouteOptions,
  listNotifications,
  resolveReroute,
  selectRerouteOption,
  setCapacity,
  submitCheckIn,
  updateWorkspace,
} from "./services/visionroute";
import { createCheckoutSession, requestCancellation } from "./services/billing";

const tenantClientInput = z.object({ tenantId: z.string().uuid(), clientId: z.string().uuid() });

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  workspace: router({
    bootstrap: protectedProcedure.query(({ ctx }) => bootstrap(ctx.user)),
    create: protectedProcedure.input(createTenantInput).mutation(({ ctx, input }) => createWorkspace(ctx.user, input)),
    update: protectedProcedure.input(updateTenantInput).mutation(async ({ ctx, input }) => {
      const scope = await getTenantScope(ctx.user, input.tenantId);
      return updateWorkspace(scope, input);
    }),
    dashboard: protectedProcedure.input(z.object({ tenantId: z.string().uuid() })).query(async ({ ctx, input }) => getCoachDashboard(await getTenantScope(ctx.user, input.tenantId))),
    notifications: protectedProcedure.input(z.object({ tenantId: z.string().uuid() })).query(async ({ ctx, input }) => listNotifications(await getTenantScope(ctx.user, input.tenantId))),
    exportCsv: protectedProcedure.input(z.object({ tenantId: z.string().uuid() })).query(async ({ ctx, input }) => exportClientData(await getTenantScope(ctx.user, input.tenantId))),
  }),
  clients: router({
    createInvitation: protectedProcedure.input(inviteClientInput).mutation(async ({ ctx, input }) => createClientInvitation(await getTenantScope(ctx.user, input.tenantId), input)),
    acceptInvitation: protectedProcedure.input(z.object({ token: z.string().min(12).max(512) })).mutation(({ ctx, input }) => acceptInvitation(ctx.user, input.token)),
    detail: protectedProcedure.input(tenantClientInput).query(async ({ ctx, input }) => getClientDetail(await getTenantScope(ctx.user, input.tenantId), input.clientId)),
    completeIntake: protectedProcedure.input(intakeInput).mutation(async ({ ctx, input }) => completeIntake(await getTenantScope(ctx.user, input.tenantId), input)),
    setCapacity: protectedProcedure.input(capacityInput).mutation(async ({ ctx, input }) => setCapacity(await getTenantScope(ctx.user, input.tenantId), input.clientId, input.capacity)),
    addCoachNote: protectedProcedure.input(coachNoteInput).mutation(async ({ ctx, input }) => addCoachNote(await getTenantScope(ctx.user, input.tenantId), input.clientId, input.body)),
  }),
  planning: router({
    generateRoute: protectedProcedure.input(generateRouteInput).mutation(async ({ ctx, input }) => generateRoute(await getTenantScope(ctx.user, input.tenantId), input.clientId)),
    decideRoute: protectedProcedure.input(z.object({ tenantId: z.string().uuid(), routeId: z.string().uuid(), decision: z.enum(["approve", "reject"]) })).mutation(async ({ ctx, input }) => approveRoute(await getTenantScope(ctx.user, input.tenantId), input.routeId, input.decision)),
    completeAction: protectedProcedure.input(actionInput).mutation(async ({ ctx, input }) => completeAction(await getTenantScope(ctx.user, input.tenantId), input.actionId, input.notes)),
  }),
  checkins: router({
    submit: protectedProcedure.input(checkInInput).mutation(async ({ ctx, input }) => submitCheckIn(await getTenantScope(ctx.user, input.tenantId), input)),
  }),
  reroutes: router({
    create: protectedProcedure.input(rerouteInput).mutation(async ({ ctx, input }) => createReroute(await getTenantScope(ctx.user, input.tenantId), input.clientId, input.whatHappened, input.triggerType)),
    options: protectedProcedure.input(z.object({ tenantId: z.string().uuid(), rerouteId: z.string().uuid() })).query(async ({ ctx, input }) => getRerouteOptions(await getTenantScope(ctx.user, input.tenantId), input.rerouteId)),
    select: protectedProcedure.input(selectRerouteOptionInput).mutation(async ({ ctx, input }) => selectRerouteOption(await getTenantScope(ctx.user, input.tenantId), input.rerouteId, input.optionId)),
    resolve: protectedProcedure.input(resolveRerouteInput).mutation(async ({ ctx, input }) => resolveReroute(await getTenantScope(ctx.user, input.tenantId), input.rerouteId, input.optionId, input.decision)),
  }),
  briefs: router({
    get: protectedProcedure.input(tenantClientInput).query(async ({ ctx, input }) => getCoachBrief(await getTenantScope(ctx.user, input.tenantId), input.clientId)),
  }),
  billing: router({
    plans: protectedProcedure.query(() => ({
      monthly: { key: "visionroute_coach", name: "VisionRoute Coach", price: 9700, currency: "usd", interval: "month" },
      annual: { key: "visionroute_coach_annual", name: "VisionRoute Coach — Annual", price: 97000, currency: "usd", interval: "year", monthsFree: 2 },
      testMode: true,
    })),
    createCheckout: protectedProcedure.input(z.object({
      tenantId: z.string().uuid(),
      planKey: z.enum(["visionroute_coach", "visionroute_coach_annual"]),
      origin: z.string().url(),
    })).mutation(async ({ ctx, input }) => createCheckoutSession(await getTenantScope(ctx.user, input.tenantId), { ...input, requestOrigin: ctx.req.header("origin") ?? undefined })),
    requestCancellation: protectedProcedure.input(z.object({ tenantId: z.string().uuid() })).mutation(async ({ ctx, input }) => requestCancellation(await getTenantScope(ctx.user, input.tenantId))),
  }),
});

export type AppRouter = typeof appRouter;
