# Decommission: Uppbeat PHP Admin

**System:** Uppbeat PHP Admin — the primary admin interface for the Uppbeat platform. Used by staff to manage Uppbeat users, assets, contributors, payees, and catalog operations for the largest platform (3M+ users).
**Priority:** 4 of 4 (decommission order — last to decommission)
**Risk Level:** High
**Owner:** _______________
**Status:** [ ] NOT STARTED

> **Note:** Last to decommission. This is the largest platform by user count (3M+). Any disruption to admin operations directly impacts the highest-volume platform. All three previous systems must be successfully decommissioned and stable before beginning this process.

---

## Prerequisites

All prerequisites must be satisfied before decommission begins:

- [ ] Conductor is deployed with `NEXT_PUBLIC_USE_REAL_API=true`
- [ ] Feature parity audit for Uppbeat PHP Admin workflows is **fully complete** (see [feature-parity-audit.md](./feature-parity-audit.md))
- [ ] **No gaps exist** in the Uppbeat PHP section of the feature parity audit
- [ ] Smoke tests pass against all real Uppbeat data (users, assets, contributors, payees)
- [ ] Staff UAT session completed for ALL Uppbeat PHP workflows (minimum 3 sessions with different staff members)
- [ ] Jordan's Admin decommission is complete: _______________
- [ ] Retool decommission is complete: _______________
- [ ] Music Vine PHP Admin decommission is complete: _______________
- [ ] Conductor has been running stably in production for minimum 2 weeks post-Music Vine decommission
- [ ] Database backups are current and verified: _______________
- [ ] Incident response plan confirmed with engineering and operations team
- [ ] On-call coverage confirmed for 48 hours post-shutdown
- [ ] Team lead sign-off: _______________
- [ ] Engineering lead sign-off: _______________
- [ ] Operations/management sign-off: _______________

---

## Pre-Decommission Checks

### Usage Verification

- [ ] Pull access logs for Uppbeat PHP Admin (last 14 days)
- [ ] Confirm zero authenticated admin sessions for **7+ consecutive business days** (extended due to scale)
- [ ] Log evidence saved: _______________
- [ ] Confirm with every Uppbeat PHP Admin user individually that they have transitioned to Conductor
- [ ] All users confirmed transitioned: _______________

### Data Verification

- [ ] Verify Conductor user list matches Uppbeat PHP Admin user count (within expected tolerance for 3M+ users)
  - Uppbeat PHP Admin count: _______________
  - Conductor count: _______________
  - Discrepancy acceptable: _______________
- [ ] Spot-check 20 random user records (higher sample due to scale): same data in both systems
- [ ] Spot-check 20 random asset records: same data in both systems
- [ ] Spot-check 10 contributor/payee records: same data in both systems
- [ ] No data discrepancies reported by staff during parallel period
- [ ] Financial data verified: payee rates match between Uppbeat PHP Admin and Conductor

### Operational Checks

- [ ] Confirm Uppbeat subscription management (Stripe) does NOT depend on PHP Admin
- [ ] Confirm Uppbeat asset delivery to end users does NOT depend on PHP Admin
- [ ] Confirm no cron jobs or scheduled tasks in Uppbeat PHP Admin that are not replicated
- [ ] Confirm Uppbeat payment processing does NOT depend on PHP Admin
- [ ] All background jobs / scheduled tasks inventoried and migrated: _______________

---

## Decommission Steps

### Step 1: Notify Staff (Extended Notice Period)

- [ ] Send announcement to all admin staff: "Uppbeat PHP Admin will be decommissioned on [date]"
- [ ] Allow minimum **10 business days** notice (extended due to high risk and scale)
- [ ] Announcement sent on: _______________
- [ ] Decommission date communicated as: _______________
- [ ] Provide Conductor quick-reference guide with this announcement
- [ ] Schedule optional drop-in Q&A session for staff before decommission date

### Step 2: Take Full Database Backup

- [ ] Take a full backup of Uppbeat PHP Admin database
- [ ] Verify backup is complete and fully restorable (test restore in staging)
- [ ] Backup location: _______________
- [ ] Backup verified by: _______________
- [ ] Test restore completed by: _______________
- [ ] Backup date: _______________

