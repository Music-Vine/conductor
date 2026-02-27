# Decommission: Jordan's Admin (Secondary Uppbeat)

**System:** Jordan's Admin — a secondary Uppbeat PHP/JS admin interface used for specific Uppbeat platform admin tasks. Also known as "Secondary Uppbeat PHP/JS admin".
**Priority:** 1 of 4 (decommission order — lowest risk, first to go)
**Risk Level:** Low
**Owner:** _______________
**Status:** [ ] NOT STARTED

---

## Prerequisites

All prerequisites must be satisfied before decommission begins:

- [ ] Conductor is deployed with `NEXT_PUBLIC_USE_REAL_API=true`
- [ ] Feature parity audit for Jordan's Admin workflows is complete (see [feature-parity-audit.md](./feature-parity-audit.md))
- [ ] No gaps exist in the Jordan's Admin section of the feature parity audit
- [ ] Smoke tests pass against real Uppbeat data in Conductor
- [ ] Staff UAT session completed for Jordan's Admin workflows
- [ ] Team lead sign-off: _______________

---

## Pre-Decommission Checks

### Usage Verification

- [ ] Pull access logs for Jordan's Admin (last 14 days)
- [ ] Confirm zero authenticated admin sessions for 5+ consecutive business days
- [ ] Log evidence saved: _______________
- [ ] Confirm with Jordan directly that they have transitioned to Conductor

### Data Verification

- [ ] Verify Conductor displays same data as Jordan's Admin for spot-check sample (minimum 5 records)
- [ ] No data discrepancies reported by staff during parallel period
- [ ] Jordan signs off that Conductor covers all workflows they used: _______________

---

## Decommission Steps

### Step 1: Notify Staff

- [ ] Send announcement to all admin staff: "Jordan's Admin will be decommissioned on [date]"
- [ ] Allow minimum 5 business days notice
- [ ] Announcement sent on: _______________
- [ ] Decommission date communicated as: _______________

### Step 2: Set Read-Only Mode

- [ ] Update Jordan's Admin configuration to disable any write operations (if applicable)
- [ ] If no read-only mode is available, proceed directly to Step 3 after usage verification
- [ ] Notify staff that Jordan's Admin is now read-only
- [ ] Date set to read-only: _______________

### Step 3: Monitor Read-Only / Wind-Down Period (5 business days)

- [ ] Day 1: Check access logs — any activity noted? _______________
- [ ] Day 2: Check access logs — any activity noted? _______________
- [ ] Day 3: Check access logs — any activity noted? _______________
- [ ] Day 4: Check access logs — any activity noted? _______________
- [ ] Day 5: Check access logs — any activity noted? _______________

If any activity is detected: investigate whether the user can accomplish the same task in Conductor before continuing.

### Step 4: Shut Down

- [ ] Take Jordan's Admin offline (stop server / disable access / redirect to Conductor URL)
- [ ] Update DNS or access controls to prevent login
- [ ] Inform Jordan directly that the system has been shut down
- [ ] Date shut down: _______________
- [ ] Shutdown performed by: _______________

### Step 5: Post-Shutdown Verification

- [ ] Jordan's Admin URL returns 404, 503, or redirect — verified by: _______________
- [ ] Wait 48 hours for any staff reports of missing functionality
- [ ] No reports received after 48 hours: _______________
- [ ] Mark status at top of this document as `[x] COMPLETE`

---

## Rollback Plan

If issues are discovered after shutdown:

- [ ] Restart Jordan's Admin server / re-enable access
- [ ] Flip Conductor `NEXT_PUBLIC_USE_REAL_API=false` to restore mock mode if Conductor API issues are the root cause
- [ ] Communicate to staff that Jordan's Admin is temporarily restored
- [ ] Investigate and resolve the gap before attempting decommission again
- [ ] Document the gap in [feature-parity-audit.md](./feature-parity-audit.md) Gaps Identified section

---

## Notes

*(Space for operational notes during decommission)*

| Date | Note | Author |
|------|------|--------|
| | | |
