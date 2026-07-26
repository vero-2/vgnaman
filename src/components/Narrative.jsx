import { STORY_BLOCKS } from '../story/catalogue.js'
import './Narrative.css'

export default function Narrative({ rows, schema }) {
  const blocks = STORY_BLOCKS.filter((b) => b.when(schema))

  return (
    <div className="narrative">
      <header className="narrative-header">
        <h1 className="narrative-title">The story of your data</h1>
        <p className="narrative-lede">
          Read it top to bottom, or make it yours — every underlined word can be changed, and the numbers follow.
        </p>
      </header>

      {blocks.map((b, i) => {
        const { Component } = b
        return (
          <section key={b.id} className="story-block">
            <p className="story-block-kicker">
              <span className="story-block-num">{String(i + 1).padStart(2, '0')}</span>
              {b.title}
            </p>
            <Component rows={rows} schema={schema} />
          </section>
        )
      })}

      <footer className="narrative-footer">
        Storygram reads the shape of your data and writes these lines automatically. Swap a word to ask a new
        question.
      </footer>
    </div>
  )
}
