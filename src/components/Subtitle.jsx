/** Film subtitle under the frame; words appear one by one. Decorative (aria-hidden). */
export default function Subtitle({ text }) {
  return (
    <p className="subtitle" aria-hidden="true">
      {text && (
        <span key={text} className="subtitle__line">
          {text.split(' ').map((w, i) => (
            <span key={i} className="subtitle__word" style={{ animationDelay: `${i * 70}ms` }}>
              {w}{' '}
            </span>
          ))}
        </span>
      )}
    </p>
  )
}
