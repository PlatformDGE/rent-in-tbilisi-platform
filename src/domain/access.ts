import type { Property } from './property';
export const USER_ROLES=['admin','operator','agent','recruit'] as const;export type UserRole=typeof USER_ROLES[number];
export type User={id:string;fullName:string;telegramUsername:string;phone:string;role:UserRole;agentHashtag:string;active:boolean;createdAt:string;updatedAt:string};
export const CHANGE_REQUEST_TYPES=['property_update','price_update','discount_request','status_update','media_update','publication_request','unpublish_request'] as const;export type ChangeRequestType=typeof CHANGE_REQUEST_TYPES[number];
export const CHANGE_REQUEST_STATUSES=['pending','approved','rejected','changes_requested','cancelled'] as const;export type ChangeRequestStatus=typeof CHANGE_REQUEST_STATUSES[number];
export type ChangeRequest={id:string;propertyId:string;propertyVersionAtRequest:number;requestedByUserId:string;type:ChangeRequestType;status:ChangeRequestStatus;reason:string;beforeSnapshot:Partial<Property>;proposedChanges:Partial<Property>;reviewedByUserId:string;reviewComment:string;reviewMetadata:Record<string,unknown>;updateRequired:boolean;reviewedAt:string;appliedAt:string;createdAt:string};
export const AUDIT_EVENT_TYPES=['request_created','request_approved','request_rejected','changes_requested','property_changed','price_changed','discount_approved','direct_admin_change'] as const;export type AuditEventType=typeof AUDIT_EVENT_TYPES[number];
export type PropertyAuditEvent={id:string;type:AuditEventType;actorId:string;timestamp:string;entityId:string;before:unknown;after:unknown;reason:string;changeRequestId:string};
export type TelegramAction={id:string;propertyId:string;changeRequestId:string;type:'update';update_required:true;createdAt:string;status:'placeholder'};
