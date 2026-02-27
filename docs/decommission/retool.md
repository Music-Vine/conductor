# Decommission: Retool Admin

**System:** Retool — hosted no-code admin tooling platform used to build custom internal dashboards and workflows for Music Vine and Uppbeat operations.
**Priority:** 2 of 4 (decommission order — eliminates subscription cost)
**Risk Level:** Low
**Owner:** _______________
**Status:** [ ] NOT STARTED

---

## Prerequisites

All prerequisites must be satisfied before decommission begins:

- [ ] Conductor is deployed with `NEXT_PUBLIC_USE_REAL_API=true`
- [ ] Feature parity audit for Retool workflows is complete (see [feature-parity-audit.md](./feature-parity-audit.md))
- [ ] No gaps exist in the Retool section of the feature parity audit
- [ ] All active Retool apps/dashboards have been inventoried (see feature-parity-audit.md)
- [ ] Smoke tests pass against real data for all workflows previously handled in Retool
- [ ] Staff UAT session completed for all Retool-equivalent workflows in Conductor
- [ ] Jordan's Admin decommission is complete (Priority 1 must be done first)
- [ ] Team lead sign-off: _______________

---

## Pre-Decommission Checks

### Usage Verification

- [ ] Pull Retool usage logs / session analytics (last 14 days)
- [ ] Confirm zero authenticated Retool sessions for 5+ consecutive business days
- [ ] Log evidence saved: _______________
- [ ] Confirm with all Retool users that they have transitioned to Conductor

### Data Verification

- [ ] Verify Conductor produces same results as Retool for spot-check sample across all active Retool apps
- [ ] No data discrepancies reported by staff during parallel period

### Subscription Check

- [ ] Identify Retool subscription billing date: _______________
- [ ] Plan decommission to avoid paying for an additional billing cycle where possible
- [ ] Retool account admin identified: _______________

---

## Decommission Steps

### Step 1: Notify Staff

- [ ] Send announcement to all admin staff: "Retool will be decommissioned on [date]"
- [ ] Allow minimum 5 business days notice
- [ ] Announcement sent on: _______________
- [ ] Decommission date communicated as: _______________

### Step 2: Archive Retool Apps (Before Shutdown)

- [ ] Export or document all active Retool app configurations for reference
- [ ] Screenshot or record each Retool app's UI and queries as documentation
- [ ] Store archived documentation at: _______________
- [ ] Archiving completed on: _______________

### Step 3: Set Retool Apps to Read-Only

- [ ] In Retool dashboard, set all apps to read-only mode (disable write queries)
- [ ] Notify staff that Retool is now read-only
- [ ] Date set to read-only: _______________

### Step 4: Monitor Read-Only Period (5 business days)

- [ ] Day 1: Check Retool usage analytics — any activity noted? _______________
- [ ] Day 2: Check Retool usage analytics — any activity noted? _______________
- [ ] Day 3: Check Retool usage analytics — any activity noted? _______________
- [ ] Day 4: Check Retool usage analytics — any activity noted? _______________
- [ ] Day 5: Check Retool usage analytics — any activity noted? _______________

If any activity is detected: investigate whether the user can accomplish the same task in Conductor before continuing.

### Step 5: Shut Down Retool Access

- [ ] Remove all user access from Retool (revoke user invitations or disable SSO)
- [ ] Disable all Retool app URLs
- [ ] Notify all users that Retool access has been removed
- [ ] Date access disabled: _______________
- [ ] Shutdown performed by: _______________

### Step 6: Cancel Retool Subscription

- [ ] Log into Retool billing dashboard
- [ ] Navigate to Settings -> Billing (or similar)
- [ ] Cancel the Retool subscription
- [ ] Confirm cancellation email received: _______________
- [ ] Final billing date: _______________
- [ ] Subscription cancelled on: _______________
- [ ] Cancelled by: _______________

### Step 7: Post-Shutdown Verification

- [ ] Retool apps are inaccessible — verified by: _______________
- [ ] Wait 48 hours for any staff reports of missing functionality
- [ ] No reports received after 48 hours: _______________
- [ ] Confirm no further Retool charges on next billing cycle
- [ ] Mark status at top of this document as `[x] COMPLETE`

---

## Rollback Plan

If issues are discovered after shutdown:

- [ ] Re-activate Retool subscription (note: may require restarting from a new plan)
- [ ] Restore user access in Retool dashboard
- [ ] Re-enable Retool app URLs
- [ ] Flip Conductor `NEXT_PUBLIC_USE_REAL_API=false` to restore mock mode if Conductor API issues are the root cause
- [ ] Communicate to staff that Retool access has been temporarily restored
- [ ] Investigate and resolve the gap before attempting decommission again
- [ ] Document the gap in [feature-parity-audit.md](./feature-parity-audit.md) Gaps Identified section

> **Warning:** If the Retool subscription has been cancelled, re-activation may not be instant. Do not cancel subscription until post-shutdown verification is complete.

---

## Notes

*(Space for operational notes during decommission)*

| Date | Note | Author |
|------|------|--------|
| | | |
