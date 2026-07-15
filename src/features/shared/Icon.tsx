import type { SVGProps } from 'react'

export type IconName = 'world' | 'timeline' | 'passport' | 'profile' | 'sparkle' | 'map' | 'globe' | 'arrow' | 'settings'

const paths: Record<IconName, React.ReactNode> = {
  world: <><circle cx="12" cy="12" r="8.5"/><path d="M3.8 9h16.4M3.8 15h16.4M12 3.5c2.2 2.2 3.2 5 3.2 8.5s-1 6.3-3.2 8.5M12 3.5C9.8 5.7 8.8 8.5 8.8 12s1 6.3 3.2 8.5"/></>,
  timeline: <><path d="M6 4v16M6 7h10M6 12h7M6 17h11"/><circle cx="6" cy="7" r="1.5"/><circle cx="6" cy="12" r="1.5"/><circle cx="6" cy="17" r="1.5"/></>,
  passport: <><rect x="5" y="3.5" width="14" height="17" rx="2"/><path d="M9 3.5v17M11.7 9.3c1.9-2.4 4.9-.4 3.4 1.8-1.5 2.2-3.4 2.4-3.4 2.4s-1.9-.2-3.4-2.4c-1.5-2.2 1.5-4.2 3.4-1.8Z"/></>,
  profile: <><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c.5-4 2.6-6 6.5-6s6 2 6.5 6"/></>,
  sparkle: <><path d="m12 2 1.6 4.4L18 8l-4.4 1.6L12 14l-1.6-4.4L6 8l4.4-1.6L12 2Z"/><path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z"/></>,
  map: <><path d="m3.5 6 5-2.5 7 2.5 5-2.5v14.5l-5 2.5-7-2.5-5 2.5V6Z"/><path d="M8.5 3.5V18M15.5 6v14.5"/></>,
  globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.4 2.5 3.5 5.5 3.5 9s-1.1 6.5-3.5 9M12 3C9.6 5.5 8.5 8.5 8.5 12s1.1 6.5 3.5 9"/></>,
  arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
}

export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>{paths[name]}</svg>
}
