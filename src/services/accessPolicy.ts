import type { ChangeRequest,User } from '../domain/access';import type { Property } from '../domain/property';
const privileged=(user:User)=>user.active&&(user.role==='admin'||user.role==='operator');
export const canViewProperty=(user:User,property:Property)=>privileged(user)||user.active&&(['agent','recruit'].includes(user.role)&&property.assignedAgentId===user.id);
export const canEditPropertyDirectly=(user:User,_property:Property)=>privileged(user);
export const canCreateChangeRequest=(user:User,property:Property)=>user.active&&(privileged(user)||(['agent','recruit'].includes(user.role)&&property.assignedAgentId===user.id));
export const canReviewChangeRequest=(user:User,_request:ChangeRequest)=>privileged(user);
export const canViewChangeRequest=(user:User,request:ChangeRequest)=>privileged(user)||user.active&&request.requestedByUserId===user.id;
export const canManageUsers=(user:User)=>user.active&&user.role==='admin';
