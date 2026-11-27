# Backend handoff: appointment worklist, details, and calendar

Status: proposed additions for backend implementation. This document does not imply these additions already exist.

## Goal and scope

Turn the Appointments page into a branch-scoped daily worklist with patient cards, selected-day counts, next expected arrival, and an appointment-details sheet. Day/week/month calendar views will reuse the same records and filters in a later frontend slice.

The receptionist's branch comes from their active token context. There is no branch selector. Users with appointment read access can view the worklist; mutations remain separately permission-gated. Do not grant branch-directory, staff-administration, or clinical-record access to render this screen.

Initial delivery priorities:

1. Enriched list/detail projections, patient search, and caller-specific allowed actions.
2. A server-calculated daily summary with counts and next expected arrival.
3. Optional narrow filter lookups for readers who lack the existing service/practitioner lookup permissions.

The booking flow, availability endpoint, and booking-context endpoint are already integrated. Preserve their contracts.

## Existing API: reuse these routes

Base path: `/api/v1/appointments/branch/{branch_uid}`.

| Method and suffix                     | Current purpose                | Current permission                            |
| ------------------------------------- | ------------------------------ | --------------------------------------------- |
| `GET /`                               | Paginated appointments         | `appointments.read`                           |
| `GET /{appointment_uid}`              | Appointment details            | `appointments.read`                           |
| `POST /`                              | Create appointment             | `appointments.create`                         |
| `GET /availability`                   | Available intervals            | `appointments.read`                           |
| `GET /booking-context`                | Minimal branch booking context | `appointments.read`                           |
| `PATCH /{appointment_uid}/reschedule` | Reschedule                     | `appointments.update`                         |
| `POST /{appointment_uid}/cancel`      | Cancel                         | `appointments.update`                         |
| `POST /{appointment_uid}/no-show`     | Record no-show                 | `appointments.update`                         |
| `POST /{appointment_uid}/arrive`      | Record arrival                 | `appointments.update`                         |
| `POST /{appointment_uid}/check-in`    | Record check-in                | `appointments.update`                         |
| `POST /{appointment_uid}/encounters`  | Start linked encounter         | `appointments.update` and `encounters.create` |

Here `/` denotes the base path itself; do not introduce a required trailing slash or replacement action routes.

The existing list supports `q`, `limit`, `offset`, `patient_uid`, `practitioner_uid`, `branch_healthcare_service_uid`, `status`, `period_start`, and `period_end`. Current pagination accepts limits from 10 to 100.

Repository inspection confirms that date overlap filtering and deterministic ordering already exist. Preserve and document them rather than implementing replacements. Current `q` searches the reason for visit only; it needs expansion for the patient-search UI.

## 1. Enrich appointment list and detail responses

Keep the existing `ServerRespModel` envelope, pagination metadata, flat IDs, timestamps, status values, attendance fields, and reasons. Add explicit, minimal nested summaries to each list item and detail item:

```json
{
  "patient": {
    "uid": "11111111-1111-4111-8111-111111111111",
    "display_name": "Mary Okonkwo",
    "patient_no": "CAR-2026-0145"
  },
  "practitioner": {
    "uid": "22222222-2222-4222-8222-222222222222",
    "display_name": "Dr. Amaka Johnson"
  },
  "service": {
    "branch_healthcare_service_uid": "33333333-3333-4333-8333-333333333333",
    "healthcare_service_uid": "44444444-4444-4444-8444-444444444444",
    "name": "Initial assessment"
  },
  "allowed_actions": ["arrive", "reschedule", "cancel"]
}
```

The example is an additive fragment, not a replacement for `AppointmentItem`.

Detail responses should additionally include:

```json
{
  "created_by": {
    "uid": "55555555-5555-4555-8555-555555555555",
    "display_name": "Jane Doe"
  }
}
```

This supports “Scheduled by…” without a separate staff-profile request. Listing the creator on every card is not required.

Projection rules:

