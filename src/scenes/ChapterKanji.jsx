/** Vertical chapter mark for the right-hand kanji column (decorative). */
export default function ChapterKanji({ children }) {
  return (
    <div className="chapter__kanji" lang="ja" aria-hidden="true">
      {children}
    </div>
  )
}
