# Decommission: Music Vine PHP Admin

**System:** Music Vine PHP Admin — the primary admin interface for the Music Vine platform. Used by staff to manage Music Vine users, assets, contributors, payees, and catalog operations.
**Priority:** 3 of 4 (decommission order)
**Risk Level:** High
**Owner:** _______________
**Status:** [ ] NOT STARTED

> **Note:** This is the primary Music Vine platform admin. Extra caution is warranted. Do not proceed without complete feature parity verification and thorough staff UAT. Decommission only after Jordan's Admin (Priority 1) and Retool (Priority 2) have both been successfully decommissioned.

---

## Prerequisites

All prerequisites must be satisfied before decommission begins:

- [ ] Conductor is deployed with `NEXT_PUBLIC_USE_REAL_API=true`
- [ ] Feature parity audit for Music Vine PHP Admin workflows is **fully complete** (see [feature-parity-audit.md](./feature-parity-audit.md))
- [ ] **No gaps exist** in the Music Vine PHP section of the feature parity audit
- [ ] Smoke tests pass against all real Music Vine data categories (users, assets, contributors, payees)
- [ ] Staff UAT session completed for ALL Music Vine PHP workflows (minimum 2 sessions with different staff members)
- [ ] Jordan's Admin decommission is complete: _______________
- [ ] Retool decommission is complete: _______________
- [ ] Database backups are current and verified: _______________
- [ ] Incident response plan confirmed with engineering team
- [ ] Team lead sign-off: _______________
- [ ] Engineering lead sign-off: _______________

---

## Pre-Decommission Checks

### Usage Verification

- [ ] Pull access logs for Music Vine PHP Admin (last 14 days)
- [ ] Confirm zero authenticated admin sessions for 5+ consecutive business days
- [ ] Log evidence saved: _______________
- [ ] Confirm with all Music Vine PHP Admin users that they have transitioned to Conductor
- [ ] Users confirmed transitioned: _______________

### Data Verification

- [ ] Verify Conductor user list matches Music Vine PHP Admin user count (within expected tolerance)
  - Music Vine PHP Admin count: _______________
  - Conductor count: _______________
- [ ] Spot-check 10 random user records: same data in both systems
- [ ] Spot-check 10 random asset records: same data in both systems
- [ ] Spot-check 5 contributor/payee records: same data in both systems
- [ ] No data discrepancies reported by staff during parallel period

### Operational Checks

- [ ] Confirm Music Vine subscription management does NOT depend on PHP Admin (check Stripe integration)
- [ ] Confirm Music Vine asset delivery to end users does NOT depend on PHP Admin
- [ ] Confirm no cron jobs or scheduled tasks in PHP Admin that are not replicated in Conductor

---

## Decommission Steps

### Step 1: Notify Staff (Extended Notice Period)

- [ ] Send announcement to all admin staff: "Music Vine PHP Admin will be decommissioned on [date]"
- [ ] Allow minimum **10 business days** notice (extended due to high risk)
- [ ] Announcement sent on: _______________
- [ ] Decommission date communicated as: _______________
- [ ] Provide Conductor quick-reference guide with this announcement

### Step 2: Take Full Database Backup

- [ ] Take a full backup of Music Vine PHP Admin database
- [ ] Verify backup is complete and restorable
- [ ] Backup location: _______________
- [ ] Backup verified by: _______________
- [ ] Backup date: _______________

### Step 3: Set Read-Only Mode

- [ ] Configure Music Vine PHP Admin to disable all write operations (block POST/PUT/DELETE requests)
- [ ] Display a banner: "This system is read-only. Please use Conductor for all admin tasks."
- [ ] Notify staff that Music Vine PHP Admin is now read-only
- [ ] Date set to read-only: _______________

### Step 4: Monitor Read-Only Period (5 business days)

- [ ] Day 1: Check access logs — any activity noted? _______________
- [ ] Day 2: Check access logs — any activity noted? _______________
- [ ] Day 3: Check access logs — any activity noted? _______________
- [ ] Day 4: Check access logs — any activity noted? _______________
- [ ] Day 5: Check access logs — any activity noted? _______________

If any write attempts are detected: contact the user, identify the workflow, verify it is available in Conductor.

### Step 5: Shut Down

- [ ] Stop Music Vine PHP Admin server or disable web access (return 503 with redirect message to Conductor)
- [ ] Update DNS or reverse proxy rules to block access
- [ ] Update any internal bookmarks or wiki links pointing to Music Vine PHP Admin
- [ ] Date shut down: _______________
- [ ] Shutdown performed by: _______________

### Step 6: Post-Shutdown Verification

- [ ] Music Vine PHP Admin URL returns 404, 503, or redirect — verified by: _______________
- [ ] Music Vine end-user site is still fully functional (not affected by admin shutdown)
- [ ] Wait 48 hours for any staff reports of missing functionality
- [ ] No reports received after 48 hours: _______________
- [ ] Mark status at top of this document as `[x] COMPLETE`

---

## Rollback Plan

If critical issues are discovered after shutdown:

- [ ] Restart Music Vine PHP Admin server / re-enable web access
- [ ] Remove the read-only restriction if writes are needed during rollback period
- [ ] Flip Conductor `NEXT_PUBLIC_USE_REAL_API=false` to restore mock mode if Conductor API issues are the root cause
- [ ] Communicate to all staff that Music Vine PHP Admin is temporarily restored
- [ ] Conduct a post-mortem to identify the gap
- [ ] Document the gap in [feature-parity-audit.md](./feature-parity-audit.md) Gaps Identified section
- [ ] Do NOT attempt re-decommission until gap is resolved and re-verified

> **Important:** The database backup taken in Step 2 provides a restore point if data integrity issues are discovered. Do not discard it until at least 30 days after successful decommission.

---

## Notes

*(Space for operational notes during decommission)*

| Date | Note | Author |
|------|------|--------|
| | | |
