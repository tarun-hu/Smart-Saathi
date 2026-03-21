import { z } from 'zod';
import { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

// JSON
//------------------------------------------------------

export type NullableJsonInput = Prisma.JsonValue | null | 'JsonNull' | 'DbNull' | Prisma.NullTypes.DbNull | Prisma.NullTypes.JsonNull;

export const transformJsonNull = (v?: NullableJsonInput) => {
  if (!v || v === 'DbNull') return Prisma.NullTypes.DbNull;
  if (v === 'JsonNull') return Prisma.NullTypes.JsonNull;
  return v;
};

export const JsonValueSchema: z.ZodType<Prisma.JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.literal(null),
    z.record(z.string(), z.lazy(() => JsonValueSchema.optional())),
    z.array(z.lazy(() => JsonValueSchema)),
  ])
);

export type JsonValueType = z.infer<typeof JsonValueSchema>;

export const NullableJsonValue = z
  .union([JsonValueSchema, z.literal('DbNull'), z.literal('JsonNull')])
  .nullable()
  .transform((v) => transformJsonNull(v));

export type NullableJsonValueType = z.infer<typeof NullableJsonValue>;

export const InputJsonValueSchema: z.ZodType<Prisma.InputJsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.object({ toJSON: z.any() }),
    z.record(z.string(), z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
    z.array(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
  ])
);

export type InputJsonValueType = z.infer<typeof InputJsonValueSchema>;


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const UserScalarFieldEnumSchema = z.enum(['id','email','username','password','firstName','lastName','phoneNumber','role','homeId','workId']);

export const LocationScalarFieldEnumSchema = z.enum(['id','latitude','longitude','createdAt','userId']);

export const CareRelationScalarFieldEnumSchema = z.enum(['id','caregiverId','userId','createdAt']);

export const PairingTokenScalarFieldEnumSchema = z.enum(['id','token','createdAt','expiryAt','usedAt','caregiverId']);

export const MedicalRecordScalarFieldEnumSchema = z.enum(['id','patientId','gender','dateOfBirth','height','weight','incidentHistory','medicalHistory','geneticHistory','allergies','medications','createdAt','modifiedAt']);

export const ReminderScalarFieldEnumSchema = z.enum(['id','userId','type','interval','disabled','lastSent','nextAt']);

export const CheckInNoteScalarFieldEnumSchema = z.enum(['id','userId','status','message','createdAt']);

export const BugReportScalarFieldEnumSchema = z.enum(['id','userId','type','title','message']);

export const CustomReminderScalarFieldEnumSchema = z.enum(['id','title','message','interval','disabled','lastSent','nextAt','userId']);

export const AuditLogScalarFieldEnumSchema = z.enum(['id','actorId','targetId','target','action','summary','metadata','createdAt']);

export const NotificationScalarFieldEnumSchema = z.enum(['id','userId','type','title','message','readAt','sentAt','metadata']);

export const EmergencyContactScalarFieldEnumSchema = z.enum(['id','userId','name','phone','relation','priority','createdAt']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const NullableJsonNullValueInputSchema: z.ZodType<Prisma.NullableJsonNullValueInput> = z.enum(['DbNull','JsonNull',]).transform((value) => value === 'JsonNull' ? Prisma.JsonNull : value === 'DbNull' ? Prisma.DbNull : value);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const NullsOrderSchema = z.enum(['first','last']);

export const JsonNullValueFilterSchema: z.ZodType<Prisma.JsonNullValueFilter> = z.enum(['DbNull','JsonNull','AnyNull',]).transform((value) => value === 'JsonNull' ? Prisma.JsonNull : value === 'DbNull' ? Prisma.DbNull : value === 'AnyNull' ? Prisma.AnyNull : value);

export const RoleSchema = z.enum(['USER','ADMIN','CAREGIVER']);

export type RoleType = `${z.infer<typeof RoleSchema>}`

export const SexSchema = z.enum(['MALE','FEMALE','OTHER']);

export type SexType = `${z.infer<typeof SexSchema>}`

export const ReminderTypeSchema = z.enum(['HYDRATION','MEDICATION']);

export type ReminderTypeType = `${z.infer<typeof ReminderTypeSchema>}`

export const HealthStatusSchema = z.enum(['HEALTHY','NEUTRAL','RESTLESS','ILL','RECOVERING','CRITICAL']);

export type HealthStatusType = `${z.infer<typeof HealthStatusSchema>}`

export const ReportTypeSchema = z.enum(['IOS','ANDROID','WEB','OTHER']);

export type ReportTypeType = `${z.infer<typeof ReportTypeSchema>}`

export const NotificationTypeSchema = z.enum(['SOS','MISSED_MEDICATION','DEVICE_OFFLINE']);

export type NotificationTypeType = `${z.infer<typeof NotificationTypeSchema>}`

export const AuditActionSchema = z.enum(['CREATE','UPDATE','DELETE','LOGIN','LOGOUT','PAIR','UNPAIR','VIEW']);

export type AuditActionType = `${z.infer<typeof AuditActionSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  role: RoleSchema,
  id: z.uuid(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  homeId: z.number().int().nullable(),
  workId: z.number().int().nullable(),
})

export type User = z.infer<typeof UserSchema>

/////////////////////////////////////////
// LOCATION SCHEMA
/////////////////////////////////////////

export const LocationSchema = z.object({
  id: z.number().int(),
  latitude: z.number(),
  longitude: z.number(),
  createdAt: z.coerce.date(),
  userId: z.string(),
})

export type Location = z.infer<typeof LocationSchema>

/////////////////////////////////////////
// CARE RELATION SCHEMA
/////////////////////////////////////////

export const CareRelationSchema = z.object({
  id: z.number().int(),
  caregiverId: z.string(),
  userId: z.string(),
  createdAt: z.coerce.date(),
})

export type CareRelation = z.infer<typeof CareRelationSchema>

/////////////////////////////////////////
// PAIRING TOKEN SCHEMA
/////////////////////////////////////////

export const PairingTokenSchema = z.object({
  id: z.uuid(),
  token: z.string(),
  createdAt: z.coerce.date(),
  expiryAt: z.coerce.date(),
  usedAt: z.coerce.date().nullable(),
  caregiverId: z.string(),
})

export type PairingToken = z.infer<typeof PairingTokenSchema>

/////////////////////////////////////////
// MEDICAL RECORD SCHEMA
/////////////////////////////////////////

export const MedicalRecordSchema = z.object({
  gender: SexSchema,
  id: z.uuid(),
  patientId: z.string(),
  dateOfBirth: z.coerce.date(),
  height: z.number().nullable(),
  weight: z.number().nullable(),
  incidentHistory: z.string().nullable(),
  medicalHistory: z.string().nullable(),
  geneticHistory: z.string().nullable(),
  allergies: z.string().nullable(),
  medications: z.string().nullable(),
  createdAt: z.coerce.date(),
  modifiedAt: z.coerce.date(),
})

export type MedicalRecord = z.infer<typeof MedicalRecordSchema>

/////////////////////////////////////////
// REMINDER SCHEMA
/////////////////////////////////////////

export const ReminderSchema = z.object({
  type: ReminderTypeSchema,
  id: z.uuid(),
  userId: z.string(),
  interval: z.number().int(),
  disabled: z.boolean(),
  lastSent: z.coerce.date().nullable(),
  nextAt: z.coerce.date(),
})

export type Reminder = z.infer<typeof ReminderSchema>

/////////////////////////////////////////
// CHECK IN NOTE SCHEMA
/////////////////////////////////////////

export const CheckInNoteSchema = z.object({
  status: HealthStatusSchema,
  id: z.uuid(),
  userId: z.string(),
  message: z.string(),
  createdAt: z.coerce.date(),
})

export type CheckInNote = z.infer<typeof CheckInNoteSchema>

/////////////////////////////////////////
// BUG REPORT SCHEMA
/////////////////////////////////////////

export const BugReportSchema = z.object({
  type: ReportTypeSchema,
  id: z.uuid(),
  userId: z.string(),
  title: z.string(),
  message: z.string(),
})

export type BugReport = z.infer<typeof BugReportSchema>

/////////////////////////////////////////
// CUSTOM REMINDER SCHEMA
/////////////////////////////////////////

export const CustomReminderSchema = z.object({
  id: z.uuid(),
  title: z.string().nullable(),
  message: z.string(),
  interval: z.number().int().nullable(),
  disabled: z.boolean(),
  lastSent: z.coerce.date().nullable(),
  nextAt: z.coerce.date(),
  userId: z.string(),
})

export type CustomReminder = z.infer<typeof CustomReminderSchema>

/////////////////////////////////////////
// AUDIT LOG SCHEMA
/////////////////////////////////////////

export const AuditLogSchema = z.object({
  action: AuditActionSchema,
  id: z.uuid(),
  actorId: z.string().nullable(),
  targetId: z.string().nullable(),
  target: z.string(),
  summary: z.string(),
  metadata: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
})

export type AuditLog = z.infer<typeof AuditLogSchema>

/////////////////////////////////////////
// NOTIFICATION SCHEMA
/////////////////////////////////////////

export const NotificationSchema = z.object({
  type: NotificationTypeSchema,
  id: z.uuid(),
  userId: z.string(),
  title: z.string(),
  message: z.string(),
  readAt: z.coerce.date().nullable(),
  sentAt: z.coerce.date(),
  metadata: JsonValueSchema.nullable(),
})

export type Notification = z.infer<typeof NotificationSchema>

/////////////////////////////////////////
// EMERGENCY CONTACT SCHEMA
/////////////////////////////////////////

export const EmergencyContactSchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  name: z.string(),
  phone: z.string(),
  relation: z.string().nullable(),
  priority: z.number().int(),
  createdAt: z.coerce.date(),
})

export type EmergencyContact = z.infer<typeof EmergencyContactSchema>

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// USER
//------------------------------------------------------

export const UserIncludeSchema: z.ZodType<Prisma.UserInclude> = z.object({
  locations: z.union([z.boolean(),z.lazy(() => LocationFindManyArgsSchema)]).optional(),
  home: z.union([z.boolean(),z.lazy(() => LocationArgsSchema)]).optional(),
  work: z.union([z.boolean(),z.lazy(() => LocationArgsSchema)]).optional(),
  dependent: z.union([z.boolean(),z.lazy(() => CareRelationFindManyArgsSchema)]).optional(),
  caregiver: z.union([z.boolean(),z.lazy(() => CareRelationFindManyArgsSchema)]).optional(),
  pairingTokens: z.union([z.boolean(),z.lazy(() => PairingTokenFindManyArgsSchema)]).optional(),
  medicalRecords: z.union([z.boolean(),z.lazy(() => MedicalRecordFindManyArgsSchema)]).optional(),
  reminders: z.union([z.boolean(),z.lazy(() => ReminderFindManyArgsSchema)]).optional(),
  checkInNotes: z.union([z.boolean(),z.lazy(() => CheckInNoteFindManyArgsSchema)]).optional(),
  bugReports: z.union([z.boolean(),z.lazy(() => BugReportFindManyArgsSchema)]).optional(),
  customReminders: z.union([z.boolean(),z.lazy(() => CustomReminderFindManyArgsSchema)]).optional(),
  auditLogs: z.union([z.boolean(),z.lazy(() => AuditLogFindManyArgsSchema)]).optional(),
  notifications: z.union([z.boolean(),z.lazy(() => NotificationFindManyArgsSchema)]).optional(),
  emergencyContacts: z.union([z.boolean(),z.lazy(() => EmergencyContactFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict();

export const UserArgsSchema: z.ZodType<Prisma.UserDefaultArgs> = z.object({
  select: z.lazy(() => UserSelectSchema).optional(),
  include: z.lazy(() => UserIncludeSchema).optional(),
}).strict();

export const UserCountOutputTypeArgsSchema: z.ZodType<Prisma.UserCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => UserCountOutputTypeSelectSchema).nullish(),
}).strict();

export const UserCountOutputTypeSelectSchema: z.ZodType<Prisma.UserCountOutputTypeSelect> = z.object({
  locations: z.boolean().optional(),
  dependent: z.boolean().optional(),
  caregiver: z.boolean().optional(),
  pairingTokens: z.boolean().optional(),
  medicalRecords: z.boolean().optional(),
  reminders: z.boolean().optional(),
  checkInNotes: z.boolean().optional(),
  bugReports: z.boolean().optional(),
  customReminders: z.boolean().optional(),
  auditLogs: z.boolean().optional(),
  notifications: z.boolean().optional(),
  emergencyContacts: z.boolean().optional(),
}).strict();

export const UserSelectSchema: z.ZodType<Prisma.UserSelect> = z.object({
  id: z.boolean().optional(),
  email: z.boolean().optional(),
  username: z.boolean().optional(),
  password: z.boolean().optional(),
  firstName: z.boolean().optional(),
  lastName: z.boolean().optional(),
  phoneNumber: z.boolean().optional(),
  role: z.boolean().optional(),
  homeId: z.boolean().optional(),
  workId: z.boolean().optional(),
  locations: z.union([z.boolean(),z.lazy(() => LocationFindManyArgsSchema)]).optional(),
  home: z.union([z.boolean(),z.lazy(() => LocationArgsSchema)]).optional(),
  work: z.union([z.boolean(),z.lazy(() => LocationArgsSchema)]).optional(),
  dependent: z.union([z.boolean(),z.lazy(() => CareRelationFindManyArgsSchema)]).optional(),
  caregiver: z.union([z.boolean(),z.lazy(() => CareRelationFindManyArgsSchema)]).optional(),
  pairingTokens: z.union([z.boolean(),z.lazy(() => PairingTokenFindManyArgsSchema)]).optional(),
  medicalRecords: z.union([z.boolean(),z.lazy(() => MedicalRecordFindManyArgsSchema)]).optional(),
  reminders: z.union([z.boolean(),z.lazy(() => ReminderFindManyArgsSchema)]).optional(),
  checkInNotes: z.union([z.boolean(),z.lazy(() => CheckInNoteFindManyArgsSchema)]).optional(),
  bugReports: z.union([z.boolean(),z.lazy(() => BugReportFindManyArgsSchema)]).optional(),
  customReminders: z.union([z.boolean(),z.lazy(() => CustomReminderFindManyArgsSchema)]).optional(),
  auditLogs: z.union([z.boolean(),z.lazy(() => AuditLogFindManyArgsSchema)]).optional(),
  notifications: z.union([z.boolean(),z.lazy(() => NotificationFindManyArgsSchema)]).optional(),
  emergencyContacts: z.union([z.boolean(),z.lazy(() => EmergencyContactFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict()

// LOCATION
//------------------------------------------------------

export const LocationIncludeSchema: z.ZodType<Prisma.LocationInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  homeOf: z.union([z.boolean(),z.lazy(() => UserFindManyArgsSchema)]).optional(),
  workOf: z.union([z.boolean(),z.lazy(() => UserFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => LocationCountOutputTypeArgsSchema)]).optional(),
}).strict();

export const LocationArgsSchema: z.ZodType<Prisma.LocationDefaultArgs> = z.object({
  select: z.lazy(() => LocationSelectSchema).optional(),
  include: z.lazy(() => LocationIncludeSchema).optional(),
}).strict();

export const LocationCountOutputTypeArgsSchema: z.ZodType<Prisma.LocationCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => LocationCountOutputTypeSelectSchema).nullish(),
}).strict();

export const LocationCountOutputTypeSelectSchema: z.ZodType<Prisma.LocationCountOutputTypeSelect> = z.object({
  homeOf: z.boolean().optional(),
  workOf: z.boolean().optional(),
}).strict();

export const LocationSelectSchema: z.ZodType<Prisma.LocationSelect> = z.object({
  id: z.boolean().optional(),
  latitude: z.boolean().optional(),
  longitude: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  userId: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  homeOf: z.union([z.boolean(),z.lazy(() => UserFindManyArgsSchema)]).optional(),
  workOf: z.union([z.boolean(),z.lazy(() => UserFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => LocationCountOutputTypeArgsSchema)]).optional(),
}).strict()

// CARE RELATION
//------------------------------------------------------

export const CareRelationIncludeSchema: z.ZodType<Prisma.CareRelationInclude> = z.object({
  caregiver: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict();

export const CareRelationArgsSchema: z.ZodType<Prisma.CareRelationDefaultArgs> = z.object({
  select: z.lazy(() => CareRelationSelectSchema).optional(),
  include: z.lazy(() => CareRelationIncludeSchema).optional(),
}).strict();

export const CareRelationSelectSchema: z.ZodType<Prisma.CareRelationSelect> = z.object({
  id: z.boolean().optional(),
  caregiverId: z.boolean().optional(),
  userId: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  caregiver: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// PAIRING TOKEN
//------------------------------------------------------

export const PairingTokenIncludeSchema: z.ZodType<Prisma.PairingTokenInclude> = z.object({
  caregiver: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict();

export const PairingTokenArgsSchema: z.ZodType<Prisma.PairingTokenDefaultArgs> = z.object({
  select: z.lazy(() => PairingTokenSelectSchema).optional(),
  include: z.lazy(() => PairingTokenIncludeSchema).optional(),
}).strict();

export const PairingTokenSelectSchema: z.ZodType<Prisma.PairingTokenSelect> = z.object({
  id: z.boolean().optional(),
  token: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  expiryAt: z.boolean().optional(),
  usedAt: z.boolean().optional(),
  caregiverId: z.boolean().optional(),
  caregiver: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// MEDICAL RECORD
//------------------------------------------------------

export const MedicalRecordIncludeSchema: z.ZodType<Prisma.MedicalRecordInclude> = z.object({
  patient: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict();

export const MedicalRecordArgsSchema: z.ZodType<Prisma.MedicalRecordDefaultArgs> = z.object({
  select: z.lazy(() => MedicalRecordSelectSchema).optional(),
  include: z.lazy(() => MedicalRecordIncludeSchema).optional(),
}).strict();

export const MedicalRecordSelectSchema: z.ZodType<Prisma.MedicalRecordSelect> = z.object({
  id: z.boolean().optional(),
  patientId: z.boolean().optional(),
  gender: z.boolean().optional(),
  dateOfBirth: z.boolean().optional(),
  height: z.boolean().optional(),
  weight: z.boolean().optional(),
  incidentHistory: z.boolean().optional(),
  medicalHistory: z.boolean().optional(),
  geneticHistory: z.boolean().optional(),
  allergies: z.boolean().optional(),
  medications: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  modifiedAt: z.boolean().optional(),
  patient: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// REMINDER
//------------------------------------------------------

export const ReminderIncludeSchema: z.ZodType<Prisma.ReminderInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict();

export const ReminderArgsSchema: z.ZodType<Prisma.ReminderDefaultArgs> = z.object({
  select: z.lazy(() => ReminderSelectSchema).optional(),
  include: z.lazy(() => ReminderIncludeSchema).optional(),
}).strict();

export const ReminderSelectSchema: z.ZodType<Prisma.ReminderSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  type: z.boolean().optional(),
  interval: z.boolean().optional(),
  disabled: z.boolean().optional(),
  lastSent: z.boolean().optional(),
  nextAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// CHECK IN NOTE
//------------------------------------------------------

export const CheckInNoteIncludeSchema: z.ZodType<Prisma.CheckInNoteInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict();

export const CheckInNoteArgsSchema: z.ZodType<Prisma.CheckInNoteDefaultArgs> = z.object({
  select: z.lazy(() => CheckInNoteSelectSchema).optional(),
  include: z.lazy(() => CheckInNoteIncludeSchema).optional(),
}).strict();

export const CheckInNoteSelectSchema: z.ZodType<Prisma.CheckInNoteSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  status: z.boolean().optional(),
  message: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// BUG REPORT
//------------------------------------------------------

export const BugReportIncludeSchema: z.ZodType<Prisma.BugReportInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict();

export const BugReportArgsSchema: z.ZodType<Prisma.BugReportDefaultArgs> = z.object({
  select: z.lazy(() => BugReportSelectSchema).optional(),
  include: z.lazy(() => BugReportIncludeSchema).optional(),
}).strict();

export const BugReportSelectSchema: z.ZodType<Prisma.BugReportSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  type: z.boolean().optional(),
  title: z.boolean().optional(),
  message: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// CUSTOM REMINDER
//------------------------------------------------------

export const CustomReminderIncludeSchema: z.ZodType<Prisma.CustomReminderInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict();

export const CustomReminderArgsSchema: z.ZodType<Prisma.CustomReminderDefaultArgs> = z.object({
  select: z.lazy(() => CustomReminderSelectSchema).optional(),
  include: z.lazy(() => CustomReminderIncludeSchema).optional(),
}).strict();

export const CustomReminderSelectSchema: z.ZodType<Prisma.CustomReminderSelect> = z.object({
  id: z.boolean().optional(),
  title: z.boolean().optional(),
  message: z.boolean().optional(),
  interval: z.boolean().optional(),
  disabled: z.boolean().optional(),
  lastSent: z.boolean().optional(),
  nextAt: z.boolean().optional(),
  userId: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// AUDIT LOG
//------------------------------------------------------

export const AuditLogIncludeSchema: z.ZodType<Prisma.AuditLogInclude> = z.object({
  actor: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict();

export const AuditLogArgsSchema: z.ZodType<Prisma.AuditLogDefaultArgs> = z.object({
  select: z.lazy(() => AuditLogSelectSchema).optional(),
  include: z.lazy(() => AuditLogIncludeSchema).optional(),
}).strict();

export const AuditLogSelectSchema: z.ZodType<Prisma.AuditLogSelect> = z.object({
  id: z.boolean().optional(),
  actorId: z.boolean().optional(),
  targetId: z.boolean().optional(),
  target: z.boolean().optional(),
  action: z.boolean().optional(),
  summary: z.boolean().optional(),
  metadata: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  actor: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// NOTIFICATION
//------------------------------------------------------

export const NotificationIncludeSchema: z.ZodType<Prisma.NotificationInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict();

export const NotificationArgsSchema: z.ZodType<Prisma.NotificationDefaultArgs> = z.object({
  select: z.lazy(() => NotificationSelectSchema).optional(),
  include: z.lazy(() => NotificationIncludeSchema).optional(),
}).strict();

export const NotificationSelectSchema: z.ZodType<Prisma.NotificationSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  type: z.boolean().optional(),
  title: z.boolean().optional(),
  message: z.boolean().optional(),
  readAt: z.boolean().optional(),
  sentAt: z.boolean().optional(),
  metadata: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// EMERGENCY CONTACT
//------------------------------------------------------

export const EmergencyContactIncludeSchema: z.ZodType<Prisma.EmergencyContactInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict();

export const EmergencyContactArgsSchema: z.ZodType<Prisma.EmergencyContactDefaultArgs> = z.object({
  select: z.lazy(() => EmergencyContactSelectSchema).optional(),
  include: z.lazy(() => EmergencyContactIncludeSchema).optional(),
}).strict();

export const EmergencyContactSelectSchema: z.ZodType<Prisma.EmergencyContactSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  name: z.boolean().optional(),
  phone: z.boolean().optional(),
  relation: z.boolean().optional(),
  priority: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()


/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const UserWhereInputSchema: z.ZodType<Prisma.UserWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  email: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  username: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  password: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  firstName: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  lastName: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  phoneNumber: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  role: z.union([ z.lazy(() => EnumRoleFilterSchema), z.lazy(() => RoleSchema) ]).optional(),
  homeId: z.union([ z.lazy(() => IntNullableFilterSchema), z.number() ]).optional().nullable(),
  workId: z.union([ z.lazy(() => IntNullableFilterSchema), z.number() ]).optional().nullable(),
  locations: z.lazy(() => LocationListRelationFilterSchema).optional(),
  home: z.union([ z.lazy(() => LocationNullableScalarRelationFilterSchema), z.lazy(() => LocationWhereInputSchema) ]).optional().nullable(),
  work: z.union([ z.lazy(() => LocationNullableScalarRelationFilterSchema), z.lazy(() => LocationWhereInputSchema) ]).optional().nullable(),
  dependent: z.lazy(() => CareRelationListRelationFilterSchema).optional(),
  caregiver: z.lazy(() => CareRelationListRelationFilterSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenListRelationFilterSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordListRelationFilterSchema).optional(),
  reminders: z.lazy(() => ReminderListRelationFilterSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteListRelationFilterSchema).optional(),
  bugReports: z.lazy(() => BugReportListRelationFilterSchema).optional(),
  customReminders: z.lazy(() => CustomReminderListRelationFilterSchema).optional(),
  auditLogs: z.lazy(() => AuditLogListRelationFilterSchema).optional(),
  notifications: z.lazy(() => NotificationListRelationFilterSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactListRelationFilterSchema).optional(),
});

export const UserOrderByWithRelationInputSchema: z.ZodType<Prisma.UserOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  username: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  phoneNumber: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  homeId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  workId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  locations: z.lazy(() => LocationOrderByRelationAggregateInputSchema).optional(),
  home: z.lazy(() => LocationOrderByWithRelationInputSchema).optional(),
  work: z.lazy(() => LocationOrderByWithRelationInputSchema).optional(),
  dependent: z.lazy(() => CareRelationOrderByRelationAggregateInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationOrderByRelationAggregateInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenOrderByRelationAggregateInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordOrderByRelationAggregateInputSchema).optional(),
  reminders: z.lazy(() => ReminderOrderByRelationAggregateInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteOrderByRelationAggregateInputSchema).optional(),
  bugReports: z.lazy(() => BugReportOrderByRelationAggregateInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderOrderByRelationAggregateInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogOrderByRelationAggregateInputSchema).optional(),
  notifications: z.lazy(() => NotificationOrderByRelationAggregateInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactOrderByRelationAggregateInputSchema).optional(),
});

export const UserWhereUniqueInputSchema: z.ZodType<Prisma.UserWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    email: z.email({ message: "Invalid email format" }),
    username: z.string(),
  }),
  z.object({
    id: z.uuid(),
    email: z.email({ message: "Invalid email format" }),
  }),
  z.object({
    id: z.uuid(),
    username: z.string(),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    email: z.email({ message: "Invalid email format" }),
    username: z.string(),
  }),
  z.object({
    email: z.email({ message: "Invalid email format" }),
  }),
  z.object({
    username: z.string(),
  }),
])
.and(z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }).optional(),
  username: z.string().optional(),
  AND: z.union([ z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  password: z.union([ z.lazy(() => StringFilterSchema), z.string().min(8, { message: "Password must be at least 8 characters" }) ]).optional(),
  firstName: z.union([ z.lazy(() => StringFilterSchema), z.string().min(1, { message: "First name is required" }) ]).optional(),
  lastName: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  phoneNumber: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  role: z.union([ z.lazy(() => EnumRoleFilterSchema), z.lazy(() => RoleSchema) ]).optional(),
  homeId: z.union([ z.lazy(() => IntNullableFilterSchema), z.number().int() ]).optional().nullable(),
  workId: z.union([ z.lazy(() => IntNullableFilterSchema), z.number().int() ]).optional().nullable(),
  locations: z.lazy(() => LocationListRelationFilterSchema).optional(),
  home: z.union([ z.lazy(() => LocationNullableScalarRelationFilterSchema), z.lazy(() => LocationWhereInputSchema) ]).optional().nullable(),
  work: z.union([ z.lazy(() => LocationNullableScalarRelationFilterSchema), z.lazy(() => LocationWhereInputSchema) ]).optional().nullable(),
  dependent: z.lazy(() => CareRelationListRelationFilterSchema).optional(),
  caregiver: z.lazy(() => CareRelationListRelationFilterSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenListRelationFilterSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordListRelationFilterSchema).optional(),
  reminders: z.lazy(() => ReminderListRelationFilterSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteListRelationFilterSchema).optional(),
  bugReports: z.lazy(() => BugReportListRelationFilterSchema).optional(),
  customReminders: z.lazy(() => CustomReminderListRelationFilterSchema).optional(),
  auditLogs: z.lazy(() => AuditLogListRelationFilterSchema).optional(),
  notifications: z.lazy(() => NotificationListRelationFilterSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactListRelationFilterSchema).optional(),
}));

export const UserOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  username: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  phoneNumber: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  homeId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  workId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => UserCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => UserAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => UserSumOrderByAggregateInputSchema).optional(),
});

export const UserScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema), z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema), z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  email: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  username: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  password: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  firstName: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  lastName: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  phoneNumber: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  role: z.union([ z.lazy(() => EnumRoleWithAggregatesFilterSchema), z.lazy(() => RoleSchema) ]).optional(),
  homeId: z.union([ z.lazy(() => IntNullableWithAggregatesFilterSchema), z.number() ]).optional().nullable(),
  workId: z.union([ z.lazy(() => IntNullableWithAggregatesFilterSchema), z.number() ]).optional().nullable(),
});

export const LocationWhereInputSchema: z.ZodType<Prisma.LocationWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => LocationWhereInputSchema), z.lazy(() => LocationWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => LocationWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => LocationWhereInputSchema), z.lazy(() => LocationWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  latitude: z.union([ z.lazy(() => FloatFilterSchema), z.number() ]).optional(),
  longitude: z.union([ z.lazy(() => FloatFilterSchema), z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
  homeOf: z.lazy(() => UserListRelationFilterSchema).optional(),
  workOf: z.lazy(() => UserListRelationFilterSchema).optional(),
});

export const LocationOrderByWithRelationInputSchema: z.ZodType<Prisma.LocationOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  latitude: z.lazy(() => SortOrderSchema).optional(),
  longitude: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  homeOf: z.lazy(() => UserOrderByRelationAggregateInputSchema).optional(),
  workOf: z.lazy(() => UserOrderByRelationAggregateInputSchema).optional(),
});

export const LocationWhereUniqueInputSchema: z.ZodType<Prisma.LocationWhereUniqueInput> = z.object({
  id: z.number().int(),
})
.and(z.strictObject({
  id: z.number().int().optional(),
  AND: z.union([ z.lazy(() => LocationWhereInputSchema), z.lazy(() => LocationWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => LocationWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => LocationWhereInputSchema), z.lazy(() => LocationWhereInputSchema).array() ]).optional(),
  latitude: z.union([ z.lazy(() => FloatFilterSchema), z.number() ]).optional(),
  longitude: z.union([ z.lazy(() => FloatFilterSchema), z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
  homeOf: z.lazy(() => UserListRelationFilterSchema).optional(),
  workOf: z.lazy(() => UserListRelationFilterSchema).optional(),
}));

export const LocationOrderByWithAggregationInputSchema: z.ZodType<Prisma.LocationOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  latitude: z.lazy(() => SortOrderSchema).optional(),
  longitude: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => LocationCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => LocationAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => LocationMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => LocationMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => LocationSumOrderByAggregateInputSchema).optional(),
});

export const LocationScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.LocationScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => LocationScalarWhereWithAggregatesInputSchema), z.lazy(() => LocationScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => LocationScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => LocationScalarWhereWithAggregatesInputSchema), z.lazy(() => LocationScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  latitude: z.union([ z.lazy(() => FloatWithAggregatesFilterSchema), z.number() ]).optional(),
  longitude: z.union([ z.lazy(() => FloatWithAggregatesFilterSchema), z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
});

export const CareRelationWhereInputSchema: z.ZodType<Prisma.CareRelationWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CareRelationWhereInputSchema), z.lazy(() => CareRelationWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CareRelationWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CareRelationWhereInputSchema), z.lazy(() => CareRelationWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  caregiverId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  caregiver: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
});

export const CareRelationOrderByWithRelationInputSchema: z.ZodType<Prisma.CareRelationOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  caregiverId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  caregiver: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
});

export const CareRelationWhereUniqueInputSchema: z.ZodType<Prisma.CareRelationWhereUniqueInput> = z.union([
  z.object({
    id: z.number().int(),
    caregiverId_userId: z.lazy(() => CareRelationCaregiverIdUserIdCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.number().int(),
  }),
  z.object({
    caregiverId_userId: z.lazy(() => CareRelationCaregiverIdUserIdCompoundUniqueInputSchema),
  }),
])
.and(z.strictObject({
  id: z.number().int().optional(),
  caregiverId_userId: z.lazy(() => CareRelationCaregiverIdUserIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => CareRelationWhereInputSchema), z.lazy(() => CareRelationWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CareRelationWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CareRelationWhereInputSchema), z.lazy(() => CareRelationWhereInputSchema).array() ]).optional(),
  caregiverId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  caregiver: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
}));

export const CareRelationOrderByWithAggregationInputSchema: z.ZodType<Prisma.CareRelationOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  caregiverId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => CareRelationCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => CareRelationAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => CareRelationMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => CareRelationMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => CareRelationSumOrderByAggregateInputSchema).optional(),
});

export const CareRelationScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.CareRelationScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CareRelationScalarWhereWithAggregatesInputSchema), z.lazy(() => CareRelationScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => CareRelationScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CareRelationScalarWhereWithAggregatesInputSchema), z.lazy(() => CareRelationScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  caregiverId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export const PairingTokenWhereInputSchema: z.ZodType<Prisma.PairingTokenWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => PairingTokenWhereInputSchema), z.lazy(() => PairingTokenWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PairingTokenWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PairingTokenWhereInputSchema), z.lazy(() => PairingTokenWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  token: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  expiryAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  usedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  caregiverId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  caregiver: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
});

export const PairingTokenOrderByWithRelationInputSchema: z.ZodType<Prisma.PairingTokenOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  expiryAt: z.lazy(() => SortOrderSchema).optional(),
  usedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  caregiverId: z.lazy(() => SortOrderSchema).optional(),
  caregiver: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
});

export const PairingTokenWhereUniqueInputSchema: z.ZodType<Prisma.PairingTokenWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    token: z.string(),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    token: z.string(),
  }),
])
.and(z.strictObject({
  id: z.uuid().optional(),
  token: z.string().optional(),
  AND: z.union([ z.lazy(() => PairingTokenWhereInputSchema), z.lazy(() => PairingTokenWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PairingTokenWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PairingTokenWhereInputSchema), z.lazy(() => PairingTokenWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  expiryAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  usedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  caregiverId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  caregiver: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
}));

export const PairingTokenOrderByWithAggregationInputSchema: z.ZodType<Prisma.PairingTokenOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  expiryAt: z.lazy(() => SortOrderSchema).optional(),
  usedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  caregiverId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => PairingTokenCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => PairingTokenMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => PairingTokenMinOrderByAggregateInputSchema).optional(),
});

export const PairingTokenScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.PairingTokenScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => PairingTokenScalarWhereWithAggregatesInputSchema), z.lazy(() => PairingTokenScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => PairingTokenScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PairingTokenScalarWhereWithAggregatesInputSchema), z.lazy(() => PairingTokenScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  token: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  expiryAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  usedAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
  caregiverId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
});

export const MedicalRecordWhereInputSchema: z.ZodType<Prisma.MedicalRecordWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => MedicalRecordWhereInputSchema), z.lazy(() => MedicalRecordWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => MedicalRecordWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => MedicalRecordWhereInputSchema), z.lazy(() => MedicalRecordWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  patientId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  gender: z.union([ z.lazy(() => EnumSexFilterSchema), z.lazy(() => SexSchema) ]).optional(),
  dateOfBirth: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  height: z.union([ z.lazy(() => FloatNullableFilterSchema), z.number() ]).optional().nullable(),
  weight: z.union([ z.lazy(() => FloatNullableFilterSchema), z.number() ]).optional().nullable(),
  incidentHistory: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  medicalHistory: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  geneticHistory: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  allergies: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  medications: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  modifiedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  patient: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
});

export const MedicalRecordOrderByWithRelationInputSchema: z.ZodType<Prisma.MedicalRecordOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  patientId: z.lazy(() => SortOrderSchema).optional(),
  gender: z.lazy(() => SortOrderSchema).optional(),
  dateOfBirth: z.lazy(() => SortOrderSchema).optional(),
  height: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  weight: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  incidentHistory: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  medicalHistory: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  geneticHistory: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  allergies: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  medications: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  modifiedAt: z.lazy(() => SortOrderSchema).optional(),
  patient: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
});

export const MedicalRecordWhereUniqueInputSchema: z.ZodType<Prisma.MedicalRecordWhereUniqueInput> = z.object({
  id: z.uuid(),
})
.and(z.strictObject({
  id: z.uuid().optional(),
  AND: z.union([ z.lazy(() => MedicalRecordWhereInputSchema), z.lazy(() => MedicalRecordWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => MedicalRecordWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => MedicalRecordWhereInputSchema), z.lazy(() => MedicalRecordWhereInputSchema).array() ]).optional(),
  patientId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  gender: z.union([ z.lazy(() => EnumSexFilterSchema), z.lazy(() => SexSchema) ]).optional(),
  dateOfBirth: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  height: z.union([ z.lazy(() => FloatNullableFilterSchema), z.number() ]).optional().nullable(),
  weight: z.union([ z.lazy(() => FloatNullableFilterSchema), z.number() ]).optional().nullable(),
  incidentHistory: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  medicalHistory: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  geneticHistory: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  allergies: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  medications: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  modifiedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  patient: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
}));

export const MedicalRecordOrderByWithAggregationInputSchema: z.ZodType<Prisma.MedicalRecordOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  patientId: z.lazy(() => SortOrderSchema).optional(),
  gender: z.lazy(() => SortOrderSchema).optional(),
  dateOfBirth: z.lazy(() => SortOrderSchema).optional(),
  height: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  weight: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  incidentHistory: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  medicalHistory: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  geneticHistory: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  allergies: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  medications: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  modifiedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => MedicalRecordCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => MedicalRecordAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => MedicalRecordMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => MedicalRecordMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => MedicalRecordSumOrderByAggregateInputSchema).optional(),
});

export const MedicalRecordScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.MedicalRecordScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => MedicalRecordScalarWhereWithAggregatesInputSchema), z.lazy(() => MedicalRecordScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => MedicalRecordScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => MedicalRecordScalarWhereWithAggregatesInputSchema), z.lazy(() => MedicalRecordScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  patientId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  gender: z.union([ z.lazy(() => EnumSexWithAggregatesFilterSchema), z.lazy(() => SexSchema) ]).optional(),
  dateOfBirth: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  height: z.union([ z.lazy(() => FloatNullableWithAggregatesFilterSchema), z.number() ]).optional().nullable(),
  weight: z.union([ z.lazy(() => FloatNullableWithAggregatesFilterSchema), z.number() ]).optional().nullable(),
  incidentHistory: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  medicalHistory: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  geneticHistory: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  allergies: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  medications: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  modifiedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export const ReminderWhereInputSchema: z.ZodType<Prisma.ReminderWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => ReminderWhereInputSchema), z.lazy(() => ReminderWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReminderWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReminderWhereInputSchema), z.lazy(() => ReminderWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  type: z.union([ z.lazy(() => EnumReminderTypeFilterSchema), z.lazy(() => ReminderTypeSchema) ]).optional(),
  interval: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  disabled: z.union([ z.lazy(() => BoolFilterSchema), z.boolean() ]).optional(),
  lastSent: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  nextAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
});

export const ReminderOrderByWithRelationInputSchema: z.ZodType<Prisma.ReminderOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  interval: z.lazy(() => SortOrderSchema).optional(),
  disabled: z.lazy(() => SortOrderSchema).optional(),
  lastSent: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  nextAt: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
});

export const ReminderWhereUniqueInputSchema: z.ZodType<Prisma.ReminderWhereUniqueInput> = z.object({
  id: z.uuid(),
})
.and(z.strictObject({
  id: z.uuid().optional(),
  AND: z.union([ z.lazy(() => ReminderWhereInputSchema), z.lazy(() => ReminderWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReminderWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReminderWhereInputSchema), z.lazy(() => ReminderWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  type: z.union([ z.lazy(() => EnumReminderTypeFilterSchema), z.lazy(() => ReminderTypeSchema) ]).optional(),
  interval: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  disabled: z.union([ z.lazy(() => BoolFilterSchema), z.boolean() ]).optional(),
  lastSent: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  nextAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
}));

export const ReminderOrderByWithAggregationInputSchema: z.ZodType<Prisma.ReminderOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  interval: z.lazy(() => SortOrderSchema).optional(),
  disabled: z.lazy(() => SortOrderSchema).optional(),
  lastSent: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  nextAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ReminderCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => ReminderAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ReminderMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ReminderMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => ReminderSumOrderByAggregateInputSchema).optional(),
});

export const ReminderScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ReminderScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => ReminderScalarWhereWithAggregatesInputSchema), z.lazy(() => ReminderScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReminderScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReminderScalarWhereWithAggregatesInputSchema), z.lazy(() => ReminderScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  type: z.union([ z.lazy(() => EnumReminderTypeWithAggregatesFilterSchema), z.lazy(() => ReminderTypeSchema) ]).optional(),
  interval: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  disabled: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema), z.boolean() ]).optional(),
  lastSent: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
  nextAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export const CheckInNoteWhereInputSchema: z.ZodType<Prisma.CheckInNoteWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CheckInNoteWhereInputSchema), z.lazy(() => CheckInNoteWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CheckInNoteWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CheckInNoteWhereInputSchema), z.lazy(() => CheckInNoteWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  status: z.union([ z.lazy(() => EnumHealthStatusFilterSchema), z.lazy(() => HealthStatusSchema) ]).optional(),
  message: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
});

export const CheckInNoteOrderByWithRelationInputSchema: z.ZodType<Prisma.CheckInNoteOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
});

export const CheckInNoteWhereUniqueInputSchema: z.ZodType<Prisma.CheckInNoteWhereUniqueInput> = z.object({
  id: z.uuid(),
})
.and(z.strictObject({
  id: z.uuid().optional(),
  AND: z.union([ z.lazy(() => CheckInNoteWhereInputSchema), z.lazy(() => CheckInNoteWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CheckInNoteWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CheckInNoteWhereInputSchema), z.lazy(() => CheckInNoteWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  status: z.union([ z.lazy(() => EnumHealthStatusFilterSchema), z.lazy(() => HealthStatusSchema) ]).optional(),
  message: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
}));

export const CheckInNoteOrderByWithAggregationInputSchema: z.ZodType<Prisma.CheckInNoteOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => CheckInNoteCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => CheckInNoteMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => CheckInNoteMinOrderByAggregateInputSchema).optional(),
});

export const CheckInNoteScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.CheckInNoteScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CheckInNoteScalarWhereWithAggregatesInputSchema), z.lazy(() => CheckInNoteScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => CheckInNoteScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CheckInNoteScalarWhereWithAggregatesInputSchema), z.lazy(() => CheckInNoteScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  status: z.union([ z.lazy(() => EnumHealthStatusWithAggregatesFilterSchema), z.lazy(() => HealthStatusSchema) ]).optional(),
  message: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export const BugReportWhereInputSchema: z.ZodType<Prisma.BugReportWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => BugReportWhereInputSchema), z.lazy(() => BugReportWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BugReportWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BugReportWhereInputSchema), z.lazy(() => BugReportWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  type: z.union([ z.lazy(() => EnumReportTypeFilterSchema), z.lazy(() => ReportTypeSchema) ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  message: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
});

export const BugReportOrderByWithRelationInputSchema: z.ZodType<Prisma.BugReportOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
});

export const BugReportWhereUniqueInputSchema: z.ZodType<Prisma.BugReportWhereUniqueInput> = z.object({
  id: z.uuid(),
})
.and(z.strictObject({
  id: z.uuid().optional(),
  AND: z.union([ z.lazy(() => BugReportWhereInputSchema), z.lazy(() => BugReportWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BugReportWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BugReportWhereInputSchema), z.lazy(() => BugReportWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  type: z.union([ z.lazy(() => EnumReportTypeFilterSchema), z.lazy(() => ReportTypeSchema) ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  message: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
}));

export const BugReportOrderByWithAggregationInputSchema: z.ZodType<Prisma.BugReportOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => BugReportCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => BugReportMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => BugReportMinOrderByAggregateInputSchema).optional(),
});

export const BugReportScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.BugReportScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => BugReportScalarWhereWithAggregatesInputSchema), z.lazy(() => BugReportScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => BugReportScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BugReportScalarWhereWithAggregatesInputSchema), z.lazy(() => BugReportScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  type: z.union([ z.lazy(() => EnumReportTypeWithAggregatesFilterSchema), z.lazy(() => ReportTypeSchema) ]).optional(),
  title: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  message: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
});

export const CustomReminderWhereInputSchema: z.ZodType<Prisma.CustomReminderWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CustomReminderWhereInputSchema), z.lazy(() => CustomReminderWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CustomReminderWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CustomReminderWhereInputSchema), z.lazy(() => CustomReminderWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  title: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  message: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  interval: z.union([ z.lazy(() => IntNullableFilterSchema), z.number() ]).optional().nullable(),
  disabled: z.union([ z.lazy(() => BoolFilterSchema), z.boolean() ]).optional(),
  lastSent: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  nextAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
});

export const CustomReminderOrderByWithRelationInputSchema: z.ZodType<Prisma.CustomReminderOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
  interval: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  disabled: z.lazy(() => SortOrderSchema).optional(),
  lastSent: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  nextAt: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
});

export const CustomReminderWhereUniqueInputSchema: z.ZodType<Prisma.CustomReminderWhereUniqueInput> = z.object({
  id: z.uuid(),
})
.and(z.strictObject({
  id: z.uuid().optional(),
  AND: z.union([ z.lazy(() => CustomReminderWhereInputSchema), z.lazy(() => CustomReminderWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CustomReminderWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CustomReminderWhereInputSchema), z.lazy(() => CustomReminderWhereInputSchema).array() ]).optional(),
  title: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  message: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  interval: z.union([ z.lazy(() => IntNullableFilterSchema), z.number().int() ]).optional().nullable(),
  disabled: z.union([ z.lazy(() => BoolFilterSchema), z.boolean() ]).optional(),
  lastSent: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  nextAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
}));

export const CustomReminderOrderByWithAggregationInputSchema: z.ZodType<Prisma.CustomReminderOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
  interval: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  disabled: z.lazy(() => SortOrderSchema).optional(),
  lastSent: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  nextAt: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => CustomReminderCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => CustomReminderAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => CustomReminderMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => CustomReminderMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => CustomReminderSumOrderByAggregateInputSchema).optional(),
});

export const CustomReminderScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.CustomReminderScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CustomReminderScalarWhereWithAggregatesInputSchema), z.lazy(() => CustomReminderScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => CustomReminderScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CustomReminderScalarWhereWithAggregatesInputSchema), z.lazy(() => CustomReminderScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  title: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  message: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  interval: z.union([ z.lazy(() => IntNullableWithAggregatesFilterSchema), z.number() ]).optional().nullable(),
  disabled: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema), z.boolean() ]).optional(),
  lastSent: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
  nextAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
});

export const AuditLogWhereInputSchema: z.ZodType<Prisma.AuditLogWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => AuditLogWhereInputSchema), z.lazy(() => AuditLogWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AuditLogWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AuditLogWhereInputSchema), z.lazy(() => AuditLogWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  actorId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  targetId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  target: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  action: z.union([ z.lazy(() => EnumAuditActionFilterSchema), z.lazy(() => AuditActionSchema) ]).optional(),
  summary: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  actor: z.union([ z.lazy(() => UserNullableScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
});

export const AuditLogOrderByWithRelationInputSchema: z.ZodType<Prisma.AuditLogOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  actorId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  targetId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  target: z.lazy(() => SortOrderSchema).optional(),
  action: z.lazy(() => SortOrderSchema).optional(),
  summary: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  actor: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
});

export const AuditLogWhereUniqueInputSchema: z.ZodType<Prisma.AuditLogWhereUniqueInput> = z.object({
  id: z.uuid(),
})
.and(z.strictObject({
  id: z.uuid().optional(),
  AND: z.union([ z.lazy(() => AuditLogWhereInputSchema), z.lazy(() => AuditLogWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AuditLogWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AuditLogWhereInputSchema), z.lazy(() => AuditLogWhereInputSchema).array() ]).optional(),
  actorId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  targetId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  target: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  action: z.union([ z.lazy(() => EnumAuditActionFilterSchema), z.lazy(() => AuditActionSchema) ]).optional(),
  summary: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  actor: z.union([ z.lazy(() => UserNullableScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
}));

export const AuditLogOrderByWithAggregationInputSchema: z.ZodType<Prisma.AuditLogOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  actorId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  targetId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  target: z.lazy(() => SortOrderSchema).optional(),
  action: z.lazy(() => SortOrderSchema).optional(),
  summary: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => AuditLogCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => AuditLogMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => AuditLogMinOrderByAggregateInputSchema).optional(),
});

export const AuditLogScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.AuditLogScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => AuditLogScalarWhereWithAggregatesInputSchema), z.lazy(() => AuditLogScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => AuditLogScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AuditLogScalarWhereWithAggregatesInputSchema), z.lazy(() => AuditLogScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  actorId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  targetId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  target: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  action: z.union([ z.lazy(() => EnumAuditActionWithAggregatesFilterSchema), z.lazy(() => AuditActionSchema) ]).optional(),
  summary: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  metadata: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export const NotificationWhereInputSchema: z.ZodType<Prisma.NotificationWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => NotificationWhereInputSchema), z.lazy(() => NotificationWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => NotificationWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => NotificationWhereInputSchema), z.lazy(() => NotificationWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  type: z.union([ z.lazy(() => EnumNotificationTypeFilterSchema), z.lazy(() => NotificationTypeSchema) ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  message: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  readAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  sentAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
});

export const NotificationOrderByWithRelationInputSchema: z.ZodType<Prisma.NotificationOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
  readAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  sentAt: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
});

export const NotificationWhereUniqueInputSchema: z.ZodType<Prisma.NotificationWhereUniqueInput> = z.object({
  id: z.uuid(),
})
.and(z.strictObject({
  id: z.uuid().optional(),
  AND: z.union([ z.lazy(() => NotificationWhereInputSchema), z.lazy(() => NotificationWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => NotificationWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => NotificationWhereInputSchema), z.lazy(() => NotificationWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  type: z.union([ z.lazy(() => EnumNotificationTypeFilterSchema), z.lazy(() => NotificationTypeSchema) ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  message: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  readAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  sentAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
}));

export const NotificationOrderByWithAggregationInputSchema: z.ZodType<Prisma.NotificationOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
  readAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  sentAt: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => NotificationCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => NotificationMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => NotificationMinOrderByAggregateInputSchema).optional(),
});

export const NotificationScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.NotificationScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => NotificationScalarWhereWithAggregatesInputSchema), z.lazy(() => NotificationScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => NotificationScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => NotificationScalarWhereWithAggregatesInputSchema), z.lazy(() => NotificationScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  type: z.union([ z.lazy(() => EnumNotificationTypeWithAggregatesFilterSchema), z.lazy(() => NotificationTypeSchema) ]).optional(),
  title: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  message: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  readAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
  sentAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  metadata: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
});

export const EmergencyContactWhereInputSchema: z.ZodType<Prisma.EmergencyContactWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => EmergencyContactWhereInputSchema), z.lazy(() => EmergencyContactWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EmergencyContactWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EmergencyContactWhereInputSchema), z.lazy(() => EmergencyContactWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  phone: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  relation: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  priority: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
});

export const EmergencyContactOrderByWithRelationInputSchema: z.ZodType<Prisma.EmergencyContactOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  phone: z.lazy(() => SortOrderSchema).optional(),
  relation: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  priority: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
});

export const EmergencyContactWhereUniqueInputSchema: z.ZodType<Prisma.EmergencyContactWhereUniqueInput> = z.object({
  id: z.uuid(),
})
.and(z.strictObject({
  id: z.uuid().optional(),
  AND: z.union([ z.lazy(() => EmergencyContactWhereInputSchema), z.lazy(() => EmergencyContactWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EmergencyContactWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EmergencyContactWhereInputSchema), z.lazy(() => EmergencyContactWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  phone: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  relation: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  priority: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
}));

export const EmergencyContactOrderByWithAggregationInputSchema: z.ZodType<Prisma.EmergencyContactOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  phone: z.lazy(() => SortOrderSchema).optional(),
  relation: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  priority: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => EmergencyContactCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => EmergencyContactAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => EmergencyContactMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => EmergencyContactMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => EmergencyContactSumOrderByAggregateInputSchema).optional(),
});

export const EmergencyContactScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.EmergencyContactScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => EmergencyContactScalarWhereWithAggregatesInputSchema), z.lazy(() => EmergencyContactScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => EmergencyContactScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EmergencyContactScalarWhereWithAggregatesInputSchema), z.lazy(() => EmergencyContactScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  phone: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  relation: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  priority: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export const UserCreateInputSchema: z.ZodType<Prisma.UserCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  locations: z.lazy(() => LocationCreateNestedManyWithoutUserInputSchema).optional(),
  home: z.lazy(() => LocationCreateNestedOneWithoutHomeOfInputSchema).optional(),
  work: z.lazy(() => LocationCreateNestedOneWithoutWorkOfInputSchema).optional(),
  dependent: z.lazy(() => CareRelationCreateNestedManyWithoutCaregiverInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationCreateNestedManyWithoutUserInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenCreateNestedManyWithoutCaregiverInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordCreateNestedManyWithoutPatientInputSchema).optional(),
  reminders: z.lazy(() => ReminderCreateNestedManyWithoutUserInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteCreateNestedManyWithoutUserInputSchema).optional(),
  bugReports: z.lazy(() => BugReportCreateNestedManyWithoutUserInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogCreateNestedManyWithoutActorInputSchema).optional(),
  notifications: z.lazy(() => NotificationCreateNestedManyWithoutUserInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserUncheckedCreateInputSchema: z.ZodType<Prisma.UserUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  homeId: z.number().int().optional().nullable(),
  workId: z.number().int().optional().nullable(),
  locations: z.lazy(() => LocationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUncheckedCreateNestedManyWithoutCaregiverInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUncheckedCreateNestedManyWithoutCaregiverInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUncheckedCreateNestedManyWithoutPatientInputSchema).optional(),
  reminders: z.lazy(() => ReminderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedCreateNestedManyWithoutActorInputSchema).optional(),
  notifications: z.lazy(() => NotificationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserUpdateInputSchema: z.ZodType<Prisma.UserUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  locations: z.lazy(() => LocationUpdateManyWithoutUserNestedInputSchema).optional(),
  home: z.lazy(() => LocationUpdateOneWithoutHomeOfNestedInputSchema).optional(),
  work: z.lazy(() => LocationUpdateOneWithoutWorkOfNestedInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUpdateManyWithoutUserNestedInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUpdateManyWithoutPatientNestedInputSchema).optional(),
  reminders: z.lazy(() => ReminderUpdateManyWithoutUserNestedInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUpdateManyWithoutUserNestedInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUpdateManyWithoutUserNestedInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUpdateManyWithoutActorNestedInputSchema).optional(),
  notifications: z.lazy(() => NotificationUpdateManyWithoutUserNestedInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserUncheckedUpdateInputSchema: z.ZodType<Prisma.UserUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  homeId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  workId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locations: z.lazy(() => LocationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUncheckedUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUncheckedUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUncheckedUpdateManyWithoutPatientNestedInputSchema).optional(),
  reminders: z.lazy(() => ReminderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedUpdateManyWithoutActorNestedInputSchema).optional(),
  notifications: z.lazy(() => NotificationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserCreateManyInputSchema: z.ZodType<Prisma.UserCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  homeId: z.number().int().optional().nullable(),
  workId: z.number().int().optional().nullable(),
});

export const UserUpdateManyMutationInputSchema: z.ZodType<Prisma.UserUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
});

export const UserUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  homeId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  workId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const LocationCreateInputSchema: z.ZodType<Prisma.LocationCreateInput> = z.strictObject({
  latitude: z.number(),
  longitude: z.number(),
  createdAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutLocationsInputSchema),
  homeOf: z.lazy(() => UserCreateNestedManyWithoutHomeInputSchema).optional(),
  workOf: z.lazy(() => UserCreateNestedManyWithoutWorkInputSchema).optional(),
});

export const LocationUncheckedCreateInputSchema: z.ZodType<Prisma.LocationUncheckedCreateInput> = z.strictObject({
  id: z.number().int().optional(),
  latitude: z.number(),
  longitude: z.number(),
  createdAt: z.coerce.date().optional(),
  userId: z.string(),
  homeOf: z.lazy(() => UserUncheckedCreateNestedManyWithoutHomeInputSchema).optional(),
  workOf: z.lazy(() => UserUncheckedCreateNestedManyWithoutWorkInputSchema).optional(),
});

export const LocationUpdateInputSchema: z.ZodType<Prisma.LocationUpdateInput> = z.strictObject({
  latitude: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  longitude: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutLocationsNestedInputSchema).optional(),
  homeOf: z.lazy(() => UserUpdateManyWithoutHomeNestedInputSchema).optional(),
  workOf: z.lazy(() => UserUpdateManyWithoutWorkNestedInputSchema).optional(),
});

export const LocationUncheckedUpdateInputSchema: z.ZodType<Prisma.LocationUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  latitude: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  longitude: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  homeOf: z.lazy(() => UserUncheckedUpdateManyWithoutHomeNestedInputSchema).optional(),
  workOf: z.lazy(() => UserUncheckedUpdateManyWithoutWorkNestedInputSchema).optional(),
});

export const LocationCreateManyInputSchema: z.ZodType<Prisma.LocationCreateManyInput> = z.strictObject({
  id: z.number().int().optional(),
  latitude: z.number(),
  longitude: z.number(),
  createdAt: z.coerce.date().optional(),
  userId: z.string(),
});

export const LocationUpdateManyMutationInputSchema: z.ZodType<Prisma.LocationUpdateManyMutationInput> = z.strictObject({
  latitude: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  longitude: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const LocationUncheckedUpdateManyInputSchema: z.ZodType<Prisma.LocationUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  latitude: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  longitude: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CareRelationCreateInputSchema: z.ZodType<Prisma.CareRelationCreateInput> = z.strictObject({
  createdAt: z.coerce.date().optional(),
  caregiver: z.lazy(() => UserCreateNestedOneWithoutDependentInputSchema),
  user: z.lazy(() => UserCreateNestedOneWithoutCaregiverInputSchema),
});

export const CareRelationUncheckedCreateInputSchema: z.ZodType<Prisma.CareRelationUncheckedCreateInput> = z.strictObject({
  id: z.number().int().optional(),
  caregiverId: z.string(),
  userId: z.string(),
  createdAt: z.coerce.date().optional(),
});

export const CareRelationUpdateInputSchema: z.ZodType<Prisma.CareRelationUpdateInput> = z.strictObject({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  caregiver: z.lazy(() => UserUpdateOneRequiredWithoutDependentNestedInputSchema).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutCaregiverNestedInputSchema).optional(),
});

export const CareRelationUncheckedUpdateInputSchema: z.ZodType<Prisma.CareRelationUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  caregiverId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CareRelationCreateManyInputSchema: z.ZodType<Prisma.CareRelationCreateManyInput> = z.strictObject({
  id: z.number().int().optional(),
  caregiverId: z.string(),
  userId: z.string(),
  createdAt: z.coerce.date().optional(),
});

export const CareRelationUpdateManyMutationInputSchema: z.ZodType<Prisma.CareRelationUpdateManyMutationInput> = z.strictObject({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CareRelationUncheckedUpdateManyInputSchema: z.ZodType<Prisma.CareRelationUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  caregiverId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const PairingTokenCreateInputSchema: z.ZodType<Prisma.PairingTokenCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  token: z.string(),
  createdAt: z.coerce.date().optional(),
  expiryAt: z.coerce.date(),
  usedAt: z.coerce.date().optional().nullable(),
  caregiver: z.lazy(() => UserCreateNestedOneWithoutPairingTokensInputSchema),
});

export const PairingTokenUncheckedCreateInputSchema: z.ZodType<Prisma.PairingTokenUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  token: z.string(),
  createdAt: z.coerce.date().optional(),
  expiryAt: z.coerce.date(),
  usedAt: z.coerce.date().optional().nullable(),
  caregiverId: z.string(),
});

export const PairingTokenUpdateInputSchema: z.ZodType<Prisma.PairingTokenUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  expiryAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  usedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  caregiver: z.lazy(() => UserUpdateOneRequiredWithoutPairingTokensNestedInputSchema).optional(),
});

export const PairingTokenUncheckedUpdateInputSchema: z.ZodType<Prisma.PairingTokenUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  expiryAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  usedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  caregiverId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
});

export const PairingTokenCreateManyInputSchema: z.ZodType<Prisma.PairingTokenCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  token: z.string(),
  createdAt: z.coerce.date().optional(),
  expiryAt: z.coerce.date(),
  usedAt: z.coerce.date().optional().nullable(),
  caregiverId: z.string(),
});

export const PairingTokenUpdateManyMutationInputSchema: z.ZodType<Prisma.PairingTokenUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  expiryAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  usedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const PairingTokenUncheckedUpdateManyInputSchema: z.ZodType<Prisma.PairingTokenUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  expiryAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  usedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  caregiverId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
});

export const MedicalRecordCreateInputSchema: z.ZodType<Prisma.MedicalRecordCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  gender: z.lazy(() => SexSchema),
  dateOfBirth: z.coerce.date(),
  height: z.number().optional().nullable(),
  weight: z.number().optional().nullable(),
  incidentHistory: z.string().optional().nullable(),
  medicalHistory: z.string().optional().nullable(),
  geneticHistory: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  medications: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  modifiedAt: z.coerce.date().optional(),
  patient: z.lazy(() => UserCreateNestedOneWithoutMedicalRecordsInputSchema),
});

export const MedicalRecordUncheckedCreateInputSchema: z.ZodType<Prisma.MedicalRecordUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  patientId: z.string(),
  gender: z.lazy(() => SexSchema),
  dateOfBirth: z.coerce.date(),
  height: z.number().optional().nullable(),
  weight: z.number().optional().nullable(),
  incidentHistory: z.string().optional().nullable(),
  medicalHistory: z.string().optional().nullable(),
  geneticHistory: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  medications: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  modifiedAt: z.coerce.date().optional(),
});

export const MedicalRecordUpdateInputSchema: z.ZodType<Prisma.MedicalRecordUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  gender: z.union([ z.lazy(() => SexSchema), z.lazy(() => EnumSexFieldUpdateOperationsInputSchema) ]).optional(),
  dateOfBirth: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  height: z.union([ z.number(),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  weight: z.union([ z.number(),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  incidentHistory: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  medicalHistory: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  geneticHistory: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  allergies: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  medications: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  modifiedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  patient: z.lazy(() => UserUpdateOneRequiredWithoutMedicalRecordsNestedInputSchema).optional(),
});

export const MedicalRecordUncheckedUpdateInputSchema: z.ZodType<Prisma.MedicalRecordUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  patientId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  gender: z.union([ z.lazy(() => SexSchema), z.lazy(() => EnumSexFieldUpdateOperationsInputSchema) ]).optional(),
  dateOfBirth: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  height: z.union([ z.number(),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  weight: z.union([ z.number(),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  incidentHistory: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  medicalHistory: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  geneticHistory: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  allergies: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  medications: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  modifiedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const MedicalRecordCreateManyInputSchema: z.ZodType<Prisma.MedicalRecordCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  patientId: z.string(),
  gender: z.lazy(() => SexSchema),
  dateOfBirth: z.coerce.date(),
  height: z.number().optional().nullable(),
  weight: z.number().optional().nullable(),
  incidentHistory: z.string().optional().nullable(),
  medicalHistory: z.string().optional().nullable(),
  geneticHistory: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  medications: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  modifiedAt: z.coerce.date().optional(),
});

export const MedicalRecordUpdateManyMutationInputSchema: z.ZodType<Prisma.MedicalRecordUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  gender: z.union([ z.lazy(() => SexSchema), z.lazy(() => EnumSexFieldUpdateOperationsInputSchema) ]).optional(),
  dateOfBirth: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  height: z.union([ z.number(),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  weight: z.union([ z.number(),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  incidentHistory: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  medicalHistory: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  geneticHistory: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  allergies: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  medications: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  modifiedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const MedicalRecordUncheckedUpdateManyInputSchema: z.ZodType<Prisma.MedicalRecordUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  patientId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  gender: z.union([ z.lazy(() => SexSchema), z.lazy(() => EnumSexFieldUpdateOperationsInputSchema) ]).optional(),
  dateOfBirth: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  height: z.union([ z.number(),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  weight: z.union([ z.number(),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  incidentHistory: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  medicalHistory: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  geneticHistory: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  allergies: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  medications: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  modifiedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const ReminderCreateInputSchema: z.ZodType<Prisma.ReminderCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  type: z.lazy(() => ReminderTypeSchema),
  interval: z.number().int(),
  disabled: z.boolean().optional(),
  lastSent: z.coerce.date().optional().nullable(),
  nextAt: z.coerce.date(),
  user: z.lazy(() => UserCreateNestedOneWithoutRemindersInputSchema),
});

export const ReminderUncheckedCreateInputSchema: z.ZodType<Prisma.ReminderUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  type: z.lazy(() => ReminderTypeSchema),
  interval: z.number().int(),
  disabled: z.boolean().optional(),
  lastSent: z.coerce.date().optional().nullable(),
  nextAt: z.coerce.date(),
});

export const ReminderUpdateInputSchema: z.ZodType<Prisma.ReminderUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ReminderTypeSchema), z.lazy(() => EnumReminderTypeFieldUpdateOperationsInputSchema) ]).optional(),
  interval: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  disabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  lastSent: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  nextAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutRemindersNestedInputSchema).optional(),
});

export const ReminderUncheckedUpdateInputSchema: z.ZodType<Prisma.ReminderUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ReminderTypeSchema), z.lazy(() => EnumReminderTypeFieldUpdateOperationsInputSchema) ]).optional(),
  interval: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  disabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  lastSent: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  nextAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const ReminderCreateManyInputSchema: z.ZodType<Prisma.ReminderCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  type: z.lazy(() => ReminderTypeSchema),
  interval: z.number().int(),
  disabled: z.boolean().optional(),
  lastSent: z.coerce.date().optional().nullable(),
  nextAt: z.coerce.date(),
});

export const ReminderUpdateManyMutationInputSchema: z.ZodType<Prisma.ReminderUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ReminderTypeSchema), z.lazy(() => EnumReminderTypeFieldUpdateOperationsInputSchema) ]).optional(),
  interval: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  disabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  lastSent: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  nextAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const ReminderUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ReminderUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ReminderTypeSchema), z.lazy(() => EnumReminderTypeFieldUpdateOperationsInputSchema) ]).optional(),
  interval: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  disabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  lastSent: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  nextAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CheckInNoteCreateInputSchema: z.ZodType<Prisma.CheckInNoteCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  status: z.lazy(() => HealthStatusSchema),
  message: z.string(),
  createdAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutCheckInNotesInputSchema),
});

export const CheckInNoteUncheckedCreateInputSchema: z.ZodType<Prisma.CheckInNoteUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  status: z.lazy(() => HealthStatusSchema),
  message: z.string(),
  createdAt: z.coerce.date().optional(),
});

export const CheckInNoteUpdateInputSchema: z.ZodType<Prisma.CheckInNoteUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => HealthStatusSchema), z.lazy(() => EnumHealthStatusFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutCheckInNotesNestedInputSchema).optional(),
});

export const CheckInNoteUncheckedUpdateInputSchema: z.ZodType<Prisma.CheckInNoteUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => HealthStatusSchema), z.lazy(() => EnumHealthStatusFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CheckInNoteCreateManyInputSchema: z.ZodType<Prisma.CheckInNoteCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  status: z.lazy(() => HealthStatusSchema),
  message: z.string(),
  createdAt: z.coerce.date().optional(),
});

export const CheckInNoteUpdateManyMutationInputSchema: z.ZodType<Prisma.CheckInNoteUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => HealthStatusSchema), z.lazy(() => EnumHealthStatusFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CheckInNoteUncheckedUpdateManyInputSchema: z.ZodType<Prisma.CheckInNoteUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => HealthStatusSchema), z.lazy(() => EnumHealthStatusFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const BugReportCreateInputSchema: z.ZodType<Prisma.BugReportCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  type: z.lazy(() => ReportTypeSchema),
  title: z.string(),
  message: z.string(),
  user: z.lazy(() => UserCreateNestedOneWithoutBugReportsInputSchema),
});

export const BugReportUncheckedCreateInputSchema: z.ZodType<Prisma.BugReportUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  type: z.lazy(() => ReportTypeSchema),
  title: z.string(),
  message: z.string(),
});

export const BugReportUpdateInputSchema: z.ZodType<Prisma.BugReportUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ReportTypeSchema), z.lazy(() => EnumReportTypeFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutBugReportsNestedInputSchema).optional(),
});

export const BugReportUncheckedUpdateInputSchema: z.ZodType<Prisma.BugReportUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ReportTypeSchema), z.lazy(() => EnumReportTypeFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
});

export const BugReportCreateManyInputSchema: z.ZodType<Prisma.BugReportCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  type: z.lazy(() => ReportTypeSchema),
  title: z.string(),
  message: z.string(),
});

export const BugReportUpdateManyMutationInputSchema: z.ZodType<Prisma.BugReportUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ReportTypeSchema), z.lazy(() => EnumReportTypeFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
});

export const BugReportUncheckedUpdateManyInputSchema: z.ZodType<Prisma.BugReportUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ReportTypeSchema), z.lazy(() => EnumReportTypeFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CustomReminderCreateInputSchema: z.ZodType<Prisma.CustomReminderCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  title: z.string().optional().nullable(),
  message: z.string(),
  interval: z.number().int().optional().nullable(),
  disabled: z.boolean().optional(),
  lastSent: z.coerce.date().optional().nullable(),
  nextAt: z.coerce.date(),
  user: z.lazy(() => UserCreateNestedOneWithoutCustomRemindersInputSchema),
});

export const CustomReminderUncheckedCreateInputSchema: z.ZodType<Prisma.CustomReminderUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  title: z.string().optional().nullable(),
  message: z.string(),
  interval: z.number().int().optional().nullable(),
  disabled: z.boolean().optional(),
  lastSent: z.coerce.date().optional().nullable(),
  nextAt: z.coerce.date(),
  userId: z.string(),
});

export const CustomReminderUpdateInputSchema: z.ZodType<Prisma.CustomReminderUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  message: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  interval: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  disabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  lastSent: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  nextAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutCustomRemindersNestedInputSchema).optional(),
});

export const CustomReminderUncheckedUpdateInputSchema: z.ZodType<Prisma.CustomReminderUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  message: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  interval: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  disabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  lastSent: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  nextAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CustomReminderCreateManyInputSchema: z.ZodType<Prisma.CustomReminderCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  title: z.string().optional().nullable(),
  message: z.string(),
  interval: z.number().int().optional().nullable(),
  disabled: z.boolean().optional(),
  lastSent: z.coerce.date().optional().nullable(),
  nextAt: z.coerce.date(),
  userId: z.string(),
});

export const CustomReminderUpdateManyMutationInputSchema: z.ZodType<Prisma.CustomReminderUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  message: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  interval: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  disabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  lastSent: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  nextAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CustomReminderUncheckedUpdateManyInputSchema: z.ZodType<Prisma.CustomReminderUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  message: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  interval: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  disabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  lastSent: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  nextAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
});

export const AuditLogCreateInputSchema: z.ZodType<Prisma.AuditLogCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  targetId: z.string().optional().nullable(),
  target: z.string(),
  action: z.lazy(() => AuditActionSchema),
  summary: z.string(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  actor: z.lazy(() => UserCreateNestedOneWithoutAuditLogsInputSchema).optional(),
});

export const AuditLogUncheckedCreateInputSchema: z.ZodType<Prisma.AuditLogUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  actorId: z.string().optional().nullable(),
  targetId: z.string().optional().nullable(),
  target: z.string(),
  action: z.lazy(() => AuditActionSchema),
  summary: z.string(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
});

export const AuditLogUpdateInputSchema: z.ZodType<Prisma.AuditLogUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  targetId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  target: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  action: z.union([ z.lazy(() => AuditActionSchema), z.lazy(() => EnumAuditActionFieldUpdateOperationsInputSchema) ]).optional(),
  summary: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  actor: z.lazy(() => UserUpdateOneWithoutAuditLogsNestedInputSchema).optional(),
});

export const AuditLogUncheckedUpdateInputSchema: z.ZodType<Prisma.AuditLogUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  actorId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  targetId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  target: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  action: z.union([ z.lazy(() => AuditActionSchema), z.lazy(() => EnumAuditActionFieldUpdateOperationsInputSchema) ]).optional(),
  summary: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const AuditLogCreateManyInputSchema: z.ZodType<Prisma.AuditLogCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  actorId: z.string().optional().nullable(),
  targetId: z.string().optional().nullable(),
  target: z.string(),
  action: z.lazy(() => AuditActionSchema),
  summary: z.string(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
});

export const AuditLogUpdateManyMutationInputSchema: z.ZodType<Prisma.AuditLogUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  targetId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  target: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  action: z.union([ z.lazy(() => AuditActionSchema), z.lazy(() => EnumAuditActionFieldUpdateOperationsInputSchema) ]).optional(),
  summary: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const AuditLogUncheckedUpdateManyInputSchema: z.ZodType<Prisma.AuditLogUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  actorId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  targetId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  target: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  action: z.union([ z.lazy(() => AuditActionSchema), z.lazy(() => EnumAuditActionFieldUpdateOperationsInputSchema) ]).optional(),
  summary: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const NotificationCreateInputSchema: z.ZodType<Prisma.NotificationCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  type: z.lazy(() => NotificationTypeSchema),
  title: z.string(),
  message: z.string(),
  readAt: z.coerce.date().optional().nullable(),
  sentAt: z.coerce.date().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutNotificationsInputSchema),
});

export const NotificationUncheckedCreateInputSchema: z.ZodType<Prisma.NotificationUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  type: z.lazy(() => NotificationTypeSchema),
  title: z.string(),
  message: z.string(),
  readAt: z.coerce.date().optional().nullable(),
  sentAt: z.coerce.date().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
});

export const NotificationUpdateInputSchema: z.ZodType<Prisma.NotificationUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => NotificationTypeSchema), z.lazy(() => EnumNotificationTypeFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  readAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sentAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutNotificationsNestedInputSchema).optional(),
});

export const NotificationUncheckedUpdateInputSchema: z.ZodType<Prisma.NotificationUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => NotificationTypeSchema), z.lazy(() => EnumNotificationTypeFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  readAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sentAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
});

export const NotificationCreateManyInputSchema: z.ZodType<Prisma.NotificationCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  type: z.lazy(() => NotificationTypeSchema),
  title: z.string(),
  message: z.string(),
  readAt: z.coerce.date().optional().nullable(),
  sentAt: z.coerce.date().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
});

export const NotificationUpdateManyMutationInputSchema: z.ZodType<Prisma.NotificationUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => NotificationTypeSchema), z.lazy(() => EnumNotificationTypeFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  readAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sentAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
});

export const NotificationUncheckedUpdateManyInputSchema: z.ZodType<Prisma.NotificationUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => NotificationTypeSchema), z.lazy(() => EnumNotificationTypeFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  readAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sentAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
});

export const EmergencyContactCreateInputSchema: z.ZodType<Prisma.EmergencyContactCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  phone: z.string(),
  relation: z.string().optional().nullable(),
  priority: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutEmergencyContactsInputSchema),
});

export const EmergencyContactUncheckedCreateInputSchema: z.ZodType<Prisma.EmergencyContactUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  name: z.string(),
  phone: z.string(),
  relation: z.string().optional().nullable(),
  priority: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
});

export const EmergencyContactUpdateInputSchema: z.ZodType<Prisma.EmergencyContactUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  relation: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  priority: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutEmergencyContactsNestedInputSchema).optional(),
});

export const EmergencyContactUncheckedUpdateInputSchema: z.ZodType<Prisma.EmergencyContactUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  relation: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  priority: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const EmergencyContactCreateManyInputSchema: z.ZodType<Prisma.EmergencyContactCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  name: z.string(),
  phone: z.string(),
  relation: z.string().optional().nullable(),
  priority: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
});

export const EmergencyContactUpdateManyMutationInputSchema: z.ZodType<Prisma.EmergencyContactUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  relation: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  priority: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const EmergencyContactUncheckedUpdateManyInputSchema: z.ZodType<Prisma.EmergencyContactUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  relation: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  priority: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
});

export const StringNullableFilterSchema: z.ZodType<Prisma.StringNullableFilter> = z.strictObject({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
});

export const EnumRoleFilterSchema: z.ZodType<Prisma.EnumRoleFilter> = z.strictObject({
  equals: z.lazy(() => RoleSchema).optional(),
  in: z.lazy(() => RoleSchema).array().optional(),
  notIn: z.lazy(() => RoleSchema).array().optional(),
  not: z.union([ z.lazy(() => RoleSchema), z.lazy(() => NestedEnumRoleFilterSchema) ]).optional(),
});

export const IntNullableFilterSchema: z.ZodType<Prisma.IntNullableFilter> = z.strictObject({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
});

export const LocationListRelationFilterSchema: z.ZodType<Prisma.LocationListRelationFilter> = z.strictObject({
  every: z.lazy(() => LocationWhereInputSchema).optional(),
  some: z.lazy(() => LocationWhereInputSchema).optional(),
  none: z.lazy(() => LocationWhereInputSchema).optional(),
});

export const LocationNullableScalarRelationFilterSchema: z.ZodType<Prisma.LocationNullableScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => LocationWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => LocationWhereInputSchema).optional().nullable(),
});

export const CareRelationListRelationFilterSchema: z.ZodType<Prisma.CareRelationListRelationFilter> = z.strictObject({
  every: z.lazy(() => CareRelationWhereInputSchema).optional(),
  some: z.lazy(() => CareRelationWhereInputSchema).optional(),
  none: z.lazy(() => CareRelationWhereInputSchema).optional(),
});

export const PairingTokenListRelationFilterSchema: z.ZodType<Prisma.PairingTokenListRelationFilter> = z.strictObject({
  every: z.lazy(() => PairingTokenWhereInputSchema).optional(),
  some: z.lazy(() => PairingTokenWhereInputSchema).optional(),
  none: z.lazy(() => PairingTokenWhereInputSchema).optional(),
});

export const MedicalRecordListRelationFilterSchema: z.ZodType<Prisma.MedicalRecordListRelationFilter> = z.strictObject({
  every: z.lazy(() => MedicalRecordWhereInputSchema).optional(),
  some: z.lazy(() => MedicalRecordWhereInputSchema).optional(),
  none: z.lazy(() => MedicalRecordWhereInputSchema).optional(),
});

export const ReminderListRelationFilterSchema: z.ZodType<Prisma.ReminderListRelationFilter> = z.strictObject({
  every: z.lazy(() => ReminderWhereInputSchema).optional(),
  some: z.lazy(() => ReminderWhereInputSchema).optional(),
  none: z.lazy(() => ReminderWhereInputSchema).optional(),
});

export const CheckInNoteListRelationFilterSchema: z.ZodType<Prisma.CheckInNoteListRelationFilter> = z.strictObject({
  every: z.lazy(() => CheckInNoteWhereInputSchema).optional(),
  some: z.lazy(() => CheckInNoteWhereInputSchema).optional(),
  none: z.lazy(() => CheckInNoteWhereInputSchema).optional(),
});

export const BugReportListRelationFilterSchema: z.ZodType<Prisma.BugReportListRelationFilter> = z.strictObject({
  every: z.lazy(() => BugReportWhereInputSchema).optional(),
  some: z.lazy(() => BugReportWhereInputSchema).optional(),
  none: z.lazy(() => BugReportWhereInputSchema).optional(),
});

export const CustomReminderListRelationFilterSchema: z.ZodType<Prisma.CustomReminderListRelationFilter> = z.strictObject({
  every: z.lazy(() => CustomReminderWhereInputSchema).optional(),
  some: z.lazy(() => CustomReminderWhereInputSchema).optional(),
  none: z.lazy(() => CustomReminderWhereInputSchema).optional(),
});

export const AuditLogListRelationFilterSchema: z.ZodType<Prisma.AuditLogListRelationFilter> = z.strictObject({
  every: z.lazy(() => AuditLogWhereInputSchema).optional(),
  some: z.lazy(() => AuditLogWhereInputSchema).optional(),
  none: z.lazy(() => AuditLogWhereInputSchema).optional(),
});

export const NotificationListRelationFilterSchema: z.ZodType<Prisma.NotificationListRelationFilter> = z.strictObject({
  every: z.lazy(() => NotificationWhereInputSchema).optional(),
  some: z.lazy(() => NotificationWhereInputSchema).optional(),
  none: z.lazy(() => NotificationWhereInputSchema).optional(),
});

export const EmergencyContactListRelationFilterSchema: z.ZodType<Prisma.EmergencyContactListRelationFilter> = z.strictObject({
  every: z.lazy(() => EmergencyContactWhereInputSchema).optional(),
  some: z.lazy(() => EmergencyContactWhereInputSchema).optional(),
  none: z.lazy(() => EmergencyContactWhereInputSchema).optional(),
});

export const SortOrderInputSchema: z.ZodType<Prisma.SortOrderInput> = z.strictObject({
  sort: z.lazy(() => SortOrderSchema),
  nulls: z.lazy(() => NullsOrderSchema).optional(),
});

export const LocationOrderByRelationAggregateInputSchema: z.ZodType<Prisma.LocationOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const CareRelationOrderByRelationAggregateInputSchema: z.ZodType<Prisma.CareRelationOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const PairingTokenOrderByRelationAggregateInputSchema: z.ZodType<Prisma.PairingTokenOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const MedicalRecordOrderByRelationAggregateInputSchema: z.ZodType<Prisma.MedicalRecordOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const ReminderOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ReminderOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const CheckInNoteOrderByRelationAggregateInputSchema: z.ZodType<Prisma.CheckInNoteOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const BugReportOrderByRelationAggregateInputSchema: z.ZodType<Prisma.BugReportOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const CustomReminderOrderByRelationAggregateInputSchema: z.ZodType<Prisma.CustomReminderOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const AuditLogOrderByRelationAggregateInputSchema: z.ZodType<Prisma.AuditLogOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const NotificationOrderByRelationAggregateInputSchema: z.ZodType<Prisma.NotificationOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const EmergencyContactOrderByRelationAggregateInputSchema: z.ZodType<Prisma.EmergencyContactOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const UserCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  username: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  phoneNumber: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  homeId: z.lazy(() => SortOrderSchema).optional(),
  workId: z.lazy(() => SortOrderSchema).optional(),
});

export const UserAvgOrderByAggregateInputSchema: z.ZodType<Prisma.UserAvgOrderByAggregateInput> = z.strictObject({
  homeId: z.lazy(() => SortOrderSchema).optional(),
  workId: z.lazy(() => SortOrderSchema).optional(),
});

export const UserMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  username: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  phoneNumber: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  homeId: z.lazy(() => SortOrderSchema).optional(),
  workId: z.lazy(() => SortOrderSchema).optional(),
});

export const UserMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  username: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  phoneNumber: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  homeId: z.lazy(() => SortOrderSchema).optional(),
  workId: z.lazy(() => SortOrderSchema).optional(),
});

export const UserSumOrderByAggregateInputSchema: z.ZodType<Prisma.UserSumOrderByAggregateInput> = z.strictObject({
  homeId: z.lazy(() => SortOrderSchema).optional(),
  workId: z.lazy(() => SortOrderSchema).optional(),
});

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional(),
});

export const StringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> = z.strictObject({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional(),
});

export const EnumRoleWithAggregatesFilterSchema: z.ZodType<Prisma.EnumRoleWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => RoleSchema).optional(),
  in: z.lazy(() => RoleSchema).array().optional(),
  notIn: z.lazy(() => RoleSchema).array().optional(),
  not: z.union([ z.lazy(() => RoleSchema), z.lazy(() => NestedEnumRoleWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumRoleFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumRoleFilterSchema).optional(),
});

export const IntNullableWithAggregatesFilterSchema: z.ZodType<Prisma.IntNullableWithAggregatesFilter> = z.strictObject({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedIntNullableFilterSchema).optional(),
});

export const IntFilterSchema: z.ZodType<Prisma.IntFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
});

export const FloatFilterSchema: z.ZodType<Prisma.FloatFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
});

export const DateTimeFilterSchema: z.ZodType<Prisma.DateTimeFilter> = z.strictObject({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
});

export const UserScalarRelationFilterSchema: z.ZodType<Prisma.UserScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => UserWhereInputSchema).optional(),
  isNot: z.lazy(() => UserWhereInputSchema).optional(),
});

export const UserListRelationFilterSchema: z.ZodType<Prisma.UserListRelationFilter> = z.strictObject({
  every: z.lazy(() => UserWhereInputSchema).optional(),
  some: z.lazy(() => UserWhereInputSchema).optional(),
  none: z.lazy(() => UserWhereInputSchema).optional(),
});

export const UserOrderByRelationAggregateInputSchema: z.ZodType<Prisma.UserOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const LocationCountOrderByAggregateInputSchema: z.ZodType<Prisma.LocationCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  latitude: z.lazy(() => SortOrderSchema).optional(),
  longitude: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
});

export const LocationAvgOrderByAggregateInputSchema: z.ZodType<Prisma.LocationAvgOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  latitude: z.lazy(() => SortOrderSchema).optional(),
  longitude: z.lazy(() => SortOrderSchema).optional(),
});

export const LocationMaxOrderByAggregateInputSchema: z.ZodType<Prisma.LocationMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  latitude: z.lazy(() => SortOrderSchema).optional(),
  longitude: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
});

export const LocationMinOrderByAggregateInputSchema: z.ZodType<Prisma.LocationMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  latitude: z.lazy(() => SortOrderSchema).optional(),
  longitude: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
});

export const LocationSumOrderByAggregateInputSchema: z.ZodType<Prisma.LocationSumOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  latitude: z.lazy(() => SortOrderSchema).optional(),
  longitude: z.lazy(() => SortOrderSchema).optional(),
});

export const IntWithAggregatesFilterSchema: z.ZodType<Prisma.IntWithAggregatesFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional(),
});

export const FloatWithAggregatesFilterSchema: z.ZodType<Prisma.FloatWithAggregatesFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedFloatFilterSchema).optional(),
  _min: z.lazy(() => NestedFloatFilterSchema).optional(),
  _max: z.lazy(() => NestedFloatFilterSchema).optional(),
});

export const DateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> = z.strictObject({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional(),
});

export const CareRelationCaregiverIdUserIdCompoundUniqueInputSchema: z.ZodType<Prisma.CareRelationCaregiverIdUserIdCompoundUniqueInput> = z.strictObject({
  caregiverId: z.string(),
  userId: z.string(),
});

export const CareRelationCountOrderByAggregateInputSchema: z.ZodType<Prisma.CareRelationCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  caregiverId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
});

export const CareRelationAvgOrderByAggregateInputSchema: z.ZodType<Prisma.CareRelationAvgOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
});

export const CareRelationMaxOrderByAggregateInputSchema: z.ZodType<Prisma.CareRelationMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  caregiverId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
});

export const CareRelationMinOrderByAggregateInputSchema: z.ZodType<Prisma.CareRelationMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  caregiverId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
});

export const CareRelationSumOrderByAggregateInputSchema: z.ZodType<Prisma.CareRelationSumOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
});

export const DateTimeNullableFilterSchema: z.ZodType<Prisma.DateTimeNullableFilter> = z.strictObject({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableFilterSchema) ]).optional().nullable(),
});

export const PairingTokenCountOrderByAggregateInputSchema: z.ZodType<Prisma.PairingTokenCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  expiryAt: z.lazy(() => SortOrderSchema).optional(),
  usedAt: z.lazy(() => SortOrderSchema).optional(),
  caregiverId: z.lazy(() => SortOrderSchema).optional(),
});

export const PairingTokenMaxOrderByAggregateInputSchema: z.ZodType<Prisma.PairingTokenMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  expiryAt: z.lazy(() => SortOrderSchema).optional(),
  usedAt: z.lazy(() => SortOrderSchema).optional(),
  caregiverId: z.lazy(() => SortOrderSchema).optional(),
});

export const PairingTokenMinOrderByAggregateInputSchema: z.ZodType<Prisma.PairingTokenMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  expiryAt: z.lazy(() => SortOrderSchema).optional(),
  usedAt: z.lazy(() => SortOrderSchema).optional(),
  caregiverId: z.lazy(() => SortOrderSchema).optional(),
});

export const DateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeNullableWithAggregatesFilter> = z.strictObject({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
});

export const EnumSexFilterSchema: z.ZodType<Prisma.EnumSexFilter> = z.strictObject({
  equals: z.lazy(() => SexSchema).optional(),
  in: z.lazy(() => SexSchema).array().optional(),
  notIn: z.lazy(() => SexSchema).array().optional(),
  not: z.union([ z.lazy(() => SexSchema), z.lazy(() => NestedEnumSexFilterSchema) ]).optional(),
});

export const FloatNullableFilterSchema: z.ZodType<Prisma.FloatNullableFilter> = z.strictObject({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatNullableFilterSchema) ]).optional().nullable(),
});

export const MedicalRecordCountOrderByAggregateInputSchema: z.ZodType<Prisma.MedicalRecordCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  patientId: z.lazy(() => SortOrderSchema).optional(),
  gender: z.lazy(() => SortOrderSchema).optional(),
  dateOfBirth: z.lazy(() => SortOrderSchema).optional(),
  height: z.lazy(() => SortOrderSchema).optional(),
  weight: z.lazy(() => SortOrderSchema).optional(),
  incidentHistory: z.lazy(() => SortOrderSchema).optional(),
  medicalHistory: z.lazy(() => SortOrderSchema).optional(),
  geneticHistory: z.lazy(() => SortOrderSchema).optional(),
  allergies: z.lazy(() => SortOrderSchema).optional(),
  medications: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  modifiedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const MedicalRecordAvgOrderByAggregateInputSchema: z.ZodType<Prisma.MedicalRecordAvgOrderByAggregateInput> = z.strictObject({
  height: z.lazy(() => SortOrderSchema).optional(),
  weight: z.lazy(() => SortOrderSchema).optional(),
});

export const MedicalRecordMaxOrderByAggregateInputSchema: z.ZodType<Prisma.MedicalRecordMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  patientId: z.lazy(() => SortOrderSchema).optional(),
  gender: z.lazy(() => SortOrderSchema).optional(),
  dateOfBirth: z.lazy(() => SortOrderSchema).optional(),
  height: z.lazy(() => SortOrderSchema).optional(),
  weight: z.lazy(() => SortOrderSchema).optional(),
  incidentHistory: z.lazy(() => SortOrderSchema).optional(),
  medicalHistory: z.lazy(() => SortOrderSchema).optional(),
  geneticHistory: z.lazy(() => SortOrderSchema).optional(),
  allergies: z.lazy(() => SortOrderSchema).optional(),
  medications: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  modifiedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const MedicalRecordMinOrderByAggregateInputSchema: z.ZodType<Prisma.MedicalRecordMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  patientId: z.lazy(() => SortOrderSchema).optional(),
  gender: z.lazy(() => SortOrderSchema).optional(),
  dateOfBirth: z.lazy(() => SortOrderSchema).optional(),
  height: z.lazy(() => SortOrderSchema).optional(),
  weight: z.lazy(() => SortOrderSchema).optional(),
  incidentHistory: z.lazy(() => SortOrderSchema).optional(),
  medicalHistory: z.lazy(() => SortOrderSchema).optional(),
  geneticHistory: z.lazy(() => SortOrderSchema).optional(),
  allergies: z.lazy(() => SortOrderSchema).optional(),
  medications: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  modifiedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const MedicalRecordSumOrderByAggregateInputSchema: z.ZodType<Prisma.MedicalRecordSumOrderByAggregateInput> = z.strictObject({
  height: z.lazy(() => SortOrderSchema).optional(),
  weight: z.lazy(() => SortOrderSchema).optional(),
});

export const EnumSexWithAggregatesFilterSchema: z.ZodType<Prisma.EnumSexWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => SexSchema).optional(),
  in: z.lazy(() => SexSchema).array().optional(),
  notIn: z.lazy(() => SexSchema).array().optional(),
  not: z.union([ z.lazy(() => SexSchema), z.lazy(() => NestedEnumSexWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumSexFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumSexFilterSchema).optional(),
});

export const FloatNullableWithAggregatesFilterSchema: z.ZodType<Prisma.FloatNullableWithAggregatesFilter> = z.strictObject({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
});

export const EnumReminderTypeFilterSchema: z.ZodType<Prisma.EnumReminderTypeFilter> = z.strictObject({
  equals: z.lazy(() => ReminderTypeSchema).optional(),
  in: z.lazy(() => ReminderTypeSchema).array().optional(),
  notIn: z.lazy(() => ReminderTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => ReminderTypeSchema), z.lazy(() => NestedEnumReminderTypeFilterSchema) ]).optional(),
});

export const BoolFilterSchema: z.ZodType<Prisma.BoolFilter> = z.strictObject({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
});

export const ReminderCountOrderByAggregateInputSchema: z.ZodType<Prisma.ReminderCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  interval: z.lazy(() => SortOrderSchema).optional(),
  disabled: z.lazy(() => SortOrderSchema).optional(),
  lastSent: z.lazy(() => SortOrderSchema).optional(),
  nextAt: z.lazy(() => SortOrderSchema).optional(),
});

export const ReminderAvgOrderByAggregateInputSchema: z.ZodType<Prisma.ReminderAvgOrderByAggregateInput> = z.strictObject({
  interval: z.lazy(() => SortOrderSchema).optional(),
});

export const ReminderMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ReminderMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  interval: z.lazy(() => SortOrderSchema).optional(),
  disabled: z.lazy(() => SortOrderSchema).optional(),
  lastSent: z.lazy(() => SortOrderSchema).optional(),
  nextAt: z.lazy(() => SortOrderSchema).optional(),
});

export const ReminderMinOrderByAggregateInputSchema: z.ZodType<Prisma.ReminderMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  interval: z.lazy(() => SortOrderSchema).optional(),
  disabled: z.lazy(() => SortOrderSchema).optional(),
  lastSent: z.lazy(() => SortOrderSchema).optional(),
  nextAt: z.lazy(() => SortOrderSchema).optional(),
});

export const ReminderSumOrderByAggregateInputSchema: z.ZodType<Prisma.ReminderSumOrderByAggregateInput> = z.strictObject({
  interval: z.lazy(() => SortOrderSchema).optional(),
});

export const EnumReminderTypeWithAggregatesFilterSchema: z.ZodType<Prisma.EnumReminderTypeWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => ReminderTypeSchema).optional(),
  in: z.lazy(() => ReminderTypeSchema).array().optional(),
  notIn: z.lazy(() => ReminderTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => ReminderTypeSchema), z.lazy(() => NestedEnumReminderTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumReminderTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumReminderTypeFilterSchema).optional(),
});

export const BoolWithAggregatesFilterSchema: z.ZodType<Prisma.BoolWithAggregatesFilter> = z.strictObject({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional(),
});

export const EnumHealthStatusFilterSchema: z.ZodType<Prisma.EnumHealthStatusFilter> = z.strictObject({
  equals: z.lazy(() => HealthStatusSchema).optional(),
  in: z.lazy(() => HealthStatusSchema).array().optional(),
  notIn: z.lazy(() => HealthStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => HealthStatusSchema), z.lazy(() => NestedEnumHealthStatusFilterSchema) ]).optional(),
});

export const CheckInNoteCountOrderByAggregateInputSchema: z.ZodType<Prisma.CheckInNoteCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
});

export const CheckInNoteMaxOrderByAggregateInputSchema: z.ZodType<Prisma.CheckInNoteMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
});

export const CheckInNoteMinOrderByAggregateInputSchema: z.ZodType<Prisma.CheckInNoteMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
});

export const EnumHealthStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumHealthStatusWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => HealthStatusSchema).optional(),
  in: z.lazy(() => HealthStatusSchema).array().optional(),
  notIn: z.lazy(() => HealthStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => HealthStatusSchema), z.lazy(() => NestedEnumHealthStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumHealthStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumHealthStatusFilterSchema).optional(),
});

export const EnumReportTypeFilterSchema: z.ZodType<Prisma.EnumReportTypeFilter> = z.strictObject({
  equals: z.lazy(() => ReportTypeSchema).optional(),
  in: z.lazy(() => ReportTypeSchema).array().optional(),
  notIn: z.lazy(() => ReportTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => ReportTypeSchema), z.lazy(() => NestedEnumReportTypeFilterSchema) ]).optional(),
});

export const BugReportCountOrderByAggregateInputSchema: z.ZodType<Prisma.BugReportCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
});

export const BugReportMaxOrderByAggregateInputSchema: z.ZodType<Prisma.BugReportMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
});

export const BugReportMinOrderByAggregateInputSchema: z.ZodType<Prisma.BugReportMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
});

export const EnumReportTypeWithAggregatesFilterSchema: z.ZodType<Prisma.EnumReportTypeWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => ReportTypeSchema).optional(),
  in: z.lazy(() => ReportTypeSchema).array().optional(),
  notIn: z.lazy(() => ReportTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => ReportTypeSchema), z.lazy(() => NestedEnumReportTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumReportTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumReportTypeFilterSchema).optional(),
});

export const CustomReminderCountOrderByAggregateInputSchema: z.ZodType<Prisma.CustomReminderCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
  interval: z.lazy(() => SortOrderSchema).optional(),
  disabled: z.lazy(() => SortOrderSchema).optional(),
  lastSent: z.lazy(() => SortOrderSchema).optional(),
  nextAt: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
});

export const CustomReminderAvgOrderByAggregateInputSchema: z.ZodType<Prisma.CustomReminderAvgOrderByAggregateInput> = z.strictObject({
  interval: z.lazy(() => SortOrderSchema).optional(),
});

export const CustomReminderMaxOrderByAggregateInputSchema: z.ZodType<Prisma.CustomReminderMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
  interval: z.lazy(() => SortOrderSchema).optional(),
  disabled: z.lazy(() => SortOrderSchema).optional(),
  lastSent: z.lazy(() => SortOrderSchema).optional(),
  nextAt: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
});

export const CustomReminderMinOrderByAggregateInputSchema: z.ZodType<Prisma.CustomReminderMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
  interval: z.lazy(() => SortOrderSchema).optional(),
  disabled: z.lazy(() => SortOrderSchema).optional(),
  lastSent: z.lazy(() => SortOrderSchema).optional(),
  nextAt: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
});

export const CustomReminderSumOrderByAggregateInputSchema: z.ZodType<Prisma.CustomReminderSumOrderByAggregateInput> = z.strictObject({
  interval: z.lazy(() => SortOrderSchema).optional(),
});

export const EnumAuditActionFilterSchema: z.ZodType<Prisma.EnumAuditActionFilter> = z.strictObject({
  equals: z.lazy(() => AuditActionSchema).optional(),
  in: z.lazy(() => AuditActionSchema).array().optional(),
  notIn: z.lazy(() => AuditActionSchema).array().optional(),
  not: z.union([ z.lazy(() => AuditActionSchema), z.lazy(() => NestedEnumAuditActionFilterSchema) ]).optional(),
});

export const JsonNullableFilterSchema: z.ZodType<Prisma.JsonNullableFilter> = z.strictObject({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional(),
});

export const UserNullableScalarRelationFilterSchema: z.ZodType<Prisma.UserNullableScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => UserWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => UserWhereInputSchema).optional().nullable(),
});

export const AuditLogCountOrderByAggregateInputSchema: z.ZodType<Prisma.AuditLogCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  actorId: z.lazy(() => SortOrderSchema).optional(),
  targetId: z.lazy(() => SortOrderSchema).optional(),
  target: z.lazy(() => SortOrderSchema).optional(),
  action: z.lazy(() => SortOrderSchema).optional(),
  summary: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
});

export const AuditLogMaxOrderByAggregateInputSchema: z.ZodType<Prisma.AuditLogMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  actorId: z.lazy(() => SortOrderSchema).optional(),
  targetId: z.lazy(() => SortOrderSchema).optional(),
  target: z.lazy(() => SortOrderSchema).optional(),
  action: z.lazy(() => SortOrderSchema).optional(),
  summary: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
});

export const AuditLogMinOrderByAggregateInputSchema: z.ZodType<Prisma.AuditLogMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  actorId: z.lazy(() => SortOrderSchema).optional(),
  targetId: z.lazy(() => SortOrderSchema).optional(),
  target: z.lazy(() => SortOrderSchema).optional(),
  action: z.lazy(() => SortOrderSchema).optional(),
  summary: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
});

export const EnumAuditActionWithAggregatesFilterSchema: z.ZodType<Prisma.EnumAuditActionWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => AuditActionSchema).optional(),
  in: z.lazy(() => AuditActionSchema).array().optional(),
  notIn: z.lazy(() => AuditActionSchema).array().optional(),
  not: z.union([ z.lazy(() => AuditActionSchema), z.lazy(() => NestedEnumAuditActionWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumAuditActionFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumAuditActionFilterSchema).optional(),
});

export const JsonNullableWithAggregatesFilterSchema: z.ZodType<Prisma.JsonNullableWithAggregatesFilter> = z.strictObject({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedJsonNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedJsonNullableFilterSchema).optional(),
});

export const EnumNotificationTypeFilterSchema: z.ZodType<Prisma.EnumNotificationTypeFilter> = z.strictObject({
  equals: z.lazy(() => NotificationTypeSchema).optional(),
  in: z.lazy(() => NotificationTypeSchema).array().optional(),
  notIn: z.lazy(() => NotificationTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => NotificationTypeSchema), z.lazy(() => NestedEnumNotificationTypeFilterSchema) ]).optional(),
});

export const NotificationCountOrderByAggregateInputSchema: z.ZodType<Prisma.NotificationCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
  readAt: z.lazy(() => SortOrderSchema).optional(),
  sentAt: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.lazy(() => SortOrderSchema).optional(),
});

export const NotificationMaxOrderByAggregateInputSchema: z.ZodType<Prisma.NotificationMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
  readAt: z.lazy(() => SortOrderSchema).optional(),
  sentAt: z.lazy(() => SortOrderSchema).optional(),
});

export const NotificationMinOrderByAggregateInputSchema: z.ZodType<Prisma.NotificationMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
  readAt: z.lazy(() => SortOrderSchema).optional(),
  sentAt: z.lazy(() => SortOrderSchema).optional(),
});

export const EnumNotificationTypeWithAggregatesFilterSchema: z.ZodType<Prisma.EnumNotificationTypeWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => NotificationTypeSchema).optional(),
  in: z.lazy(() => NotificationTypeSchema).array().optional(),
  notIn: z.lazy(() => NotificationTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => NotificationTypeSchema), z.lazy(() => NestedEnumNotificationTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumNotificationTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumNotificationTypeFilterSchema).optional(),
});

export const EmergencyContactCountOrderByAggregateInputSchema: z.ZodType<Prisma.EmergencyContactCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  phone: z.lazy(() => SortOrderSchema).optional(),
  relation: z.lazy(() => SortOrderSchema).optional(),
  priority: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
});

export const EmergencyContactAvgOrderByAggregateInputSchema: z.ZodType<Prisma.EmergencyContactAvgOrderByAggregateInput> = z.strictObject({
  priority: z.lazy(() => SortOrderSchema).optional(),
});

export const EmergencyContactMaxOrderByAggregateInputSchema: z.ZodType<Prisma.EmergencyContactMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  phone: z.lazy(() => SortOrderSchema).optional(),
  relation: z.lazy(() => SortOrderSchema).optional(),
  priority: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
});

export const EmergencyContactMinOrderByAggregateInputSchema: z.ZodType<Prisma.EmergencyContactMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  phone: z.lazy(() => SortOrderSchema).optional(),
  relation: z.lazy(() => SortOrderSchema).optional(),
  priority: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
});

export const EmergencyContactSumOrderByAggregateInputSchema: z.ZodType<Prisma.EmergencyContactSumOrderByAggregateInput> = z.strictObject({
  priority: z.lazy(() => SortOrderSchema).optional(),
});

export const LocationCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.LocationCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => LocationCreateWithoutUserInputSchema), z.lazy(() => LocationCreateWithoutUserInputSchema).array(), z.lazy(() => LocationUncheckedCreateWithoutUserInputSchema), z.lazy(() => LocationUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => LocationCreateOrConnectWithoutUserInputSchema), z.lazy(() => LocationCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => LocationCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => LocationWhereUniqueInputSchema), z.lazy(() => LocationWhereUniqueInputSchema).array() ]).optional(),
});

export const LocationCreateNestedOneWithoutHomeOfInputSchema: z.ZodType<Prisma.LocationCreateNestedOneWithoutHomeOfInput> = z.strictObject({
  create: z.union([ z.lazy(() => LocationCreateWithoutHomeOfInputSchema), z.lazy(() => LocationUncheckedCreateWithoutHomeOfInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => LocationCreateOrConnectWithoutHomeOfInputSchema).optional(),
  connect: z.lazy(() => LocationWhereUniqueInputSchema).optional(),
});

export const LocationCreateNestedOneWithoutWorkOfInputSchema: z.ZodType<Prisma.LocationCreateNestedOneWithoutWorkOfInput> = z.strictObject({
  create: z.union([ z.lazy(() => LocationCreateWithoutWorkOfInputSchema), z.lazy(() => LocationUncheckedCreateWithoutWorkOfInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => LocationCreateOrConnectWithoutWorkOfInputSchema).optional(),
  connect: z.lazy(() => LocationWhereUniqueInputSchema).optional(),
});

export const CareRelationCreateNestedManyWithoutCaregiverInputSchema: z.ZodType<Prisma.CareRelationCreateNestedManyWithoutCaregiverInput> = z.strictObject({
  create: z.union([ z.lazy(() => CareRelationCreateWithoutCaregiverInputSchema), z.lazy(() => CareRelationCreateWithoutCaregiverInputSchema).array(), z.lazy(() => CareRelationUncheckedCreateWithoutCaregiverInputSchema), z.lazy(() => CareRelationUncheckedCreateWithoutCaregiverInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CareRelationCreateOrConnectWithoutCaregiverInputSchema), z.lazy(() => CareRelationCreateOrConnectWithoutCaregiverInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CareRelationCreateManyCaregiverInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CareRelationWhereUniqueInputSchema), z.lazy(() => CareRelationWhereUniqueInputSchema).array() ]).optional(),
});

export const CareRelationCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.CareRelationCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => CareRelationCreateWithoutUserInputSchema), z.lazy(() => CareRelationCreateWithoutUserInputSchema).array(), z.lazy(() => CareRelationUncheckedCreateWithoutUserInputSchema), z.lazy(() => CareRelationUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CareRelationCreateOrConnectWithoutUserInputSchema), z.lazy(() => CareRelationCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CareRelationCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CareRelationWhereUniqueInputSchema), z.lazy(() => CareRelationWhereUniqueInputSchema).array() ]).optional(),
});

export const PairingTokenCreateNestedManyWithoutCaregiverInputSchema: z.ZodType<Prisma.PairingTokenCreateNestedManyWithoutCaregiverInput> = z.strictObject({
  create: z.union([ z.lazy(() => PairingTokenCreateWithoutCaregiverInputSchema), z.lazy(() => PairingTokenCreateWithoutCaregiverInputSchema).array(), z.lazy(() => PairingTokenUncheckedCreateWithoutCaregiverInputSchema), z.lazy(() => PairingTokenUncheckedCreateWithoutCaregiverInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PairingTokenCreateOrConnectWithoutCaregiverInputSchema), z.lazy(() => PairingTokenCreateOrConnectWithoutCaregiverInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PairingTokenCreateManyCaregiverInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => PairingTokenWhereUniqueInputSchema), z.lazy(() => PairingTokenWhereUniqueInputSchema).array() ]).optional(),
});

export const MedicalRecordCreateNestedManyWithoutPatientInputSchema: z.ZodType<Prisma.MedicalRecordCreateNestedManyWithoutPatientInput> = z.strictObject({
  create: z.union([ z.lazy(() => MedicalRecordCreateWithoutPatientInputSchema), z.lazy(() => MedicalRecordCreateWithoutPatientInputSchema).array(), z.lazy(() => MedicalRecordUncheckedCreateWithoutPatientInputSchema), z.lazy(() => MedicalRecordUncheckedCreateWithoutPatientInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MedicalRecordCreateOrConnectWithoutPatientInputSchema), z.lazy(() => MedicalRecordCreateOrConnectWithoutPatientInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MedicalRecordCreateManyPatientInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => MedicalRecordWhereUniqueInputSchema), z.lazy(() => MedicalRecordWhereUniqueInputSchema).array() ]).optional(),
});

export const ReminderCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.ReminderCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => ReminderCreateWithoutUserInputSchema), z.lazy(() => ReminderCreateWithoutUserInputSchema).array(), z.lazy(() => ReminderUncheckedCreateWithoutUserInputSchema), z.lazy(() => ReminderUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReminderCreateOrConnectWithoutUserInputSchema), z.lazy(() => ReminderCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReminderCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReminderWhereUniqueInputSchema), z.lazy(() => ReminderWhereUniqueInputSchema).array() ]).optional(),
});

export const CheckInNoteCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.CheckInNoteCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => CheckInNoteCreateWithoutUserInputSchema), z.lazy(() => CheckInNoteCreateWithoutUserInputSchema).array(), z.lazy(() => CheckInNoteUncheckedCreateWithoutUserInputSchema), z.lazy(() => CheckInNoteUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CheckInNoteCreateOrConnectWithoutUserInputSchema), z.lazy(() => CheckInNoteCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CheckInNoteCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CheckInNoteWhereUniqueInputSchema), z.lazy(() => CheckInNoteWhereUniqueInputSchema).array() ]).optional(),
});

export const BugReportCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.BugReportCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => BugReportCreateWithoutUserInputSchema), z.lazy(() => BugReportCreateWithoutUserInputSchema).array(), z.lazy(() => BugReportUncheckedCreateWithoutUserInputSchema), z.lazy(() => BugReportUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BugReportCreateOrConnectWithoutUserInputSchema), z.lazy(() => BugReportCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BugReportCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => BugReportWhereUniqueInputSchema), z.lazy(() => BugReportWhereUniqueInputSchema).array() ]).optional(),
});

export const CustomReminderCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.CustomReminderCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => CustomReminderCreateWithoutUserInputSchema), z.lazy(() => CustomReminderCreateWithoutUserInputSchema).array(), z.lazy(() => CustomReminderUncheckedCreateWithoutUserInputSchema), z.lazy(() => CustomReminderUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CustomReminderCreateOrConnectWithoutUserInputSchema), z.lazy(() => CustomReminderCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CustomReminderCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CustomReminderWhereUniqueInputSchema), z.lazy(() => CustomReminderWhereUniqueInputSchema).array() ]).optional(),
});

export const AuditLogCreateNestedManyWithoutActorInputSchema: z.ZodType<Prisma.AuditLogCreateNestedManyWithoutActorInput> = z.strictObject({
  create: z.union([ z.lazy(() => AuditLogCreateWithoutActorInputSchema), z.lazy(() => AuditLogCreateWithoutActorInputSchema).array(), z.lazy(() => AuditLogUncheckedCreateWithoutActorInputSchema), z.lazy(() => AuditLogUncheckedCreateWithoutActorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AuditLogCreateOrConnectWithoutActorInputSchema), z.lazy(() => AuditLogCreateOrConnectWithoutActorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AuditLogCreateManyActorInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AuditLogWhereUniqueInputSchema), z.lazy(() => AuditLogWhereUniqueInputSchema).array() ]).optional(),
});

export const NotificationCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.NotificationCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => NotificationCreateWithoutUserInputSchema), z.lazy(() => NotificationCreateWithoutUserInputSchema).array(), z.lazy(() => NotificationUncheckedCreateWithoutUserInputSchema), z.lazy(() => NotificationUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => NotificationCreateOrConnectWithoutUserInputSchema), z.lazy(() => NotificationCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => NotificationCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => NotificationWhereUniqueInputSchema), z.lazy(() => NotificationWhereUniqueInputSchema).array() ]).optional(),
});

export const EmergencyContactCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.EmergencyContactCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => EmergencyContactCreateWithoutUserInputSchema), z.lazy(() => EmergencyContactCreateWithoutUserInputSchema).array(), z.lazy(() => EmergencyContactUncheckedCreateWithoutUserInputSchema), z.lazy(() => EmergencyContactUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EmergencyContactCreateOrConnectWithoutUserInputSchema), z.lazy(() => EmergencyContactCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EmergencyContactCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => EmergencyContactWhereUniqueInputSchema), z.lazy(() => EmergencyContactWhereUniqueInputSchema).array() ]).optional(),
});

export const LocationUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.LocationUncheckedCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => LocationCreateWithoutUserInputSchema), z.lazy(() => LocationCreateWithoutUserInputSchema).array(), z.lazy(() => LocationUncheckedCreateWithoutUserInputSchema), z.lazy(() => LocationUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => LocationCreateOrConnectWithoutUserInputSchema), z.lazy(() => LocationCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => LocationCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => LocationWhereUniqueInputSchema), z.lazy(() => LocationWhereUniqueInputSchema).array() ]).optional(),
});

export const CareRelationUncheckedCreateNestedManyWithoutCaregiverInputSchema: z.ZodType<Prisma.CareRelationUncheckedCreateNestedManyWithoutCaregiverInput> = z.strictObject({
  create: z.union([ z.lazy(() => CareRelationCreateWithoutCaregiverInputSchema), z.lazy(() => CareRelationCreateWithoutCaregiverInputSchema).array(), z.lazy(() => CareRelationUncheckedCreateWithoutCaregiverInputSchema), z.lazy(() => CareRelationUncheckedCreateWithoutCaregiverInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CareRelationCreateOrConnectWithoutCaregiverInputSchema), z.lazy(() => CareRelationCreateOrConnectWithoutCaregiverInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CareRelationCreateManyCaregiverInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CareRelationWhereUniqueInputSchema), z.lazy(() => CareRelationWhereUniqueInputSchema).array() ]).optional(),
});

export const CareRelationUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.CareRelationUncheckedCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => CareRelationCreateWithoutUserInputSchema), z.lazy(() => CareRelationCreateWithoutUserInputSchema).array(), z.lazy(() => CareRelationUncheckedCreateWithoutUserInputSchema), z.lazy(() => CareRelationUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CareRelationCreateOrConnectWithoutUserInputSchema), z.lazy(() => CareRelationCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CareRelationCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CareRelationWhereUniqueInputSchema), z.lazy(() => CareRelationWhereUniqueInputSchema).array() ]).optional(),
});

export const PairingTokenUncheckedCreateNestedManyWithoutCaregiverInputSchema: z.ZodType<Prisma.PairingTokenUncheckedCreateNestedManyWithoutCaregiverInput> = z.strictObject({
  create: z.union([ z.lazy(() => PairingTokenCreateWithoutCaregiverInputSchema), z.lazy(() => PairingTokenCreateWithoutCaregiverInputSchema).array(), z.lazy(() => PairingTokenUncheckedCreateWithoutCaregiverInputSchema), z.lazy(() => PairingTokenUncheckedCreateWithoutCaregiverInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PairingTokenCreateOrConnectWithoutCaregiverInputSchema), z.lazy(() => PairingTokenCreateOrConnectWithoutCaregiverInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PairingTokenCreateManyCaregiverInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => PairingTokenWhereUniqueInputSchema), z.lazy(() => PairingTokenWhereUniqueInputSchema).array() ]).optional(),
});

export const MedicalRecordUncheckedCreateNestedManyWithoutPatientInputSchema: z.ZodType<Prisma.MedicalRecordUncheckedCreateNestedManyWithoutPatientInput> = z.strictObject({
  create: z.union([ z.lazy(() => MedicalRecordCreateWithoutPatientInputSchema), z.lazy(() => MedicalRecordCreateWithoutPatientInputSchema).array(), z.lazy(() => MedicalRecordUncheckedCreateWithoutPatientInputSchema), z.lazy(() => MedicalRecordUncheckedCreateWithoutPatientInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MedicalRecordCreateOrConnectWithoutPatientInputSchema), z.lazy(() => MedicalRecordCreateOrConnectWithoutPatientInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MedicalRecordCreateManyPatientInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => MedicalRecordWhereUniqueInputSchema), z.lazy(() => MedicalRecordWhereUniqueInputSchema).array() ]).optional(),
});

export const ReminderUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.ReminderUncheckedCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => ReminderCreateWithoutUserInputSchema), z.lazy(() => ReminderCreateWithoutUserInputSchema).array(), z.lazy(() => ReminderUncheckedCreateWithoutUserInputSchema), z.lazy(() => ReminderUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReminderCreateOrConnectWithoutUserInputSchema), z.lazy(() => ReminderCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReminderCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReminderWhereUniqueInputSchema), z.lazy(() => ReminderWhereUniqueInputSchema).array() ]).optional(),
});

export const CheckInNoteUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.CheckInNoteUncheckedCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => CheckInNoteCreateWithoutUserInputSchema), z.lazy(() => CheckInNoteCreateWithoutUserInputSchema).array(), z.lazy(() => CheckInNoteUncheckedCreateWithoutUserInputSchema), z.lazy(() => CheckInNoteUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CheckInNoteCreateOrConnectWithoutUserInputSchema), z.lazy(() => CheckInNoteCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CheckInNoteCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CheckInNoteWhereUniqueInputSchema), z.lazy(() => CheckInNoteWhereUniqueInputSchema).array() ]).optional(),
});

export const BugReportUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.BugReportUncheckedCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => BugReportCreateWithoutUserInputSchema), z.lazy(() => BugReportCreateWithoutUserInputSchema).array(), z.lazy(() => BugReportUncheckedCreateWithoutUserInputSchema), z.lazy(() => BugReportUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BugReportCreateOrConnectWithoutUserInputSchema), z.lazy(() => BugReportCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BugReportCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => BugReportWhereUniqueInputSchema), z.lazy(() => BugReportWhereUniqueInputSchema).array() ]).optional(),
});

export const CustomReminderUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.CustomReminderUncheckedCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => CustomReminderCreateWithoutUserInputSchema), z.lazy(() => CustomReminderCreateWithoutUserInputSchema).array(), z.lazy(() => CustomReminderUncheckedCreateWithoutUserInputSchema), z.lazy(() => CustomReminderUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CustomReminderCreateOrConnectWithoutUserInputSchema), z.lazy(() => CustomReminderCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CustomReminderCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CustomReminderWhereUniqueInputSchema), z.lazy(() => CustomReminderWhereUniqueInputSchema).array() ]).optional(),
});

export const AuditLogUncheckedCreateNestedManyWithoutActorInputSchema: z.ZodType<Prisma.AuditLogUncheckedCreateNestedManyWithoutActorInput> = z.strictObject({
  create: z.union([ z.lazy(() => AuditLogCreateWithoutActorInputSchema), z.lazy(() => AuditLogCreateWithoutActorInputSchema).array(), z.lazy(() => AuditLogUncheckedCreateWithoutActorInputSchema), z.lazy(() => AuditLogUncheckedCreateWithoutActorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AuditLogCreateOrConnectWithoutActorInputSchema), z.lazy(() => AuditLogCreateOrConnectWithoutActorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AuditLogCreateManyActorInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AuditLogWhereUniqueInputSchema), z.lazy(() => AuditLogWhereUniqueInputSchema).array() ]).optional(),
});

export const NotificationUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.NotificationUncheckedCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => NotificationCreateWithoutUserInputSchema), z.lazy(() => NotificationCreateWithoutUserInputSchema).array(), z.lazy(() => NotificationUncheckedCreateWithoutUserInputSchema), z.lazy(() => NotificationUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => NotificationCreateOrConnectWithoutUserInputSchema), z.lazy(() => NotificationCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => NotificationCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => NotificationWhereUniqueInputSchema), z.lazy(() => NotificationWhereUniqueInputSchema).array() ]).optional(),
});

export const EmergencyContactUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.EmergencyContactUncheckedCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => EmergencyContactCreateWithoutUserInputSchema), z.lazy(() => EmergencyContactCreateWithoutUserInputSchema).array(), z.lazy(() => EmergencyContactUncheckedCreateWithoutUserInputSchema), z.lazy(() => EmergencyContactUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EmergencyContactCreateOrConnectWithoutUserInputSchema), z.lazy(() => EmergencyContactCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EmergencyContactCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => EmergencyContactWhereUniqueInputSchema), z.lazy(() => EmergencyContactWhereUniqueInputSchema).array() ]).optional(),
});

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.strictObject({
  set: z.string().optional(),
});

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> = z.strictObject({
  set: z.string().optional().nullable(),
});

export const EnumRoleFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumRoleFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => RoleSchema).optional(),
});

export const LocationUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.LocationUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => LocationCreateWithoutUserInputSchema), z.lazy(() => LocationCreateWithoutUserInputSchema).array(), z.lazy(() => LocationUncheckedCreateWithoutUserInputSchema), z.lazy(() => LocationUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => LocationCreateOrConnectWithoutUserInputSchema), z.lazy(() => LocationCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => LocationUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => LocationUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => LocationCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => LocationWhereUniqueInputSchema), z.lazy(() => LocationWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => LocationWhereUniqueInputSchema), z.lazy(() => LocationWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => LocationWhereUniqueInputSchema), z.lazy(() => LocationWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => LocationWhereUniqueInputSchema), z.lazy(() => LocationWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => LocationUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => LocationUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => LocationUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => LocationUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => LocationScalarWhereInputSchema), z.lazy(() => LocationScalarWhereInputSchema).array() ]).optional(),
});

export const LocationUpdateOneWithoutHomeOfNestedInputSchema: z.ZodType<Prisma.LocationUpdateOneWithoutHomeOfNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => LocationCreateWithoutHomeOfInputSchema), z.lazy(() => LocationUncheckedCreateWithoutHomeOfInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => LocationCreateOrConnectWithoutHomeOfInputSchema).optional(),
  upsert: z.lazy(() => LocationUpsertWithoutHomeOfInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => LocationWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => LocationWhereInputSchema) ]).optional(),
  connect: z.lazy(() => LocationWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => LocationUpdateToOneWithWhereWithoutHomeOfInputSchema), z.lazy(() => LocationUpdateWithoutHomeOfInputSchema), z.lazy(() => LocationUncheckedUpdateWithoutHomeOfInputSchema) ]).optional(),
});

export const LocationUpdateOneWithoutWorkOfNestedInputSchema: z.ZodType<Prisma.LocationUpdateOneWithoutWorkOfNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => LocationCreateWithoutWorkOfInputSchema), z.lazy(() => LocationUncheckedCreateWithoutWorkOfInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => LocationCreateOrConnectWithoutWorkOfInputSchema).optional(),
  upsert: z.lazy(() => LocationUpsertWithoutWorkOfInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => LocationWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => LocationWhereInputSchema) ]).optional(),
  connect: z.lazy(() => LocationWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => LocationUpdateToOneWithWhereWithoutWorkOfInputSchema), z.lazy(() => LocationUpdateWithoutWorkOfInputSchema), z.lazy(() => LocationUncheckedUpdateWithoutWorkOfInputSchema) ]).optional(),
});

export const CareRelationUpdateManyWithoutCaregiverNestedInputSchema: z.ZodType<Prisma.CareRelationUpdateManyWithoutCaregiverNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => CareRelationCreateWithoutCaregiverInputSchema), z.lazy(() => CareRelationCreateWithoutCaregiverInputSchema).array(), z.lazy(() => CareRelationUncheckedCreateWithoutCaregiverInputSchema), z.lazy(() => CareRelationUncheckedCreateWithoutCaregiverInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CareRelationCreateOrConnectWithoutCaregiverInputSchema), z.lazy(() => CareRelationCreateOrConnectWithoutCaregiverInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CareRelationUpsertWithWhereUniqueWithoutCaregiverInputSchema), z.lazy(() => CareRelationUpsertWithWhereUniqueWithoutCaregiverInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CareRelationCreateManyCaregiverInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CareRelationWhereUniqueInputSchema), z.lazy(() => CareRelationWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CareRelationWhereUniqueInputSchema), z.lazy(() => CareRelationWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CareRelationWhereUniqueInputSchema), z.lazy(() => CareRelationWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CareRelationWhereUniqueInputSchema), z.lazy(() => CareRelationWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CareRelationUpdateWithWhereUniqueWithoutCaregiverInputSchema), z.lazy(() => CareRelationUpdateWithWhereUniqueWithoutCaregiverInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CareRelationUpdateManyWithWhereWithoutCaregiverInputSchema), z.lazy(() => CareRelationUpdateManyWithWhereWithoutCaregiverInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CareRelationScalarWhereInputSchema), z.lazy(() => CareRelationScalarWhereInputSchema).array() ]).optional(),
});

export const CareRelationUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.CareRelationUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => CareRelationCreateWithoutUserInputSchema), z.lazy(() => CareRelationCreateWithoutUserInputSchema).array(), z.lazy(() => CareRelationUncheckedCreateWithoutUserInputSchema), z.lazy(() => CareRelationUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CareRelationCreateOrConnectWithoutUserInputSchema), z.lazy(() => CareRelationCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CareRelationUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => CareRelationUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CareRelationCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CareRelationWhereUniqueInputSchema), z.lazy(() => CareRelationWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CareRelationWhereUniqueInputSchema), z.lazy(() => CareRelationWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CareRelationWhereUniqueInputSchema), z.lazy(() => CareRelationWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CareRelationWhereUniqueInputSchema), z.lazy(() => CareRelationWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CareRelationUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => CareRelationUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CareRelationUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => CareRelationUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CareRelationScalarWhereInputSchema), z.lazy(() => CareRelationScalarWhereInputSchema).array() ]).optional(),
});

export const PairingTokenUpdateManyWithoutCaregiverNestedInputSchema: z.ZodType<Prisma.PairingTokenUpdateManyWithoutCaregiverNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => PairingTokenCreateWithoutCaregiverInputSchema), z.lazy(() => PairingTokenCreateWithoutCaregiverInputSchema).array(), z.lazy(() => PairingTokenUncheckedCreateWithoutCaregiverInputSchema), z.lazy(() => PairingTokenUncheckedCreateWithoutCaregiverInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PairingTokenCreateOrConnectWithoutCaregiverInputSchema), z.lazy(() => PairingTokenCreateOrConnectWithoutCaregiverInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => PairingTokenUpsertWithWhereUniqueWithoutCaregiverInputSchema), z.lazy(() => PairingTokenUpsertWithWhereUniqueWithoutCaregiverInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PairingTokenCreateManyCaregiverInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => PairingTokenWhereUniqueInputSchema), z.lazy(() => PairingTokenWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => PairingTokenWhereUniqueInputSchema), z.lazy(() => PairingTokenWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => PairingTokenWhereUniqueInputSchema), z.lazy(() => PairingTokenWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => PairingTokenWhereUniqueInputSchema), z.lazy(() => PairingTokenWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => PairingTokenUpdateWithWhereUniqueWithoutCaregiverInputSchema), z.lazy(() => PairingTokenUpdateWithWhereUniqueWithoutCaregiverInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => PairingTokenUpdateManyWithWhereWithoutCaregiverInputSchema), z.lazy(() => PairingTokenUpdateManyWithWhereWithoutCaregiverInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => PairingTokenScalarWhereInputSchema), z.lazy(() => PairingTokenScalarWhereInputSchema).array() ]).optional(),
});

export const MedicalRecordUpdateManyWithoutPatientNestedInputSchema: z.ZodType<Prisma.MedicalRecordUpdateManyWithoutPatientNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => MedicalRecordCreateWithoutPatientInputSchema), z.lazy(() => MedicalRecordCreateWithoutPatientInputSchema).array(), z.lazy(() => MedicalRecordUncheckedCreateWithoutPatientInputSchema), z.lazy(() => MedicalRecordUncheckedCreateWithoutPatientInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MedicalRecordCreateOrConnectWithoutPatientInputSchema), z.lazy(() => MedicalRecordCreateOrConnectWithoutPatientInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => MedicalRecordUpsertWithWhereUniqueWithoutPatientInputSchema), z.lazy(() => MedicalRecordUpsertWithWhereUniqueWithoutPatientInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MedicalRecordCreateManyPatientInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => MedicalRecordWhereUniqueInputSchema), z.lazy(() => MedicalRecordWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => MedicalRecordWhereUniqueInputSchema), z.lazy(() => MedicalRecordWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => MedicalRecordWhereUniqueInputSchema), z.lazy(() => MedicalRecordWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => MedicalRecordWhereUniqueInputSchema), z.lazy(() => MedicalRecordWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => MedicalRecordUpdateWithWhereUniqueWithoutPatientInputSchema), z.lazy(() => MedicalRecordUpdateWithWhereUniqueWithoutPatientInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => MedicalRecordUpdateManyWithWhereWithoutPatientInputSchema), z.lazy(() => MedicalRecordUpdateManyWithWhereWithoutPatientInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => MedicalRecordScalarWhereInputSchema), z.lazy(() => MedicalRecordScalarWhereInputSchema).array() ]).optional(),
});

export const ReminderUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.ReminderUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => ReminderCreateWithoutUserInputSchema), z.lazy(() => ReminderCreateWithoutUserInputSchema).array(), z.lazy(() => ReminderUncheckedCreateWithoutUserInputSchema), z.lazy(() => ReminderUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReminderCreateOrConnectWithoutUserInputSchema), z.lazy(() => ReminderCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ReminderUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => ReminderUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReminderCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ReminderWhereUniqueInputSchema), z.lazy(() => ReminderWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ReminderWhereUniqueInputSchema), z.lazy(() => ReminderWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ReminderWhereUniqueInputSchema), z.lazy(() => ReminderWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ReminderWhereUniqueInputSchema), z.lazy(() => ReminderWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ReminderUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => ReminderUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ReminderUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => ReminderUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ReminderScalarWhereInputSchema), z.lazy(() => ReminderScalarWhereInputSchema).array() ]).optional(),
});

export const CheckInNoteUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.CheckInNoteUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => CheckInNoteCreateWithoutUserInputSchema), z.lazy(() => CheckInNoteCreateWithoutUserInputSchema).array(), z.lazy(() => CheckInNoteUncheckedCreateWithoutUserInputSchema), z.lazy(() => CheckInNoteUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CheckInNoteCreateOrConnectWithoutUserInputSchema), z.lazy(() => CheckInNoteCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CheckInNoteUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => CheckInNoteUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CheckInNoteCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CheckInNoteWhereUniqueInputSchema), z.lazy(() => CheckInNoteWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CheckInNoteWhereUniqueInputSchema), z.lazy(() => CheckInNoteWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CheckInNoteWhereUniqueInputSchema), z.lazy(() => CheckInNoteWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CheckInNoteWhereUniqueInputSchema), z.lazy(() => CheckInNoteWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CheckInNoteUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => CheckInNoteUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CheckInNoteUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => CheckInNoteUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CheckInNoteScalarWhereInputSchema), z.lazy(() => CheckInNoteScalarWhereInputSchema).array() ]).optional(),
});

export const BugReportUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.BugReportUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => BugReportCreateWithoutUserInputSchema), z.lazy(() => BugReportCreateWithoutUserInputSchema).array(), z.lazy(() => BugReportUncheckedCreateWithoutUserInputSchema), z.lazy(() => BugReportUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BugReportCreateOrConnectWithoutUserInputSchema), z.lazy(() => BugReportCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => BugReportUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => BugReportUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BugReportCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => BugReportWhereUniqueInputSchema), z.lazy(() => BugReportWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => BugReportWhereUniqueInputSchema), z.lazy(() => BugReportWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => BugReportWhereUniqueInputSchema), z.lazy(() => BugReportWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BugReportWhereUniqueInputSchema), z.lazy(() => BugReportWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => BugReportUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => BugReportUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => BugReportUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => BugReportUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => BugReportScalarWhereInputSchema), z.lazy(() => BugReportScalarWhereInputSchema).array() ]).optional(),
});

export const CustomReminderUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.CustomReminderUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => CustomReminderCreateWithoutUserInputSchema), z.lazy(() => CustomReminderCreateWithoutUserInputSchema).array(), z.lazy(() => CustomReminderUncheckedCreateWithoutUserInputSchema), z.lazy(() => CustomReminderUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CustomReminderCreateOrConnectWithoutUserInputSchema), z.lazy(() => CustomReminderCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CustomReminderUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => CustomReminderUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CustomReminderCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CustomReminderWhereUniqueInputSchema), z.lazy(() => CustomReminderWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CustomReminderWhereUniqueInputSchema), z.lazy(() => CustomReminderWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CustomReminderWhereUniqueInputSchema), z.lazy(() => CustomReminderWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CustomReminderWhereUniqueInputSchema), z.lazy(() => CustomReminderWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CustomReminderUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => CustomReminderUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CustomReminderUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => CustomReminderUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CustomReminderScalarWhereInputSchema), z.lazy(() => CustomReminderScalarWhereInputSchema).array() ]).optional(),
});

export const AuditLogUpdateManyWithoutActorNestedInputSchema: z.ZodType<Prisma.AuditLogUpdateManyWithoutActorNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => AuditLogCreateWithoutActorInputSchema), z.lazy(() => AuditLogCreateWithoutActorInputSchema).array(), z.lazy(() => AuditLogUncheckedCreateWithoutActorInputSchema), z.lazy(() => AuditLogUncheckedCreateWithoutActorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AuditLogCreateOrConnectWithoutActorInputSchema), z.lazy(() => AuditLogCreateOrConnectWithoutActorInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AuditLogUpsertWithWhereUniqueWithoutActorInputSchema), z.lazy(() => AuditLogUpsertWithWhereUniqueWithoutActorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AuditLogCreateManyActorInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AuditLogWhereUniqueInputSchema), z.lazy(() => AuditLogWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AuditLogWhereUniqueInputSchema), z.lazy(() => AuditLogWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AuditLogWhereUniqueInputSchema), z.lazy(() => AuditLogWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AuditLogWhereUniqueInputSchema), z.lazy(() => AuditLogWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AuditLogUpdateWithWhereUniqueWithoutActorInputSchema), z.lazy(() => AuditLogUpdateWithWhereUniqueWithoutActorInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AuditLogUpdateManyWithWhereWithoutActorInputSchema), z.lazy(() => AuditLogUpdateManyWithWhereWithoutActorInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AuditLogScalarWhereInputSchema), z.lazy(() => AuditLogScalarWhereInputSchema).array() ]).optional(),
});

export const NotificationUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.NotificationUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => NotificationCreateWithoutUserInputSchema), z.lazy(() => NotificationCreateWithoutUserInputSchema).array(), z.lazy(() => NotificationUncheckedCreateWithoutUserInputSchema), z.lazy(() => NotificationUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => NotificationCreateOrConnectWithoutUserInputSchema), z.lazy(() => NotificationCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => NotificationUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => NotificationUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => NotificationCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => NotificationWhereUniqueInputSchema), z.lazy(() => NotificationWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => NotificationWhereUniqueInputSchema), z.lazy(() => NotificationWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => NotificationWhereUniqueInputSchema), z.lazy(() => NotificationWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => NotificationWhereUniqueInputSchema), z.lazy(() => NotificationWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => NotificationUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => NotificationUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => NotificationUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => NotificationUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => NotificationScalarWhereInputSchema), z.lazy(() => NotificationScalarWhereInputSchema).array() ]).optional(),
});

export const EmergencyContactUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.EmergencyContactUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => EmergencyContactCreateWithoutUserInputSchema), z.lazy(() => EmergencyContactCreateWithoutUserInputSchema).array(), z.lazy(() => EmergencyContactUncheckedCreateWithoutUserInputSchema), z.lazy(() => EmergencyContactUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EmergencyContactCreateOrConnectWithoutUserInputSchema), z.lazy(() => EmergencyContactCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => EmergencyContactUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => EmergencyContactUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EmergencyContactCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => EmergencyContactWhereUniqueInputSchema), z.lazy(() => EmergencyContactWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => EmergencyContactWhereUniqueInputSchema), z.lazy(() => EmergencyContactWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => EmergencyContactWhereUniqueInputSchema), z.lazy(() => EmergencyContactWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => EmergencyContactWhereUniqueInputSchema), z.lazy(() => EmergencyContactWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => EmergencyContactUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => EmergencyContactUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => EmergencyContactUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => EmergencyContactUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => EmergencyContactScalarWhereInputSchema), z.lazy(() => EmergencyContactScalarWhereInputSchema).array() ]).optional(),
});

export const NullableIntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableIntFieldUpdateOperationsInput> = z.strictObject({
  set: z.number().optional().nullable(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional(),
});

export const LocationUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.LocationUncheckedUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => LocationCreateWithoutUserInputSchema), z.lazy(() => LocationCreateWithoutUserInputSchema).array(), z.lazy(() => LocationUncheckedCreateWithoutUserInputSchema), z.lazy(() => LocationUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => LocationCreateOrConnectWithoutUserInputSchema), z.lazy(() => LocationCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => LocationUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => LocationUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => LocationCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => LocationWhereUniqueInputSchema), z.lazy(() => LocationWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => LocationWhereUniqueInputSchema), z.lazy(() => LocationWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => LocationWhereUniqueInputSchema), z.lazy(() => LocationWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => LocationWhereUniqueInputSchema), z.lazy(() => LocationWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => LocationUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => LocationUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => LocationUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => LocationUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => LocationScalarWhereInputSchema), z.lazy(() => LocationScalarWhereInputSchema).array() ]).optional(),
});

export const CareRelationUncheckedUpdateManyWithoutCaregiverNestedInputSchema: z.ZodType<Prisma.CareRelationUncheckedUpdateManyWithoutCaregiverNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => CareRelationCreateWithoutCaregiverInputSchema), z.lazy(() => CareRelationCreateWithoutCaregiverInputSchema).array(), z.lazy(() => CareRelationUncheckedCreateWithoutCaregiverInputSchema), z.lazy(() => CareRelationUncheckedCreateWithoutCaregiverInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CareRelationCreateOrConnectWithoutCaregiverInputSchema), z.lazy(() => CareRelationCreateOrConnectWithoutCaregiverInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CareRelationUpsertWithWhereUniqueWithoutCaregiverInputSchema), z.lazy(() => CareRelationUpsertWithWhereUniqueWithoutCaregiverInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CareRelationCreateManyCaregiverInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CareRelationWhereUniqueInputSchema), z.lazy(() => CareRelationWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CareRelationWhereUniqueInputSchema), z.lazy(() => CareRelationWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CareRelationWhereUniqueInputSchema), z.lazy(() => CareRelationWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CareRelationWhereUniqueInputSchema), z.lazy(() => CareRelationWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CareRelationUpdateWithWhereUniqueWithoutCaregiverInputSchema), z.lazy(() => CareRelationUpdateWithWhereUniqueWithoutCaregiverInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CareRelationUpdateManyWithWhereWithoutCaregiverInputSchema), z.lazy(() => CareRelationUpdateManyWithWhereWithoutCaregiverInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CareRelationScalarWhereInputSchema), z.lazy(() => CareRelationScalarWhereInputSchema).array() ]).optional(),
});

export const CareRelationUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.CareRelationUncheckedUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => CareRelationCreateWithoutUserInputSchema), z.lazy(() => CareRelationCreateWithoutUserInputSchema).array(), z.lazy(() => CareRelationUncheckedCreateWithoutUserInputSchema), z.lazy(() => CareRelationUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CareRelationCreateOrConnectWithoutUserInputSchema), z.lazy(() => CareRelationCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CareRelationUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => CareRelationUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CareRelationCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CareRelationWhereUniqueInputSchema), z.lazy(() => CareRelationWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CareRelationWhereUniqueInputSchema), z.lazy(() => CareRelationWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CareRelationWhereUniqueInputSchema), z.lazy(() => CareRelationWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CareRelationWhereUniqueInputSchema), z.lazy(() => CareRelationWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CareRelationUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => CareRelationUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CareRelationUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => CareRelationUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CareRelationScalarWhereInputSchema), z.lazy(() => CareRelationScalarWhereInputSchema).array() ]).optional(),
});

export const PairingTokenUncheckedUpdateManyWithoutCaregiverNestedInputSchema: z.ZodType<Prisma.PairingTokenUncheckedUpdateManyWithoutCaregiverNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => PairingTokenCreateWithoutCaregiverInputSchema), z.lazy(() => PairingTokenCreateWithoutCaregiverInputSchema).array(), z.lazy(() => PairingTokenUncheckedCreateWithoutCaregiverInputSchema), z.lazy(() => PairingTokenUncheckedCreateWithoutCaregiverInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PairingTokenCreateOrConnectWithoutCaregiverInputSchema), z.lazy(() => PairingTokenCreateOrConnectWithoutCaregiverInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => PairingTokenUpsertWithWhereUniqueWithoutCaregiverInputSchema), z.lazy(() => PairingTokenUpsertWithWhereUniqueWithoutCaregiverInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PairingTokenCreateManyCaregiverInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => PairingTokenWhereUniqueInputSchema), z.lazy(() => PairingTokenWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => PairingTokenWhereUniqueInputSchema), z.lazy(() => PairingTokenWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => PairingTokenWhereUniqueInputSchema), z.lazy(() => PairingTokenWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => PairingTokenWhereUniqueInputSchema), z.lazy(() => PairingTokenWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => PairingTokenUpdateWithWhereUniqueWithoutCaregiverInputSchema), z.lazy(() => PairingTokenUpdateWithWhereUniqueWithoutCaregiverInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => PairingTokenUpdateManyWithWhereWithoutCaregiverInputSchema), z.lazy(() => PairingTokenUpdateManyWithWhereWithoutCaregiverInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => PairingTokenScalarWhereInputSchema), z.lazy(() => PairingTokenScalarWhereInputSchema).array() ]).optional(),
});

export const MedicalRecordUncheckedUpdateManyWithoutPatientNestedInputSchema: z.ZodType<Prisma.MedicalRecordUncheckedUpdateManyWithoutPatientNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => MedicalRecordCreateWithoutPatientInputSchema), z.lazy(() => MedicalRecordCreateWithoutPatientInputSchema).array(), z.lazy(() => MedicalRecordUncheckedCreateWithoutPatientInputSchema), z.lazy(() => MedicalRecordUncheckedCreateWithoutPatientInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MedicalRecordCreateOrConnectWithoutPatientInputSchema), z.lazy(() => MedicalRecordCreateOrConnectWithoutPatientInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => MedicalRecordUpsertWithWhereUniqueWithoutPatientInputSchema), z.lazy(() => MedicalRecordUpsertWithWhereUniqueWithoutPatientInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MedicalRecordCreateManyPatientInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => MedicalRecordWhereUniqueInputSchema), z.lazy(() => MedicalRecordWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => MedicalRecordWhereUniqueInputSchema), z.lazy(() => MedicalRecordWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => MedicalRecordWhereUniqueInputSchema), z.lazy(() => MedicalRecordWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => MedicalRecordWhereUniqueInputSchema), z.lazy(() => MedicalRecordWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => MedicalRecordUpdateWithWhereUniqueWithoutPatientInputSchema), z.lazy(() => MedicalRecordUpdateWithWhereUniqueWithoutPatientInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => MedicalRecordUpdateManyWithWhereWithoutPatientInputSchema), z.lazy(() => MedicalRecordUpdateManyWithWhereWithoutPatientInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => MedicalRecordScalarWhereInputSchema), z.lazy(() => MedicalRecordScalarWhereInputSchema).array() ]).optional(),
});

export const ReminderUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.ReminderUncheckedUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => ReminderCreateWithoutUserInputSchema), z.lazy(() => ReminderCreateWithoutUserInputSchema).array(), z.lazy(() => ReminderUncheckedCreateWithoutUserInputSchema), z.lazy(() => ReminderUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReminderCreateOrConnectWithoutUserInputSchema), z.lazy(() => ReminderCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ReminderUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => ReminderUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReminderCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ReminderWhereUniqueInputSchema), z.lazy(() => ReminderWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ReminderWhereUniqueInputSchema), z.lazy(() => ReminderWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ReminderWhereUniqueInputSchema), z.lazy(() => ReminderWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ReminderWhereUniqueInputSchema), z.lazy(() => ReminderWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ReminderUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => ReminderUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ReminderUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => ReminderUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ReminderScalarWhereInputSchema), z.lazy(() => ReminderScalarWhereInputSchema).array() ]).optional(),
});

export const CheckInNoteUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.CheckInNoteUncheckedUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => CheckInNoteCreateWithoutUserInputSchema), z.lazy(() => CheckInNoteCreateWithoutUserInputSchema).array(), z.lazy(() => CheckInNoteUncheckedCreateWithoutUserInputSchema), z.lazy(() => CheckInNoteUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CheckInNoteCreateOrConnectWithoutUserInputSchema), z.lazy(() => CheckInNoteCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CheckInNoteUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => CheckInNoteUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CheckInNoteCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CheckInNoteWhereUniqueInputSchema), z.lazy(() => CheckInNoteWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CheckInNoteWhereUniqueInputSchema), z.lazy(() => CheckInNoteWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CheckInNoteWhereUniqueInputSchema), z.lazy(() => CheckInNoteWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CheckInNoteWhereUniqueInputSchema), z.lazy(() => CheckInNoteWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CheckInNoteUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => CheckInNoteUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CheckInNoteUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => CheckInNoteUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CheckInNoteScalarWhereInputSchema), z.lazy(() => CheckInNoteScalarWhereInputSchema).array() ]).optional(),
});

export const BugReportUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.BugReportUncheckedUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => BugReportCreateWithoutUserInputSchema), z.lazy(() => BugReportCreateWithoutUserInputSchema).array(), z.lazy(() => BugReportUncheckedCreateWithoutUserInputSchema), z.lazy(() => BugReportUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BugReportCreateOrConnectWithoutUserInputSchema), z.lazy(() => BugReportCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => BugReportUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => BugReportUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BugReportCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => BugReportWhereUniqueInputSchema), z.lazy(() => BugReportWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => BugReportWhereUniqueInputSchema), z.lazy(() => BugReportWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => BugReportWhereUniqueInputSchema), z.lazy(() => BugReportWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BugReportWhereUniqueInputSchema), z.lazy(() => BugReportWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => BugReportUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => BugReportUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => BugReportUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => BugReportUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => BugReportScalarWhereInputSchema), z.lazy(() => BugReportScalarWhereInputSchema).array() ]).optional(),
});

export const CustomReminderUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.CustomReminderUncheckedUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => CustomReminderCreateWithoutUserInputSchema), z.lazy(() => CustomReminderCreateWithoutUserInputSchema).array(), z.lazy(() => CustomReminderUncheckedCreateWithoutUserInputSchema), z.lazy(() => CustomReminderUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CustomReminderCreateOrConnectWithoutUserInputSchema), z.lazy(() => CustomReminderCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CustomReminderUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => CustomReminderUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CustomReminderCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CustomReminderWhereUniqueInputSchema), z.lazy(() => CustomReminderWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CustomReminderWhereUniqueInputSchema), z.lazy(() => CustomReminderWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CustomReminderWhereUniqueInputSchema), z.lazy(() => CustomReminderWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CustomReminderWhereUniqueInputSchema), z.lazy(() => CustomReminderWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CustomReminderUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => CustomReminderUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CustomReminderUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => CustomReminderUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CustomReminderScalarWhereInputSchema), z.lazy(() => CustomReminderScalarWhereInputSchema).array() ]).optional(),
});

export const AuditLogUncheckedUpdateManyWithoutActorNestedInputSchema: z.ZodType<Prisma.AuditLogUncheckedUpdateManyWithoutActorNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => AuditLogCreateWithoutActorInputSchema), z.lazy(() => AuditLogCreateWithoutActorInputSchema).array(), z.lazy(() => AuditLogUncheckedCreateWithoutActorInputSchema), z.lazy(() => AuditLogUncheckedCreateWithoutActorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AuditLogCreateOrConnectWithoutActorInputSchema), z.lazy(() => AuditLogCreateOrConnectWithoutActorInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AuditLogUpsertWithWhereUniqueWithoutActorInputSchema), z.lazy(() => AuditLogUpsertWithWhereUniqueWithoutActorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AuditLogCreateManyActorInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AuditLogWhereUniqueInputSchema), z.lazy(() => AuditLogWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AuditLogWhereUniqueInputSchema), z.lazy(() => AuditLogWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AuditLogWhereUniqueInputSchema), z.lazy(() => AuditLogWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AuditLogWhereUniqueInputSchema), z.lazy(() => AuditLogWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AuditLogUpdateWithWhereUniqueWithoutActorInputSchema), z.lazy(() => AuditLogUpdateWithWhereUniqueWithoutActorInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AuditLogUpdateManyWithWhereWithoutActorInputSchema), z.lazy(() => AuditLogUpdateManyWithWhereWithoutActorInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AuditLogScalarWhereInputSchema), z.lazy(() => AuditLogScalarWhereInputSchema).array() ]).optional(),
});

export const NotificationUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.NotificationUncheckedUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => NotificationCreateWithoutUserInputSchema), z.lazy(() => NotificationCreateWithoutUserInputSchema).array(), z.lazy(() => NotificationUncheckedCreateWithoutUserInputSchema), z.lazy(() => NotificationUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => NotificationCreateOrConnectWithoutUserInputSchema), z.lazy(() => NotificationCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => NotificationUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => NotificationUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => NotificationCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => NotificationWhereUniqueInputSchema), z.lazy(() => NotificationWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => NotificationWhereUniqueInputSchema), z.lazy(() => NotificationWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => NotificationWhereUniqueInputSchema), z.lazy(() => NotificationWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => NotificationWhereUniqueInputSchema), z.lazy(() => NotificationWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => NotificationUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => NotificationUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => NotificationUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => NotificationUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => NotificationScalarWhereInputSchema), z.lazy(() => NotificationScalarWhereInputSchema).array() ]).optional(),
});

export const EmergencyContactUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.EmergencyContactUncheckedUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => EmergencyContactCreateWithoutUserInputSchema), z.lazy(() => EmergencyContactCreateWithoutUserInputSchema).array(), z.lazy(() => EmergencyContactUncheckedCreateWithoutUserInputSchema), z.lazy(() => EmergencyContactUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EmergencyContactCreateOrConnectWithoutUserInputSchema), z.lazy(() => EmergencyContactCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => EmergencyContactUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => EmergencyContactUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EmergencyContactCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => EmergencyContactWhereUniqueInputSchema), z.lazy(() => EmergencyContactWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => EmergencyContactWhereUniqueInputSchema), z.lazy(() => EmergencyContactWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => EmergencyContactWhereUniqueInputSchema), z.lazy(() => EmergencyContactWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => EmergencyContactWhereUniqueInputSchema), z.lazy(() => EmergencyContactWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => EmergencyContactUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => EmergencyContactUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => EmergencyContactUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => EmergencyContactUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => EmergencyContactScalarWhereInputSchema), z.lazy(() => EmergencyContactScalarWhereInputSchema).array() ]).optional(),
});

export const UserCreateNestedOneWithoutLocationsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutLocationsInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutLocationsInputSchema), z.lazy(() => UserUncheckedCreateWithoutLocationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutLocationsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
});

export const UserCreateNestedManyWithoutHomeInputSchema: z.ZodType<Prisma.UserCreateNestedManyWithoutHomeInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutHomeInputSchema), z.lazy(() => UserCreateWithoutHomeInputSchema).array(), z.lazy(() => UserUncheckedCreateWithoutHomeInputSchema), z.lazy(() => UserUncheckedCreateWithoutHomeInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserCreateOrConnectWithoutHomeInputSchema), z.lazy(() => UserCreateOrConnectWithoutHomeInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserCreateManyHomeInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserWhereUniqueInputSchema), z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
});

export const UserCreateNestedManyWithoutWorkInputSchema: z.ZodType<Prisma.UserCreateNestedManyWithoutWorkInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutWorkInputSchema), z.lazy(() => UserCreateWithoutWorkInputSchema).array(), z.lazy(() => UserUncheckedCreateWithoutWorkInputSchema), z.lazy(() => UserUncheckedCreateWithoutWorkInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserCreateOrConnectWithoutWorkInputSchema), z.lazy(() => UserCreateOrConnectWithoutWorkInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserCreateManyWorkInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserWhereUniqueInputSchema), z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
});

export const UserUncheckedCreateNestedManyWithoutHomeInputSchema: z.ZodType<Prisma.UserUncheckedCreateNestedManyWithoutHomeInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutHomeInputSchema), z.lazy(() => UserCreateWithoutHomeInputSchema).array(), z.lazy(() => UserUncheckedCreateWithoutHomeInputSchema), z.lazy(() => UserUncheckedCreateWithoutHomeInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserCreateOrConnectWithoutHomeInputSchema), z.lazy(() => UserCreateOrConnectWithoutHomeInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserCreateManyHomeInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserWhereUniqueInputSchema), z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
});

export const UserUncheckedCreateNestedManyWithoutWorkInputSchema: z.ZodType<Prisma.UserUncheckedCreateNestedManyWithoutWorkInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutWorkInputSchema), z.lazy(() => UserCreateWithoutWorkInputSchema).array(), z.lazy(() => UserUncheckedCreateWithoutWorkInputSchema), z.lazy(() => UserUncheckedCreateWithoutWorkInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserCreateOrConnectWithoutWorkInputSchema), z.lazy(() => UserCreateOrConnectWithoutWorkInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserCreateManyWorkInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserWhereUniqueInputSchema), z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
});

export const FloatFieldUpdateOperationsInputSchema: z.ZodType<Prisma.FloatFieldUpdateOperationsInput> = z.strictObject({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional(),
});

export const DateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> = z.strictObject({
  set: z.coerce.date().optional(),
});

export const UserUpdateOneRequiredWithoutLocationsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutLocationsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutLocationsInputSchema), z.lazy(() => UserUncheckedCreateWithoutLocationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutLocationsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutLocationsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutLocationsInputSchema), z.lazy(() => UserUpdateWithoutLocationsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutLocationsInputSchema) ]).optional(),
});

export const UserUpdateManyWithoutHomeNestedInputSchema: z.ZodType<Prisma.UserUpdateManyWithoutHomeNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutHomeInputSchema), z.lazy(() => UserCreateWithoutHomeInputSchema).array(), z.lazy(() => UserUncheckedCreateWithoutHomeInputSchema), z.lazy(() => UserUncheckedCreateWithoutHomeInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserCreateOrConnectWithoutHomeInputSchema), z.lazy(() => UserCreateOrConnectWithoutHomeInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserUpsertWithWhereUniqueWithoutHomeInputSchema), z.lazy(() => UserUpsertWithWhereUniqueWithoutHomeInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserCreateManyHomeInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserWhereUniqueInputSchema), z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserWhereUniqueInputSchema), z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserWhereUniqueInputSchema), z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserWhereUniqueInputSchema), z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserUpdateWithWhereUniqueWithoutHomeInputSchema), z.lazy(() => UserUpdateWithWhereUniqueWithoutHomeInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserUpdateManyWithWhereWithoutHomeInputSchema), z.lazy(() => UserUpdateManyWithWhereWithoutHomeInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserScalarWhereInputSchema), z.lazy(() => UserScalarWhereInputSchema).array() ]).optional(),
});

export const UserUpdateManyWithoutWorkNestedInputSchema: z.ZodType<Prisma.UserUpdateManyWithoutWorkNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutWorkInputSchema), z.lazy(() => UserCreateWithoutWorkInputSchema).array(), z.lazy(() => UserUncheckedCreateWithoutWorkInputSchema), z.lazy(() => UserUncheckedCreateWithoutWorkInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserCreateOrConnectWithoutWorkInputSchema), z.lazy(() => UserCreateOrConnectWithoutWorkInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserUpsertWithWhereUniqueWithoutWorkInputSchema), z.lazy(() => UserUpsertWithWhereUniqueWithoutWorkInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserCreateManyWorkInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserWhereUniqueInputSchema), z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserWhereUniqueInputSchema), z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserWhereUniqueInputSchema), z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserWhereUniqueInputSchema), z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserUpdateWithWhereUniqueWithoutWorkInputSchema), z.lazy(() => UserUpdateWithWhereUniqueWithoutWorkInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserUpdateManyWithWhereWithoutWorkInputSchema), z.lazy(() => UserUpdateManyWithWhereWithoutWorkInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserScalarWhereInputSchema), z.lazy(() => UserScalarWhereInputSchema).array() ]).optional(),
});

export const IntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.IntFieldUpdateOperationsInput> = z.strictObject({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional(),
});

export const UserUncheckedUpdateManyWithoutHomeNestedInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyWithoutHomeNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutHomeInputSchema), z.lazy(() => UserCreateWithoutHomeInputSchema).array(), z.lazy(() => UserUncheckedCreateWithoutHomeInputSchema), z.lazy(() => UserUncheckedCreateWithoutHomeInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserCreateOrConnectWithoutHomeInputSchema), z.lazy(() => UserCreateOrConnectWithoutHomeInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserUpsertWithWhereUniqueWithoutHomeInputSchema), z.lazy(() => UserUpsertWithWhereUniqueWithoutHomeInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserCreateManyHomeInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserWhereUniqueInputSchema), z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserWhereUniqueInputSchema), z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserWhereUniqueInputSchema), z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserWhereUniqueInputSchema), z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserUpdateWithWhereUniqueWithoutHomeInputSchema), z.lazy(() => UserUpdateWithWhereUniqueWithoutHomeInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserUpdateManyWithWhereWithoutHomeInputSchema), z.lazy(() => UserUpdateManyWithWhereWithoutHomeInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserScalarWhereInputSchema), z.lazy(() => UserScalarWhereInputSchema).array() ]).optional(),
});

export const UserUncheckedUpdateManyWithoutWorkNestedInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyWithoutWorkNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutWorkInputSchema), z.lazy(() => UserCreateWithoutWorkInputSchema).array(), z.lazy(() => UserUncheckedCreateWithoutWorkInputSchema), z.lazy(() => UserUncheckedCreateWithoutWorkInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserCreateOrConnectWithoutWorkInputSchema), z.lazy(() => UserCreateOrConnectWithoutWorkInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserUpsertWithWhereUniqueWithoutWorkInputSchema), z.lazy(() => UserUpsertWithWhereUniqueWithoutWorkInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserCreateManyWorkInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserWhereUniqueInputSchema), z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserWhereUniqueInputSchema), z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserWhereUniqueInputSchema), z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserWhereUniqueInputSchema), z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserUpdateWithWhereUniqueWithoutWorkInputSchema), z.lazy(() => UserUpdateWithWhereUniqueWithoutWorkInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserUpdateManyWithWhereWithoutWorkInputSchema), z.lazy(() => UserUpdateManyWithWhereWithoutWorkInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserScalarWhereInputSchema), z.lazy(() => UserScalarWhereInputSchema).array() ]).optional(),
});

export const UserCreateNestedOneWithoutDependentInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutDependentInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutDependentInputSchema), z.lazy(() => UserUncheckedCreateWithoutDependentInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDependentInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
});

export const UserCreateNestedOneWithoutCaregiverInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutCaregiverInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutCaregiverInputSchema), z.lazy(() => UserUncheckedCreateWithoutCaregiverInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutCaregiverInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
});

export const UserUpdateOneRequiredWithoutDependentNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutDependentNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutDependentInputSchema), z.lazy(() => UserUncheckedCreateWithoutDependentInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDependentInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutDependentInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutDependentInputSchema), z.lazy(() => UserUpdateWithoutDependentInputSchema), z.lazy(() => UserUncheckedUpdateWithoutDependentInputSchema) ]).optional(),
});

export const UserUpdateOneRequiredWithoutCaregiverNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutCaregiverNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutCaregiverInputSchema), z.lazy(() => UserUncheckedCreateWithoutCaregiverInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutCaregiverInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutCaregiverInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutCaregiverInputSchema), z.lazy(() => UserUpdateWithoutCaregiverInputSchema), z.lazy(() => UserUncheckedUpdateWithoutCaregiverInputSchema) ]).optional(),
});

export const UserCreateNestedOneWithoutPairingTokensInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutPairingTokensInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutPairingTokensInputSchema), z.lazy(() => UserUncheckedCreateWithoutPairingTokensInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutPairingTokensInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
});

export const NullableDateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableDateTimeFieldUpdateOperationsInput> = z.strictObject({
  set: z.coerce.date().optional().nullable(),
});

export const UserUpdateOneRequiredWithoutPairingTokensNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutPairingTokensNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutPairingTokensInputSchema), z.lazy(() => UserUncheckedCreateWithoutPairingTokensInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutPairingTokensInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutPairingTokensInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutPairingTokensInputSchema), z.lazy(() => UserUpdateWithoutPairingTokensInputSchema), z.lazy(() => UserUncheckedUpdateWithoutPairingTokensInputSchema) ]).optional(),
});

export const UserCreateNestedOneWithoutMedicalRecordsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutMedicalRecordsInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutMedicalRecordsInputSchema), z.lazy(() => UserUncheckedCreateWithoutMedicalRecordsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutMedicalRecordsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
});

export const EnumSexFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumSexFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => SexSchema).optional(),
});

export const NullableFloatFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableFloatFieldUpdateOperationsInput> = z.strictObject({
  set: z.number().optional().nullable(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional(),
});

export const UserUpdateOneRequiredWithoutMedicalRecordsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutMedicalRecordsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutMedicalRecordsInputSchema), z.lazy(() => UserUncheckedCreateWithoutMedicalRecordsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutMedicalRecordsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutMedicalRecordsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutMedicalRecordsInputSchema), z.lazy(() => UserUpdateWithoutMedicalRecordsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutMedicalRecordsInputSchema) ]).optional(),
});

export const UserCreateNestedOneWithoutRemindersInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutRemindersInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutRemindersInputSchema), z.lazy(() => UserUncheckedCreateWithoutRemindersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutRemindersInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
});

export const EnumReminderTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumReminderTypeFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => ReminderTypeSchema).optional(),
});

export const BoolFieldUpdateOperationsInputSchema: z.ZodType<Prisma.BoolFieldUpdateOperationsInput> = z.strictObject({
  set: z.boolean().optional(),
});

export const UserUpdateOneRequiredWithoutRemindersNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutRemindersNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutRemindersInputSchema), z.lazy(() => UserUncheckedCreateWithoutRemindersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutRemindersInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutRemindersInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutRemindersInputSchema), z.lazy(() => UserUpdateWithoutRemindersInputSchema), z.lazy(() => UserUncheckedUpdateWithoutRemindersInputSchema) ]).optional(),
});

export const UserCreateNestedOneWithoutCheckInNotesInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutCheckInNotesInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutCheckInNotesInputSchema), z.lazy(() => UserUncheckedCreateWithoutCheckInNotesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutCheckInNotesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
});

export const EnumHealthStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumHealthStatusFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => HealthStatusSchema).optional(),
});

export const UserUpdateOneRequiredWithoutCheckInNotesNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutCheckInNotesNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutCheckInNotesInputSchema), z.lazy(() => UserUncheckedCreateWithoutCheckInNotesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutCheckInNotesInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutCheckInNotesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutCheckInNotesInputSchema), z.lazy(() => UserUpdateWithoutCheckInNotesInputSchema), z.lazy(() => UserUncheckedUpdateWithoutCheckInNotesInputSchema) ]).optional(),
});

export const UserCreateNestedOneWithoutBugReportsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutBugReportsInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutBugReportsInputSchema), z.lazy(() => UserUncheckedCreateWithoutBugReportsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutBugReportsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
});

export const EnumReportTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumReportTypeFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => ReportTypeSchema).optional(),
});

export const UserUpdateOneRequiredWithoutBugReportsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutBugReportsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutBugReportsInputSchema), z.lazy(() => UserUncheckedCreateWithoutBugReportsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutBugReportsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutBugReportsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutBugReportsInputSchema), z.lazy(() => UserUpdateWithoutBugReportsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutBugReportsInputSchema) ]).optional(),
});

export const UserCreateNestedOneWithoutCustomRemindersInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutCustomRemindersInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutCustomRemindersInputSchema), z.lazy(() => UserUncheckedCreateWithoutCustomRemindersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutCustomRemindersInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
});

export const UserUpdateOneRequiredWithoutCustomRemindersNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutCustomRemindersNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutCustomRemindersInputSchema), z.lazy(() => UserUncheckedCreateWithoutCustomRemindersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutCustomRemindersInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutCustomRemindersInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutCustomRemindersInputSchema), z.lazy(() => UserUpdateWithoutCustomRemindersInputSchema), z.lazy(() => UserUncheckedUpdateWithoutCustomRemindersInputSchema) ]).optional(),
});

export const UserCreateNestedOneWithoutAuditLogsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutAuditLogsInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutAuditLogsInputSchema), z.lazy(() => UserUncheckedCreateWithoutAuditLogsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutAuditLogsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
});

export const EnumAuditActionFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumAuditActionFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => AuditActionSchema).optional(),
});

export const UserUpdateOneWithoutAuditLogsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutAuditLogsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutAuditLogsInputSchema), z.lazy(() => UserUncheckedCreateWithoutAuditLogsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutAuditLogsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutAuditLogsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutAuditLogsInputSchema), z.lazy(() => UserUpdateWithoutAuditLogsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutAuditLogsInputSchema) ]).optional(),
});

export const UserCreateNestedOneWithoutNotificationsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutNotificationsInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutNotificationsInputSchema), z.lazy(() => UserUncheckedCreateWithoutNotificationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutNotificationsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
});

export const EnumNotificationTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumNotificationTypeFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => NotificationTypeSchema).optional(),
});

export const UserUpdateOneRequiredWithoutNotificationsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutNotificationsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutNotificationsInputSchema), z.lazy(() => UserUncheckedCreateWithoutNotificationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutNotificationsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutNotificationsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutNotificationsInputSchema), z.lazy(() => UserUpdateWithoutNotificationsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutNotificationsInputSchema) ]).optional(),
});

export const UserCreateNestedOneWithoutEmergencyContactsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutEmergencyContactsInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutEmergencyContactsInputSchema), z.lazy(() => UserUncheckedCreateWithoutEmergencyContactsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutEmergencyContactsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
});

export const UserUpdateOneRequiredWithoutEmergencyContactsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutEmergencyContactsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutEmergencyContactsInputSchema), z.lazy(() => UserUncheckedCreateWithoutEmergencyContactsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutEmergencyContactsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutEmergencyContactsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutEmergencyContactsInputSchema), z.lazy(() => UserUpdateWithoutEmergencyContactsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutEmergencyContactsInputSchema) ]).optional(),
});

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
});

export const NestedStringNullableFilterSchema: z.ZodType<Prisma.NestedStringNullableFilter> = z.strictObject({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
});

export const NestedEnumRoleFilterSchema: z.ZodType<Prisma.NestedEnumRoleFilter> = z.strictObject({
  equals: z.lazy(() => RoleSchema).optional(),
  in: z.lazy(() => RoleSchema).array().optional(),
  notIn: z.lazy(() => RoleSchema).array().optional(),
  not: z.union([ z.lazy(() => RoleSchema), z.lazy(() => NestedEnumRoleFilterSchema) ]).optional(),
});

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> = z.strictObject({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
});

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional(),
});

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
});

export const NestedStringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> = z.strictObject({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional(),
});

export const NestedEnumRoleWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumRoleWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => RoleSchema).optional(),
  in: z.lazy(() => RoleSchema).array().optional(),
  notIn: z.lazy(() => RoleSchema).array().optional(),
  not: z.union([ z.lazy(() => RoleSchema), z.lazy(() => NestedEnumRoleWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumRoleFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumRoleFilterSchema).optional(),
});

export const NestedIntNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntNullableWithAggregatesFilter> = z.strictObject({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedIntNullableFilterSchema).optional(),
});

export const NestedFloatNullableFilterSchema: z.ZodType<Prisma.NestedFloatNullableFilter> = z.strictObject({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatNullableFilterSchema) ]).optional().nullable(),
});

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
});

export const NestedDateTimeFilterSchema: z.ZodType<Prisma.NestedDateTimeFilter> = z.strictObject({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
});

export const NestedIntWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntWithAggregatesFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional(),
});

export const NestedFloatWithAggregatesFilterSchema: z.ZodType<Prisma.NestedFloatWithAggregatesFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedFloatFilterSchema).optional(),
  _min: z.lazy(() => NestedFloatFilterSchema).optional(),
  _max: z.lazy(() => NestedFloatFilterSchema).optional(),
});

export const NestedDateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> = z.strictObject({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional(),
});

export const NestedDateTimeNullableFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableFilter> = z.strictObject({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableFilterSchema) ]).optional().nullable(),
});

export const NestedDateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableWithAggregatesFilter> = z.strictObject({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
});

export const NestedEnumSexFilterSchema: z.ZodType<Prisma.NestedEnumSexFilter> = z.strictObject({
  equals: z.lazy(() => SexSchema).optional(),
  in: z.lazy(() => SexSchema).array().optional(),
  notIn: z.lazy(() => SexSchema).array().optional(),
  not: z.union([ z.lazy(() => SexSchema), z.lazy(() => NestedEnumSexFilterSchema) ]).optional(),
});

export const NestedEnumSexWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumSexWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => SexSchema).optional(),
  in: z.lazy(() => SexSchema).array().optional(),
  notIn: z.lazy(() => SexSchema).array().optional(),
  not: z.union([ z.lazy(() => SexSchema), z.lazy(() => NestedEnumSexWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumSexFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumSexFilterSchema).optional(),
});

export const NestedFloatNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedFloatNullableWithAggregatesFilter> = z.strictObject({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
});

export const NestedEnumReminderTypeFilterSchema: z.ZodType<Prisma.NestedEnumReminderTypeFilter> = z.strictObject({
  equals: z.lazy(() => ReminderTypeSchema).optional(),
  in: z.lazy(() => ReminderTypeSchema).array().optional(),
  notIn: z.lazy(() => ReminderTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => ReminderTypeSchema), z.lazy(() => NestedEnumReminderTypeFilterSchema) ]).optional(),
});

export const NestedBoolFilterSchema: z.ZodType<Prisma.NestedBoolFilter> = z.strictObject({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
});

export const NestedEnumReminderTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumReminderTypeWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => ReminderTypeSchema).optional(),
  in: z.lazy(() => ReminderTypeSchema).array().optional(),
  notIn: z.lazy(() => ReminderTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => ReminderTypeSchema), z.lazy(() => NestedEnumReminderTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumReminderTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumReminderTypeFilterSchema).optional(),
});

export const NestedBoolWithAggregatesFilterSchema: z.ZodType<Prisma.NestedBoolWithAggregatesFilter> = z.strictObject({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional(),
});

export const NestedEnumHealthStatusFilterSchema: z.ZodType<Prisma.NestedEnumHealthStatusFilter> = z.strictObject({
  equals: z.lazy(() => HealthStatusSchema).optional(),
  in: z.lazy(() => HealthStatusSchema).array().optional(),
  notIn: z.lazy(() => HealthStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => HealthStatusSchema), z.lazy(() => NestedEnumHealthStatusFilterSchema) ]).optional(),
});

export const NestedEnumHealthStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumHealthStatusWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => HealthStatusSchema).optional(),
  in: z.lazy(() => HealthStatusSchema).array().optional(),
  notIn: z.lazy(() => HealthStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => HealthStatusSchema), z.lazy(() => NestedEnumHealthStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumHealthStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumHealthStatusFilterSchema).optional(),
});

export const NestedEnumReportTypeFilterSchema: z.ZodType<Prisma.NestedEnumReportTypeFilter> = z.strictObject({
  equals: z.lazy(() => ReportTypeSchema).optional(),
  in: z.lazy(() => ReportTypeSchema).array().optional(),
  notIn: z.lazy(() => ReportTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => ReportTypeSchema), z.lazy(() => NestedEnumReportTypeFilterSchema) ]).optional(),
});

export const NestedEnumReportTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumReportTypeWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => ReportTypeSchema).optional(),
  in: z.lazy(() => ReportTypeSchema).array().optional(),
  notIn: z.lazy(() => ReportTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => ReportTypeSchema), z.lazy(() => NestedEnumReportTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumReportTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumReportTypeFilterSchema).optional(),
});

export const NestedEnumAuditActionFilterSchema: z.ZodType<Prisma.NestedEnumAuditActionFilter> = z.strictObject({
  equals: z.lazy(() => AuditActionSchema).optional(),
  in: z.lazy(() => AuditActionSchema).array().optional(),
  notIn: z.lazy(() => AuditActionSchema).array().optional(),
  not: z.union([ z.lazy(() => AuditActionSchema), z.lazy(() => NestedEnumAuditActionFilterSchema) ]).optional(),
});

export const NestedEnumAuditActionWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumAuditActionWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => AuditActionSchema).optional(),
  in: z.lazy(() => AuditActionSchema).array().optional(),
  notIn: z.lazy(() => AuditActionSchema).array().optional(),
  not: z.union([ z.lazy(() => AuditActionSchema), z.lazy(() => NestedEnumAuditActionWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumAuditActionFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumAuditActionFilterSchema).optional(),
});

export const NestedJsonNullableFilterSchema: z.ZodType<Prisma.NestedJsonNullableFilter> = z.strictObject({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional(),
});

export const NestedEnumNotificationTypeFilterSchema: z.ZodType<Prisma.NestedEnumNotificationTypeFilter> = z.strictObject({
  equals: z.lazy(() => NotificationTypeSchema).optional(),
  in: z.lazy(() => NotificationTypeSchema).array().optional(),
  notIn: z.lazy(() => NotificationTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => NotificationTypeSchema), z.lazy(() => NestedEnumNotificationTypeFilterSchema) ]).optional(),
});

export const NestedEnumNotificationTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumNotificationTypeWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => NotificationTypeSchema).optional(),
  in: z.lazy(() => NotificationTypeSchema).array().optional(),
  notIn: z.lazy(() => NotificationTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => NotificationTypeSchema), z.lazy(() => NestedEnumNotificationTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumNotificationTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumNotificationTypeFilterSchema).optional(),
});

export const LocationCreateWithoutUserInputSchema: z.ZodType<Prisma.LocationCreateWithoutUserInput> = z.strictObject({
  latitude: z.number(),
  longitude: z.number(),
  createdAt: z.coerce.date().optional(),
  homeOf: z.lazy(() => UserCreateNestedManyWithoutHomeInputSchema).optional(),
  workOf: z.lazy(() => UserCreateNestedManyWithoutWorkInputSchema).optional(),
});

export const LocationUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.LocationUncheckedCreateWithoutUserInput> = z.strictObject({
  id: z.number().int().optional(),
  latitude: z.number(),
  longitude: z.number(),
  createdAt: z.coerce.date().optional(),
  homeOf: z.lazy(() => UserUncheckedCreateNestedManyWithoutHomeInputSchema).optional(),
  workOf: z.lazy(() => UserUncheckedCreateNestedManyWithoutWorkInputSchema).optional(),
});

export const LocationCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.LocationCreateOrConnectWithoutUserInput> = z.strictObject({
  where: z.lazy(() => LocationWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => LocationCreateWithoutUserInputSchema), z.lazy(() => LocationUncheckedCreateWithoutUserInputSchema) ]),
});

export const LocationCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.LocationCreateManyUserInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => LocationCreateManyUserInputSchema), z.lazy(() => LocationCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const LocationCreateWithoutHomeOfInputSchema: z.ZodType<Prisma.LocationCreateWithoutHomeOfInput> = z.strictObject({
  latitude: z.number(),
  longitude: z.number(),
  createdAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutLocationsInputSchema),
  workOf: z.lazy(() => UserCreateNestedManyWithoutWorkInputSchema).optional(),
});

export const LocationUncheckedCreateWithoutHomeOfInputSchema: z.ZodType<Prisma.LocationUncheckedCreateWithoutHomeOfInput> = z.strictObject({
  id: z.number().int().optional(),
  latitude: z.number(),
  longitude: z.number(),
  createdAt: z.coerce.date().optional(),
  userId: z.string(),
  workOf: z.lazy(() => UserUncheckedCreateNestedManyWithoutWorkInputSchema).optional(),
});

export const LocationCreateOrConnectWithoutHomeOfInputSchema: z.ZodType<Prisma.LocationCreateOrConnectWithoutHomeOfInput> = z.strictObject({
  where: z.lazy(() => LocationWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => LocationCreateWithoutHomeOfInputSchema), z.lazy(() => LocationUncheckedCreateWithoutHomeOfInputSchema) ]),
});

export const LocationCreateWithoutWorkOfInputSchema: z.ZodType<Prisma.LocationCreateWithoutWorkOfInput> = z.strictObject({
  latitude: z.number(),
  longitude: z.number(),
  createdAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutLocationsInputSchema),
  homeOf: z.lazy(() => UserCreateNestedManyWithoutHomeInputSchema).optional(),
});

export const LocationUncheckedCreateWithoutWorkOfInputSchema: z.ZodType<Prisma.LocationUncheckedCreateWithoutWorkOfInput> = z.strictObject({
  id: z.number().int().optional(),
  latitude: z.number(),
  longitude: z.number(),
  createdAt: z.coerce.date().optional(),
  userId: z.string(),
  homeOf: z.lazy(() => UserUncheckedCreateNestedManyWithoutHomeInputSchema).optional(),
});

export const LocationCreateOrConnectWithoutWorkOfInputSchema: z.ZodType<Prisma.LocationCreateOrConnectWithoutWorkOfInput> = z.strictObject({
  where: z.lazy(() => LocationWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => LocationCreateWithoutWorkOfInputSchema), z.lazy(() => LocationUncheckedCreateWithoutWorkOfInputSchema) ]),
});

export const CareRelationCreateWithoutCaregiverInputSchema: z.ZodType<Prisma.CareRelationCreateWithoutCaregiverInput> = z.strictObject({
  createdAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutCaregiverInputSchema),
});

export const CareRelationUncheckedCreateWithoutCaregiverInputSchema: z.ZodType<Prisma.CareRelationUncheckedCreateWithoutCaregiverInput> = z.strictObject({
  id: z.number().int().optional(),
  userId: z.string(),
  createdAt: z.coerce.date().optional(),
});

export const CareRelationCreateOrConnectWithoutCaregiverInputSchema: z.ZodType<Prisma.CareRelationCreateOrConnectWithoutCaregiverInput> = z.strictObject({
  where: z.lazy(() => CareRelationWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CareRelationCreateWithoutCaregiverInputSchema), z.lazy(() => CareRelationUncheckedCreateWithoutCaregiverInputSchema) ]),
});

export const CareRelationCreateManyCaregiverInputEnvelopeSchema: z.ZodType<Prisma.CareRelationCreateManyCaregiverInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => CareRelationCreateManyCaregiverInputSchema), z.lazy(() => CareRelationCreateManyCaregiverInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const CareRelationCreateWithoutUserInputSchema: z.ZodType<Prisma.CareRelationCreateWithoutUserInput> = z.strictObject({
  createdAt: z.coerce.date().optional(),
  caregiver: z.lazy(() => UserCreateNestedOneWithoutDependentInputSchema),
});

export const CareRelationUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.CareRelationUncheckedCreateWithoutUserInput> = z.strictObject({
  id: z.number().int().optional(),
  caregiverId: z.string(),
  createdAt: z.coerce.date().optional(),
});

export const CareRelationCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.CareRelationCreateOrConnectWithoutUserInput> = z.strictObject({
  where: z.lazy(() => CareRelationWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CareRelationCreateWithoutUserInputSchema), z.lazy(() => CareRelationUncheckedCreateWithoutUserInputSchema) ]),
});

export const CareRelationCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.CareRelationCreateManyUserInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => CareRelationCreateManyUserInputSchema), z.lazy(() => CareRelationCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const PairingTokenCreateWithoutCaregiverInputSchema: z.ZodType<Prisma.PairingTokenCreateWithoutCaregiverInput> = z.strictObject({
  id: z.uuid().optional(),
  token: z.string(),
  createdAt: z.coerce.date().optional(),
  expiryAt: z.coerce.date(),
  usedAt: z.coerce.date().optional().nullable(),
});

export const PairingTokenUncheckedCreateWithoutCaregiverInputSchema: z.ZodType<Prisma.PairingTokenUncheckedCreateWithoutCaregiverInput> = z.strictObject({
  id: z.uuid().optional(),
  token: z.string(),
  createdAt: z.coerce.date().optional(),
  expiryAt: z.coerce.date(),
  usedAt: z.coerce.date().optional().nullable(),
});

export const PairingTokenCreateOrConnectWithoutCaregiverInputSchema: z.ZodType<Prisma.PairingTokenCreateOrConnectWithoutCaregiverInput> = z.strictObject({
  where: z.lazy(() => PairingTokenWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => PairingTokenCreateWithoutCaregiverInputSchema), z.lazy(() => PairingTokenUncheckedCreateWithoutCaregiverInputSchema) ]),
});

export const PairingTokenCreateManyCaregiverInputEnvelopeSchema: z.ZodType<Prisma.PairingTokenCreateManyCaregiverInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => PairingTokenCreateManyCaregiverInputSchema), z.lazy(() => PairingTokenCreateManyCaregiverInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const MedicalRecordCreateWithoutPatientInputSchema: z.ZodType<Prisma.MedicalRecordCreateWithoutPatientInput> = z.strictObject({
  id: z.uuid().optional(),
  gender: z.lazy(() => SexSchema),
  dateOfBirth: z.coerce.date(),
  height: z.number().optional().nullable(),
  weight: z.number().optional().nullable(),
  incidentHistory: z.string().optional().nullable(),
  medicalHistory: z.string().optional().nullable(),
  geneticHistory: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  medications: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  modifiedAt: z.coerce.date().optional(),
});

export const MedicalRecordUncheckedCreateWithoutPatientInputSchema: z.ZodType<Prisma.MedicalRecordUncheckedCreateWithoutPatientInput> = z.strictObject({
  id: z.uuid().optional(),
  gender: z.lazy(() => SexSchema),
  dateOfBirth: z.coerce.date(),
  height: z.number().optional().nullable(),
  weight: z.number().optional().nullable(),
  incidentHistory: z.string().optional().nullable(),
  medicalHistory: z.string().optional().nullable(),
  geneticHistory: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  medications: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  modifiedAt: z.coerce.date().optional(),
});

export const MedicalRecordCreateOrConnectWithoutPatientInputSchema: z.ZodType<Prisma.MedicalRecordCreateOrConnectWithoutPatientInput> = z.strictObject({
  where: z.lazy(() => MedicalRecordWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => MedicalRecordCreateWithoutPatientInputSchema), z.lazy(() => MedicalRecordUncheckedCreateWithoutPatientInputSchema) ]),
});

export const MedicalRecordCreateManyPatientInputEnvelopeSchema: z.ZodType<Prisma.MedicalRecordCreateManyPatientInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => MedicalRecordCreateManyPatientInputSchema), z.lazy(() => MedicalRecordCreateManyPatientInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const ReminderCreateWithoutUserInputSchema: z.ZodType<Prisma.ReminderCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  type: z.lazy(() => ReminderTypeSchema),
  interval: z.number().int(),
  disabled: z.boolean().optional(),
  lastSent: z.coerce.date().optional().nullable(),
  nextAt: z.coerce.date(),
});

export const ReminderUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.ReminderUncheckedCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  type: z.lazy(() => ReminderTypeSchema),
  interval: z.number().int(),
  disabled: z.boolean().optional(),
  lastSent: z.coerce.date().optional().nullable(),
  nextAt: z.coerce.date(),
});

export const ReminderCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.ReminderCreateOrConnectWithoutUserInput> = z.strictObject({
  where: z.lazy(() => ReminderWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ReminderCreateWithoutUserInputSchema), z.lazy(() => ReminderUncheckedCreateWithoutUserInputSchema) ]),
});

export const ReminderCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.ReminderCreateManyUserInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => ReminderCreateManyUserInputSchema), z.lazy(() => ReminderCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const CheckInNoteCreateWithoutUserInputSchema: z.ZodType<Prisma.CheckInNoteCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  status: z.lazy(() => HealthStatusSchema),
  message: z.string(),
  createdAt: z.coerce.date().optional(),
});

export const CheckInNoteUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.CheckInNoteUncheckedCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  status: z.lazy(() => HealthStatusSchema),
  message: z.string(),
  createdAt: z.coerce.date().optional(),
});

export const CheckInNoteCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.CheckInNoteCreateOrConnectWithoutUserInput> = z.strictObject({
  where: z.lazy(() => CheckInNoteWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CheckInNoteCreateWithoutUserInputSchema), z.lazy(() => CheckInNoteUncheckedCreateWithoutUserInputSchema) ]),
});

export const CheckInNoteCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.CheckInNoteCreateManyUserInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => CheckInNoteCreateManyUserInputSchema), z.lazy(() => CheckInNoteCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const BugReportCreateWithoutUserInputSchema: z.ZodType<Prisma.BugReportCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  type: z.lazy(() => ReportTypeSchema),
  title: z.string(),
  message: z.string(),
});

export const BugReportUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.BugReportUncheckedCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  type: z.lazy(() => ReportTypeSchema),
  title: z.string(),
  message: z.string(),
});

export const BugReportCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.BugReportCreateOrConnectWithoutUserInput> = z.strictObject({
  where: z.lazy(() => BugReportWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BugReportCreateWithoutUserInputSchema), z.lazy(() => BugReportUncheckedCreateWithoutUserInputSchema) ]),
});

export const BugReportCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.BugReportCreateManyUserInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => BugReportCreateManyUserInputSchema), z.lazy(() => BugReportCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const CustomReminderCreateWithoutUserInputSchema: z.ZodType<Prisma.CustomReminderCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  title: z.string().optional().nullable(),
  message: z.string(),
  interval: z.number().int().optional().nullable(),
  disabled: z.boolean().optional(),
  lastSent: z.coerce.date().optional().nullable(),
  nextAt: z.coerce.date(),
});

export const CustomReminderUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.CustomReminderUncheckedCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  title: z.string().optional().nullable(),
  message: z.string(),
  interval: z.number().int().optional().nullable(),
  disabled: z.boolean().optional(),
  lastSent: z.coerce.date().optional().nullable(),
  nextAt: z.coerce.date(),
});

export const CustomReminderCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.CustomReminderCreateOrConnectWithoutUserInput> = z.strictObject({
  where: z.lazy(() => CustomReminderWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CustomReminderCreateWithoutUserInputSchema), z.lazy(() => CustomReminderUncheckedCreateWithoutUserInputSchema) ]),
});

export const CustomReminderCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.CustomReminderCreateManyUserInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => CustomReminderCreateManyUserInputSchema), z.lazy(() => CustomReminderCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const AuditLogCreateWithoutActorInputSchema: z.ZodType<Prisma.AuditLogCreateWithoutActorInput> = z.strictObject({
  id: z.uuid().optional(),
  targetId: z.string().optional().nullable(),
  target: z.string(),
  action: z.lazy(() => AuditActionSchema),
  summary: z.string(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
});

export const AuditLogUncheckedCreateWithoutActorInputSchema: z.ZodType<Prisma.AuditLogUncheckedCreateWithoutActorInput> = z.strictObject({
  id: z.uuid().optional(),
  targetId: z.string().optional().nullable(),
  target: z.string(),
  action: z.lazy(() => AuditActionSchema),
  summary: z.string(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
});

export const AuditLogCreateOrConnectWithoutActorInputSchema: z.ZodType<Prisma.AuditLogCreateOrConnectWithoutActorInput> = z.strictObject({
  where: z.lazy(() => AuditLogWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => AuditLogCreateWithoutActorInputSchema), z.lazy(() => AuditLogUncheckedCreateWithoutActorInputSchema) ]),
});

export const AuditLogCreateManyActorInputEnvelopeSchema: z.ZodType<Prisma.AuditLogCreateManyActorInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => AuditLogCreateManyActorInputSchema), z.lazy(() => AuditLogCreateManyActorInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const NotificationCreateWithoutUserInputSchema: z.ZodType<Prisma.NotificationCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  type: z.lazy(() => NotificationTypeSchema),
  title: z.string(),
  message: z.string(),
  readAt: z.coerce.date().optional().nullable(),
  sentAt: z.coerce.date().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
});

export const NotificationUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.NotificationUncheckedCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  type: z.lazy(() => NotificationTypeSchema),
  title: z.string(),
  message: z.string(),
  readAt: z.coerce.date().optional().nullable(),
  sentAt: z.coerce.date().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
});

export const NotificationCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.NotificationCreateOrConnectWithoutUserInput> = z.strictObject({
  where: z.lazy(() => NotificationWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => NotificationCreateWithoutUserInputSchema), z.lazy(() => NotificationUncheckedCreateWithoutUserInputSchema) ]),
});

export const NotificationCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.NotificationCreateManyUserInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => NotificationCreateManyUserInputSchema), z.lazy(() => NotificationCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const EmergencyContactCreateWithoutUserInputSchema: z.ZodType<Prisma.EmergencyContactCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  phone: z.string(),
  relation: z.string().optional().nullable(),
  priority: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
});

export const EmergencyContactUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.EmergencyContactUncheckedCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  phone: z.string(),
  relation: z.string().optional().nullable(),
  priority: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
});

export const EmergencyContactCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.EmergencyContactCreateOrConnectWithoutUserInput> = z.strictObject({
  where: z.lazy(() => EmergencyContactWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => EmergencyContactCreateWithoutUserInputSchema), z.lazy(() => EmergencyContactUncheckedCreateWithoutUserInputSchema) ]),
});

export const EmergencyContactCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.EmergencyContactCreateManyUserInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => EmergencyContactCreateManyUserInputSchema), z.lazy(() => EmergencyContactCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const LocationUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.LocationUpsertWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => LocationWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => LocationUpdateWithoutUserInputSchema), z.lazy(() => LocationUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => LocationCreateWithoutUserInputSchema), z.lazy(() => LocationUncheckedCreateWithoutUserInputSchema) ]),
});

export const LocationUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.LocationUpdateWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => LocationWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => LocationUpdateWithoutUserInputSchema), z.lazy(() => LocationUncheckedUpdateWithoutUserInputSchema) ]),
});

export const LocationUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.LocationUpdateManyWithWhereWithoutUserInput> = z.strictObject({
  where: z.lazy(() => LocationScalarWhereInputSchema),
  data: z.union([ z.lazy(() => LocationUpdateManyMutationInputSchema), z.lazy(() => LocationUncheckedUpdateManyWithoutUserInputSchema) ]),
});

export const LocationScalarWhereInputSchema: z.ZodType<Prisma.LocationScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => LocationScalarWhereInputSchema), z.lazy(() => LocationScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => LocationScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => LocationScalarWhereInputSchema), z.lazy(() => LocationScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  latitude: z.union([ z.lazy(() => FloatFilterSchema), z.number() ]).optional(),
  longitude: z.union([ z.lazy(() => FloatFilterSchema), z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
});

export const LocationUpsertWithoutHomeOfInputSchema: z.ZodType<Prisma.LocationUpsertWithoutHomeOfInput> = z.strictObject({
  update: z.union([ z.lazy(() => LocationUpdateWithoutHomeOfInputSchema), z.lazy(() => LocationUncheckedUpdateWithoutHomeOfInputSchema) ]),
  create: z.union([ z.lazy(() => LocationCreateWithoutHomeOfInputSchema), z.lazy(() => LocationUncheckedCreateWithoutHomeOfInputSchema) ]),
  where: z.lazy(() => LocationWhereInputSchema).optional(),
});

export const LocationUpdateToOneWithWhereWithoutHomeOfInputSchema: z.ZodType<Prisma.LocationUpdateToOneWithWhereWithoutHomeOfInput> = z.strictObject({
  where: z.lazy(() => LocationWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => LocationUpdateWithoutHomeOfInputSchema), z.lazy(() => LocationUncheckedUpdateWithoutHomeOfInputSchema) ]),
});

export const LocationUpdateWithoutHomeOfInputSchema: z.ZodType<Prisma.LocationUpdateWithoutHomeOfInput> = z.strictObject({
  latitude: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  longitude: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutLocationsNestedInputSchema).optional(),
  workOf: z.lazy(() => UserUpdateManyWithoutWorkNestedInputSchema).optional(),
});

export const LocationUncheckedUpdateWithoutHomeOfInputSchema: z.ZodType<Prisma.LocationUncheckedUpdateWithoutHomeOfInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  latitude: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  longitude: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  workOf: z.lazy(() => UserUncheckedUpdateManyWithoutWorkNestedInputSchema).optional(),
});

export const LocationUpsertWithoutWorkOfInputSchema: z.ZodType<Prisma.LocationUpsertWithoutWorkOfInput> = z.strictObject({
  update: z.union([ z.lazy(() => LocationUpdateWithoutWorkOfInputSchema), z.lazy(() => LocationUncheckedUpdateWithoutWorkOfInputSchema) ]),
  create: z.union([ z.lazy(() => LocationCreateWithoutWorkOfInputSchema), z.lazy(() => LocationUncheckedCreateWithoutWorkOfInputSchema) ]),
  where: z.lazy(() => LocationWhereInputSchema).optional(),
});

export const LocationUpdateToOneWithWhereWithoutWorkOfInputSchema: z.ZodType<Prisma.LocationUpdateToOneWithWhereWithoutWorkOfInput> = z.strictObject({
  where: z.lazy(() => LocationWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => LocationUpdateWithoutWorkOfInputSchema), z.lazy(() => LocationUncheckedUpdateWithoutWorkOfInputSchema) ]),
});

export const LocationUpdateWithoutWorkOfInputSchema: z.ZodType<Prisma.LocationUpdateWithoutWorkOfInput> = z.strictObject({
  latitude: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  longitude: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutLocationsNestedInputSchema).optional(),
  homeOf: z.lazy(() => UserUpdateManyWithoutHomeNestedInputSchema).optional(),
});

export const LocationUncheckedUpdateWithoutWorkOfInputSchema: z.ZodType<Prisma.LocationUncheckedUpdateWithoutWorkOfInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  latitude: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  longitude: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  homeOf: z.lazy(() => UserUncheckedUpdateManyWithoutHomeNestedInputSchema).optional(),
});

export const CareRelationUpsertWithWhereUniqueWithoutCaregiverInputSchema: z.ZodType<Prisma.CareRelationUpsertWithWhereUniqueWithoutCaregiverInput> = z.strictObject({
  where: z.lazy(() => CareRelationWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => CareRelationUpdateWithoutCaregiverInputSchema), z.lazy(() => CareRelationUncheckedUpdateWithoutCaregiverInputSchema) ]),
  create: z.union([ z.lazy(() => CareRelationCreateWithoutCaregiverInputSchema), z.lazy(() => CareRelationUncheckedCreateWithoutCaregiverInputSchema) ]),
});

export const CareRelationUpdateWithWhereUniqueWithoutCaregiverInputSchema: z.ZodType<Prisma.CareRelationUpdateWithWhereUniqueWithoutCaregiverInput> = z.strictObject({
  where: z.lazy(() => CareRelationWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => CareRelationUpdateWithoutCaregiverInputSchema), z.lazy(() => CareRelationUncheckedUpdateWithoutCaregiverInputSchema) ]),
});

export const CareRelationUpdateManyWithWhereWithoutCaregiverInputSchema: z.ZodType<Prisma.CareRelationUpdateManyWithWhereWithoutCaregiverInput> = z.strictObject({
  where: z.lazy(() => CareRelationScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CareRelationUpdateManyMutationInputSchema), z.lazy(() => CareRelationUncheckedUpdateManyWithoutCaregiverInputSchema) ]),
});

export const CareRelationScalarWhereInputSchema: z.ZodType<Prisma.CareRelationScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CareRelationScalarWhereInputSchema), z.lazy(() => CareRelationScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CareRelationScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CareRelationScalarWhereInputSchema), z.lazy(() => CareRelationScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  caregiverId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
});

export const CareRelationUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.CareRelationUpsertWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => CareRelationWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => CareRelationUpdateWithoutUserInputSchema), z.lazy(() => CareRelationUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => CareRelationCreateWithoutUserInputSchema), z.lazy(() => CareRelationUncheckedCreateWithoutUserInputSchema) ]),
});

export const CareRelationUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.CareRelationUpdateWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => CareRelationWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => CareRelationUpdateWithoutUserInputSchema), z.lazy(() => CareRelationUncheckedUpdateWithoutUserInputSchema) ]),
});

export const CareRelationUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.CareRelationUpdateManyWithWhereWithoutUserInput> = z.strictObject({
  where: z.lazy(() => CareRelationScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CareRelationUpdateManyMutationInputSchema), z.lazy(() => CareRelationUncheckedUpdateManyWithoutUserInputSchema) ]),
});

export const PairingTokenUpsertWithWhereUniqueWithoutCaregiverInputSchema: z.ZodType<Prisma.PairingTokenUpsertWithWhereUniqueWithoutCaregiverInput> = z.strictObject({
  where: z.lazy(() => PairingTokenWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => PairingTokenUpdateWithoutCaregiverInputSchema), z.lazy(() => PairingTokenUncheckedUpdateWithoutCaregiverInputSchema) ]),
  create: z.union([ z.lazy(() => PairingTokenCreateWithoutCaregiverInputSchema), z.lazy(() => PairingTokenUncheckedCreateWithoutCaregiverInputSchema) ]),
});

export const PairingTokenUpdateWithWhereUniqueWithoutCaregiverInputSchema: z.ZodType<Prisma.PairingTokenUpdateWithWhereUniqueWithoutCaregiverInput> = z.strictObject({
  where: z.lazy(() => PairingTokenWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => PairingTokenUpdateWithoutCaregiverInputSchema), z.lazy(() => PairingTokenUncheckedUpdateWithoutCaregiverInputSchema) ]),
});

export const PairingTokenUpdateManyWithWhereWithoutCaregiverInputSchema: z.ZodType<Prisma.PairingTokenUpdateManyWithWhereWithoutCaregiverInput> = z.strictObject({
  where: z.lazy(() => PairingTokenScalarWhereInputSchema),
  data: z.union([ z.lazy(() => PairingTokenUpdateManyMutationInputSchema), z.lazy(() => PairingTokenUncheckedUpdateManyWithoutCaregiverInputSchema) ]),
});

export const PairingTokenScalarWhereInputSchema: z.ZodType<Prisma.PairingTokenScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => PairingTokenScalarWhereInputSchema), z.lazy(() => PairingTokenScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PairingTokenScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PairingTokenScalarWhereInputSchema), z.lazy(() => PairingTokenScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  token: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  expiryAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  usedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  caregiverId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
});

export const MedicalRecordUpsertWithWhereUniqueWithoutPatientInputSchema: z.ZodType<Prisma.MedicalRecordUpsertWithWhereUniqueWithoutPatientInput> = z.strictObject({
  where: z.lazy(() => MedicalRecordWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => MedicalRecordUpdateWithoutPatientInputSchema), z.lazy(() => MedicalRecordUncheckedUpdateWithoutPatientInputSchema) ]),
  create: z.union([ z.lazy(() => MedicalRecordCreateWithoutPatientInputSchema), z.lazy(() => MedicalRecordUncheckedCreateWithoutPatientInputSchema) ]),
});

export const MedicalRecordUpdateWithWhereUniqueWithoutPatientInputSchema: z.ZodType<Prisma.MedicalRecordUpdateWithWhereUniqueWithoutPatientInput> = z.strictObject({
  where: z.lazy(() => MedicalRecordWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => MedicalRecordUpdateWithoutPatientInputSchema), z.lazy(() => MedicalRecordUncheckedUpdateWithoutPatientInputSchema) ]),
});

export const MedicalRecordUpdateManyWithWhereWithoutPatientInputSchema: z.ZodType<Prisma.MedicalRecordUpdateManyWithWhereWithoutPatientInput> = z.strictObject({
  where: z.lazy(() => MedicalRecordScalarWhereInputSchema),
  data: z.union([ z.lazy(() => MedicalRecordUpdateManyMutationInputSchema), z.lazy(() => MedicalRecordUncheckedUpdateManyWithoutPatientInputSchema) ]),
});

export const MedicalRecordScalarWhereInputSchema: z.ZodType<Prisma.MedicalRecordScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => MedicalRecordScalarWhereInputSchema), z.lazy(() => MedicalRecordScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => MedicalRecordScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => MedicalRecordScalarWhereInputSchema), z.lazy(() => MedicalRecordScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  patientId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  gender: z.union([ z.lazy(() => EnumSexFilterSchema), z.lazy(() => SexSchema) ]).optional(),
  dateOfBirth: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  height: z.union([ z.lazy(() => FloatNullableFilterSchema), z.number() ]).optional().nullable(),
  weight: z.union([ z.lazy(() => FloatNullableFilterSchema), z.number() ]).optional().nullable(),
  incidentHistory: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  medicalHistory: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  geneticHistory: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  allergies: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  medications: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  modifiedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
});

export const ReminderUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.ReminderUpsertWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => ReminderWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ReminderUpdateWithoutUserInputSchema), z.lazy(() => ReminderUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => ReminderCreateWithoutUserInputSchema), z.lazy(() => ReminderUncheckedCreateWithoutUserInputSchema) ]),
});

export const ReminderUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.ReminderUpdateWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => ReminderWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ReminderUpdateWithoutUserInputSchema), z.lazy(() => ReminderUncheckedUpdateWithoutUserInputSchema) ]),
});

export const ReminderUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.ReminderUpdateManyWithWhereWithoutUserInput> = z.strictObject({
  where: z.lazy(() => ReminderScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ReminderUpdateManyMutationInputSchema), z.lazy(() => ReminderUncheckedUpdateManyWithoutUserInputSchema) ]),
});

export const ReminderScalarWhereInputSchema: z.ZodType<Prisma.ReminderScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => ReminderScalarWhereInputSchema), z.lazy(() => ReminderScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReminderScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReminderScalarWhereInputSchema), z.lazy(() => ReminderScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  type: z.union([ z.lazy(() => EnumReminderTypeFilterSchema), z.lazy(() => ReminderTypeSchema) ]).optional(),
  interval: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  disabled: z.union([ z.lazy(() => BoolFilterSchema), z.boolean() ]).optional(),
  lastSent: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  nextAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
});

export const CheckInNoteUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.CheckInNoteUpsertWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => CheckInNoteWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => CheckInNoteUpdateWithoutUserInputSchema), z.lazy(() => CheckInNoteUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => CheckInNoteCreateWithoutUserInputSchema), z.lazy(() => CheckInNoteUncheckedCreateWithoutUserInputSchema) ]),
});

export const CheckInNoteUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.CheckInNoteUpdateWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => CheckInNoteWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => CheckInNoteUpdateWithoutUserInputSchema), z.lazy(() => CheckInNoteUncheckedUpdateWithoutUserInputSchema) ]),
});

export const CheckInNoteUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.CheckInNoteUpdateManyWithWhereWithoutUserInput> = z.strictObject({
  where: z.lazy(() => CheckInNoteScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CheckInNoteUpdateManyMutationInputSchema), z.lazy(() => CheckInNoteUncheckedUpdateManyWithoutUserInputSchema) ]),
});

export const CheckInNoteScalarWhereInputSchema: z.ZodType<Prisma.CheckInNoteScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CheckInNoteScalarWhereInputSchema), z.lazy(() => CheckInNoteScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CheckInNoteScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CheckInNoteScalarWhereInputSchema), z.lazy(() => CheckInNoteScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  status: z.union([ z.lazy(() => EnumHealthStatusFilterSchema), z.lazy(() => HealthStatusSchema) ]).optional(),
  message: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
});

export const BugReportUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.BugReportUpsertWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => BugReportWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => BugReportUpdateWithoutUserInputSchema), z.lazy(() => BugReportUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => BugReportCreateWithoutUserInputSchema), z.lazy(() => BugReportUncheckedCreateWithoutUserInputSchema) ]),
});

export const BugReportUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.BugReportUpdateWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => BugReportWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => BugReportUpdateWithoutUserInputSchema), z.lazy(() => BugReportUncheckedUpdateWithoutUserInputSchema) ]),
});

export const BugReportUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.BugReportUpdateManyWithWhereWithoutUserInput> = z.strictObject({
  where: z.lazy(() => BugReportScalarWhereInputSchema),
  data: z.union([ z.lazy(() => BugReportUpdateManyMutationInputSchema), z.lazy(() => BugReportUncheckedUpdateManyWithoutUserInputSchema) ]),
});

export const BugReportScalarWhereInputSchema: z.ZodType<Prisma.BugReportScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => BugReportScalarWhereInputSchema), z.lazy(() => BugReportScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BugReportScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BugReportScalarWhereInputSchema), z.lazy(() => BugReportScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  type: z.union([ z.lazy(() => EnumReportTypeFilterSchema), z.lazy(() => ReportTypeSchema) ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  message: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
});

export const CustomReminderUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.CustomReminderUpsertWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => CustomReminderWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => CustomReminderUpdateWithoutUserInputSchema), z.lazy(() => CustomReminderUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => CustomReminderCreateWithoutUserInputSchema), z.lazy(() => CustomReminderUncheckedCreateWithoutUserInputSchema) ]),
});

export const CustomReminderUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.CustomReminderUpdateWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => CustomReminderWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => CustomReminderUpdateWithoutUserInputSchema), z.lazy(() => CustomReminderUncheckedUpdateWithoutUserInputSchema) ]),
});

export const CustomReminderUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.CustomReminderUpdateManyWithWhereWithoutUserInput> = z.strictObject({
  where: z.lazy(() => CustomReminderScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CustomReminderUpdateManyMutationInputSchema), z.lazy(() => CustomReminderUncheckedUpdateManyWithoutUserInputSchema) ]),
});

export const CustomReminderScalarWhereInputSchema: z.ZodType<Prisma.CustomReminderScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CustomReminderScalarWhereInputSchema), z.lazy(() => CustomReminderScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CustomReminderScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CustomReminderScalarWhereInputSchema), z.lazy(() => CustomReminderScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  title: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  message: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  interval: z.union([ z.lazy(() => IntNullableFilterSchema), z.number() ]).optional().nullable(),
  disabled: z.union([ z.lazy(() => BoolFilterSchema), z.boolean() ]).optional(),
  lastSent: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  nextAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
});

export const AuditLogUpsertWithWhereUniqueWithoutActorInputSchema: z.ZodType<Prisma.AuditLogUpsertWithWhereUniqueWithoutActorInput> = z.strictObject({
  where: z.lazy(() => AuditLogWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => AuditLogUpdateWithoutActorInputSchema), z.lazy(() => AuditLogUncheckedUpdateWithoutActorInputSchema) ]),
  create: z.union([ z.lazy(() => AuditLogCreateWithoutActorInputSchema), z.lazy(() => AuditLogUncheckedCreateWithoutActorInputSchema) ]),
});

export const AuditLogUpdateWithWhereUniqueWithoutActorInputSchema: z.ZodType<Prisma.AuditLogUpdateWithWhereUniqueWithoutActorInput> = z.strictObject({
  where: z.lazy(() => AuditLogWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => AuditLogUpdateWithoutActorInputSchema), z.lazy(() => AuditLogUncheckedUpdateWithoutActorInputSchema) ]),
});

export const AuditLogUpdateManyWithWhereWithoutActorInputSchema: z.ZodType<Prisma.AuditLogUpdateManyWithWhereWithoutActorInput> = z.strictObject({
  where: z.lazy(() => AuditLogScalarWhereInputSchema),
  data: z.union([ z.lazy(() => AuditLogUpdateManyMutationInputSchema), z.lazy(() => AuditLogUncheckedUpdateManyWithoutActorInputSchema) ]),
});

export const AuditLogScalarWhereInputSchema: z.ZodType<Prisma.AuditLogScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => AuditLogScalarWhereInputSchema), z.lazy(() => AuditLogScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AuditLogScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AuditLogScalarWhereInputSchema), z.lazy(() => AuditLogScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  actorId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  targetId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  target: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  action: z.union([ z.lazy(() => EnumAuditActionFilterSchema), z.lazy(() => AuditActionSchema) ]).optional(),
  summary: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
});

export const NotificationUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.NotificationUpsertWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => NotificationWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => NotificationUpdateWithoutUserInputSchema), z.lazy(() => NotificationUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => NotificationCreateWithoutUserInputSchema), z.lazy(() => NotificationUncheckedCreateWithoutUserInputSchema) ]),
});

export const NotificationUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.NotificationUpdateWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => NotificationWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => NotificationUpdateWithoutUserInputSchema), z.lazy(() => NotificationUncheckedUpdateWithoutUserInputSchema) ]),
});

export const NotificationUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.NotificationUpdateManyWithWhereWithoutUserInput> = z.strictObject({
  where: z.lazy(() => NotificationScalarWhereInputSchema),
  data: z.union([ z.lazy(() => NotificationUpdateManyMutationInputSchema), z.lazy(() => NotificationUncheckedUpdateManyWithoutUserInputSchema) ]),
});

export const NotificationScalarWhereInputSchema: z.ZodType<Prisma.NotificationScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => NotificationScalarWhereInputSchema), z.lazy(() => NotificationScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => NotificationScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => NotificationScalarWhereInputSchema), z.lazy(() => NotificationScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  type: z.union([ z.lazy(() => EnumNotificationTypeFilterSchema), z.lazy(() => NotificationTypeSchema) ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  message: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  readAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  sentAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
});

export const EmergencyContactUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.EmergencyContactUpsertWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => EmergencyContactWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => EmergencyContactUpdateWithoutUserInputSchema), z.lazy(() => EmergencyContactUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => EmergencyContactCreateWithoutUserInputSchema), z.lazy(() => EmergencyContactUncheckedCreateWithoutUserInputSchema) ]),
});

export const EmergencyContactUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.EmergencyContactUpdateWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => EmergencyContactWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => EmergencyContactUpdateWithoutUserInputSchema), z.lazy(() => EmergencyContactUncheckedUpdateWithoutUserInputSchema) ]),
});

export const EmergencyContactUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.EmergencyContactUpdateManyWithWhereWithoutUserInput> = z.strictObject({
  where: z.lazy(() => EmergencyContactScalarWhereInputSchema),
  data: z.union([ z.lazy(() => EmergencyContactUpdateManyMutationInputSchema), z.lazy(() => EmergencyContactUncheckedUpdateManyWithoutUserInputSchema) ]),
});

export const EmergencyContactScalarWhereInputSchema: z.ZodType<Prisma.EmergencyContactScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => EmergencyContactScalarWhereInputSchema), z.lazy(() => EmergencyContactScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EmergencyContactScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EmergencyContactScalarWhereInputSchema), z.lazy(() => EmergencyContactScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  phone: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  relation: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  priority: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
});

export const UserCreateWithoutLocationsInputSchema: z.ZodType<Prisma.UserCreateWithoutLocationsInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  home: z.lazy(() => LocationCreateNestedOneWithoutHomeOfInputSchema).optional(),
  work: z.lazy(() => LocationCreateNestedOneWithoutWorkOfInputSchema).optional(),
  dependent: z.lazy(() => CareRelationCreateNestedManyWithoutCaregiverInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationCreateNestedManyWithoutUserInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenCreateNestedManyWithoutCaregiverInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordCreateNestedManyWithoutPatientInputSchema).optional(),
  reminders: z.lazy(() => ReminderCreateNestedManyWithoutUserInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteCreateNestedManyWithoutUserInputSchema).optional(),
  bugReports: z.lazy(() => BugReportCreateNestedManyWithoutUserInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogCreateNestedManyWithoutActorInputSchema).optional(),
  notifications: z.lazy(() => NotificationCreateNestedManyWithoutUserInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserUncheckedCreateWithoutLocationsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutLocationsInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  homeId: z.number().int().optional().nullable(),
  workId: z.number().int().optional().nullable(),
  dependent: z.lazy(() => CareRelationUncheckedCreateNestedManyWithoutCaregiverInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUncheckedCreateNestedManyWithoutCaregiverInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUncheckedCreateNestedManyWithoutPatientInputSchema).optional(),
  reminders: z.lazy(() => ReminderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedCreateNestedManyWithoutActorInputSchema).optional(),
  notifications: z.lazy(() => NotificationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserCreateOrConnectWithoutLocationsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutLocationsInput> = z.strictObject({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutLocationsInputSchema), z.lazy(() => UserUncheckedCreateWithoutLocationsInputSchema) ]),
});

export const UserCreateWithoutHomeInputSchema: z.ZodType<Prisma.UserCreateWithoutHomeInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  locations: z.lazy(() => LocationCreateNestedManyWithoutUserInputSchema).optional(),
  work: z.lazy(() => LocationCreateNestedOneWithoutWorkOfInputSchema).optional(),
  dependent: z.lazy(() => CareRelationCreateNestedManyWithoutCaregiverInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationCreateNestedManyWithoutUserInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenCreateNestedManyWithoutCaregiverInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordCreateNestedManyWithoutPatientInputSchema).optional(),
  reminders: z.lazy(() => ReminderCreateNestedManyWithoutUserInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteCreateNestedManyWithoutUserInputSchema).optional(),
  bugReports: z.lazy(() => BugReportCreateNestedManyWithoutUserInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogCreateNestedManyWithoutActorInputSchema).optional(),
  notifications: z.lazy(() => NotificationCreateNestedManyWithoutUserInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserUncheckedCreateWithoutHomeInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutHomeInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  workId: z.number().int().optional().nullable(),
  locations: z.lazy(() => LocationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUncheckedCreateNestedManyWithoutCaregiverInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUncheckedCreateNestedManyWithoutCaregiverInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUncheckedCreateNestedManyWithoutPatientInputSchema).optional(),
  reminders: z.lazy(() => ReminderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedCreateNestedManyWithoutActorInputSchema).optional(),
  notifications: z.lazy(() => NotificationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserCreateOrConnectWithoutHomeInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutHomeInput> = z.strictObject({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutHomeInputSchema), z.lazy(() => UserUncheckedCreateWithoutHomeInputSchema) ]),
});

export const UserCreateManyHomeInputEnvelopeSchema: z.ZodType<Prisma.UserCreateManyHomeInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => UserCreateManyHomeInputSchema), z.lazy(() => UserCreateManyHomeInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const UserCreateWithoutWorkInputSchema: z.ZodType<Prisma.UserCreateWithoutWorkInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  locations: z.lazy(() => LocationCreateNestedManyWithoutUserInputSchema).optional(),
  home: z.lazy(() => LocationCreateNestedOneWithoutHomeOfInputSchema).optional(),
  dependent: z.lazy(() => CareRelationCreateNestedManyWithoutCaregiverInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationCreateNestedManyWithoutUserInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenCreateNestedManyWithoutCaregiverInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordCreateNestedManyWithoutPatientInputSchema).optional(),
  reminders: z.lazy(() => ReminderCreateNestedManyWithoutUserInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteCreateNestedManyWithoutUserInputSchema).optional(),
  bugReports: z.lazy(() => BugReportCreateNestedManyWithoutUserInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogCreateNestedManyWithoutActorInputSchema).optional(),
  notifications: z.lazy(() => NotificationCreateNestedManyWithoutUserInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserUncheckedCreateWithoutWorkInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutWorkInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  homeId: z.number().int().optional().nullable(),
  locations: z.lazy(() => LocationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUncheckedCreateNestedManyWithoutCaregiverInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUncheckedCreateNestedManyWithoutCaregiverInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUncheckedCreateNestedManyWithoutPatientInputSchema).optional(),
  reminders: z.lazy(() => ReminderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedCreateNestedManyWithoutActorInputSchema).optional(),
  notifications: z.lazy(() => NotificationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserCreateOrConnectWithoutWorkInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutWorkInput> = z.strictObject({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutWorkInputSchema), z.lazy(() => UserUncheckedCreateWithoutWorkInputSchema) ]),
});

export const UserCreateManyWorkInputEnvelopeSchema: z.ZodType<Prisma.UserCreateManyWorkInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => UserCreateManyWorkInputSchema), z.lazy(() => UserCreateManyWorkInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const UserUpsertWithoutLocationsInputSchema: z.ZodType<Prisma.UserUpsertWithoutLocationsInput> = z.strictObject({
  update: z.union([ z.lazy(() => UserUpdateWithoutLocationsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutLocationsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutLocationsInputSchema), z.lazy(() => UserUncheckedCreateWithoutLocationsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional(),
});

export const UserUpdateToOneWithWhereWithoutLocationsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutLocationsInput> = z.strictObject({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutLocationsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutLocationsInputSchema) ]),
});

export const UserUpdateWithoutLocationsInputSchema: z.ZodType<Prisma.UserUpdateWithoutLocationsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  home: z.lazy(() => LocationUpdateOneWithoutHomeOfNestedInputSchema).optional(),
  work: z.lazy(() => LocationUpdateOneWithoutWorkOfNestedInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUpdateManyWithoutUserNestedInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUpdateManyWithoutPatientNestedInputSchema).optional(),
  reminders: z.lazy(() => ReminderUpdateManyWithoutUserNestedInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUpdateManyWithoutUserNestedInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUpdateManyWithoutUserNestedInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUpdateManyWithoutActorNestedInputSchema).optional(),
  notifications: z.lazy(() => NotificationUpdateManyWithoutUserNestedInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserUncheckedUpdateWithoutLocationsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutLocationsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  homeId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  workId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  dependent: z.lazy(() => CareRelationUncheckedUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUncheckedUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUncheckedUpdateManyWithoutPatientNestedInputSchema).optional(),
  reminders: z.lazy(() => ReminderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedUpdateManyWithoutActorNestedInputSchema).optional(),
  notifications: z.lazy(() => NotificationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserUpsertWithWhereUniqueWithoutHomeInputSchema: z.ZodType<Prisma.UserUpsertWithWhereUniqueWithoutHomeInput> = z.strictObject({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserUpdateWithoutHomeInputSchema), z.lazy(() => UserUncheckedUpdateWithoutHomeInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutHomeInputSchema), z.lazy(() => UserUncheckedCreateWithoutHomeInputSchema) ]),
});

export const UserUpdateWithWhereUniqueWithoutHomeInputSchema: z.ZodType<Prisma.UserUpdateWithWhereUniqueWithoutHomeInput> = z.strictObject({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserUpdateWithoutHomeInputSchema), z.lazy(() => UserUncheckedUpdateWithoutHomeInputSchema) ]),
});

export const UserUpdateManyWithWhereWithoutHomeInputSchema: z.ZodType<Prisma.UserUpdateManyWithWhereWithoutHomeInput> = z.strictObject({
  where: z.lazy(() => UserScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserUpdateManyMutationInputSchema), z.lazy(() => UserUncheckedUpdateManyWithoutHomeInputSchema) ]),
});

export const UserScalarWhereInputSchema: z.ZodType<Prisma.UserScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => UserScalarWhereInputSchema), z.lazy(() => UserScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserScalarWhereInputSchema), z.lazy(() => UserScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  email: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  username: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  password: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  firstName: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  lastName: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  phoneNumber: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  role: z.union([ z.lazy(() => EnumRoleFilterSchema), z.lazy(() => RoleSchema) ]).optional(),
  homeId: z.union([ z.lazy(() => IntNullableFilterSchema), z.number() ]).optional().nullable(),
  workId: z.union([ z.lazy(() => IntNullableFilterSchema), z.number() ]).optional().nullable(),
});

export const UserUpsertWithWhereUniqueWithoutWorkInputSchema: z.ZodType<Prisma.UserUpsertWithWhereUniqueWithoutWorkInput> = z.strictObject({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserUpdateWithoutWorkInputSchema), z.lazy(() => UserUncheckedUpdateWithoutWorkInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutWorkInputSchema), z.lazy(() => UserUncheckedCreateWithoutWorkInputSchema) ]),
});

export const UserUpdateWithWhereUniqueWithoutWorkInputSchema: z.ZodType<Prisma.UserUpdateWithWhereUniqueWithoutWorkInput> = z.strictObject({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserUpdateWithoutWorkInputSchema), z.lazy(() => UserUncheckedUpdateWithoutWorkInputSchema) ]),
});

export const UserUpdateManyWithWhereWithoutWorkInputSchema: z.ZodType<Prisma.UserUpdateManyWithWhereWithoutWorkInput> = z.strictObject({
  where: z.lazy(() => UserScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserUpdateManyMutationInputSchema), z.lazy(() => UserUncheckedUpdateManyWithoutWorkInputSchema) ]),
});

export const UserCreateWithoutDependentInputSchema: z.ZodType<Prisma.UserCreateWithoutDependentInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  locations: z.lazy(() => LocationCreateNestedManyWithoutUserInputSchema).optional(),
  home: z.lazy(() => LocationCreateNestedOneWithoutHomeOfInputSchema).optional(),
  work: z.lazy(() => LocationCreateNestedOneWithoutWorkOfInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationCreateNestedManyWithoutUserInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenCreateNestedManyWithoutCaregiverInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordCreateNestedManyWithoutPatientInputSchema).optional(),
  reminders: z.lazy(() => ReminderCreateNestedManyWithoutUserInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteCreateNestedManyWithoutUserInputSchema).optional(),
  bugReports: z.lazy(() => BugReportCreateNestedManyWithoutUserInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogCreateNestedManyWithoutActorInputSchema).optional(),
  notifications: z.lazy(() => NotificationCreateNestedManyWithoutUserInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserUncheckedCreateWithoutDependentInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutDependentInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  homeId: z.number().int().optional().nullable(),
  workId: z.number().int().optional().nullable(),
  locations: z.lazy(() => LocationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUncheckedCreateNestedManyWithoutCaregiverInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUncheckedCreateNestedManyWithoutPatientInputSchema).optional(),
  reminders: z.lazy(() => ReminderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedCreateNestedManyWithoutActorInputSchema).optional(),
  notifications: z.lazy(() => NotificationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserCreateOrConnectWithoutDependentInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutDependentInput> = z.strictObject({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutDependentInputSchema), z.lazy(() => UserUncheckedCreateWithoutDependentInputSchema) ]),
});

export const UserCreateWithoutCaregiverInputSchema: z.ZodType<Prisma.UserCreateWithoutCaregiverInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  locations: z.lazy(() => LocationCreateNestedManyWithoutUserInputSchema).optional(),
  home: z.lazy(() => LocationCreateNestedOneWithoutHomeOfInputSchema).optional(),
  work: z.lazy(() => LocationCreateNestedOneWithoutWorkOfInputSchema).optional(),
  dependent: z.lazy(() => CareRelationCreateNestedManyWithoutCaregiverInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenCreateNestedManyWithoutCaregiverInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordCreateNestedManyWithoutPatientInputSchema).optional(),
  reminders: z.lazy(() => ReminderCreateNestedManyWithoutUserInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteCreateNestedManyWithoutUserInputSchema).optional(),
  bugReports: z.lazy(() => BugReportCreateNestedManyWithoutUserInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogCreateNestedManyWithoutActorInputSchema).optional(),
  notifications: z.lazy(() => NotificationCreateNestedManyWithoutUserInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserUncheckedCreateWithoutCaregiverInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutCaregiverInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  homeId: z.number().int().optional().nullable(),
  workId: z.number().int().optional().nullable(),
  locations: z.lazy(() => LocationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUncheckedCreateNestedManyWithoutCaregiverInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUncheckedCreateNestedManyWithoutCaregiverInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUncheckedCreateNestedManyWithoutPatientInputSchema).optional(),
  reminders: z.lazy(() => ReminderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedCreateNestedManyWithoutActorInputSchema).optional(),
  notifications: z.lazy(() => NotificationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserCreateOrConnectWithoutCaregiverInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutCaregiverInput> = z.strictObject({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutCaregiverInputSchema), z.lazy(() => UserUncheckedCreateWithoutCaregiverInputSchema) ]),
});

export const UserUpsertWithoutDependentInputSchema: z.ZodType<Prisma.UserUpsertWithoutDependentInput> = z.strictObject({
  update: z.union([ z.lazy(() => UserUpdateWithoutDependentInputSchema), z.lazy(() => UserUncheckedUpdateWithoutDependentInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutDependentInputSchema), z.lazy(() => UserUncheckedCreateWithoutDependentInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional(),
});

export const UserUpdateToOneWithWhereWithoutDependentInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutDependentInput> = z.strictObject({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutDependentInputSchema), z.lazy(() => UserUncheckedUpdateWithoutDependentInputSchema) ]),
});

export const UserUpdateWithoutDependentInputSchema: z.ZodType<Prisma.UserUpdateWithoutDependentInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  locations: z.lazy(() => LocationUpdateManyWithoutUserNestedInputSchema).optional(),
  home: z.lazy(() => LocationUpdateOneWithoutHomeOfNestedInputSchema).optional(),
  work: z.lazy(() => LocationUpdateOneWithoutWorkOfNestedInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUpdateManyWithoutUserNestedInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUpdateManyWithoutPatientNestedInputSchema).optional(),
  reminders: z.lazy(() => ReminderUpdateManyWithoutUserNestedInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUpdateManyWithoutUserNestedInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUpdateManyWithoutUserNestedInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUpdateManyWithoutActorNestedInputSchema).optional(),
  notifications: z.lazy(() => NotificationUpdateManyWithoutUserNestedInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserUncheckedUpdateWithoutDependentInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutDependentInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  homeId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  workId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locations: z.lazy(() => LocationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUncheckedUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUncheckedUpdateManyWithoutPatientNestedInputSchema).optional(),
  reminders: z.lazy(() => ReminderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedUpdateManyWithoutActorNestedInputSchema).optional(),
  notifications: z.lazy(() => NotificationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserUpsertWithoutCaregiverInputSchema: z.ZodType<Prisma.UserUpsertWithoutCaregiverInput> = z.strictObject({
  update: z.union([ z.lazy(() => UserUpdateWithoutCaregiverInputSchema), z.lazy(() => UserUncheckedUpdateWithoutCaregiverInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutCaregiverInputSchema), z.lazy(() => UserUncheckedCreateWithoutCaregiverInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional(),
});

export const UserUpdateToOneWithWhereWithoutCaregiverInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutCaregiverInput> = z.strictObject({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutCaregiverInputSchema), z.lazy(() => UserUncheckedUpdateWithoutCaregiverInputSchema) ]),
});

export const UserUpdateWithoutCaregiverInputSchema: z.ZodType<Prisma.UserUpdateWithoutCaregiverInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  locations: z.lazy(() => LocationUpdateManyWithoutUserNestedInputSchema).optional(),
  home: z.lazy(() => LocationUpdateOneWithoutHomeOfNestedInputSchema).optional(),
  work: z.lazy(() => LocationUpdateOneWithoutWorkOfNestedInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUpdateManyWithoutPatientNestedInputSchema).optional(),
  reminders: z.lazy(() => ReminderUpdateManyWithoutUserNestedInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUpdateManyWithoutUserNestedInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUpdateManyWithoutUserNestedInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUpdateManyWithoutActorNestedInputSchema).optional(),
  notifications: z.lazy(() => NotificationUpdateManyWithoutUserNestedInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserUncheckedUpdateWithoutCaregiverInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutCaregiverInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  homeId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  workId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locations: z.lazy(() => LocationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUncheckedUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUncheckedUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUncheckedUpdateManyWithoutPatientNestedInputSchema).optional(),
  reminders: z.lazy(() => ReminderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedUpdateManyWithoutActorNestedInputSchema).optional(),
  notifications: z.lazy(() => NotificationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserCreateWithoutPairingTokensInputSchema: z.ZodType<Prisma.UserCreateWithoutPairingTokensInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  locations: z.lazy(() => LocationCreateNestedManyWithoutUserInputSchema).optional(),
  home: z.lazy(() => LocationCreateNestedOneWithoutHomeOfInputSchema).optional(),
  work: z.lazy(() => LocationCreateNestedOneWithoutWorkOfInputSchema).optional(),
  dependent: z.lazy(() => CareRelationCreateNestedManyWithoutCaregiverInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationCreateNestedManyWithoutUserInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordCreateNestedManyWithoutPatientInputSchema).optional(),
  reminders: z.lazy(() => ReminderCreateNestedManyWithoutUserInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteCreateNestedManyWithoutUserInputSchema).optional(),
  bugReports: z.lazy(() => BugReportCreateNestedManyWithoutUserInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogCreateNestedManyWithoutActorInputSchema).optional(),
  notifications: z.lazy(() => NotificationCreateNestedManyWithoutUserInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserUncheckedCreateWithoutPairingTokensInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutPairingTokensInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  homeId: z.number().int().optional().nullable(),
  workId: z.number().int().optional().nullable(),
  locations: z.lazy(() => LocationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUncheckedCreateNestedManyWithoutCaregiverInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUncheckedCreateNestedManyWithoutPatientInputSchema).optional(),
  reminders: z.lazy(() => ReminderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedCreateNestedManyWithoutActorInputSchema).optional(),
  notifications: z.lazy(() => NotificationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserCreateOrConnectWithoutPairingTokensInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutPairingTokensInput> = z.strictObject({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutPairingTokensInputSchema), z.lazy(() => UserUncheckedCreateWithoutPairingTokensInputSchema) ]),
});

export const UserUpsertWithoutPairingTokensInputSchema: z.ZodType<Prisma.UserUpsertWithoutPairingTokensInput> = z.strictObject({
  update: z.union([ z.lazy(() => UserUpdateWithoutPairingTokensInputSchema), z.lazy(() => UserUncheckedUpdateWithoutPairingTokensInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutPairingTokensInputSchema), z.lazy(() => UserUncheckedCreateWithoutPairingTokensInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional(),
});

export const UserUpdateToOneWithWhereWithoutPairingTokensInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutPairingTokensInput> = z.strictObject({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutPairingTokensInputSchema), z.lazy(() => UserUncheckedUpdateWithoutPairingTokensInputSchema) ]),
});

export const UserUpdateWithoutPairingTokensInputSchema: z.ZodType<Prisma.UserUpdateWithoutPairingTokensInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  locations: z.lazy(() => LocationUpdateManyWithoutUserNestedInputSchema).optional(),
  home: z.lazy(() => LocationUpdateOneWithoutHomeOfNestedInputSchema).optional(),
  work: z.lazy(() => LocationUpdateOneWithoutWorkOfNestedInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUpdateManyWithoutUserNestedInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUpdateManyWithoutPatientNestedInputSchema).optional(),
  reminders: z.lazy(() => ReminderUpdateManyWithoutUserNestedInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUpdateManyWithoutUserNestedInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUpdateManyWithoutUserNestedInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUpdateManyWithoutActorNestedInputSchema).optional(),
  notifications: z.lazy(() => NotificationUpdateManyWithoutUserNestedInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserUncheckedUpdateWithoutPairingTokensInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutPairingTokensInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  homeId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  workId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locations: z.lazy(() => LocationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUncheckedUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUncheckedUpdateManyWithoutPatientNestedInputSchema).optional(),
  reminders: z.lazy(() => ReminderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedUpdateManyWithoutActorNestedInputSchema).optional(),
  notifications: z.lazy(() => NotificationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserCreateWithoutMedicalRecordsInputSchema: z.ZodType<Prisma.UserCreateWithoutMedicalRecordsInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  locations: z.lazy(() => LocationCreateNestedManyWithoutUserInputSchema).optional(),
  home: z.lazy(() => LocationCreateNestedOneWithoutHomeOfInputSchema).optional(),
  work: z.lazy(() => LocationCreateNestedOneWithoutWorkOfInputSchema).optional(),
  dependent: z.lazy(() => CareRelationCreateNestedManyWithoutCaregiverInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationCreateNestedManyWithoutUserInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenCreateNestedManyWithoutCaregiverInputSchema).optional(),
  reminders: z.lazy(() => ReminderCreateNestedManyWithoutUserInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteCreateNestedManyWithoutUserInputSchema).optional(),
  bugReports: z.lazy(() => BugReportCreateNestedManyWithoutUserInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogCreateNestedManyWithoutActorInputSchema).optional(),
  notifications: z.lazy(() => NotificationCreateNestedManyWithoutUserInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserUncheckedCreateWithoutMedicalRecordsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutMedicalRecordsInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  homeId: z.number().int().optional().nullable(),
  workId: z.number().int().optional().nullable(),
  locations: z.lazy(() => LocationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUncheckedCreateNestedManyWithoutCaregiverInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUncheckedCreateNestedManyWithoutCaregiverInputSchema).optional(),
  reminders: z.lazy(() => ReminderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedCreateNestedManyWithoutActorInputSchema).optional(),
  notifications: z.lazy(() => NotificationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserCreateOrConnectWithoutMedicalRecordsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutMedicalRecordsInput> = z.strictObject({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutMedicalRecordsInputSchema), z.lazy(() => UserUncheckedCreateWithoutMedicalRecordsInputSchema) ]),
});

export const UserUpsertWithoutMedicalRecordsInputSchema: z.ZodType<Prisma.UserUpsertWithoutMedicalRecordsInput> = z.strictObject({
  update: z.union([ z.lazy(() => UserUpdateWithoutMedicalRecordsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutMedicalRecordsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutMedicalRecordsInputSchema), z.lazy(() => UserUncheckedCreateWithoutMedicalRecordsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional(),
});

export const UserUpdateToOneWithWhereWithoutMedicalRecordsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutMedicalRecordsInput> = z.strictObject({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutMedicalRecordsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutMedicalRecordsInputSchema) ]),
});

export const UserUpdateWithoutMedicalRecordsInputSchema: z.ZodType<Prisma.UserUpdateWithoutMedicalRecordsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  locations: z.lazy(() => LocationUpdateManyWithoutUserNestedInputSchema).optional(),
  home: z.lazy(() => LocationUpdateOneWithoutHomeOfNestedInputSchema).optional(),
  work: z.lazy(() => LocationUpdateOneWithoutWorkOfNestedInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUpdateManyWithoutUserNestedInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  reminders: z.lazy(() => ReminderUpdateManyWithoutUserNestedInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUpdateManyWithoutUserNestedInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUpdateManyWithoutUserNestedInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUpdateManyWithoutActorNestedInputSchema).optional(),
  notifications: z.lazy(() => NotificationUpdateManyWithoutUserNestedInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserUncheckedUpdateWithoutMedicalRecordsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutMedicalRecordsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  homeId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  workId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locations: z.lazy(() => LocationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUncheckedUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUncheckedUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  reminders: z.lazy(() => ReminderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedUpdateManyWithoutActorNestedInputSchema).optional(),
  notifications: z.lazy(() => NotificationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserCreateWithoutRemindersInputSchema: z.ZodType<Prisma.UserCreateWithoutRemindersInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  locations: z.lazy(() => LocationCreateNestedManyWithoutUserInputSchema).optional(),
  home: z.lazy(() => LocationCreateNestedOneWithoutHomeOfInputSchema).optional(),
  work: z.lazy(() => LocationCreateNestedOneWithoutWorkOfInputSchema).optional(),
  dependent: z.lazy(() => CareRelationCreateNestedManyWithoutCaregiverInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationCreateNestedManyWithoutUserInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenCreateNestedManyWithoutCaregiverInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordCreateNestedManyWithoutPatientInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteCreateNestedManyWithoutUserInputSchema).optional(),
  bugReports: z.lazy(() => BugReportCreateNestedManyWithoutUserInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogCreateNestedManyWithoutActorInputSchema).optional(),
  notifications: z.lazy(() => NotificationCreateNestedManyWithoutUserInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserUncheckedCreateWithoutRemindersInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutRemindersInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  homeId: z.number().int().optional().nullable(),
  workId: z.number().int().optional().nullable(),
  locations: z.lazy(() => LocationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUncheckedCreateNestedManyWithoutCaregiverInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUncheckedCreateNestedManyWithoutCaregiverInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUncheckedCreateNestedManyWithoutPatientInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedCreateNestedManyWithoutActorInputSchema).optional(),
  notifications: z.lazy(() => NotificationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserCreateOrConnectWithoutRemindersInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutRemindersInput> = z.strictObject({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutRemindersInputSchema), z.lazy(() => UserUncheckedCreateWithoutRemindersInputSchema) ]),
});

export const UserUpsertWithoutRemindersInputSchema: z.ZodType<Prisma.UserUpsertWithoutRemindersInput> = z.strictObject({
  update: z.union([ z.lazy(() => UserUpdateWithoutRemindersInputSchema), z.lazy(() => UserUncheckedUpdateWithoutRemindersInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutRemindersInputSchema), z.lazy(() => UserUncheckedCreateWithoutRemindersInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional(),
});

export const UserUpdateToOneWithWhereWithoutRemindersInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutRemindersInput> = z.strictObject({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutRemindersInputSchema), z.lazy(() => UserUncheckedUpdateWithoutRemindersInputSchema) ]),
});

export const UserUpdateWithoutRemindersInputSchema: z.ZodType<Prisma.UserUpdateWithoutRemindersInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  locations: z.lazy(() => LocationUpdateManyWithoutUserNestedInputSchema).optional(),
  home: z.lazy(() => LocationUpdateOneWithoutHomeOfNestedInputSchema).optional(),
  work: z.lazy(() => LocationUpdateOneWithoutWorkOfNestedInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUpdateManyWithoutUserNestedInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUpdateManyWithoutPatientNestedInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUpdateManyWithoutUserNestedInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUpdateManyWithoutUserNestedInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUpdateManyWithoutActorNestedInputSchema).optional(),
  notifications: z.lazy(() => NotificationUpdateManyWithoutUserNestedInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserUncheckedUpdateWithoutRemindersInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutRemindersInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  homeId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  workId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locations: z.lazy(() => LocationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUncheckedUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUncheckedUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUncheckedUpdateManyWithoutPatientNestedInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedUpdateManyWithoutActorNestedInputSchema).optional(),
  notifications: z.lazy(() => NotificationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserCreateWithoutCheckInNotesInputSchema: z.ZodType<Prisma.UserCreateWithoutCheckInNotesInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  locations: z.lazy(() => LocationCreateNestedManyWithoutUserInputSchema).optional(),
  home: z.lazy(() => LocationCreateNestedOneWithoutHomeOfInputSchema).optional(),
  work: z.lazy(() => LocationCreateNestedOneWithoutWorkOfInputSchema).optional(),
  dependent: z.lazy(() => CareRelationCreateNestedManyWithoutCaregiverInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationCreateNestedManyWithoutUserInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenCreateNestedManyWithoutCaregiverInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordCreateNestedManyWithoutPatientInputSchema).optional(),
  reminders: z.lazy(() => ReminderCreateNestedManyWithoutUserInputSchema).optional(),
  bugReports: z.lazy(() => BugReportCreateNestedManyWithoutUserInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogCreateNestedManyWithoutActorInputSchema).optional(),
  notifications: z.lazy(() => NotificationCreateNestedManyWithoutUserInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserUncheckedCreateWithoutCheckInNotesInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutCheckInNotesInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  homeId: z.number().int().optional().nullable(),
  workId: z.number().int().optional().nullable(),
  locations: z.lazy(() => LocationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUncheckedCreateNestedManyWithoutCaregiverInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUncheckedCreateNestedManyWithoutCaregiverInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUncheckedCreateNestedManyWithoutPatientInputSchema).optional(),
  reminders: z.lazy(() => ReminderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedCreateNestedManyWithoutActorInputSchema).optional(),
  notifications: z.lazy(() => NotificationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserCreateOrConnectWithoutCheckInNotesInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutCheckInNotesInput> = z.strictObject({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutCheckInNotesInputSchema), z.lazy(() => UserUncheckedCreateWithoutCheckInNotesInputSchema) ]),
});

export const UserUpsertWithoutCheckInNotesInputSchema: z.ZodType<Prisma.UserUpsertWithoutCheckInNotesInput> = z.strictObject({
  update: z.union([ z.lazy(() => UserUpdateWithoutCheckInNotesInputSchema), z.lazy(() => UserUncheckedUpdateWithoutCheckInNotesInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutCheckInNotesInputSchema), z.lazy(() => UserUncheckedCreateWithoutCheckInNotesInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional(),
});

export const UserUpdateToOneWithWhereWithoutCheckInNotesInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutCheckInNotesInput> = z.strictObject({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutCheckInNotesInputSchema), z.lazy(() => UserUncheckedUpdateWithoutCheckInNotesInputSchema) ]),
});

export const UserUpdateWithoutCheckInNotesInputSchema: z.ZodType<Prisma.UserUpdateWithoutCheckInNotesInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  locations: z.lazy(() => LocationUpdateManyWithoutUserNestedInputSchema).optional(),
  home: z.lazy(() => LocationUpdateOneWithoutHomeOfNestedInputSchema).optional(),
  work: z.lazy(() => LocationUpdateOneWithoutWorkOfNestedInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUpdateManyWithoutUserNestedInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUpdateManyWithoutPatientNestedInputSchema).optional(),
  reminders: z.lazy(() => ReminderUpdateManyWithoutUserNestedInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUpdateManyWithoutUserNestedInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUpdateManyWithoutActorNestedInputSchema).optional(),
  notifications: z.lazy(() => NotificationUpdateManyWithoutUserNestedInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserUncheckedUpdateWithoutCheckInNotesInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutCheckInNotesInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  homeId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  workId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locations: z.lazy(() => LocationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUncheckedUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUncheckedUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUncheckedUpdateManyWithoutPatientNestedInputSchema).optional(),
  reminders: z.lazy(() => ReminderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedUpdateManyWithoutActorNestedInputSchema).optional(),
  notifications: z.lazy(() => NotificationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserCreateWithoutBugReportsInputSchema: z.ZodType<Prisma.UserCreateWithoutBugReportsInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  locations: z.lazy(() => LocationCreateNestedManyWithoutUserInputSchema).optional(),
  home: z.lazy(() => LocationCreateNestedOneWithoutHomeOfInputSchema).optional(),
  work: z.lazy(() => LocationCreateNestedOneWithoutWorkOfInputSchema).optional(),
  dependent: z.lazy(() => CareRelationCreateNestedManyWithoutCaregiverInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationCreateNestedManyWithoutUserInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenCreateNestedManyWithoutCaregiverInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordCreateNestedManyWithoutPatientInputSchema).optional(),
  reminders: z.lazy(() => ReminderCreateNestedManyWithoutUserInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteCreateNestedManyWithoutUserInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogCreateNestedManyWithoutActorInputSchema).optional(),
  notifications: z.lazy(() => NotificationCreateNestedManyWithoutUserInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserUncheckedCreateWithoutBugReportsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutBugReportsInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  homeId: z.number().int().optional().nullable(),
  workId: z.number().int().optional().nullable(),
  locations: z.lazy(() => LocationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUncheckedCreateNestedManyWithoutCaregiverInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUncheckedCreateNestedManyWithoutCaregiverInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUncheckedCreateNestedManyWithoutPatientInputSchema).optional(),
  reminders: z.lazy(() => ReminderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedCreateNestedManyWithoutActorInputSchema).optional(),
  notifications: z.lazy(() => NotificationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserCreateOrConnectWithoutBugReportsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutBugReportsInput> = z.strictObject({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutBugReportsInputSchema), z.lazy(() => UserUncheckedCreateWithoutBugReportsInputSchema) ]),
});

export const UserUpsertWithoutBugReportsInputSchema: z.ZodType<Prisma.UserUpsertWithoutBugReportsInput> = z.strictObject({
  update: z.union([ z.lazy(() => UserUpdateWithoutBugReportsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutBugReportsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutBugReportsInputSchema), z.lazy(() => UserUncheckedCreateWithoutBugReportsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional(),
});

export const UserUpdateToOneWithWhereWithoutBugReportsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutBugReportsInput> = z.strictObject({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutBugReportsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutBugReportsInputSchema) ]),
});

export const UserUpdateWithoutBugReportsInputSchema: z.ZodType<Prisma.UserUpdateWithoutBugReportsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  locations: z.lazy(() => LocationUpdateManyWithoutUserNestedInputSchema).optional(),
  home: z.lazy(() => LocationUpdateOneWithoutHomeOfNestedInputSchema).optional(),
  work: z.lazy(() => LocationUpdateOneWithoutWorkOfNestedInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUpdateManyWithoutUserNestedInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUpdateManyWithoutPatientNestedInputSchema).optional(),
  reminders: z.lazy(() => ReminderUpdateManyWithoutUserNestedInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUpdateManyWithoutUserNestedInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUpdateManyWithoutActorNestedInputSchema).optional(),
  notifications: z.lazy(() => NotificationUpdateManyWithoutUserNestedInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserUncheckedUpdateWithoutBugReportsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutBugReportsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  homeId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  workId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locations: z.lazy(() => LocationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUncheckedUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUncheckedUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUncheckedUpdateManyWithoutPatientNestedInputSchema).optional(),
  reminders: z.lazy(() => ReminderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedUpdateManyWithoutActorNestedInputSchema).optional(),
  notifications: z.lazy(() => NotificationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserCreateWithoutCustomRemindersInputSchema: z.ZodType<Prisma.UserCreateWithoutCustomRemindersInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  locations: z.lazy(() => LocationCreateNestedManyWithoutUserInputSchema).optional(),
  home: z.lazy(() => LocationCreateNestedOneWithoutHomeOfInputSchema).optional(),
  work: z.lazy(() => LocationCreateNestedOneWithoutWorkOfInputSchema).optional(),
  dependent: z.lazy(() => CareRelationCreateNestedManyWithoutCaregiverInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationCreateNestedManyWithoutUserInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenCreateNestedManyWithoutCaregiverInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordCreateNestedManyWithoutPatientInputSchema).optional(),
  reminders: z.lazy(() => ReminderCreateNestedManyWithoutUserInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteCreateNestedManyWithoutUserInputSchema).optional(),
  bugReports: z.lazy(() => BugReportCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogCreateNestedManyWithoutActorInputSchema).optional(),
  notifications: z.lazy(() => NotificationCreateNestedManyWithoutUserInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserUncheckedCreateWithoutCustomRemindersInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutCustomRemindersInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  homeId: z.number().int().optional().nullable(),
  workId: z.number().int().optional().nullable(),
  locations: z.lazy(() => LocationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUncheckedCreateNestedManyWithoutCaregiverInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUncheckedCreateNestedManyWithoutCaregiverInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUncheckedCreateNestedManyWithoutPatientInputSchema).optional(),
  reminders: z.lazy(() => ReminderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedCreateNestedManyWithoutActorInputSchema).optional(),
  notifications: z.lazy(() => NotificationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserCreateOrConnectWithoutCustomRemindersInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutCustomRemindersInput> = z.strictObject({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutCustomRemindersInputSchema), z.lazy(() => UserUncheckedCreateWithoutCustomRemindersInputSchema) ]),
});

export const UserUpsertWithoutCustomRemindersInputSchema: z.ZodType<Prisma.UserUpsertWithoutCustomRemindersInput> = z.strictObject({
  update: z.union([ z.lazy(() => UserUpdateWithoutCustomRemindersInputSchema), z.lazy(() => UserUncheckedUpdateWithoutCustomRemindersInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutCustomRemindersInputSchema), z.lazy(() => UserUncheckedCreateWithoutCustomRemindersInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional(),
});

export const UserUpdateToOneWithWhereWithoutCustomRemindersInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutCustomRemindersInput> = z.strictObject({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutCustomRemindersInputSchema), z.lazy(() => UserUncheckedUpdateWithoutCustomRemindersInputSchema) ]),
});

export const UserUpdateWithoutCustomRemindersInputSchema: z.ZodType<Prisma.UserUpdateWithoutCustomRemindersInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  locations: z.lazy(() => LocationUpdateManyWithoutUserNestedInputSchema).optional(),
  home: z.lazy(() => LocationUpdateOneWithoutHomeOfNestedInputSchema).optional(),
  work: z.lazy(() => LocationUpdateOneWithoutWorkOfNestedInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUpdateManyWithoutUserNestedInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUpdateManyWithoutPatientNestedInputSchema).optional(),
  reminders: z.lazy(() => ReminderUpdateManyWithoutUserNestedInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUpdateManyWithoutUserNestedInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUpdateManyWithoutActorNestedInputSchema).optional(),
  notifications: z.lazy(() => NotificationUpdateManyWithoutUserNestedInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserUncheckedUpdateWithoutCustomRemindersInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutCustomRemindersInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  homeId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  workId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locations: z.lazy(() => LocationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUncheckedUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUncheckedUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUncheckedUpdateManyWithoutPatientNestedInputSchema).optional(),
  reminders: z.lazy(() => ReminderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedUpdateManyWithoutActorNestedInputSchema).optional(),
  notifications: z.lazy(() => NotificationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserCreateWithoutAuditLogsInputSchema: z.ZodType<Prisma.UserCreateWithoutAuditLogsInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  locations: z.lazy(() => LocationCreateNestedManyWithoutUserInputSchema).optional(),
  home: z.lazy(() => LocationCreateNestedOneWithoutHomeOfInputSchema).optional(),
  work: z.lazy(() => LocationCreateNestedOneWithoutWorkOfInputSchema).optional(),
  dependent: z.lazy(() => CareRelationCreateNestedManyWithoutCaregiverInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationCreateNestedManyWithoutUserInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenCreateNestedManyWithoutCaregiverInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordCreateNestedManyWithoutPatientInputSchema).optional(),
  reminders: z.lazy(() => ReminderCreateNestedManyWithoutUserInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteCreateNestedManyWithoutUserInputSchema).optional(),
  bugReports: z.lazy(() => BugReportCreateNestedManyWithoutUserInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderCreateNestedManyWithoutUserInputSchema).optional(),
  notifications: z.lazy(() => NotificationCreateNestedManyWithoutUserInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserUncheckedCreateWithoutAuditLogsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutAuditLogsInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  homeId: z.number().int().optional().nullable(),
  workId: z.number().int().optional().nullable(),
  locations: z.lazy(() => LocationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUncheckedCreateNestedManyWithoutCaregiverInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUncheckedCreateNestedManyWithoutCaregiverInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUncheckedCreateNestedManyWithoutPatientInputSchema).optional(),
  reminders: z.lazy(() => ReminderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  notifications: z.lazy(() => NotificationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserCreateOrConnectWithoutAuditLogsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutAuditLogsInput> = z.strictObject({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutAuditLogsInputSchema), z.lazy(() => UserUncheckedCreateWithoutAuditLogsInputSchema) ]),
});

export const UserUpsertWithoutAuditLogsInputSchema: z.ZodType<Prisma.UserUpsertWithoutAuditLogsInput> = z.strictObject({
  update: z.union([ z.lazy(() => UserUpdateWithoutAuditLogsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutAuditLogsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutAuditLogsInputSchema), z.lazy(() => UserUncheckedCreateWithoutAuditLogsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional(),
});

export const UserUpdateToOneWithWhereWithoutAuditLogsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutAuditLogsInput> = z.strictObject({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutAuditLogsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutAuditLogsInputSchema) ]),
});

export const UserUpdateWithoutAuditLogsInputSchema: z.ZodType<Prisma.UserUpdateWithoutAuditLogsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  locations: z.lazy(() => LocationUpdateManyWithoutUserNestedInputSchema).optional(),
  home: z.lazy(() => LocationUpdateOneWithoutHomeOfNestedInputSchema).optional(),
  work: z.lazy(() => LocationUpdateOneWithoutWorkOfNestedInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUpdateManyWithoutUserNestedInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUpdateManyWithoutPatientNestedInputSchema).optional(),
  reminders: z.lazy(() => ReminderUpdateManyWithoutUserNestedInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUpdateManyWithoutUserNestedInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUpdateManyWithoutUserNestedInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUpdateManyWithoutUserNestedInputSchema).optional(),
  notifications: z.lazy(() => NotificationUpdateManyWithoutUserNestedInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserUncheckedUpdateWithoutAuditLogsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutAuditLogsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  homeId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  workId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locations: z.lazy(() => LocationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUncheckedUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUncheckedUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUncheckedUpdateManyWithoutPatientNestedInputSchema).optional(),
  reminders: z.lazy(() => ReminderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  notifications: z.lazy(() => NotificationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserCreateWithoutNotificationsInputSchema: z.ZodType<Prisma.UserCreateWithoutNotificationsInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  locations: z.lazy(() => LocationCreateNestedManyWithoutUserInputSchema).optional(),
  home: z.lazy(() => LocationCreateNestedOneWithoutHomeOfInputSchema).optional(),
  work: z.lazy(() => LocationCreateNestedOneWithoutWorkOfInputSchema).optional(),
  dependent: z.lazy(() => CareRelationCreateNestedManyWithoutCaregiverInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationCreateNestedManyWithoutUserInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenCreateNestedManyWithoutCaregiverInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordCreateNestedManyWithoutPatientInputSchema).optional(),
  reminders: z.lazy(() => ReminderCreateNestedManyWithoutUserInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteCreateNestedManyWithoutUserInputSchema).optional(),
  bugReports: z.lazy(() => BugReportCreateNestedManyWithoutUserInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogCreateNestedManyWithoutActorInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserUncheckedCreateWithoutNotificationsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutNotificationsInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  homeId: z.number().int().optional().nullable(),
  workId: z.number().int().optional().nullable(),
  locations: z.lazy(() => LocationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUncheckedCreateNestedManyWithoutCaregiverInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUncheckedCreateNestedManyWithoutCaregiverInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUncheckedCreateNestedManyWithoutPatientInputSchema).optional(),
  reminders: z.lazy(() => ReminderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedCreateNestedManyWithoutActorInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserCreateOrConnectWithoutNotificationsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutNotificationsInput> = z.strictObject({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutNotificationsInputSchema), z.lazy(() => UserUncheckedCreateWithoutNotificationsInputSchema) ]),
});

export const UserUpsertWithoutNotificationsInputSchema: z.ZodType<Prisma.UserUpsertWithoutNotificationsInput> = z.strictObject({
  update: z.union([ z.lazy(() => UserUpdateWithoutNotificationsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutNotificationsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutNotificationsInputSchema), z.lazy(() => UserUncheckedCreateWithoutNotificationsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional(),
});

export const UserUpdateToOneWithWhereWithoutNotificationsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutNotificationsInput> = z.strictObject({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutNotificationsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutNotificationsInputSchema) ]),
});

export const UserUpdateWithoutNotificationsInputSchema: z.ZodType<Prisma.UserUpdateWithoutNotificationsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  locations: z.lazy(() => LocationUpdateManyWithoutUserNestedInputSchema).optional(),
  home: z.lazy(() => LocationUpdateOneWithoutHomeOfNestedInputSchema).optional(),
  work: z.lazy(() => LocationUpdateOneWithoutWorkOfNestedInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUpdateManyWithoutUserNestedInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUpdateManyWithoutPatientNestedInputSchema).optional(),
  reminders: z.lazy(() => ReminderUpdateManyWithoutUserNestedInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUpdateManyWithoutUserNestedInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUpdateManyWithoutUserNestedInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUpdateManyWithoutActorNestedInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserUncheckedUpdateWithoutNotificationsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutNotificationsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  homeId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  workId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locations: z.lazy(() => LocationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUncheckedUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUncheckedUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUncheckedUpdateManyWithoutPatientNestedInputSchema).optional(),
  reminders: z.lazy(() => ReminderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedUpdateManyWithoutActorNestedInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserCreateWithoutEmergencyContactsInputSchema: z.ZodType<Prisma.UserCreateWithoutEmergencyContactsInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  locations: z.lazy(() => LocationCreateNestedManyWithoutUserInputSchema).optional(),
  home: z.lazy(() => LocationCreateNestedOneWithoutHomeOfInputSchema).optional(),
  work: z.lazy(() => LocationCreateNestedOneWithoutWorkOfInputSchema).optional(),
  dependent: z.lazy(() => CareRelationCreateNestedManyWithoutCaregiverInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationCreateNestedManyWithoutUserInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenCreateNestedManyWithoutCaregiverInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordCreateNestedManyWithoutPatientInputSchema).optional(),
  reminders: z.lazy(() => ReminderCreateNestedManyWithoutUserInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteCreateNestedManyWithoutUserInputSchema).optional(),
  bugReports: z.lazy(() => BugReportCreateNestedManyWithoutUserInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogCreateNestedManyWithoutActorInputSchema).optional(),
  notifications: z.lazy(() => NotificationCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserUncheckedCreateWithoutEmergencyContactsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutEmergencyContactsInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  homeId: z.number().int().optional().nullable(),
  workId: z.number().int().optional().nullable(),
  locations: z.lazy(() => LocationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUncheckedCreateNestedManyWithoutCaregiverInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUncheckedCreateNestedManyWithoutCaregiverInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUncheckedCreateNestedManyWithoutPatientInputSchema).optional(),
  reminders: z.lazy(() => ReminderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedCreateNestedManyWithoutActorInputSchema).optional(),
  notifications: z.lazy(() => NotificationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserCreateOrConnectWithoutEmergencyContactsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutEmergencyContactsInput> = z.strictObject({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutEmergencyContactsInputSchema), z.lazy(() => UserUncheckedCreateWithoutEmergencyContactsInputSchema) ]),
});

export const UserUpsertWithoutEmergencyContactsInputSchema: z.ZodType<Prisma.UserUpsertWithoutEmergencyContactsInput> = z.strictObject({
  update: z.union([ z.lazy(() => UserUpdateWithoutEmergencyContactsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutEmergencyContactsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutEmergencyContactsInputSchema), z.lazy(() => UserUncheckedCreateWithoutEmergencyContactsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional(),
});

export const UserUpdateToOneWithWhereWithoutEmergencyContactsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutEmergencyContactsInput> = z.strictObject({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutEmergencyContactsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutEmergencyContactsInputSchema) ]),
});

export const UserUpdateWithoutEmergencyContactsInputSchema: z.ZodType<Prisma.UserUpdateWithoutEmergencyContactsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  locations: z.lazy(() => LocationUpdateManyWithoutUserNestedInputSchema).optional(),
  home: z.lazy(() => LocationUpdateOneWithoutHomeOfNestedInputSchema).optional(),
  work: z.lazy(() => LocationUpdateOneWithoutWorkOfNestedInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUpdateManyWithoutUserNestedInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUpdateManyWithoutPatientNestedInputSchema).optional(),
  reminders: z.lazy(() => ReminderUpdateManyWithoutUserNestedInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUpdateManyWithoutUserNestedInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUpdateManyWithoutUserNestedInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUpdateManyWithoutActorNestedInputSchema).optional(),
  notifications: z.lazy(() => NotificationUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserUncheckedUpdateWithoutEmergencyContactsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutEmergencyContactsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  homeId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  workId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locations: z.lazy(() => LocationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUncheckedUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUncheckedUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUncheckedUpdateManyWithoutPatientNestedInputSchema).optional(),
  reminders: z.lazy(() => ReminderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedUpdateManyWithoutActorNestedInputSchema).optional(),
  notifications: z.lazy(() => NotificationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const LocationCreateManyUserInputSchema: z.ZodType<Prisma.LocationCreateManyUserInput> = z.strictObject({
  id: z.number().int().optional(),
  latitude: z.number(),
  longitude: z.number(),
  createdAt: z.coerce.date().optional(),
});

export const CareRelationCreateManyCaregiverInputSchema: z.ZodType<Prisma.CareRelationCreateManyCaregiverInput> = z.strictObject({
  id: z.number().int().optional(),
  userId: z.string(),
  createdAt: z.coerce.date().optional(),
});

export const CareRelationCreateManyUserInputSchema: z.ZodType<Prisma.CareRelationCreateManyUserInput> = z.strictObject({
  id: z.number().int().optional(),
  caregiverId: z.string(),
  createdAt: z.coerce.date().optional(),
});

export const PairingTokenCreateManyCaregiverInputSchema: z.ZodType<Prisma.PairingTokenCreateManyCaregiverInput> = z.strictObject({
  id: z.uuid().optional(),
  token: z.string(),
  createdAt: z.coerce.date().optional(),
  expiryAt: z.coerce.date(),
  usedAt: z.coerce.date().optional().nullable(),
});

export const MedicalRecordCreateManyPatientInputSchema: z.ZodType<Prisma.MedicalRecordCreateManyPatientInput> = z.strictObject({
  id: z.uuid().optional(),
  gender: z.lazy(() => SexSchema),
  dateOfBirth: z.coerce.date(),
  height: z.number().optional().nullable(),
  weight: z.number().optional().nullable(),
  incidentHistory: z.string().optional().nullable(),
  medicalHistory: z.string().optional().nullable(),
  geneticHistory: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  medications: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  modifiedAt: z.coerce.date().optional(),
});

export const ReminderCreateManyUserInputSchema: z.ZodType<Prisma.ReminderCreateManyUserInput> = z.strictObject({
  id: z.uuid().optional(),
  type: z.lazy(() => ReminderTypeSchema),
  interval: z.number().int(),
  disabled: z.boolean().optional(),
  lastSent: z.coerce.date().optional().nullable(),
  nextAt: z.coerce.date(),
});

export const CheckInNoteCreateManyUserInputSchema: z.ZodType<Prisma.CheckInNoteCreateManyUserInput> = z.strictObject({
  id: z.uuid().optional(),
  status: z.lazy(() => HealthStatusSchema),
  message: z.string(),
  createdAt: z.coerce.date().optional(),
});

export const BugReportCreateManyUserInputSchema: z.ZodType<Prisma.BugReportCreateManyUserInput> = z.strictObject({
  id: z.uuid().optional(),
  type: z.lazy(() => ReportTypeSchema),
  title: z.string(),
  message: z.string(),
});

export const CustomReminderCreateManyUserInputSchema: z.ZodType<Prisma.CustomReminderCreateManyUserInput> = z.strictObject({
  id: z.uuid().optional(),
  title: z.string().optional().nullable(),
  message: z.string(),
  interval: z.number().int().optional().nullable(),
  disabled: z.boolean().optional(),
  lastSent: z.coerce.date().optional().nullable(),
  nextAt: z.coerce.date(),
});

export const AuditLogCreateManyActorInputSchema: z.ZodType<Prisma.AuditLogCreateManyActorInput> = z.strictObject({
  id: z.uuid().optional(),
  targetId: z.string().optional().nullable(),
  target: z.string(),
  action: z.lazy(() => AuditActionSchema),
  summary: z.string(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
});

export const NotificationCreateManyUserInputSchema: z.ZodType<Prisma.NotificationCreateManyUserInput> = z.strictObject({
  id: z.uuid().optional(),
  type: z.lazy(() => NotificationTypeSchema),
  title: z.string(),
  message: z.string(),
  readAt: z.coerce.date().optional().nullable(),
  sentAt: z.coerce.date().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
});

export const EmergencyContactCreateManyUserInputSchema: z.ZodType<Prisma.EmergencyContactCreateManyUserInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  phone: z.string(),
  relation: z.string().optional().nullable(),
  priority: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
});

export const LocationUpdateWithoutUserInputSchema: z.ZodType<Prisma.LocationUpdateWithoutUserInput> = z.strictObject({
  latitude: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  longitude: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  homeOf: z.lazy(() => UserUpdateManyWithoutHomeNestedInputSchema).optional(),
  workOf: z.lazy(() => UserUpdateManyWithoutWorkNestedInputSchema).optional(),
});

export const LocationUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.LocationUncheckedUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  latitude: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  longitude: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  homeOf: z.lazy(() => UserUncheckedUpdateManyWithoutHomeNestedInputSchema).optional(),
  workOf: z.lazy(() => UserUncheckedUpdateManyWithoutWorkNestedInputSchema).optional(),
});

export const LocationUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.LocationUncheckedUpdateManyWithoutUserInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  latitude: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  longitude: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CareRelationUpdateWithoutCaregiverInputSchema: z.ZodType<Prisma.CareRelationUpdateWithoutCaregiverInput> = z.strictObject({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutCaregiverNestedInputSchema).optional(),
});

export const CareRelationUncheckedUpdateWithoutCaregiverInputSchema: z.ZodType<Prisma.CareRelationUncheckedUpdateWithoutCaregiverInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CareRelationUncheckedUpdateManyWithoutCaregiverInputSchema: z.ZodType<Prisma.CareRelationUncheckedUpdateManyWithoutCaregiverInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CareRelationUpdateWithoutUserInputSchema: z.ZodType<Prisma.CareRelationUpdateWithoutUserInput> = z.strictObject({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  caregiver: z.lazy(() => UserUpdateOneRequiredWithoutDependentNestedInputSchema).optional(),
});

export const CareRelationUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.CareRelationUncheckedUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  caregiverId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CareRelationUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.CareRelationUncheckedUpdateManyWithoutUserInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  caregiverId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const PairingTokenUpdateWithoutCaregiverInputSchema: z.ZodType<Prisma.PairingTokenUpdateWithoutCaregiverInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  expiryAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  usedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const PairingTokenUncheckedUpdateWithoutCaregiverInputSchema: z.ZodType<Prisma.PairingTokenUncheckedUpdateWithoutCaregiverInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  expiryAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  usedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const PairingTokenUncheckedUpdateManyWithoutCaregiverInputSchema: z.ZodType<Prisma.PairingTokenUncheckedUpdateManyWithoutCaregiverInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  expiryAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  usedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const MedicalRecordUpdateWithoutPatientInputSchema: z.ZodType<Prisma.MedicalRecordUpdateWithoutPatientInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  gender: z.union([ z.lazy(() => SexSchema), z.lazy(() => EnumSexFieldUpdateOperationsInputSchema) ]).optional(),
  dateOfBirth: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  height: z.union([ z.number(),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  weight: z.union([ z.number(),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  incidentHistory: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  medicalHistory: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  geneticHistory: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  allergies: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  medications: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  modifiedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const MedicalRecordUncheckedUpdateWithoutPatientInputSchema: z.ZodType<Prisma.MedicalRecordUncheckedUpdateWithoutPatientInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  gender: z.union([ z.lazy(() => SexSchema), z.lazy(() => EnumSexFieldUpdateOperationsInputSchema) ]).optional(),
  dateOfBirth: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  height: z.union([ z.number(),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  weight: z.union([ z.number(),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  incidentHistory: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  medicalHistory: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  geneticHistory: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  allergies: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  medications: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  modifiedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const MedicalRecordUncheckedUpdateManyWithoutPatientInputSchema: z.ZodType<Prisma.MedicalRecordUncheckedUpdateManyWithoutPatientInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  gender: z.union([ z.lazy(() => SexSchema), z.lazy(() => EnumSexFieldUpdateOperationsInputSchema) ]).optional(),
  dateOfBirth: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  height: z.union([ z.number(),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  weight: z.union([ z.number(),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  incidentHistory: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  medicalHistory: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  geneticHistory: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  allergies: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  medications: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  modifiedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const ReminderUpdateWithoutUserInputSchema: z.ZodType<Prisma.ReminderUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ReminderTypeSchema), z.lazy(() => EnumReminderTypeFieldUpdateOperationsInputSchema) ]).optional(),
  interval: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  disabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  lastSent: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  nextAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const ReminderUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.ReminderUncheckedUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ReminderTypeSchema), z.lazy(() => EnumReminderTypeFieldUpdateOperationsInputSchema) ]).optional(),
  interval: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  disabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  lastSent: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  nextAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const ReminderUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.ReminderUncheckedUpdateManyWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ReminderTypeSchema), z.lazy(() => EnumReminderTypeFieldUpdateOperationsInputSchema) ]).optional(),
  interval: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  disabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  lastSent: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  nextAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CheckInNoteUpdateWithoutUserInputSchema: z.ZodType<Prisma.CheckInNoteUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => HealthStatusSchema), z.lazy(() => EnumHealthStatusFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CheckInNoteUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.CheckInNoteUncheckedUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => HealthStatusSchema), z.lazy(() => EnumHealthStatusFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CheckInNoteUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.CheckInNoteUncheckedUpdateManyWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => HealthStatusSchema), z.lazy(() => EnumHealthStatusFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const BugReportUpdateWithoutUserInputSchema: z.ZodType<Prisma.BugReportUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ReportTypeSchema), z.lazy(() => EnumReportTypeFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
});

export const BugReportUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.BugReportUncheckedUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ReportTypeSchema), z.lazy(() => EnumReportTypeFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
});

export const BugReportUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.BugReportUncheckedUpdateManyWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => ReportTypeSchema), z.lazy(() => EnumReportTypeFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CustomReminderUpdateWithoutUserInputSchema: z.ZodType<Prisma.CustomReminderUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  message: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  interval: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  disabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  lastSent: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  nextAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CustomReminderUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.CustomReminderUncheckedUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  message: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  interval: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  disabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  lastSent: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  nextAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CustomReminderUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.CustomReminderUncheckedUpdateManyWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  message: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  interval: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  disabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  lastSent: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  nextAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const AuditLogUpdateWithoutActorInputSchema: z.ZodType<Prisma.AuditLogUpdateWithoutActorInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  targetId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  target: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  action: z.union([ z.lazy(() => AuditActionSchema), z.lazy(() => EnumAuditActionFieldUpdateOperationsInputSchema) ]).optional(),
  summary: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const AuditLogUncheckedUpdateWithoutActorInputSchema: z.ZodType<Prisma.AuditLogUncheckedUpdateWithoutActorInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  targetId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  target: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  action: z.union([ z.lazy(() => AuditActionSchema), z.lazy(() => EnumAuditActionFieldUpdateOperationsInputSchema) ]).optional(),
  summary: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const AuditLogUncheckedUpdateManyWithoutActorInputSchema: z.ZodType<Prisma.AuditLogUncheckedUpdateManyWithoutActorInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  targetId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  target: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  action: z.union([ z.lazy(() => AuditActionSchema), z.lazy(() => EnumAuditActionFieldUpdateOperationsInputSchema) ]).optional(),
  summary: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const NotificationUpdateWithoutUserInputSchema: z.ZodType<Prisma.NotificationUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => NotificationTypeSchema), z.lazy(() => EnumNotificationTypeFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  readAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sentAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
});

export const NotificationUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.NotificationUncheckedUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => NotificationTypeSchema), z.lazy(() => EnumNotificationTypeFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  readAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sentAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
});

export const NotificationUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.NotificationUncheckedUpdateManyWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => NotificationTypeSchema), z.lazy(() => EnumNotificationTypeFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  readAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sentAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
});

export const EmergencyContactUpdateWithoutUserInputSchema: z.ZodType<Prisma.EmergencyContactUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  relation: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  priority: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const EmergencyContactUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.EmergencyContactUncheckedUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  relation: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  priority: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const EmergencyContactUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.EmergencyContactUncheckedUpdateManyWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  relation: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  priority: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const UserCreateManyHomeInputSchema: z.ZodType<Prisma.UserCreateManyHomeInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  workId: z.number().int().optional().nullable(),
});

export const UserCreateManyWorkInputSchema: z.ZodType<Prisma.UserCreateManyWorkInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.email({ message: "Invalid email format" }),
  username: z.string().optional().nullable(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.lazy(() => RoleSchema),
  homeId: z.number().int().optional().nullable(),
});

export const UserUpdateWithoutHomeInputSchema: z.ZodType<Prisma.UserUpdateWithoutHomeInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  locations: z.lazy(() => LocationUpdateManyWithoutUserNestedInputSchema).optional(),
  work: z.lazy(() => LocationUpdateOneWithoutWorkOfNestedInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUpdateManyWithoutUserNestedInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUpdateManyWithoutPatientNestedInputSchema).optional(),
  reminders: z.lazy(() => ReminderUpdateManyWithoutUserNestedInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUpdateManyWithoutUserNestedInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUpdateManyWithoutUserNestedInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUpdateManyWithoutActorNestedInputSchema).optional(),
  notifications: z.lazy(() => NotificationUpdateManyWithoutUserNestedInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserUncheckedUpdateWithoutHomeInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutHomeInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  workId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locations: z.lazy(() => LocationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUncheckedUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUncheckedUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUncheckedUpdateManyWithoutPatientNestedInputSchema).optional(),
  reminders: z.lazy(() => ReminderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedUpdateManyWithoutActorNestedInputSchema).optional(),
  notifications: z.lazy(() => NotificationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserUncheckedUpdateManyWithoutHomeInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyWithoutHomeInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  workId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const UserUpdateWithoutWorkInputSchema: z.ZodType<Prisma.UserUpdateWithoutWorkInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  locations: z.lazy(() => LocationUpdateManyWithoutUserNestedInputSchema).optional(),
  home: z.lazy(() => LocationUpdateOneWithoutHomeOfNestedInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUpdateManyWithoutUserNestedInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUpdateManyWithoutPatientNestedInputSchema).optional(),
  reminders: z.lazy(() => ReminderUpdateManyWithoutUserNestedInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUpdateManyWithoutUserNestedInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUpdateManyWithoutUserNestedInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUpdateManyWithoutActorNestedInputSchema).optional(),
  notifications: z.lazy(() => NotificationUpdateManyWithoutUserNestedInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserUncheckedUpdateWithoutWorkInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutWorkInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  homeId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locations: z.lazy(() => LocationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  dependent: z.lazy(() => CareRelationUncheckedUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  caregiver: z.lazy(() => CareRelationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  pairingTokens: z.lazy(() => PairingTokenUncheckedUpdateManyWithoutCaregiverNestedInputSchema).optional(),
  medicalRecords: z.lazy(() => MedicalRecordUncheckedUpdateManyWithoutPatientNestedInputSchema).optional(),
  reminders: z.lazy(() => ReminderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  checkInNotes: z.lazy(() => CheckInNoteUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  bugReports: z.lazy(() => BugReportUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  customReminders: z.lazy(() => CustomReminderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedUpdateManyWithoutActorNestedInputSchema).optional(),
  notifications: z.lazy(() => NotificationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  emergencyContacts: z.lazy(() => EmergencyContactUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserUncheckedUpdateManyWithoutWorkInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyWithoutWorkInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.email({ message: "Invalid email format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string().min(8, { message: "Password must be at least 8 characters" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string().min(1, { message: "First name is required" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  homeId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const UserFindFirstArgsSchema: z.ZodType<Prisma.UserFindFirstArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(), 
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema, UserScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const UserFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserFindFirstOrThrowArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(), 
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema, UserScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const UserFindManyArgsSchema: z.ZodType<Prisma.UserFindManyArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(), 
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema, UserScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const UserAggregateArgsSchema: z.ZodType<Prisma.UserAggregateArgs> = z.object({
  where: UserWhereInputSchema.optional(), 
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const UserGroupByArgsSchema: z.ZodType<Prisma.UserGroupByArgs> = z.object({
  where: UserWhereInputSchema.optional(), 
  orderBy: z.union([ UserOrderByWithAggregationInputSchema.array(), UserOrderByWithAggregationInputSchema ]).optional(),
  by: UserScalarFieldEnumSchema.array(), 
  having: UserScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const UserFindUniqueArgsSchema: z.ZodType<Prisma.UserFindUniqueArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema, 
}).strict();

export const UserFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserFindUniqueOrThrowArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema, 
}).strict();

export const LocationFindFirstArgsSchema: z.ZodType<Prisma.LocationFindFirstArgs> = z.object({
  select: LocationSelectSchema.optional(),
  include: LocationIncludeSchema.optional(),
  where: LocationWhereInputSchema.optional(), 
  orderBy: z.union([ LocationOrderByWithRelationInputSchema.array(), LocationOrderByWithRelationInputSchema ]).optional(),
  cursor: LocationWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ LocationScalarFieldEnumSchema, LocationScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const LocationFindFirstOrThrowArgsSchema: z.ZodType<Prisma.LocationFindFirstOrThrowArgs> = z.object({
  select: LocationSelectSchema.optional(),
  include: LocationIncludeSchema.optional(),
  where: LocationWhereInputSchema.optional(), 
  orderBy: z.union([ LocationOrderByWithRelationInputSchema.array(), LocationOrderByWithRelationInputSchema ]).optional(),
  cursor: LocationWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ LocationScalarFieldEnumSchema, LocationScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const LocationFindManyArgsSchema: z.ZodType<Prisma.LocationFindManyArgs> = z.object({
  select: LocationSelectSchema.optional(),
  include: LocationIncludeSchema.optional(),
  where: LocationWhereInputSchema.optional(), 
  orderBy: z.union([ LocationOrderByWithRelationInputSchema.array(), LocationOrderByWithRelationInputSchema ]).optional(),
  cursor: LocationWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ LocationScalarFieldEnumSchema, LocationScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const LocationAggregateArgsSchema: z.ZodType<Prisma.LocationAggregateArgs> = z.object({
  where: LocationWhereInputSchema.optional(), 
  orderBy: z.union([ LocationOrderByWithRelationInputSchema.array(), LocationOrderByWithRelationInputSchema ]).optional(),
  cursor: LocationWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const LocationGroupByArgsSchema: z.ZodType<Prisma.LocationGroupByArgs> = z.object({
  where: LocationWhereInputSchema.optional(), 
  orderBy: z.union([ LocationOrderByWithAggregationInputSchema.array(), LocationOrderByWithAggregationInputSchema ]).optional(),
  by: LocationScalarFieldEnumSchema.array(), 
  having: LocationScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const LocationFindUniqueArgsSchema: z.ZodType<Prisma.LocationFindUniqueArgs> = z.object({
  select: LocationSelectSchema.optional(),
  include: LocationIncludeSchema.optional(),
  where: LocationWhereUniqueInputSchema, 
}).strict();

export const LocationFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.LocationFindUniqueOrThrowArgs> = z.object({
  select: LocationSelectSchema.optional(),
  include: LocationIncludeSchema.optional(),
  where: LocationWhereUniqueInputSchema, 
}).strict();

export const CareRelationFindFirstArgsSchema: z.ZodType<Prisma.CareRelationFindFirstArgs> = z.object({
  select: CareRelationSelectSchema.optional(),
  include: CareRelationIncludeSchema.optional(),
  where: CareRelationWhereInputSchema.optional(), 
  orderBy: z.union([ CareRelationOrderByWithRelationInputSchema.array(), CareRelationOrderByWithRelationInputSchema ]).optional(),
  cursor: CareRelationWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CareRelationScalarFieldEnumSchema, CareRelationScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const CareRelationFindFirstOrThrowArgsSchema: z.ZodType<Prisma.CareRelationFindFirstOrThrowArgs> = z.object({
  select: CareRelationSelectSchema.optional(),
  include: CareRelationIncludeSchema.optional(),
  where: CareRelationWhereInputSchema.optional(), 
  orderBy: z.union([ CareRelationOrderByWithRelationInputSchema.array(), CareRelationOrderByWithRelationInputSchema ]).optional(),
  cursor: CareRelationWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CareRelationScalarFieldEnumSchema, CareRelationScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const CareRelationFindManyArgsSchema: z.ZodType<Prisma.CareRelationFindManyArgs> = z.object({
  select: CareRelationSelectSchema.optional(),
  include: CareRelationIncludeSchema.optional(),
  where: CareRelationWhereInputSchema.optional(), 
  orderBy: z.union([ CareRelationOrderByWithRelationInputSchema.array(), CareRelationOrderByWithRelationInputSchema ]).optional(),
  cursor: CareRelationWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CareRelationScalarFieldEnumSchema, CareRelationScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const CareRelationAggregateArgsSchema: z.ZodType<Prisma.CareRelationAggregateArgs> = z.object({
  where: CareRelationWhereInputSchema.optional(), 
  orderBy: z.union([ CareRelationOrderByWithRelationInputSchema.array(), CareRelationOrderByWithRelationInputSchema ]).optional(),
  cursor: CareRelationWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const CareRelationGroupByArgsSchema: z.ZodType<Prisma.CareRelationGroupByArgs> = z.object({
  where: CareRelationWhereInputSchema.optional(), 
  orderBy: z.union([ CareRelationOrderByWithAggregationInputSchema.array(), CareRelationOrderByWithAggregationInputSchema ]).optional(),
  by: CareRelationScalarFieldEnumSchema.array(), 
  having: CareRelationScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const CareRelationFindUniqueArgsSchema: z.ZodType<Prisma.CareRelationFindUniqueArgs> = z.object({
  select: CareRelationSelectSchema.optional(),
  include: CareRelationIncludeSchema.optional(),
  where: CareRelationWhereUniqueInputSchema, 
}).strict();

export const CareRelationFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.CareRelationFindUniqueOrThrowArgs> = z.object({
  select: CareRelationSelectSchema.optional(),
  include: CareRelationIncludeSchema.optional(),
  where: CareRelationWhereUniqueInputSchema, 
}).strict();

export const PairingTokenFindFirstArgsSchema: z.ZodType<Prisma.PairingTokenFindFirstArgs> = z.object({
  select: PairingTokenSelectSchema.optional(),
  include: PairingTokenIncludeSchema.optional(),
  where: PairingTokenWhereInputSchema.optional(), 
  orderBy: z.union([ PairingTokenOrderByWithRelationInputSchema.array(), PairingTokenOrderByWithRelationInputSchema ]).optional(),
  cursor: PairingTokenWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ PairingTokenScalarFieldEnumSchema, PairingTokenScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const PairingTokenFindFirstOrThrowArgsSchema: z.ZodType<Prisma.PairingTokenFindFirstOrThrowArgs> = z.object({
  select: PairingTokenSelectSchema.optional(),
  include: PairingTokenIncludeSchema.optional(),
  where: PairingTokenWhereInputSchema.optional(), 
  orderBy: z.union([ PairingTokenOrderByWithRelationInputSchema.array(), PairingTokenOrderByWithRelationInputSchema ]).optional(),
  cursor: PairingTokenWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ PairingTokenScalarFieldEnumSchema, PairingTokenScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const PairingTokenFindManyArgsSchema: z.ZodType<Prisma.PairingTokenFindManyArgs> = z.object({
  select: PairingTokenSelectSchema.optional(),
  include: PairingTokenIncludeSchema.optional(),
  where: PairingTokenWhereInputSchema.optional(), 
  orderBy: z.union([ PairingTokenOrderByWithRelationInputSchema.array(), PairingTokenOrderByWithRelationInputSchema ]).optional(),
  cursor: PairingTokenWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ PairingTokenScalarFieldEnumSchema, PairingTokenScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const PairingTokenAggregateArgsSchema: z.ZodType<Prisma.PairingTokenAggregateArgs> = z.object({
  where: PairingTokenWhereInputSchema.optional(), 
  orderBy: z.union([ PairingTokenOrderByWithRelationInputSchema.array(), PairingTokenOrderByWithRelationInputSchema ]).optional(),
  cursor: PairingTokenWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const PairingTokenGroupByArgsSchema: z.ZodType<Prisma.PairingTokenGroupByArgs> = z.object({
  where: PairingTokenWhereInputSchema.optional(), 
  orderBy: z.union([ PairingTokenOrderByWithAggregationInputSchema.array(), PairingTokenOrderByWithAggregationInputSchema ]).optional(),
  by: PairingTokenScalarFieldEnumSchema.array(), 
  having: PairingTokenScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const PairingTokenFindUniqueArgsSchema: z.ZodType<Prisma.PairingTokenFindUniqueArgs> = z.object({
  select: PairingTokenSelectSchema.optional(),
  include: PairingTokenIncludeSchema.optional(),
  where: PairingTokenWhereUniqueInputSchema, 
}).strict();

export const PairingTokenFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.PairingTokenFindUniqueOrThrowArgs> = z.object({
  select: PairingTokenSelectSchema.optional(),
  include: PairingTokenIncludeSchema.optional(),
  where: PairingTokenWhereUniqueInputSchema, 
}).strict();

export const MedicalRecordFindFirstArgsSchema: z.ZodType<Prisma.MedicalRecordFindFirstArgs> = z.object({
  select: MedicalRecordSelectSchema.optional(),
  include: MedicalRecordIncludeSchema.optional(),
  where: MedicalRecordWhereInputSchema.optional(), 
  orderBy: z.union([ MedicalRecordOrderByWithRelationInputSchema.array(), MedicalRecordOrderByWithRelationInputSchema ]).optional(),
  cursor: MedicalRecordWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ MedicalRecordScalarFieldEnumSchema, MedicalRecordScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const MedicalRecordFindFirstOrThrowArgsSchema: z.ZodType<Prisma.MedicalRecordFindFirstOrThrowArgs> = z.object({
  select: MedicalRecordSelectSchema.optional(),
  include: MedicalRecordIncludeSchema.optional(),
  where: MedicalRecordWhereInputSchema.optional(), 
  orderBy: z.union([ MedicalRecordOrderByWithRelationInputSchema.array(), MedicalRecordOrderByWithRelationInputSchema ]).optional(),
  cursor: MedicalRecordWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ MedicalRecordScalarFieldEnumSchema, MedicalRecordScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const MedicalRecordFindManyArgsSchema: z.ZodType<Prisma.MedicalRecordFindManyArgs> = z.object({
  select: MedicalRecordSelectSchema.optional(),
  include: MedicalRecordIncludeSchema.optional(),
  where: MedicalRecordWhereInputSchema.optional(), 
  orderBy: z.union([ MedicalRecordOrderByWithRelationInputSchema.array(), MedicalRecordOrderByWithRelationInputSchema ]).optional(),
  cursor: MedicalRecordWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ MedicalRecordScalarFieldEnumSchema, MedicalRecordScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const MedicalRecordAggregateArgsSchema: z.ZodType<Prisma.MedicalRecordAggregateArgs> = z.object({
  where: MedicalRecordWhereInputSchema.optional(), 
  orderBy: z.union([ MedicalRecordOrderByWithRelationInputSchema.array(), MedicalRecordOrderByWithRelationInputSchema ]).optional(),
  cursor: MedicalRecordWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const MedicalRecordGroupByArgsSchema: z.ZodType<Prisma.MedicalRecordGroupByArgs> = z.object({
  where: MedicalRecordWhereInputSchema.optional(), 
  orderBy: z.union([ MedicalRecordOrderByWithAggregationInputSchema.array(), MedicalRecordOrderByWithAggregationInputSchema ]).optional(),
  by: MedicalRecordScalarFieldEnumSchema.array(), 
  having: MedicalRecordScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const MedicalRecordFindUniqueArgsSchema: z.ZodType<Prisma.MedicalRecordFindUniqueArgs> = z.object({
  select: MedicalRecordSelectSchema.optional(),
  include: MedicalRecordIncludeSchema.optional(),
  where: MedicalRecordWhereUniqueInputSchema, 
}).strict();

export const MedicalRecordFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.MedicalRecordFindUniqueOrThrowArgs> = z.object({
  select: MedicalRecordSelectSchema.optional(),
  include: MedicalRecordIncludeSchema.optional(),
  where: MedicalRecordWhereUniqueInputSchema, 
}).strict();

export const ReminderFindFirstArgsSchema: z.ZodType<Prisma.ReminderFindFirstArgs> = z.object({
  select: ReminderSelectSchema.optional(),
  include: ReminderIncludeSchema.optional(),
  where: ReminderWhereInputSchema.optional(), 
  orderBy: z.union([ ReminderOrderByWithRelationInputSchema.array(), ReminderOrderByWithRelationInputSchema ]).optional(),
  cursor: ReminderWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ReminderScalarFieldEnumSchema, ReminderScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const ReminderFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ReminderFindFirstOrThrowArgs> = z.object({
  select: ReminderSelectSchema.optional(),
  include: ReminderIncludeSchema.optional(),
  where: ReminderWhereInputSchema.optional(), 
  orderBy: z.union([ ReminderOrderByWithRelationInputSchema.array(), ReminderOrderByWithRelationInputSchema ]).optional(),
  cursor: ReminderWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ReminderScalarFieldEnumSchema, ReminderScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const ReminderFindManyArgsSchema: z.ZodType<Prisma.ReminderFindManyArgs> = z.object({
  select: ReminderSelectSchema.optional(),
  include: ReminderIncludeSchema.optional(),
  where: ReminderWhereInputSchema.optional(), 
  orderBy: z.union([ ReminderOrderByWithRelationInputSchema.array(), ReminderOrderByWithRelationInputSchema ]).optional(),
  cursor: ReminderWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ReminderScalarFieldEnumSchema, ReminderScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const ReminderAggregateArgsSchema: z.ZodType<Prisma.ReminderAggregateArgs> = z.object({
  where: ReminderWhereInputSchema.optional(), 
  orderBy: z.union([ ReminderOrderByWithRelationInputSchema.array(), ReminderOrderByWithRelationInputSchema ]).optional(),
  cursor: ReminderWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const ReminderGroupByArgsSchema: z.ZodType<Prisma.ReminderGroupByArgs> = z.object({
  where: ReminderWhereInputSchema.optional(), 
  orderBy: z.union([ ReminderOrderByWithAggregationInputSchema.array(), ReminderOrderByWithAggregationInputSchema ]).optional(),
  by: ReminderScalarFieldEnumSchema.array(), 
  having: ReminderScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const ReminderFindUniqueArgsSchema: z.ZodType<Prisma.ReminderFindUniqueArgs> = z.object({
  select: ReminderSelectSchema.optional(),
  include: ReminderIncludeSchema.optional(),
  where: ReminderWhereUniqueInputSchema, 
}).strict();

export const ReminderFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ReminderFindUniqueOrThrowArgs> = z.object({
  select: ReminderSelectSchema.optional(),
  include: ReminderIncludeSchema.optional(),
  where: ReminderWhereUniqueInputSchema, 
}).strict();

export const CheckInNoteFindFirstArgsSchema: z.ZodType<Prisma.CheckInNoteFindFirstArgs> = z.object({
  select: CheckInNoteSelectSchema.optional(),
  include: CheckInNoteIncludeSchema.optional(),
  where: CheckInNoteWhereInputSchema.optional(), 
  orderBy: z.union([ CheckInNoteOrderByWithRelationInputSchema.array(), CheckInNoteOrderByWithRelationInputSchema ]).optional(),
  cursor: CheckInNoteWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CheckInNoteScalarFieldEnumSchema, CheckInNoteScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const CheckInNoteFindFirstOrThrowArgsSchema: z.ZodType<Prisma.CheckInNoteFindFirstOrThrowArgs> = z.object({
  select: CheckInNoteSelectSchema.optional(),
  include: CheckInNoteIncludeSchema.optional(),
  where: CheckInNoteWhereInputSchema.optional(), 
  orderBy: z.union([ CheckInNoteOrderByWithRelationInputSchema.array(), CheckInNoteOrderByWithRelationInputSchema ]).optional(),
  cursor: CheckInNoteWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CheckInNoteScalarFieldEnumSchema, CheckInNoteScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const CheckInNoteFindManyArgsSchema: z.ZodType<Prisma.CheckInNoteFindManyArgs> = z.object({
  select: CheckInNoteSelectSchema.optional(),
  include: CheckInNoteIncludeSchema.optional(),
  where: CheckInNoteWhereInputSchema.optional(), 
  orderBy: z.union([ CheckInNoteOrderByWithRelationInputSchema.array(), CheckInNoteOrderByWithRelationInputSchema ]).optional(),
  cursor: CheckInNoteWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CheckInNoteScalarFieldEnumSchema, CheckInNoteScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const CheckInNoteAggregateArgsSchema: z.ZodType<Prisma.CheckInNoteAggregateArgs> = z.object({
  where: CheckInNoteWhereInputSchema.optional(), 
  orderBy: z.union([ CheckInNoteOrderByWithRelationInputSchema.array(), CheckInNoteOrderByWithRelationInputSchema ]).optional(),
  cursor: CheckInNoteWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const CheckInNoteGroupByArgsSchema: z.ZodType<Prisma.CheckInNoteGroupByArgs> = z.object({
  where: CheckInNoteWhereInputSchema.optional(), 
  orderBy: z.union([ CheckInNoteOrderByWithAggregationInputSchema.array(), CheckInNoteOrderByWithAggregationInputSchema ]).optional(),
  by: CheckInNoteScalarFieldEnumSchema.array(), 
  having: CheckInNoteScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const CheckInNoteFindUniqueArgsSchema: z.ZodType<Prisma.CheckInNoteFindUniqueArgs> = z.object({
  select: CheckInNoteSelectSchema.optional(),
  include: CheckInNoteIncludeSchema.optional(),
  where: CheckInNoteWhereUniqueInputSchema, 
}).strict();

export const CheckInNoteFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.CheckInNoteFindUniqueOrThrowArgs> = z.object({
  select: CheckInNoteSelectSchema.optional(),
  include: CheckInNoteIncludeSchema.optional(),
  where: CheckInNoteWhereUniqueInputSchema, 
}).strict();

export const BugReportFindFirstArgsSchema: z.ZodType<Prisma.BugReportFindFirstArgs> = z.object({
  select: BugReportSelectSchema.optional(),
  include: BugReportIncludeSchema.optional(),
  where: BugReportWhereInputSchema.optional(), 
  orderBy: z.union([ BugReportOrderByWithRelationInputSchema.array(), BugReportOrderByWithRelationInputSchema ]).optional(),
  cursor: BugReportWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ BugReportScalarFieldEnumSchema, BugReportScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const BugReportFindFirstOrThrowArgsSchema: z.ZodType<Prisma.BugReportFindFirstOrThrowArgs> = z.object({
  select: BugReportSelectSchema.optional(),
  include: BugReportIncludeSchema.optional(),
  where: BugReportWhereInputSchema.optional(), 
  orderBy: z.union([ BugReportOrderByWithRelationInputSchema.array(), BugReportOrderByWithRelationInputSchema ]).optional(),
  cursor: BugReportWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ BugReportScalarFieldEnumSchema, BugReportScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const BugReportFindManyArgsSchema: z.ZodType<Prisma.BugReportFindManyArgs> = z.object({
  select: BugReportSelectSchema.optional(),
  include: BugReportIncludeSchema.optional(),
  where: BugReportWhereInputSchema.optional(), 
  orderBy: z.union([ BugReportOrderByWithRelationInputSchema.array(), BugReportOrderByWithRelationInputSchema ]).optional(),
  cursor: BugReportWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ BugReportScalarFieldEnumSchema, BugReportScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const BugReportAggregateArgsSchema: z.ZodType<Prisma.BugReportAggregateArgs> = z.object({
  where: BugReportWhereInputSchema.optional(), 
  orderBy: z.union([ BugReportOrderByWithRelationInputSchema.array(), BugReportOrderByWithRelationInputSchema ]).optional(),
  cursor: BugReportWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const BugReportGroupByArgsSchema: z.ZodType<Prisma.BugReportGroupByArgs> = z.object({
  where: BugReportWhereInputSchema.optional(), 
  orderBy: z.union([ BugReportOrderByWithAggregationInputSchema.array(), BugReportOrderByWithAggregationInputSchema ]).optional(),
  by: BugReportScalarFieldEnumSchema.array(), 
  having: BugReportScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const BugReportFindUniqueArgsSchema: z.ZodType<Prisma.BugReportFindUniqueArgs> = z.object({
  select: BugReportSelectSchema.optional(),
  include: BugReportIncludeSchema.optional(),
  where: BugReportWhereUniqueInputSchema, 
}).strict();

export const BugReportFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.BugReportFindUniqueOrThrowArgs> = z.object({
  select: BugReportSelectSchema.optional(),
  include: BugReportIncludeSchema.optional(),
  where: BugReportWhereUniqueInputSchema, 
}).strict();

export const CustomReminderFindFirstArgsSchema: z.ZodType<Prisma.CustomReminderFindFirstArgs> = z.object({
  select: CustomReminderSelectSchema.optional(),
  include: CustomReminderIncludeSchema.optional(),
  where: CustomReminderWhereInputSchema.optional(), 
  orderBy: z.union([ CustomReminderOrderByWithRelationInputSchema.array(), CustomReminderOrderByWithRelationInputSchema ]).optional(),
  cursor: CustomReminderWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CustomReminderScalarFieldEnumSchema, CustomReminderScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const CustomReminderFindFirstOrThrowArgsSchema: z.ZodType<Prisma.CustomReminderFindFirstOrThrowArgs> = z.object({
  select: CustomReminderSelectSchema.optional(),
  include: CustomReminderIncludeSchema.optional(),
  where: CustomReminderWhereInputSchema.optional(), 
  orderBy: z.union([ CustomReminderOrderByWithRelationInputSchema.array(), CustomReminderOrderByWithRelationInputSchema ]).optional(),
  cursor: CustomReminderWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CustomReminderScalarFieldEnumSchema, CustomReminderScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const CustomReminderFindManyArgsSchema: z.ZodType<Prisma.CustomReminderFindManyArgs> = z.object({
  select: CustomReminderSelectSchema.optional(),
  include: CustomReminderIncludeSchema.optional(),
  where: CustomReminderWhereInputSchema.optional(), 
  orderBy: z.union([ CustomReminderOrderByWithRelationInputSchema.array(), CustomReminderOrderByWithRelationInputSchema ]).optional(),
  cursor: CustomReminderWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CustomReminderScalarFieldEnumSchema, CustomReminderScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const CustomReminderAggregateArgsSchema: z.ZodType<Prisma.CustomReminderAggregateArgs> = z.object({
  where: CustomReminderWhereInputSchema.optional(), 
  orderBy: z.union([ CustomReminderOrderByWithRelationInputSchema.array(), CustomReminderOrderByWithRelationInputSchema ]).optional(),
  cursor: CustomReminderWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const CustomReminderGroupByArgsSchema: z.ZodType<Prisma.CustomReminderGroupByArgs> = z.object({
  where: CustomReminderWhereInputSchema.optional(), 
  orderBy: z.union([ CustomReminderOrderByWithAggregationInputSchema.array(), CustomReminderOrderByWithAggregationInputSchema ]).optional(),
  by: CustomReminderScalarFieldEnumSchema.array(), 
  having: CustomReminderScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const CustomReminderFindUniqueArgsSchema: z.ZodType<Prisma.CustomReminderFindUniqueArgs> = z.object({
  select: CustomReminderSelectSchema.optional(),
  include: CustomReminderIncludeSchema.optional(),
  where: CustomReminderWhereUniqueInputSchema, 
}).strict();

export const CustomReminderFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.CustomReminderFindUniqueOrThrowArgs> = z.object({
  select: CustomReminderSelectSchema.optional(),
  include: CustomReminderIncludeSchema.optional(),
  where: CustomReminderWhereUniqueInputSchema, 
}).strict();

export const AuditLogFindFirstArgsSchema: z.ZodType<Prisma.AuditLogFindFirstArgs> = z.object({
  select: AuditLogSelectSchema.optional(),
  include: AuditLogIncludeSchema.optional(),
  where: AuditLogWhereInputSchema.optional(), 
  orderBy: z.union([ AuditLogOrderByWithRelationInputSchema.array(), AuditLogOrderByWithRelationInputSchema ]).optional(),
  cursor: AuditLogWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AuditLogScalarFieldEnumSchema, AuditLogScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const AuditLogFindFirstOrThrowArgsSchema: z.ZodType<Prisma.AuditLogFindFirstOrThrowArgs> = z.object({
  select: AuditLogSelectSchema.optional(),
  include: AuditLogIncludeSchema.optional(),
  where: AuditLogWhereInputSchema.optional(), 
  orderBy: z.union([ AuditLogOrderByWithRelationInputSchema.array(), AuditLogOrderByWithRelationInputSchema ]).optional(),
  cursor: AuditLogWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AuditLogScalarFieldEnumSchema, AuditLogScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const AuditLogFindManyArgsSchema: z.ZodType<Prisma.AuditLogFindManyArgs> = z.object({
  select: AuditLogSelectSchema.optional(),
  include: AuditLogIncludeSchema.optional(),
  where: AuditLogWhereInputSchema.optional(), 
  orderBy: z.union([ AuditLogOrderByWithRelationInputSchema.array(), AuditLogOrderByWithRelationInputSchema ]).optional(),
  cursor: AuditLogWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AuditLogScalarFieldEnumSchema, AuditLogScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const AuditLogAggregateArgsSchema: z.ZodType<Prisma.AuditLogAggregateArgs> = z.object({
  where: AuditLogWhereInputSchema.optional(), 
  orderBy: z.union([ AuditLogOrderByWithRelationInputSchema.array(), AuditLogOrderByWithRelationInputSchema ]).optional(),
  cursor: AuditLogWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const AuditLogGroupByArgsSchema: z.ZodType<Prisma.AuditLogGroupByArgs> = z.object({
  where: AuditLogWhereInputSchema.optional(), 
  orderBy: z.union([ AuditLogOrderByWithAggregationInputSchema.array(), AuditLogOrderByWithAggregationInputSchema ]).optional(),
  by: AuditLogScalarFieldEnumSchema.array(), 
  having: AuditLogScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const AuditLogFindUniqueArgsSchema: z.ZodType<Prisma.AuditLogFindUniqueArgs> = z.object({
  select: AuditLogSelectSchema.optional(),
  include: AuditLogIncludeSchema.optional(),
  where: AuditLogWhereUniqueInputSchema, 
}).strict();

export const AuditLogFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.AuditLogFindUniqueOrThrowArgs> = z.object({
  select: AuditLogSelectSchema.optional(),
  include: AuditLogIncludeSchema.optional(),
  where: AuditLogWhereUniqueInputSchema, 
}).strict();

export const NotificationFindFirstArgsSchema: z.ZodType<Prisma.NotificationFindFirstArgs> = z.object({
  select: NotificationSelectSchema.optional(),
  include: NotificationIncludeSchema.optional(),
  where: NotificationWhereInputSchema.optional(), 
  orderBy: z.union([ NotificationOrderByWithRelationInputSchema.array(), NotificationOrderByWithRelationInputSchema ]).optional(),
  cursor: NotificationWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ NotificationScalarFieldEnumSchema, NotificationScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const NotificationFindFirstOrThrowArgsSchema: z.ZodType<Prisma.NotificationFindFirstOrThrowArgs> = z.object({
  select: NotificationSelectSchema.optional(),
  include: NotificationIncludeSchema.optional(),
  where: NotificationWhereInputSchema.optional(), 
  orderBy: z.union([ NotificationOrderByWithRelationInputSchema.array(), NotificationOrderByWithRelationInputSchema ]).optional(),
  cursor: NotificationWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ NotificationScalarFieldEnumSchema, NotificationScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const NotificationFindManyArgsSchema: z.ZodType<Prisma.NotificationFindManyArgs> = z.object({
  select: NotificationSelectSchema.optional(),
  include: NotificationIncludeSchema.optional(),
  where: NotificationWhereInputSchema.optional(), 
  orderBy: z.union([ NotificationOrderByWithRelationInputSchema.array(), NotificationOrderByWithRelationInputSchema ]).optional(),
  cursor: NotificationWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ NotificationScalarFieldEnumSchema, NotificationScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const NotificationAggregateArgsSchema: z.ZodType<Prisma.NotificationAggregateArgs> = z.object({
  where: NotificationWhereInputSchema.optional(), 
  orderBy: z.union([ NotificationOrderByWithRelationInputSchema.array(), NotificationOrderByWithRelationInputSchema ]).optional(),
  cursor: NotificationWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const NotificationGroupByArgsSchema: z.ZodType<Prisma.NotificationGroupByArgs> = z.object({
  where: NotificationWhereInputSchema.optional(), 
  orderBy: z.union([ NotificationOrderByWithAggregationInputSchema.array(), NotificationOrderByWithAggregationInputSchema ]).optional(),
  by: NotificationScalarFieldEnumSchema.array(), 
  having: NotificationScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const NotificationFindUniqueArgsSchema: z.ZodType<Prisma.NotificationFindUniqueArgs> = z.object({
  select: NotificationSelectSchema.optional(),
  include: NotificationIncludeSchema.optional(),
  where: NotificationWhereUniqueInputSchema, 
}).strict();

export const NotificationFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.NotificationFindUniqueOrThrowArgs> = z.object({
  select: NotificationSelectSchema.optional(),
  include: NotificationIncludeSchema.optional(),
  where: NotificationWhereUniqueInputSchema, 
}).strict();

export const EmergencyContactFindFirstArgsSchema: z.ZodType<Prisma.EmergencyContactFindFirstArgs> = z.object({
  select: EmergencyContactSelectSchema.optional(),
  include: EmergencyContactIncludeSchema.optional(),
  where: EmergencyContactWhereInputSchema.optional(), 
  orderBy: z.union([ EmergencyContactOrderByWithRelationInputSchema.array(), EmergencyContactOrderByWithRelationInputSchema ]).optional(),
  cursor: EmergencyContactWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EmergencyContactScalarFieldEnumSchema, EmergencyContactScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const EmergencyContactFindFirstOrThrowArgsSchema: z.ZodType<Prisma.EmergencyContactFindFirstOrThrowArgs> = z.object({
  select: EmergencyContactSelectSchema.optional(),
  include: EmergencyContactIncludeSchema.optional(),
  where: EmergencyContactWhereInputSchema.optional(), 
  orderBy: z.union([ EmergencyContactOrderByWithRelationInputSchema.array(), EmergencyContactOrderByWithRelationInputSchema ]).optional(),
  cursor: EmergencyContactWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EmergencyContactScalarFieldEnumSchema, EmergencyContactScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const EmergencyContactFindManyArgsSchema: z.ZodType<Prisma.EmergencyContactFindManyArgs> = z.object({
  select: EmergencyContactSelectSchema.optional(),
  include: EmergencyContactIncludeSchema.optional(),
  where: EmergencyContactWhereInputSchema.optional(), 
  orderBy: z.union([ EmergencyContactOrderByWithRelationInputSchema.array(), EmergencyContactOrderByWithRelationInputSchema ]).optional(),
  cursor: EmergencyContactWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EmergencyContactScalarFieldEnumSchema, EmergencyContactScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const EmergencyContactAggregateArgsSchema: z.ZodType<Prisma.EmergencyContactAggregateArgs> = z.object({
  where: EmergencyContactWhereInputSchema.optional(), 
  orderBy: z.union([ EmergencyContactOrderByWithRelationInputSchema.array(), EmergencyContactOrderByWithRelationInputSchema ]).optional(),
  cursor: EmergencyContactWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const EmergencyContactGroupByArgsSchema: z.ZodType<Prisma.EmergencyContactGroupByArgs> = z.object({
  where: EmergencyContactWhereInputSchema.optional(), 
  orderBy: z.union([ EmergencyContactOrderByWithAggregationInputSchema.array(), EmergencyContactOrderByWithAggregationInputSchema ]).optional(),
  by: EmergencyContactScalarFieldEnumSchema.array(), 
  having: EmergencyContactScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const EmergencyContactFindUniqueArgsSchema: z.ZodType<Prisma.EmergencyContactFindUniqueArgs> = z.object({
  select: EmergencyContactSelectSchema.optional(),
  include: EmergencyContactIncludeSchema.optional(),
  where: EmergencyContactWhereUniqueInputSchema, 
}).strict();

export const EmergencyContactFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.EmergencyContactFindUniqueOrThrowArgs> = z.object({
  select: EmergencyContactSelectSchema.optional(),
  include: EmergencyContactIncludeSchema.optional(),
  where: EmergencyContactWhereUniqueInputSchema, 
}).strict();

export const UserCreateArgsSchema: z.ZodType<Prisma.UserCreateArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  data: z.union([ UserCreateInputSchema, UserUncheckedCreateInputSchema ]),
}).strict();

export const UserUpsertArgsSchema: z.ZodType<Prisma.UserUpsertArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema, 
  create: z.union([ UserCreateInputSchema, UserUncheckedCreateInputSchema ]),
  update: z.union([ UserUpdateInputSchema, UserUncheckedUpdateInputSchema ]),
}).strict();

export const UserCreateManyArgsSchema: z.ZodType<Prisma.UserCreateManyArgs> = z.object({
  data: z.union([ UserCreateManyInputSchema, UserCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const UserCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UserCreateManyAndReturnArgs> = z.object({
  data: z.union([ UserCreateManyInputSchema, UserCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const UserDeleteArgsSchema: z.ZodType<Prisma.UserDeleteArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema, 
}).strict();

export const UserUpdateArgsSchema: z.ZodType<Prisma.UserUpdateArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  data: z.union([ UserUpdateInputSchema, UserUncheckedUpdateInputSchema ]),
  where: UserWhereUniqueInputSchema, 
}).strict();

export const UserUpdateManyArgsSchema: z.ZodType<Prisma.UserUpdateManyArgs> = z.object({
  data: z.union([ UserUpdateManyMutationInputSchema, UserUncheckedUpdateManyInputSchema ]),
  where: UserWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const UserUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.UserUpdateManyAndReturnArgs> = z.object({
  data: z.union([ UserUpdateManyMutationInputSchema, UserUncheckedUpdateManyInputSchema ]),
  where: UserWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const UserDeleteManyArgsSchema: z.ZodType<Prisma.UserDeleteManyArgs> = z.object({
  where: UserWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const LocationCreateArgsSchema: z.ZodType<Prisma.LocationCreateArgs> = z.object({
  select: LocationSelectSchema.optional(),
  include: LocationIncludeSchema.optional(),
  data: z.union([ LocationCreateInputSchema, LocationUncheckedCreateInputSchema ]),
}).strict();

export const LocationUpsertArgsSchema: z.ZodType<Prisma.LocationUpsertArgs> = z.object({
  select: LocationSelectSchema.optional(),
  include: LocationIncludeSchema.optional(),
  where: LocationWhereUniqueInputSchema, 
  create: z.union([ LocationCreateInputSchema, LocationUncheckedCreateInputSchema ]),
  update: z.union([ LocationUpdateInputSchema, LocationUncheckedUpdateInputSchema ]),
}).strict();

export const LocationCreateManyArgsSchema: z.ZodType<Prisma.LocationCreateManyArgs> = z.object({
  data: z.union([ LocationCreateManyInputSchema, LocationCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const LocationCreateManyAndReturnArgsSchema: z.ZodType<Prisma.LocationCreateManyAndReturnArgs> = z.object({
  data: z.union([ LocationCreateManyInputSchema, LocationCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const LocationDeleteArgsSchema: z.ZodType<Prisma.LocationDeleteArgs> = z.object({
  select: LocationSelectSchema.optional(),
  include: LocationIncludeSchema.optional(),
  where: LocationWhereUniqueInputSchema, 
}).strict();

export const LocationUpdateArgsSchema: z.ZodType<Prisma.LocationUpdateArgs> = z.object({
  select: LocationSelectSchema.optional(),
  include: LocationIncludeSchema.optional(),
  data: z.union([ LocationUpdateInputSchema, LocationUncheckedUpdateInputSchema ]),
  where: LocationWhereUniqueInputSchema, 
}).strict();

export const LocationUpdateManyArgsSchema: z.ZodType<Prisma.LocationUpdateManyArgs> = z.object({
  data: z.union([ LocationUpdateManyMutationInputSchema, LocationUncheckedUpdateManyInputSchema ]),
  where: LocationWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const LocationUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.LocationUpdateManyAndReturnArgs> = z.object({
  data: z.union([ LocationUpdateManyMutationInputSchema, LocationUncheckedUpdateManyInputSchema ]),
  where: LocationWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const LocationDeleteManyArgsSchema: z.ZodType<Prisma.LocationDeleteManyArgs> = z.object({
  where: LocationWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const CareRelationCreateArgsSchema: z.ZodType<Prisma.CareRelationCreateArgs> = z.object({
  select: CareRelationSelectSchema.optional(),
  include: CareRelationIncludeSchema.optional(),
  data: z.union([ CareRelationCreateInputSchema, CareRelationUncheckedCreateInputSchema ]),
}).strict();

export const CareRelationUpsertArgsSchema: z.ZodType<Prisma.CareRelationUpsertArgs> = z.object({
  select: CareRelationSelectSchema.optional(),
  include: CareRelationIncludeSchema.optional(),
  where: CareRelationWhereUniqueInputSchema, 
  create: z.union([ CareRelationCreateInputSchema, CareRelationUncheckedCreateInputSchema ]),
  update: z.union([ CareRelationUpdateInputSchema, CareRelationUncheckedUpdateInputSchema ]),
}).strict();

export const CareRelationCreateManyArgsSchema: z.ZodType<Prisma.CareRelationCreateManyArgs> = z.object({
  data: z.union([ CareRelationCreateManyInputSchema, CareRelationCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const CareRelationCreateManyAndReturnArgsSchema: z.ZodType<Prisma.CareRelationCreateManyAndReturnArgs> = z.object({
  data: z.union([ CareRelationCreateManyInputSchema, CareRelationCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const CareRelationDeleteArgsSchema: z.ZodType<Prisma.CareRelationDeleteArgs> = z.object({
  select: CareRelationSelectSchema.optional(),
  include: CareRelationIncludeSchema.optional(),
  where: CareRelationWhereUniqueInputSchema, 
}).strict();

export const CareRelationUpdateArgsSchema: z.ZodType<Prisma.CareRelationUpdateArgs> = z.object({
  select: CareRelationSelectSchema.optional(),
  include: CareRelationIncludeSchema.optional(),
  data: z.union([ CareRelationUpdateInputSchema, CareRelationUncheckedUpdateInputSchema ]),
  where: CareRelationWhereUniqueInputSchema, 
}).strict();

export const CareRelationUpdateManyArgsSchema: z.ZodType<Prisma.CareRelationUpdateManyArgs> = z.object({
  data: z.union([ CareRelationUpdateManyMutationInputSchema, CareRelationUncheckedUpdateManyInputSchema ]),
  where: CareRelationWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const CareRelationUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.CareRelationUpdateManyAndReturnArgs> = z.object({
  data: z.union([ CareRelationUpdateManyMutationInputSchema, CareRelationUncheckedUpdateManyInputSchema ]),
  where: CareRelationWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const CareRelationDeleteManyArgsSchema: z.ZodType<Prisma.CareRelationDeleteManyArgs> = z.object({
  where: CareRelationWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const PairingTokenCreateArgsSchema: z.ZodType<Prisma.PairingTokenCreateArgs> = z.object({
  select: PairingTokenSelectSchema.optional(),
  include: PairingTokenIncludeSchema.optional(),
  data: z.union([ PairingTokenCreateInputSchema, PairingTokenUncheckedCreateInputSchema ]),
}).strict();

export const PairingTokenUpsertArgsSchema: z.ZodType<Prisma.PairingTokenUpsertArgs> = z.object({
  select: PairingTokenSelectSchema.optional(),
  include: PairingTokenIncludeSchema.optional(),
  where: PairingTokenWhereUniqueInputSchema, 
  create: z.union([ PairingTokenCreateInputSchema, PairingTokenUncheckedCreateInputSchema ]),
  update: z.union([ PairingTokenUpdateInputSchema, PairingTokenUncheckedUpdateInputSchema ]),
}).strict();

export const PairingTokenCreateManyArgsSchema: z.ZodType<Prisma.PairingTokenCreateManyArgs> = z.object({
  data: z.union([ PairingTokenCreateManyInputSchema, PairingTokenCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const PairingTokenCreateManyAndReturnArgsSchema: z.ZodType<Prisma.PairingTokenCreateManyAndReturnArgs> = z.object({
  data: z.union([ PairingTokenCreateManyInputSchema, PairingTokenCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const PairingTokenDeleteArgsSchema: z.ZodType<Prisma.PairingTokenDeleteArgs> = z.object({
  select: PairingTokenSelectSchema.optional(),
  include: PairingTokenIncludeSchema.optional(),
  where: PairingTokenWhereUniqueInputSchema, 
}).strict();

export const PairingTokenUpdateArgsSchema: z.ZodType<Prisma.PairingTokenUpdateArgs> = z.object({
  select: PairingTokenSelectSchema.optional(),
  include: PairingTokenIncludeSchema.optional(),
  data: z.union([ PairingTokenUpdateInputSchema, PairingTokenUncheckedUpdateInputSchema ]),
  where: PairingTokenWhereUniqueInputSchema, 
}).strict();

export const PairingTokenUpdateManyArgsSchema: z.ZodType<Prisma.PairingTokenUpdateManyArgs> = z.object({
  data: z.union([ PairingTokenUpdateManyMutationInputSchema, PairingTokenUncheckedUpdateManyInputSchema ]),
  where: PairingTokenWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const PairingTokenUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.PairingTokenUpdateManyAndReturnArgs> = z.object({
  data: z.union([ PairingTokenUpdateManyMutationInputSchema, PairingTokenUncheckedUpdateManyInputSchema ]),
  where: PairingTokenWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const PairingTokenDeleteManyArgsSchema: z.ZodType<Prisma.PairingTokenDeleteManyArgs> = z.object({
  where: PairingTokenWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const MedicalRecordCreateArgsSchema: z.ZodType<Prisma.MedicalRecordCreateArgs> = z.object({
  select: MedicalRecordSelectSchema.optional(),
  include: MedicalRecordIncludeSchema.optional(),
  data: z.union([ MedicalRecordCreateInputSchema, MedicalRecordUncheckedCreateInputSchema ]),
}).strict();

export const MedicalRecordUpsertArgsSchema: z.ZodType<Prisma.MedicalRecordUpsertArgs> = z.object({
  select: MedicalRecordSelectSchema.optional(),
  include: MedicalRecordIncludeSchema.optional(),
  where: MedicalRecordWhereUniqueInputSchema, 
  create: z.union([ MedicalRecordCreateInputSchema, MedicalRecordUncheckedCreateInputSchema ]),
  update: z.union([ MedicalRecordUpdateInputSchema, MedicalRecordUncheckedUpdateInputSchema ]),
}).strict();

export const MedicalRecordCreateManyArgsSchema: z.ZodType<Prisma.MedicalRecordCreateManyArgs> = z.object({
  data: z.union([ MedicalRecordCreateManyInputSchema, MedicalRecordCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const MedicalRecordCreateManyAndReturnArgsSchema: z.ZodType<Prisma.MedicalRecordCreateManyAndReturnArgs> = z.object({
  data: z.union([ MedicalRecordCreateManyInputSchema, MedicalRecordCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const MedicalRecordDeleteArgsSchema: z.ZodType<Prisma.MedicalRecordDeleteArgs> = z.object({
  select: MedicalRecordSelectSchema.optional(),
  include: MedicalRecordIncludeSchema.optional(),
  where: MedicalRecordWhereUniqueInputSchema, 
}).strict();

export const MedicalRecordUpdateArgsSchema: z.ZodType<Prisma.MedicalRecordUpdateArgs> = z.object({
  select: MedicalRecordSelectSchema.optional(),
  include: MedicalRecordIncludeSchema.optional(),
  data: z.union([ MedicalRecordUpdateInputSchema, MedicalRecordUncheckedUpdateInputSchema ]),
  where: MedicalRecordWhereUniqueInputSchema, 
}).strict();

export const MedicalRecordUpdateManyArgsSchema: z.ZodType<Prisma.MedicalRecordUpdateManyArgs> = z.object({
  data: z.union([ MedicalRecordUpdateManyMutationInputSchema, MedicalRecordUncheckedUpdateManyInputSchema ]),
  where: MedicalRecordWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const MedicalRecordUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.MedicalRecordUpdateManyAndReturnArgs> = z.object({
  data: z.union([ MedicalRecordUpdateManyMutationInputSchema, MedicalRecordUncheckedUpdateManyInputSchema ]),
  where: MedicalRecordWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const MedicalRecordDeleteManyArgsSchema: z.ZodType<Prisma.MedicalRecordDeleteManyArgs> = z.object({
  where: MedicalRecordWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const ReminderCreateArgsSchema: z.ZodType<Prisma.ReminderCreateArgs> = z.object({
  select: ReminderSelectSchema.optional(),
  include: ReminderIncludeSchema.optional(),
  data: z.union([ ReminderCreateInputSchema, ReminderUncheckedCreateInputSchema ]),
}).strict();

export const ReminderUpsertArgsSchema: z.ZodType<Prisma.ReminderUpsertArgs> = z.object({
  select: ReminderSelectSchema.optional(),
  include: ReminderIncludeSchema.optional(),
  where: ReminderWhereUniqueInputSchema, 
  create: z.union([ ReminderCreateInputSchema, ReminderUncheckedCreateInputSchema ]),
  update: z.union([ ReminderUpdateInputSchema, ReminderUncheckedUpdateInputSchema ]),
}).strict();

export const ReminderCreateManyArgsSchema: z.ZodType<Prisma.ReminderCreateManyArgs> = z.object({
  data: z.union([ ReminderCreateManyInputSchema, ReminderCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const ReminderCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ReminderCreateManyAndReturnArgs> = z.object({
  data: z.union([ ReminderCreateManyInputSchema, ReminderCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const ReminderDeleteArgsSchema: z.ZodType<Prisma.ReminderDeleteArgs> = z.object({
  select: ReminderSelectSchema.optional(),
  include: ReminderIncludeSchema.optional(),
  where: ReminderWhereUniqueInputSchema, 
}).strict();

export const ReminderUpdateArgsSchema: z.ZodType<Prisma.ReminderUpdateArgs> = z.object({
  select: ReminderSelectSchema.optional(),
  include: ReminderIncludeSchema.optional(),
  data: z.union([ ReminderUpdateInputSchema, ReminderUncheckedUpdateInputSchema ]),
  where: ReminderWhereUniqueInputSchema, 
}).strict();

export const ReminderUpdateManyArgsSchema: z.ZodType<Prisma.ReminderUpdateManyArgs> = z.object({
  data: z.union([ ReminderUpdateManyMutationInputSchema, ReminderUncheckedUpdateManyInputSchema ]),
  where: ReminderWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const ReminderUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.ReminderUpdateManyAndReturnArgs> = z.object({
  data: z.union([ ReminderUpdateManyMutationInputSchema, ReminderUncheckedUpdateManyInputSchema ]),
  where: ReminderWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const ReminderDeleteManyArgsSchema: z.ZodType<Prisma.ReminderDeleteManyArgs> = z.object({
  where: ReminderWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const CheckInNoteCreateArgsSchema: z.ZodType<Prisma.CheckInNoteCreateArgs> = z.object({
  select: CheckInNoteSelectSchema.optional(),
  include: CheckInNoteIncludeSchema.optional(),
  data: z.union([ CheckInNoteCreateInputSchema, CheckInNoteUncheckedCreateInputSchema ]),
}).strict();

export const CheckInNoteUpsertArgsSchema: z.ZodType<Prisma.CheckInNoteUpsertArgs> = z.object({
  select: CheckInNoteSelectSchema.optional(),
  include: CheckInNoteIncludeSchema.optional(),
  where: CheckInNoteWhereUniqueInputSchema, 
  create: z.union([ CheckInNoteCreateInputSchema, CheckInNoteUncheckedCreateInputSchema ]),
  update: z.union([ CheckInNoteUpdateInputSchema, CheckInNoteUncheckedUpdateInputSchema ]),
}).strict();

export const CheckInNoteCreateManyArgsSchema: z.ZodType<Prisma.CheckInNoteCreateManyArgs> = z.object({
  data: z.union([ CheckInNoteCreateManyInputSchema, CheckInNoteCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const CheckInNoteCreateManyAndReturnArgsSchema: z.ZodType<Prisma.CheckInNoteCreateManyAndReturnArgs> = z.object({
  data: z.union([ CheckInNoteCreateManyInputSchema, CheckInNoteCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const CheckInNoteDeleteArgsSchema: z.ZodType<Prisma.CheckInNoteDeleteArgs> = z.object({
  select: CheckInNoteSelectSchema.optional(),
  include: CheckInNoteIncludeSchema.optional(),
  where: CheckInNoteWhereUniqueInputSchema, 
}).strict();

export const CheckInNoteUpdateArgsSchema: z.ZodType<Prisma.CheckInNoteUpdateArgs> = z.object({
  select: CheckInNoteSelectSchema.optional(),
  include: CheckInNoteIncludeSchema.optional(),
  data: z.union([ CheckInNoteUpdateInputSchema, CheckInNoteUncheckedUpdateInputSchema ]),
  where: CheckInNoteWhereUniqueInputSchema, 
}).strict();

export const CheckInNoteUpdateManyArgsSchema: z.ZodType<Prisma.CheckInNoteUpdateManyArgs> = z.object({
  data: z.union([ CheckInNoteUpdateManyMutationInputSchema, CheckInNoteUncheckedUpdateManyInputSchema ]),
  where: CheckInNoteWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const CheckInNoteUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.CheckInNoteUpdateManyAndReturnArgs> = z.object({
  data: z.union([ CheckInNoteUpdateManyMutationInputSchema, CheckInNoteUncheckedUpdateManyInputSchema ]),
  where: CheckInNoteWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const CheckInNoteDeleteManyArgsSchema: z.ZodType<Prisma.CheckInNoteDeleteManyArgs> = z.object({
  where: CheckInNoteWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const BugReportCreateArgsSchema: z.ZodType<Prisma.BugReportCreateArgs> = z.object({
  select: BugReportSelectSchema.optional(),
  include: BugReportIncludeSchema.optional(),
  data: z.union([ BugReportCreateInputSchema, BugReportUncheckedCreateInputSchema ]),
}).strict();

export const BugReportUpsertArgsSchema: z.ZodType<Prisma.BugReportUpsertArgs> = z.object({
  select: BugReportSelectSchema.optional(),
  include: BugReportIncludeSchema.optional(),
  where: BugReportWhereUniqueInputSchema, 
  create: z.union([ BugReportCreateInputSchema, BugReportUncheckedCreateInputSchema ]),
  update: z.union([ BugReportUpdateInputSchema, BugReportUncheckedUpdateInputSchema ]),
}).strict();

export const BugReportCreateManyArgsSchema: z.ZodType<Prisma.BugReportCreateManyArgs> = z.object({
  data: z.union([ BugReportCreateManyInputSchema, BugReportCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const BugReportCreateManyAndReturnArgsSchema: z.ZodType<Prisma.BugReportCreateManyAndReturnArgs> = z.object({
  data: z.union([ BugReportCreateManyInputSchema, BugReportCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const BugReportDeleteArgsSchema: z.ZodType<Prisma.BugReportDeleteArgs> = z.object({
  select: BugReportSelectSchema.optional(),
  include: BugReportIncludeSchema.optional(),
  where: BugReportWhereUniqueInputSchema, 
}).strict();

export const BugReportUpdateArgsSchema: z.ZodType<Prisma.BugReportUpdateArgs> = z.object({
  select: BugReportSelectSchema.optional(),
  include: BugReportIncludeSchema.optional(),
  data: z.union([ BugReportUpdateInputSchema, BugReportUncheckedUpdateInputSchema ]),
  where: BugReportWhereUniqueInputSchema, 
}).strict();

export const BugReportUpdateManyArgsSchema: z.ZodType<Prisma.BugReportUpdateManyArgs> = z.object({
  data: z.union([ BugReportUpdateManyMutationInputSchema, BugReportUncheckedUpdateManyInputSchema ]),
  where: BugReportWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const BugReportUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.BugReportUpdateManyAndReturnArgs> = z.object({
  data: z.union([ BugReportUpdateManyMutationInputSchema, BugReportUncheckedUpdateManyInputSchema ]),
  where: BugReportWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const BugReportDeleteManyArgsSchema: z.ZodType<Prisma.BugReportDeleteManyArgs> = z.object({
  where: BugReportWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const CustomReminderCreateArgsSchema: z.ZodType<Prisma.CustomReminderCreateArgs> = z.object({
  select: CustomReminderSelectSchema.optional(),
  include: CustomReminderIncludeSchema.optional(),
  data: z.union([ CustomReminderCreateInputSchema, CustomReminderUncheckedCreateInputSchema ]),
}).strict();

export const CustomReminderUpsertArgsSchema: z.ZodType<Prisma.CustomReminderUpsertArgs> = z.object({
  select: CustomReminderSelectSchema.optional(),
  include: CustomReminderIncludeSchema.optional(),
  where: CustomReminderWhereUniqueInputSchema, 
  create: z.union([ CustomReminderCreateInputSchema, CustomReminderUncheckedCreateInputSchema ]),
  update: z.union([ CustomReminderUpdateInputSchema, CustomReminderUncheckedUpdateInputSchema ]),
}).strict();

export const CustomReminderCreateManyArgsSchema: z.ZodType<Prisma.CustomReminderCreateManyArgs> = z.object({
  data: z.union([ CustomReminderCreateManyInputSchema, CustomReminderCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const CustomReminderCreateManyAndReturnArgsSchema: z.ZodType<Prisma.CustomReminderCreateManyAndReturnArgs> = z.object({
  data: z.union([ CustomReminderCreateManyInputSchema, CustomReminderCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const CustomReminderDeleteArgsSchema: z.ZodType<Prisma.CustomReminderDeleteArgs> = z.object({
  select: CustomReminderSelectSchema.optional(),
  include: CustomReminderIncludeSchema.optional(),
  where: CustomReminderWhereUniqueInputSchema, 
}).strict();

export const CustomReminderUpdateArgsSchema: z.ZodType<Prisma.CustomReminderUpdateArgs> = z.object({
  select: CustomReminderSelectSchema.optional(),
  include: CustomReminderIncludeSchema.optional(),
  data: z.union([ CustomReminderUpdateInputSchema, CustomReminderUncheckedUpdateInputSchema ]),
  where: CustomReminderWhereUniqueInputSchema, 
}).strict();

export const CustomReminderUpdateManyArgsSchema: z.ZodType<Prisma.CustomReminderUpdateManyArgs> = z.object({
  data: z.union([ CustomReminderUpdateManyMutationInputSchema, CustomReminderUncheckedUpdateManyInputSchema ]),
  where: CustomReminderWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const CustomReminderUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.CustomReminderUpdateManyAndReturnArgs> = z.object({
  data: z.union([ CustomReminderUpdateManyMutationInputSchema, CustomReminderUncheckedUpdateManyInputSchema ]),
  where: CustomReminderWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const CustomReminderDeleteManyArgsSchema: z.ZodType<Prisma.CustomReminderDeleteManyArgs> = z.object({
  where: CustomReminderWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const AuditLogCreateArgsSchema: z.ZodType<Prisma.AuditLogCreateArgs> = z.object({
  select: AuditLogSelectSchema.optional(),
  include: AuditLogIncludeSchema.optional(),
  data: z.union([ AuditLogCreateInputSchema, AuditLogUncheckedCreateInputSchema ]),
}).strict();

export const AuditLogUpsertArgsSchema: z.ZodType<Prisma.AuditLogUpsertArgs> = z.object({
  select: AuditLogSelectSchema.optional(),
  include: AuditLogIncludeSchema.optional(),
  where: AuditLogWhereUniqueInputSchema, 
  create: z.union([ AuditLogCreateInputSchema, AuditLogUncheckedCreateInputSchema ]),
  update: z.union([ AuditLogUpdateInputSchema, AuditLogUncheckedUpdateInputSchema ]),
}).strict();

export const AuditLogCreateManyArgsSchema: z.ZodType<Prisma.AuditLogCreateManyArgs> = z.object({
  data: z.union([ AuditLogCreateManyInputSchema, AuditLogCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const AuditLogCreateManyAndReturnArgsSchema: z.ZodType<Prisma.AuditLogCreateManyAndReturnArgs> = z.object({
  data: z.union([ AuditLogCreateManyInputSchema, AuditLogCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const AuditLogDeleteArgsSchema: z.ZodType<Prisma.AuditLogDeleteArgs> = z.object({
  select: AuditLogSelectSchema.optional(),
  include: AuditLogIncludeSchema.optional(),
  where: AuditLogWhereUniqueInputSchema, 
}).strict();

export const AuditLogUpdateArgsSchema: z.ZodType<Prisma.AuditLogUpdateArgs> = z.object({
  select: AuditLogSelectSchema.optional(),
  include: AuditLogIncludeSchema.optional(),
  data: z.union([ AuditLogUpdateInputSchema, AuditLogUncheckedUpdateInputSchema ]),
  where: AuditLogWhereUniqueInputSchema, 
}).strict();

export const AuditLogUpdateManyArgsSchema: z.ZodType<Prisma.AuditLogUpdateManyArgs> = z.object({
  data: z.union([ AuditLogUpdateManyMutationInputSchema, AuditLogUncheckedUpdateManyInputSchema ]),
  where: AuditLogWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const AuditLogUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.AuditLogUpdateManyAndReturnArgs> = z.object({
  data: z.union([ AuditLogUpdateManyMutationInputSchema, AuditLogUncheckedUpdateManyInputSchema ]),
  where: AuditLogWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const AuditLogDeleteManyArgsSchema: z.ZodType<Prisma.AuditLogDeleteManyArgs> = z.object({
  where: AuditLogWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const NotificationCreateArgsSchema: z.ZodType<Prisma.NotificationCreateArgs> = z.object({
  select: NotificationSelectSchema.optional(),
  include: NotificationIncludeSchema.optional(),
  data: z.union([ NotificationCreateInputSchema, NotificationUncheckedCreateInputSchema ]),
}).strict();

export const NotificationUpsertArgsSchema: z.ZodType<Prisma.NotificationUpsertArgs> = z.object({
  select: NotificationSelectSchema.optional(),
  include: NotificationIncludeSchema.optional(),
  where: NotificationWhereUniqueInputSchema, 
  create: z.union([ NotificationCreateInputSchema, NotificationUncheckedCreateInputSchema ]),
  update: z.union([ NotificationUpdateInputSchema, NotificationUncheckedUpdateInputSchema ]),
}).strict();

export const NotificationCreateManyArgsSchema: z.ZodType<Prisma.NotificationCreateManyArgs> = z.object({
  data: z.union([ NotificationCreateManyInputSchema, NotificationCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const NotificationCreateManyAndReturnArgsSchema: z.ZodType<Prisma.NotificationCreateManyAndReturnArgs> = z.object({
  data: z.union([ NotificationCreateManyInputSchema, NotificationCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const NotificationDeleteArgsSchema: z.ZodType<Prisma.NotificationDeleteArgs> = z.object({
  select: NotificationSelectSchema.optional(),
  include: NotificationIncludeSchema.optional(),
  where: NotificationWhereUniqueInputSchema, 
}).strict();

export const NotificationUpdateArgsSchema: z.ZodType<Prisma.NotificationUpdateArgs> = z.object({
  select: NotificationSelectSchema.optional(),
  include: NotificationIncludeSchema.optional(),
  data: z.union([ NotificationUpdateInputSchema, NotificationUncheckedUpdateInputSchema ]),
  where: NotificationWhereUniqueInputSchema, 
}).strict();

export const NotificationUpdateManyArgsSchema: z.ZodType<Prisma.NotificationUpdateManyArgs> = z.object({
  data: z.union([ NotificationUpdateManyMutationInputSchema, NotificationUncheckedUpdateManyInputSchema ]),
  where: NotificationWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const NotificationUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.NotificationUpdateManyAndReturnArgs> = z.object({
  data: z.union([ NotificationUpdateManyMutationInputSchema, NotificationUncheckedUpdateManyInputSchema ]),
  where: NotificationWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const NotificationDeleteManyArgsSchema: z.ZodType<Prisma.NotificationDeleteManyArgs> = z.object({
  where: NotificationWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const EmergencyContactCreateArgsSchema: z.ZodType<Prisma.EmergencyContactCreateArgs> = z.object({
  select: EmergencyContactSelectSchema.optional(),
  include: EmergencyContactIncludeSchema.optional(),
  data: z.union([ EmergencyContactCreateInputSchema, EmergencyContactUncheckedCreateInputSchema ]),
}).strict();

export const EmergencyContactUpsertArgsSchema: z.ZodType<Prisma.EmergencyContactUpsertArgs> = z.object({
  select: EmergencyContactSelectSchema.optional(),
  include: EmergencyContactIncludeSchema.optional(),
  where: EmergencyContactWhereUniqueInputSchema, 
  create: z.union([ EmergencyContactCreateInputSchema, EmergencyContactUncheckedCreateInputSchema ]),
  update: z.union([ EmergencyContactUpdateInputSchema, EmergencyContactUncheckedUpdateInputSchema ]),
}).strict();

export const EmergencyContactCreateManyArgsSchema: z.ZodType<Prisma.EmergencyContactCreateManyArgs> = z.object({
  data: z.union([ EmergencyContactCreateManyInputSchema, EmergencyContactCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const EmergencyContactCreateManyAndReturnArgsSchema: z.ZodType<Prisma.EmergencyContactCreateManyAndReturnArgs> = z.object({
  data: z.union([ EmergencyContactCreateManyInputSchema, EmergencyContactCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const EmergencyContactDeleteArgsSchema: z.ZodType<Prisma.EmergencyContactDeleteArgs> = z.object({
  select: EmergencyContactSelectSchema.optional(),
  include: EmergencyContactIncludeSchema.optional(),
  where: EmergencyContactWhereUniqueInputSchema, 
}).strict();

export const EmergencyContactUpdateArgsSchema: z.ZodType<Prisma.EmergencyContactUpdateArgs> = z.object({
  select: EmergencyContactSelectSchema.optional(),
  include: EmergencyContactIncludeSchema.optional(),
  data: z.union([ EmergencyContactUpdateInputSchema, EmergencyContactUncheckedUpdateInputSchema ]),
  where: EmergencyContactWhereUniqueInputSchema, 
}).strict();

export const EmergencyContactUpdateManyArgsSchema: z.ZodType<Prisma.EmergencyContactUpdateManyArgs> = z.object({
  data: z.union([ EmergencyContactUpdateManyMutationInputSchema, EmergencyContactUncheckedUpdateManyInputSchema ]),
  where: EmergencyContactWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const EmergencyContactUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.EmergencyContactUpdateManyAndReturnArgs> = z.object({
  data: z.union([ EmergencyContactUpdateManyMutationInputSchema, EmergencyContactUncheckedUpdateManyInputSchema ]),
  where: EmergencyContactWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const EmergencyContactDeleteManyArgsSchema: z.ZodType<Prisma.EmergencyContactDeleteManyArgs> = z.object({
  where: EmergencyContactWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();