- `patient.uid` is the existing `patient_uid`, not the patient-tenant link ID. Source `patient_no` from the appointment's tenant patient link, never another tenant's number.
- Preserve both service identifiers: booking uses the branch configuration UID; existing branch service-detail paths use the catalog `healthcare_service_uid`.
- Nested summaries should be present but nullable when a reference cannot safely be resolved. Retain the appointment and its existing IDs; do not remove historical appointments through inner joins or active-only filters.
- An inactive practitioner/service must not erase their display name from a historical appointment. Follow existing deletion/privacy policies; return null when a name must no longer be exposed.
- Use dedicated summary DTOs, not full patient, staff, branch, or ORM serialization. No contact information, date of birth, clinical notes, diagnoses, insurance, role assignments, or credentials.
- The minimal identity projection is part of `appointments.read`; rendering appointment cards must not require additional `patients.read`, `staff.read`, or `branches.read` permissions. Opening a full patient record remains governed by its own permission.
- Fetch related summaries in bounded joins or batched queries. Do not add per-item database queries or frontend requests.
- Document whether mutation responses return the enriched projection too. It is acceptable to retain their existing response shape and have the frontend refetch list/detail after success; do not silently make existing mutation consumers incompatible.

### Patient search

Extend `q` to match patient display-name components and the current tenant's patient number, case-insensitively. Preserve existing reason-for-visit matching for compatibility. Apply search in the database before counting/pagination, with correct tenant and branch restrictions. Avoid duplicate appointment rows when joining related tables. An empty/whitespace query means no search filter.

## 2. Caller-specific allowed actions

Add a typed `allowed_actions` array to list and detail projections. Suggested stable values:

`arrive`, `check_in`, `reschedule`, `cancel`, `mark_no_show`, `start_encounter`.

The array is the intersection of the caller's permissions, authorized scope, and the appointment's current business-state eligibility. A read-only caller receives `[]`.

Use the same predicates as the mutation services. Do not maintain an unrelated UI-only transition table, and do not weaken mutation authorization because an action was previously returned by a read.

Current behavior to preserve:

| Action            | Existing state/business requirement                                              | Permission                                    |
| ----------------- | -------------------------------------------------------------------------------- | --------------------------------------------- |
| `arrive`          | `booked`; active branch                                                          | `appointments.update`                         |
| `check_in`        | `arrived`; active branch                                                         | `appointments.update`                         |
| `reschedule`      | `booked`; replacement selection is validated on submission                       | `appointments.update`                         |
| `cancel`          | `booked`                                                                         | `appointments.update`                         |
| `mark_no_show`    | `booked`; no recorded arrival/check-in; server time strictly after scheduled end | `appointments.update`                         |
| `start_encounter` | `checked-in`; active branch                                                      | `appointments.update` and `encounters.create` |

The frontend should not show a repeated no-op action merely because a mutation supports idempotent handling of an already-applied transition. Do not offer cancellation/rescheduling for arrived or checked-in appointments unless the backend business rules are explicitly changed and documented separately.

Allowed actions need not perform a fresh slot search for every row. Rescheduling still validates the chosen replacement time and references on submission. A concurrent change may invalidate an earlier action list; return the existing conflict response and let the frontend refresh.

Preserve required action bodies: cancellation requires `cancellation_reason`; no-show supports optional `no_show_reason`; rescheduling requires `starts_at` and `ends_at`, with its existing optional practitioner/service fields. Do not add clinical/reception notes or history endpoints just because they appear in the visual inspiration.

## 3. Daily summary endpoint

```http
GET /api/v1/appointments/branch/{branch_uid}/summary?date=2026-11-27
```

Require `appointments.read` and the same tenant/branch authorization policy as appointment list/detail. Register this static route before `/{appointment_uid}`.

Inputs:

- Required `date`: ISO calendar date interpreted in the branch's stored timezone.
- Optional `q`, `patient_uid`, `practitioner_uid`, and `branch_healthcare_service_uid`, with the same search/filter semantics as the list.
- Do not accept pagination or a status filter. Counts represent all matching statuses, making them useful while the main list is filtered to one status.

Proposed response inside the existing response envelope:

