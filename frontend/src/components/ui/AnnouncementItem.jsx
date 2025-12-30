export default function AnnouncementItem({ icon, text, link }) {
  return (
    <div className="flex items-center gap-2 text-sm text-white">
      <span>{icon}</span>
      <span>
        {text}
        {link && (
          <a href={link} className="ml-1 underline font-medium">
            Tại đây
          </a>
        )}
      </span>
    </div>
  )
}
