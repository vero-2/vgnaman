import {
  OverviewBlock,
  SegmentBlock,
  CompareBlock,
  RankBlock,
  TrendBlock,
} from './blocks.jsx'

// The catalogue of story blocks, each with a guard describing when it applies
// to a dataset's schema. Kept separate from the components so the component
// file has a single kind of export (keeps React Fast Refresh happy).
export const STORY_BLOCKS = [
  { id: 'overview', title: 'The big picture', Component: OverviewBlock, when: () => true },
  { id: 'segment', title: 'A closer look', Component: SegmentBlock, when: (s) => s.dimensions.length > 0 },
  {
    id: 'compare',
    title: 'Head to head',
    Component: CompareBlock,
    when: (s) => s.dimensions.some((d) => d.distinct.length >= 2),
  },
  { id: 'rank', title: 'The leaderboard', Component: RankBlock, when: (s) => s.dimensions.length > 0 },
  { id: 'trend', title: 'Over time', Component: TrendBlock, when: (s) => s.times.length > 0 },
]