```json
{
  "data": {
    "branch_uid": "2d109622-fe46-4d41-8a08-03d78035c853",
    "date": "2026-11-27",
    "timezone": "Africa/Lagos",
    "period_start": "2026-11-26T23:00:00Z",
    "period_end": "2026-11-27T23:00:00Z",
    "as_of": "2026-11-27T08:00:00Z",
    "total": 12,
    "counts_by_status": {
      "proposed": 0,
      "pending": 0,
      "booked": 7,
      "arrived": 3,
      "fulfilled": 0,
      "cancelled": 0,
      "noshow": 0,
      "entered-in-error": 0,
      "checked-in": 2,
      "waitlist": 0
    },
    "next_expected": null
  },
  "message": "Appointment summary retrieved successfully.",
  "meta": null,
  "status": "success"
}
```

`next_expected` is null or a minimal appointment projection containing `uid`, `starts_at`, `ends_at`, `status`, `patient`, `practitioner`, and `service`, using the same identity DTOs as the list. Use null when there is no qualifying future booked appointment; the example does not imply all seven booked records are future arrivals.

Summary definitions:

- Use the same half-open day-overlap predicate as the list: `starts_at < period_end AND ends_at > period_start`.
- Count each appointment once per requested day. An overnight appointment can legitimately appear in both adjacent daily summaries; do not sum those summaries to infer a unique multi-day total.
- `total` includes every status that survives the non-status filters; it equals the sum of `counts_by_status`. Always return all documented enum keys with zero values where needed.
- These counts are mutually exclusive current statuses, not cumulative attendance events. A checked-in appointment is not also counted under `arrived`.
- The UI may label the current `booked` count “Expected”; it includes booked records that are overdue but have not been marked otherwise. Do not automatically turn elapsed bookings into no-shows.
- `next_expected` is the earliest matching `booked` appointment with `starts_at >= as_of`, belonging to the selected day and filters, ordered by start time then UID. A past selected day has no next expected arrival. A future selected day can show its first future booking.
- Capture server `as_of` once for the response so temporal calculations are consistent.
- A branch-local calendar day may be 23 or 25 hours across daylight saving changes. Compute consecutive local midnights; do not assume 24 elapsed hours.
- Empty results return total zero, all counts zero, and `next_expected: null`.
- Invalid/missing branch timezone must produce a clear configuration error, rather than silently using UTC or the server/browser timezone.

Do not label `fulfilled` as “Consultation completed” based on its enum name. The current backend marks an appointment fulfilled when the linked encounter is started. Display wording should reflect that behavior unless the lifecycle is deliberately changed.

## 4. Calendar and pagination contract

Preserve and document the existing overlap semantics:

```text
appointment.starts_at < period_end
AND appointment.ends_at > period_start
```

- Use offset-aware ISO timestamps. Validate that `period_end > period_start` when both bounds are provided, and document existing behavior for one-sided bounds.
- Return actual appointment timestamps, including overnight appointments. The frontend clips events visually to the displayed day/window.
- Preserve stable ascending ordering by `(starts_at, uid)`.
- Preserve `OffsetPaginationModel` and its accurate filtered total; do not silently cap the dataset while claiming the visible period is complete.
- Initial calendars can fetch every page for the visible period using the existing endpoint and maximum supported limit. The frontend must not render a single page as a complete calendar or calculate full-day counts from that page.
- If a separate bounded calendar endpoint is later introduced for performance, document its maximum range and completeness/truncation behavior explicitly. It is not required for the first worklist delivery.
- If a maximum date range is enforced, document it and return a clear validation error rather than partial success.
- Offset pagination can shift during concurrent changes. The frontend will deduplicate by UID and refresh after mutations; this contract does not promise snapshot consistency across separate requests.

## 5. Optional workflow-scoped filter options

The receptionist currently has service/practitioner schedule read permissions, but other appointment readers may not. Do not grant staff or branch administration merely to populate worklist filters.

Prefer reusing an existing narrow lookup when its permission and field projection already fit. Otherwise add:

```http
GET /api/v1/appointments/branch/{branch_uid}/filter-options?kind=practitioner&limit=10&offset=0
```

