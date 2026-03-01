

# Profile Image Upload, Seamless Navigation, and Training Feature

## 1. Profile Image Upload

The `profiles` table already has an `avatar_url` column. We need:

- **Storage bucket**: Create an `avatars` storage bucket in Lovable Cloud for profile images
- **Profile page update** (`src/pages/Profile.tsx`): Replace the initials circle with a clickable avatar that opens a file picker. On upload, store the file in the `avatars` bucket and update `avatar_url` in the profile
- **Header avatar** (`src/components/DashboardLayout.tsx`): Show the uploaded avatar image instead of initials when `avatar_url` exists
- **Hook update** (`src/hooks/useProfile.ts`): Add an `uploadAvatar` function that handles the file upload and profile update

## 2. Seamless Page Navigation (App-like Transitions)

Add CSS transitions so page navigation feels smooth like a native mobile app:

- **Wrap `<Outlet />` in a fade/slide transition** in `DashboardLayout.tsx` using CSS `transition` and React key-based re-rendering on route change
- Add a simple fade-in animation class in `src/index.css` (e.g., `animate-page-in`) that triggers on each route change
- Keep it lightweight -- no heavy animation library needed, just a CSS `@keyframes` fade + slight upward slide

## 3. Training Feature (Course Viewer with YouTube Embeds)

Inspired by the reference screenshots, build a courses section with modules containing YouTube video lessons.

### Database

Create a `training_courses` table and a `training_lessons` table:

**`training_courses`**:
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| title | text | Course name |
| description | text | Short description |
| category | text | e.g. "Sales Skills" |
| level | text | "Beginner", "Intermediate", "Advanced" |
| cover_color | text | Hex color for card background (like the pink in reference) |
| sort_order | int | Display ordering |
| created_at | timestamptz | |

**`training_lessons`**:
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| course_id | uuid (FK) | References training_courses |
| module_number | int | Module grouping |
| module_title | text | e.g. "Introduction" |
| title | text | Lesson title |
| youtube_url | text | YouTube video URL |
| sort_order | int | Order within module |
| created_at | timestamptz | |

**`training_progress`**:
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| user_id | uuid | References auth user |
| lesson_id | uuid (FK) | References training_lessons |
| completed | boolean | Default false |
| completed_at | timestamptz | |

RLS policies: courses and lessons are readable by all authenticated users. Progress is per-user (user can only read/write their own).

Seed a few sample courses with YouTube video URLs so the feature works out of the box.

### New Pages

**`src/pages/Training.tsx`** -- Course listing page (like IMG_2882):
- Header: "Learning Hub" / "Explore Courses" with subtitle
- Search bar to filter courses
- Category filter chips ("All Courses", category names)
- Course cards showing: cover color/icon, title, lesson count, progress percentage, "Continue" link
- Progress bar on each card

**`src/pages/TrainingCourse.tsx`** -- Single course view (like IMG_2880/IMG_2881):
- Back arrow to courses list
- Course title, category, level badge
- Overall progress bar
- "Course Content" section listing modules as an accordion
- Each module shows its lessons; clicking a lesson opens the YouTube embed inline
- Green checkmarks on completed lessons; click to mark complete

### YouTube Embed

- Extract the video ID from the `youtube_url` field
- Render an `<iframe>` with `src="https://www.youtube.com/embed/{videoId}"` inside each lesson
- Responsive 16:9 aspect ratio using the `AspectRatio` component

### Navigation Integration

- Add "Training" to the sidebar (`src/components/AppSidebar.tsx`) with a `GraduationCap` icon
- Add "Training" to the mobile bottom nav's "More" drawer (`src/components/MobileBottomNav.tsx`)
- Add route `/training` and `/training/:courseId` inside the protected layout in `App.tsx`

### New Hook

**`src/hooks/useTraining.ts`**: Fetches courses, lessons, and user progress. Provides `markLessonComplete` mutation.

## Files to Create/Modify

| File | Action |
|------|--------|
| DB migration | Create `training_courses`, `training_lessons`, `training_progress` tables + RLS + seed data |
| Storage migration | Create `avatars` bucket |
| `src/pages/Training.tsx` | New -- course listing |
| `src/pages/TrainingCourse.tsx` | New -- single course with YouTube lessons |
| `src/hooks/useTraining.ts` | New -- data fetching + progress tracking |
| `src/pages/Profile.tsx` | Add avatar upload UI |
| `src/hooks/useProfile.ts` | Add avatar upload function |
| `src/components/DashboardLayout.tsx` | Show avatar image + add page transition |
| `src/components/AppSidebar.tsx` | Add Training nav item |
| `src/components/MobileBottomNav.tsx` | Add Training to More drawer |
| `src/App.tsx` | Add training routes |
| `src/index.css` | Add page transition keyframes |

