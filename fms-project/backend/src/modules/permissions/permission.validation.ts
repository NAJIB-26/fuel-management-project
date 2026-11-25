import { z } from "zod";

export const updatePermissionSchema = z.object({
  isSystemAdmin: z.boolean().optional(),
  tabPermissions: z.array(z.string()).optional(),
  screenPermissions: z.array(z.string()).optional(),
  canAdd: z.boolean().optional(),
  canEdit: z.boolean().optional(),
  canPrint: z.boolean().optional(),
  canViewReports: z.boolean().optional(),
  canApproveLevel1: z.boolean().optional(),
  canApproveLevel2: z.boolean().optional(),
  financialApprovalLimit: z.number().nonnegative().nullable().optional(),
});
