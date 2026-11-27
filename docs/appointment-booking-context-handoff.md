# Backend handoff: appointment booking context and scoped workflow reads

Status: contract confirmed in the updated OpenAPI documentation. The frontend now fetches this endpoint when the booking sheet opens and displays branch hours independently of availability lookup.

## Problem and agreed approach

Receptionists need to see their assigned branch's operating hours when booking an appointment. The existing branch-detail endpoint requires `branches.read` and returns branch administration data. In the frontend, that permission also grants access to the Branches route and tenant branch directory. Receptionists must not receive that broader access merely to read booking prerequisites.

Keep administration permissions separate from workflow reads. Use the appointment read permission for a small booking-context response, with tenant and branch scope enforced by the backend. Return only information needed by booking.

This supersedes the earlier proposal to add `branch_operating_hours` to the appointment availability response. Context must load as soon as booking opens, before choosing a service, practitioner, date, or duration.

## Endpoint

```http
GET /api/v1/appointments/branch/{branch_uid}/booking-context
```

- Require tenant authentication and `appointments.read`.
- No request body or additional query parameters.
- The frontend supplies the branch UID from the access token. There is no branch selector or fallback to another assignment.
- Register this static route before `/{appointment_uid}` so `booking-context` is not parsed as an appointment UUID.
- This endpoint is read-only. It does not configure hours, create appointments, or grant access to branch administration.

## Authorization and scope

Reuse the existing appointment branch-access policy, rather than creating a parallel role-based check:

1. Derive tenant identity from the authenticated token, never from client-supplied tenant data.
2. Require `appointments.read` through the existing authorization mechanism.
3. Resolve the requested branch within that tenant and apply the authorized branch database scope/RLS using the existing branch service.
4. A receptionist accessing the branch in their token needs neither `branches.read` nor `branches.manage`.
5. Reject a request for a different branch unless the caller has the existing explicit cross-branch authorization. Current appointment endpoints use `branches.manage` for that case through `BranchService.validate_permission_access`.
6. Cross-branch authority must not permit cross-tenant reads. Keep nonexistent/foreign-tenant responses consistent with existing non-disclosure behavior.
7. A token with no branch must not silently select a branch. It can only access an explicitly requested branch through the existing cross-branch authorization policy. The frontend booking flow remains unavailable without an active branch context.

Do not change the receptionist role matrix or broaden the existing branch-list/detail endpoints. Reading this context does not authorize creating appointments; creation remains separately gated by `appointments.create` and existing booking validation.

## Response contract

Use the existing `ServerRespModel` envelope and a dedicated, explicitly defined response DTO:

```json
{
  "data": {
    "branch": {
      "uid": "2d109622-fe46-4d41-8a08-03d78035c853",
      "name": "Main branch",
      "is_active": true,
      "timezone": "Africa/Lagos",
      "operating_hours": {
        "days": [
          {
            "week_day": 0,
            "is_enabled": true,
            "all_day": false,
            "open_time": "09:00",
            "close_time": "17:00"
          },
          {
            "week_day": 1,
            "is_enabled": true,
            "all_day": false,
            "open_time": "09:00",
            "close_time": "17:00"
          },
          {
            "week_day": 2,
            "is_enabled": true,
            "all_day": false,
            "open_time": "09:00",
            "close_time": "17:00"
          },
          {
            "week_day": 3,
            "is_enabled": true,
            "all_day": false,
            "open_time": "09:00",
            "close_time": "17:00"
          },
          {
            "week_day": 4,
            "is_enabled": true,
            "all_day": false,
            "open_time": "09:00",
            "close_time": "17:00"
          },
          {
            "week_day": 5,
            "is_enabled": false,
            "all_day": false,
            "open_time": null,
            "close_time": null
          },
          {
            "week_day": 6,
            "is_enabled": false,
            "all_day": false,
            "open_time": null,
            "close_time": null
          }
        ],
        "is_emergency_services": false
      }
    }
  },
  "message": "Appointment booking context retrieved successfully.",
  "meta": null,
  "status": "success"
}
```

Types:

| Field                         | Type                           | Meaning                                              |
| ----------------------------- | ------------------------------ | ---------------------------------------------------- |
| `data.branch.uid`             | UUID                           | Authorized branch identity                           |
| `data.branch.name`            | string                         | Display name                                         |
| `data.branch.is_active`       | boolean                        | Whether the branch is active                         |
| `data.branch.timezone`        | string or null                 | Stored IANA timezone; null if absent                 |
| `data.branch.operating_hours` | `BranchOperatingHours` or null | Stored operating-hours configuration; null if absent |

Reuse `BranchOperatingHours` and its day model. Monday is `0`, Sunday is `6`. Keep all seven days, local `HH:MM` times, closed days, all-day periods, and overnight periods. Existing stored rows may omit `all_day`; apply the existing schema's default of `false`.

Required behavior:

