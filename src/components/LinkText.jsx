const URL_RE = /(https?:\/\/[^\s<>"']+)/g;

export default function LinkText({ text, style }) {
  if (!text) return null;
  const parts = text.split(URL_RE);
  return (
    <span style={style}>
      {parts.map((part, i) =>
        URL_RE.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent)', textDecoration: 'underline', wordBreak: 'break-all' }}
          >
            {part}
          </a>
        ) : (
          part
        )
      )}
    </span>
  );
}