### Step 3: Disable Cron Jobs and Background Tasks

- [ ] List all cron jobs / scheduled tasks in Uppbeat PHP Admin
- [ ] Confirm equivalent tasks are running in Conductor or elsewhere
- [ ] Disable PHP Admin cron jobs
- [ ] Date cron jobs disabled: _______________
- [ ] Monitor for any side effects for 24 hours after disabling: _______________

### Step 4: Set Read-Only Mode

- [ ] Configure Uppbeat PHP Admin to disable all write operations (block POST/PUT/DELETE requests)
- [ ] Display a banner: "This system is read-only. Please use Conductor for all admin tasks."
- [ ] Notify staff that Uppbeat PHP Admin is now read-only
- [ ] Date set to read-only: _______________

### Step 5: Monitor Read-Only Period (7 business days — extended)

- [ ] Day 1: Check access logs — any activity noted? _______________
- [ ] Day 2: Check access logs — any activity noted? _______________
- [ ] Day 3: Check access logs — any activity noted? _______________
- [ ] Day 4: Check access logs — any activity noted? _______________
- [ ] Day 5: Check access logs — any activity noted? _______________
- [ ] Day 6: Check access logs — any activity noted? _______________
- [ ] Day 7: Check access logs — any activity noted? _______________

If any write attempts are detected: contact the user immediately, identify the workflow, verify it is available in Conductor. Do not proceed to shutdown until zero write attempts for 3 consecutive days.

### Step 6: Shut Down

- [ ] Confirm on-call engineering coverage is active
- [ ] Stop Uppbeat PHP Admin server or disable web access (return 503 with redirect message to Conductor)
- [ ] Update DNS or reverse proxy rules to block access
- [ ] Update any internal bookmarks, wiki links, or Slack bookmarks pointing to Uppbeat PHP Admin
- [ ] Date shut down: _______________
- [ ] Shutdown performed by: _______________
- [ ] On-call engineer notified: _______________

### Step 7: Post-Shutdown Verification

- [ ] Uppbeat PHP Admin URL returns 404, 503, or redirect — verified by: _______________
- [ ] Uppbeat end-user site is still fully functional (CRITICAL — check user-facing site)
- [ ] Uppbeat Stripe payments are still processing (spot-check payment webhook activity)
- [ ] Uppbeat asset downloads are working for end users
- [ ] Wait 48 hours with active monitoring for any staff reports of missing functionality
- [ ] 48-hour check complete — no issues: _______________
- [ ] Wait additional 48 hours (total 96 hours) before final sign-off
- [ ] No reports in 96-hour window: _______________
- [ ] Mark status at top of this document as `[x] COMPLETE`

---

## Rollback Plan

If critical issues are discovered after shutdown:

- [ ] Restart Uppbeat PHP Admin server / re-enable web access immediately
- [ ] Remove the read-only restriction if writes are needed during rollback period
- [ ] Re-enable any disabled cron jobs if they are implicated in the issue
- [ ] Flip Conductor `NEXT_PUBLIC_USE_REAL_API=false` to restore mock mode if Conductor API issues are the root cause
- [ ] Communicate to ALL staff that Uppbeat PHP Admin is temporarily restored
- [ ] Page on-call engineer regardless of time of day
- [ ] Conduct a post-mortem to identify the gap
- [ ] Document the gap in [feature-parity-audit.md](./feature-parity-audit.md) Gaps Identified section
- [ ] Do NOT attempt re-decommission until gap is resolved, re-verified, and signed off again

> **Important:** The database backup taken in Step 2 provides a restore point. Do not discard until at least **60 days** after successful decommission (longer retention than other systems due to scale).

> **Congratulations:** Successful completion of this runbook means Conductor is now the sole admin interface for both Music Vine and Uppbeat. The legacy PHP admin era is over.

---

## Notes

*(Space for operational notes during decommission)*

| Date | Note | Author |
|------|------|--------|
| | | |
