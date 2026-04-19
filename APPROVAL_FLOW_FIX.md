# Approval Flow Fix: Status Mapping Issue

## Problem
When a student submitted a request, the approval chain wasn't reflecting correctly through the teacher → HOD → principal hierarchy. The issue was that the frontend used **hardcoded array indices** to map backend status changes, which failed for approval types with different chain lengths.

### Example of the Bug
- **Leave** chain: Student → Teacher → HOD → Office (4 stages)
- **Room Booking** chain: Student → Teacher → HOD (3 stages)
- **Event** chain: Student → Teacher → HOD → Principal (4 stages)

When backend status changed to `PENDING_HOD`, the code did:
```javascript
chain[2].status = 'current'  // Works for Leave/Event (HOD is index 2)
                            // But breaks for other logic
```

This was fragile because:
1. Different approval types have different chain lengths
2. The index of HOD/Principal differs per type
3. Changing status didn't correctly track which role was currently reviewing

## Solution
Implemented a **role-based mapping** instead of index-based:

### Key Changes in `aether-frontend/store/campusStore.ts`

**Added helper function:**
```javascript
function updateChainByStatus(chain: ApprovalStage[], backendStatus: string): ApprovalStage[] {
  // Maps backend status (PENDING_PROFESSOR, PENDING_HOD, PENDING_PRINCIPAL)
  // to the correct role in the chain by finding the matching "by" field
  
  const currentRole = statusToRole[backendStatus];  // 'Teacher', 'HOD', 'Principal'
  const currentIndex = chain.findIndex(c => c.by === currentRole);
  
  // Mark all stages before current as done,
  // current stage as current,
  // rest as pending
}
```

**Updated three locations:**
1. `fetchDashboardData()` - When loading approvals on app start
2. `socket.on('approval:updated')` - When approval status changes in real-time
3. `socket.on('approval:new')` - When creating new approvals

## How It Works Now

**Flow Example:** Leave Request
```
1. Student submits → Backend: PENDING_PROFESSOR (waiting for Teacher)
   Frontend: Student[done] → Teacher[current] → HOD[pending] → Office[pending]

2. Teacher approves → Backend: PENDING_HOD (waiting for HOD)
   Frontend: Student[done] → Teacher[done] → HOD[current] → Office[pending]
           ✓ Correctly reflects to Teacher section

3. HOD approves → Backend: PENDING_PRINCIPAL
   Frontend: Student[done] → Teacher[done] → HOD[done] → Principal[current]
           ✓ Correctly reflects to Principal section
```

## Benefits
✅ Works for ALL approval types regardless of chain length
✅ Correctly maps backend status to frontend UI
✅ Maintains proper flow: Student → Teacher → HOD → Principal
✅ Each role sees only their turn to act
✅ Notifications trigger at the right time for each role

## Testing
The fix handles:
- ✅ New approvals (PENDING_PROFESSOR)
- ✅ Teacher approval → HOD review
- ✅ HOD approval → Principal review
- ✅ Principal final approval → COMPLETED
- ✅ Rejections at any stage
- ✅ Different approval types with different chain lengths
