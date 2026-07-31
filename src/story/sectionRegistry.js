import { OverviewBlock, SegmentBlock, CompareBlock, RankBlock } from './blocks.jsx'
import {
  HeadcountShapeBlock,
  HeadcountConcentrationBlock,
  HeadcountCompareBlock,
  HiringSpanBlock,
  HiringYearBlock,
  HiringGrowthBlock,
  AttritionRateBlock,
  AttritionByBlock,
  AttritionGroupBlock,
  SchemaBlock,
} from './sections.jsx'

// The catalogue of topic sections. `when` decides whether a section is
// offered for the current dataset; titles adapt to whether it reads like
// people/HR data. Kept in its own module (no component definitions) so the
// component files stay clean for React Fast Refresh.
export function getSections(schema, ctx) {
  const people = ctx.people
  const all = [
    {
      id: 'overview',
      icon: 'book',
      title: 'Overview',
      subtitle: 'The shape of your data, in a few plain sentences.',
      when: () => true,
      blocks: [OverviewBlock, SegmentBlock, CompareBlock, RankBlock],
    },
    {
      id: 'headcount',
      icon: 'users',
      title: people ? 'Headcount' : 'Breakdown',
      subtitle: people
        ? 'How your people divide across the organisation.'
        : 'How your records divide across categories.',
      when: (s) => s.dimensions.length > 0,
      blocks: [HeadcountShapeBlock, HeadcountConcentrationBlock, HeadcountCompareBlock],
    },
    {
      id: 'hiring',
      icon: 'userPlus',
      title: people ? 'Hiring' : 'Over time',
      subtitle: people
        ? 'When people joined, and how the team grew.'
        : 'How the count changed year over year.',
      when: (s) => s.times.length > 0,
      blocks: [HiringSpanBlock, HiringYearBlock, HiringGrowthBlock],
    },
    {
      id: 'attrition',
      icon: 'logout',
      title: people ? 'Attrition' : 'Churn',
      subtitle: 'Who is leaving, and where it concentrates.',
      when: () => !!ctx.flag,
      blocks: [AttritionRateBlock, AttritionByBlock, AttritionGroupBlock],
    },
    {
      id: 'data',
      icon: 'table',
      title: 'The data',
      subtitle: 'Every column, and how Storygram read it.',
      when: () => true,
      blocks: [SchemaBlock],
    },
  ]
  return all.filter((sec) => sec.when(schema))
}