- Return a successful context response for an authorized branch even when it is inactive, has no hours, or has no enabled days. These are conditions the receptionist needs to see, not reasons to hide the context behind an error.
- Represent genuinely absent hours with explicit null. Do not omit the field or synthesize opening hours.
- An all-disabled configuration means no operating days are enabled. Do not claim that the user never configured it; an intentionally closed branch can have the same configuration.
- Do not replace a missing/invalid timezone with UTC or the browser timezone. Preserve the stored value so the frontend can explain the configuration problem.
- Emergency-service settings must not implicitly make ordinary appointments bookable 24/7. Preserve existing scheduling rules.

Exclude branch administrators, staff records, patient data, contact/address details, other branches, and unrelated configuration. Do not return `BranchItemWithAdmin` or serialize the full branch ORM object with a generic serializer.

## Implementation guidance

Relevant backend files:

- `app/api/v1/appointments/router.py`: route, permission description, authorization and branch scope.
- `app/api/v1/appointments/schemas.py`: explicit booking-context and branch-summary DTOs.
- `app/services/appointment_service.py`: workflow projection if needed by existing service conventions.
- `app/services/branch_service.py`: reuse existing branch access resolution and RLS setup.
- `app/schemas/branch.py`: reuse the operating-hours schema.

Use the same authorized branch object for identity and hours. Avoid an additional broad branch-list query or an administrator-detail lookup. No schema migration should be needed; the operating-hours data already exists.

Suggested OpenAPI description:

> Requires `appointments.read`. Returns minimal appointment-booking context for the selected branch. Requires `branches.manage` when the selected branch differs from the branch in the access token. Does not grant branch-directory or branch-administration access.

Update the API documentation/OpenAPI export after implementation. Do not change existing appointment creation or availability response contracts for this feature.

## Frontend handoff

Frontend integration now follows these requirements:

1. Add a tenant/branch-scoped booking-context query and fetch it when the booking sheet opens.
2. Show branch hours above the service selection, with an independent loading, error, and retry state.
3. Render the existing `booking-branch-hours.svelte` component with `data.branch.operating_hours` and `data.branch.timezone`.
4. Explicit null or no enabled days: explain that operating hours need attention before bookings can be made.
5. A failed request or missing access must be shown as a retrieval/access problem, never as missing hours.
6. Keep Branches navigation and its route gated by `branches.read`. Keep appointment creation gated separately.
7. Remove the temporary optional `branch_operating_hours` field on the frontend availability type and the current availability-response-based branch-hours rendering.

The frontend has switched to this endpoint and removed the temporary optional availability-response field. Receptionist sessions require no branch-directory permission to load booking context.

## Acceptance tests

| Case                                                                       | Expected result                                                                |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Receptionist, own token branch, `appointments.read`, no branch permissions | 200 with minimal context                                                       |
| No `appointments.read`, even with `branches.read`                          | 403                                                                            |
| Ordinary branch-scoped user requests another branch                        | 403; no branch data disclosed                                                  |
| Explicitly authorized cross-branch user in the same tenant                 | Existing appointment branch policy applies; requires appointment read as well  |
| Branch belongs to another tenant, including callers with `branches.manage` | No data disclosed; existing tenant-isolation/not-found policy applies          |
| Missing authentication or invalid/expired token                            | Existing authentication failure behavior                                       |
| No branch claim and no cross-branch authority                              | Rejected; no fallback assignment                                               |
| Missing/deleted branch                                                     | Existing not-found behavior                                                    |
| Inactive branch                                                            | 200 with `is_active: false`                                                    |
| All seven days disabled                                                    | 200 with the actual closed configuration                                       |
| Missing hours                                                              | 200 with `operating_hours: null`                                               |
| All-day/overnight hours and legacy rows without `all_day`                  | Correct schema normalization and local times                                   |
| Missing/invalid timezone                                                   | No invented timezone or opening hours                                          |
| Response inspection                                                        | Only allowlisted branch fields; no administrator or unrelated data             |
| Static route resolution                                                    | `booking-context` reaches this handler, not appointment-detail UUID validation |
| Existing branch and appointment endpoints                                  | Permissions and response contracts remain unchanged                            |

## Convention for similar features

Apply this pattern to future workflow reads:

- Permission answers which action/workflow is allowed; scope answers whose records are accessible; the response DTO controls the information exposed.
- Reuse existing tenant/branch authorization helpers and RLS. Do not rely on hidden frontend navigation for isolation.
- Reuse narrow lookup endpoints where their permission and field set already match the need. Use a workflow context endpoint when it provides a meaningful projection or combines related prerequisites.
- Do not add a permission for every dropdown. Add one when a responsibility must be independently grantable.
- Do not grant staff administration to select a practitioner, broad clinical access to identify a patient, or branch-directory access to read booking hours.
- Audit branches, staff, and patient lookups as later work. This handoff does not authorize a broad permission-matrix rewrite or replacement of those endpoints.
