# THINKING.md - Revenue Intelligence Console

## Project Overview

Built a full-stack Revenue Intelligence Console to help CROs answer:
"Why are we behind (or ahead) on revenue this quarter, and what should we focus on right now?"

---

## 1. Assumptions Made

### Data Assumptions

1. **Current Quarter Definition**: Assumed the "current" quarter is based on the system date. For demo purposes, used Q4 2024 (Oct-Dec 2024) as most deals in the data fall within this range.

2. **Closed Won = Revenue**: Assumed `closed_at` date for "Closed Won" deals represents when revenue was recognized. In reality, revenue recognition might follow different rules.

3. **Deal Stages**: Assumed a linear progression: Prospecting → Qualification → Proposal → Negotiation → Closed Won/Lost. Not all companies follow this exact funnel.

4. **Activity Attribution**: Assumed activities belong to the deal they're linked to, and by extension to the rep and account. Activities without deal_id were not considered (edge case).

5. **Target = Monthly Targets**: Summed monthly targets to get quarterly targets. Assumed targets are evenly distributed (not weighted by business days or seasonality).

6. **Rep Performance Baseline**: Used team average win rate as the benchmark. Assumed all reps have similar territory quality and deal distribution.

7. **Stale Deal Threshold**: Defined "stale" as 14+ days without activity or 30+ days in the same stage. These thresholds are industry-dependent.

### Technical Assumptions

1. **Single User**: No authentication required - assumed single CRO user.
2. **Real-time Updates**: Data refreshes on page load; no WebSocket/polling for live updates.
3. **Time Zone**: All dates treated as UTC; no timezone conversion.

---

## 2. Data Issues Found

### Inconsistencies Discovered

1. **Null `closed_at` for Closed Won Deals**
   - Some deals marked as "Closed Won" had `closed_at: null`
   - **Solution**: Skipped these in revenue calculations, logged as data quality issue

2. **Future Dates in Activities**
   - Found activities with timestamps in 2025 (e.g., "2025-11-11")
   - **Solution**: Included them anyway as they might be scheduled activities; flagged for review

3. **Orphaned References**
   - Activities referencing non-existent deals (e.g., "D182" when max is D100)
   - **Solution**: Used LEFT JOINs and null checks to handle gracefully

4. **Missing Rep-Account Relationships**
   - No direct rep-account mapping; inferred through deals
   - **Solution**: Built relationships dynamically from deals table

5. **Inconsistent Stage Names**
   - Assumed stages are case-sensitive and exact matches
   - **Solution**: Used exact string matching; could normalize in production

6. **Date Format Variations**
   - All dates in ISO format (YYYY-MM-DD) - consistent ✓

### Data Quality Score

- Accounts: ✓ Clean
- Reps: ✓ Clean
- Deals: ⚠️ Some null closed_at dates
- Activities: ⚠️ Some orphaned references, future dates
- Targets: ✓ Clean

---

## 3. Tradeoffs Chosen

### Architecture Tradeoffs

| Decision                   | Alternative               | Why Chosen                                                   |
| -------------------------- | ------------------------- | ------------------------------------------------------------ |
| **sql.js (in-memory)**     | PostgreSQL, MySQL         | Simpler setup, no external dependencies, fast for demo scale |
| **Single API per section** | GraphQL, unified endpoint | RESTful clarity, independent loading, easier caching         |
| **Calculate on request**   | Pre-computed aggregations | Simpler code, always fresh, acceptable at this scale         |
| **Synchronous DB queries** | Async/streaming           | Data size small enough; simpler error handling               |

### Frontend Tradeoffs

| Decision                   | Alternative          | Why Chosen                                       |
| -------------------------- | -------------------- | ------------------------------------------------ |
| **Material UI**            | Custom CSS, Tailwind | Requirement specified; fast development          |
| **D3 for charts**          | Chart.js, Recharts   | Requirement specified; full control over visuals |
| **Client-side state only** | Redux, Zustand       | Small app; useState/useEffect sufficient         |
| **Parallel API loading**   | Sequential           | Better UX; show data as it arrives               |

### Algorithm Tradeoffs

| Decision                             | Alternative                | Why Chosen                               |
| ------------------------------------ | -------------------------- | ---------------------------------------- |
| **Simple % thresholds for severity** | ML-based anomaly detection | Interpretable, no training needed        |
| **Static recommendations**           | LLM-generated insights     | Deterministic, explainable, no API costs |
| **Days-based staleness**             | Probability decay models   | Simple, business-understandable metric   |

---

## 4. What Would Break at 10× Scale

### Current Limits (100 deals, 160 activities)

At **10× scale** (1,000 deals, 1,600 activities):

- ✅ Still manageable with current approach

At **100× scale** (10,000 deals, 16,000 activities):

- ⚠️ In-memory DB starts to strain
- ⚠️ Full table scans become slow

At **1000× scale** (100,000 deals, 160,000 activities):

- ❌ **Memory issues**: sql.js loads entire DB in memory
- ❌ **API latency**: Aggregations would take seconds
- ❌ **No indexing benefit**: sql.js doesn't persist indexes

### Specific Breaking Points

1. **Database Layer**
