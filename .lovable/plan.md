

## Make Hero Images Landscape-Sized for Desktop

Both the student and brand hero images are currently constrained to `max-w-sm` / `md:max-w-md` (~28rem), making them look small on desktop. The fix is to widen them significantly on desktop while keeping them appropriately sized on mobile.

### Changes

**1. Student Hero Image (`src/pages/LandingPage.tsx`, ~lines 179-188)**
- Remove the tight `max-w-sm md:max-w-md` constraint
- Use `max-w-sm md:max-w-2xl lg:max-w-4xl` so the image scales up to a landscape-friendly width on desktop
- Add `aspect-video md:aspect-[16/9]` or use `md:h-[400px] lg:h-[480px]` with `object-cover` to crop into a landscape format on desktop while keeping natural proportions on mobile

**2. Brand Hero Image (`src/components/LandingBrandsContent.tsx`, ~lines 103-112)**
- Apply the same sizing approach: `max-w-sm md:max-w-2xl lg:max-w-4xl`
- Same landscape aspect ratio treatment on desktop with `object-cover`

### Technical Details
- On mobile: images stay at `max-w-sm` (natural portrait/square look, fits phone screens)
- On tablet/desktop: images expand to `max-w-2xl` / `max-w-4xl` and are cropped to a landscape `aspect-video` ratio using `object-cover`, giving them a well-placed, cinematic feel
- Both images keep `rounded-3xl`, `border`, `shadow-xl`, and `loading="lazy"`

