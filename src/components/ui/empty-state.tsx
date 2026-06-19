import Link from "next/link"

type EmptyStateProps = {
  icon: string
  title: string
  description: string
  action?: { label: string; href: string }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="mb-3 text-2xl opacity-30">{icon}</span>
      <p className="text-sm font-medium text-stone-500">{title}</p>
      <p className="mt-1 text-xs text-stone-400">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="mt-4 rounded-lg bg-face px-4 py-2 text-sm font-medium text-white hover:bg-face-dark"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
