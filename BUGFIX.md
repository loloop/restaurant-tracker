# Calendar Date Bug Fix

This branch fixes the calendar date offset issue where clicking on a date would show events for the previous day.

## Problem
The original code used `date.toISOString().split('T')[0]` which converts dates to UTC, causing timezone offset issues.

## Solution  
Replaced with local date formatting using a helper function `formatDateToString()`.

## Files Changed
- `frontend/src/components/Calendar.tsx`