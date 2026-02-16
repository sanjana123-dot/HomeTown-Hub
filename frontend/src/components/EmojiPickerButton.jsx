import { useState, useRef, useEffect } from 'react'

// Common emojis for comments and captions
const EMOJI_LIST = [
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂',
  '😉', '😍', '🥰', '😘', '😗', '😋', '😛', '😜', '🤪', '😎',
  '👍', '👎', '👏', '🙌', '👋', '🤝', '🙏', '❤️', '🧡', '💛',
  '💚', '💙', '💜', '🖤', '🤍', '💕', '💖', '💗', '💘', '🔥',
  '⭐', '🌟', '✨', '💫', '🎉', '🎊', '🏠', '📷', '📹', '📌',
  '✅', '❌', '❗', '❓', '💬', '🔔', '👍', '❤️', '😢', '😭',
]

/**
 * Button that opens a popover with emoji grid. Call onInsert(emoji) when user picks one.
 * Parent should insert the emoji at cursor (use a ref and selectionStart/End).
 */
const EmojiPickerButton = ({ onInsert, className = '', title = 'Add emoji' }) => {
  const [open, setOpen] = useState(false)
  const popoverRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handlePick = (emoji) => {
    onInsert(emoji)
    setOpen(false)
  }

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors ${className}`}
        title={title}
        aria-label={title}
      >
        <span className="text-xl" role="img" aria-label="emoji">😀</span>
      </button>
      {open && (
        <div className="absolute z-50 bottom-full left-0 mb-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-2 w-64 max-h-56 overflow-y-auto">
          <div className="grid grid-cols-8 gap-1">
            {EMOJI_LIST.map((emoji, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handlePick(emoji)}
                className="text-xl p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default EmojiPickerButton

/**
 * Helper: insert text at cursor in an input or textarea, then update React state.
 * Call from parent: insertEmojiAtCursor(inputRef, currentValue, setValue, emoji)
 */
export function insertEmojiAtCursor(ref, value, setValue, emoji) {
  const el = ref?.current
  if (!el) {
    setValue(value + emoji)
    return
  }
  const start = el.selectionStart ?? value.length
  const end = el.selectionEnd ?? start
  const before = value.substring(0, start)
  const after = value.substring(end)
  const newValue = before + emoji + after
  setValue(newValue)
  el.focus()
  requestAnimationFrame(() => {
    const pos = start + emoji.length
    el.setSelectionRange(pos, pos)
  })
}