- Require `appointments.read` and the existing tenant/branch scope policy.
- `kind` is `practitioner` or `service`; support `q`, pagination, and optional period bounds.
- Return distinct options referenced by appointments in the authorized branch and requested period, not a tenant-wide staff directory or booking-eligibility list.
- Each option needs only `value` and `label`. Practitioner values are practitioner UIDs; service values are branch healthcare service UIDs.
- Retain safe historical labels for inactive references. Use accurate pagination metadata.
- This endpoint is for filtering existing appointments. It must not replace the booking flow's eligibility checks or imply that a historical practitioner/service can accept new bookings.

This can follow the first worklist slice. Until available, the frontend must permission-gate any existing lookup requests and omit inaccessible filters rather than widening permissions.

## Authorization and implementation constraints

- Tenant identity comes from authentication. Branch UID comes from the path and is authorized server-side.
- Reuse the current branch access helper and authorized database scope/RLS. Own-token-branch access requires no `branches.read` or `branches.manage`; cross-branch requests require the existing explicit `branches.manage` authority in addition to the workflow permission. Cross-tenant reads remain prohibited.
- Do not hardcode “receptionist only” in these read endpoints. Enforce actual permissions, so explicitly authorized medical officers and other readers can use the worklist without gaining creation/update powers.
- No permission-matrix changes are requested by this handoff.
- `allowed_actions` is caller-specific. Do not share/cache it across users with different grants; action and summary caches must respect tenant, branch, caller authorization, filters, and relevant time changes.
- Preserve existing mutation validation, locking, overlap constraints, attendance timestamps, and conflict handling.
- Do not add a broad endpoint that serializes arbitrary related resources according to client-requested expansions.
- Update OpenAPI endpoint descriptions with their required permissions and cross-branch rule. Export the updated API docs for frontend integration.

Relevant implementation areas: `app/api/v1/appointments/router.py`, its response schemas, `app/services/appointment_service.py`, `app/repositories/appointment_repository.py`, and the existing shared authorization/branch helpers.

## Acceptance tests

1. Own-branch appointment reader without branch/staff/patient-directory read permissions receives only the minimal summaries needed for cards and details.
2. Missing `appointments.read`, unauthorized cross-branch requests, and foreign-tenant IDs disclose no worklist or summary data.
3. List/detail retain their flat fields, status strings, timestamps, and existing pagination envelope.
4. Patient search matches name and tenant patient number, preserves reason search, counts before pagination, and introduces no duplicate appointment rows.
5. Inactive/missing related references do not remove appointments or expose unrelated data.
6. Read-only users receive no mutation actions. Each supported action follows the existing permission/state rules, including the no-show time boundary and `encounters.create` requirement.
7. A state/permission change after a read is rejected by the mutation endpoint; stale allowed-actions data never authorizes a write.
8. Summary totals cover all matching records, not one page; status counts partition the total. Changing the table's status filter does not alter non-status summary counts.
9. Next expected arrival honors the selected local day, non-status filters, server time, and deterministic ordering; empty/past days behave as documented.
10. Date filtering includes appointments crossing midnight and excludes records merely touching either half-open boundary. Test DST transitions and non-UTC branches.
11. Complete calendar pagination handles more than 100 matching appointments without silent truncation; errors do not masquerade as empty periods.
12. Optional filter lookups stay branch-scoped, minimal, paginated, and distinct from booking eligibility.
13. Static `summary`/`filter-options` routes resolve before the dynamic appointment-detail route.
14. Enrichment/query count remains bounded as page size grows; no per-row related-resource fetching.
15. Existing booking context, availability, creation, rescheduling, cancellation, arrival, check-in, no-show, and encounter-linking behavior remains covered by regression tests.

## Delivery back to frontend

Provide updated OpenAPI documentation, representative enriched list/detail and summary responses, exact allowed-action values, search behavior, and any pagination/range limits. Confirm whether mutation responses are enriched or require a list/detail refetch. Note optional filter-lookup delivery separately from the initial required worklist contract.
