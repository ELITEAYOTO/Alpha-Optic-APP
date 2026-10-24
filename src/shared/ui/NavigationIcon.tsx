import type { Destination } from "../../app/navigation";

const paths: Record<Destination, string[]> = {
  home: ["M3 3h7v7H3z", "M14 3h7v7h-7z", "M3 14h7v7H3z", "M14 14h7v7h-7z"],
  projects: ["M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v10H3z"],
  sessions: ["M5 3h14v18H5z", "M9 8h6", "M9 12h6", "M9 16h4"],
  permissions: ["M12 2 20 6v7c0 5-4 8-8 9-4-1-8-4-8-9V6z", "m9 12 2 2 4-4"],
  supervision: ["M3 12h4l3-5 4 10 3-5h4"],
  terminal: ["M3 4h18v16H3z", "m7 9 3 3-3 3", "M13 16h5"],
  connections: ["M7 3v5", "M17 3v5", "M5 8h14v4a7 7 0 0 1-14 0z", "M12 19v3"],
  settings: ["M12 4v3", "M12 17v3", "M4 12h3", "M17 12h3", "M6.4 6.4l2.1 2.1", "m15.5 15.5 2.1 2.1", "M17.6 6.4l-2.1 2.1", "m8.5 15.5-2.1 2.1", "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
};

export function NavigationIcon({ name }: { name: Destination }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round">
      {paths[name].map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}
